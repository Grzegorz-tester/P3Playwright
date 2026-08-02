import { expect, Page } from '@playwright/test'
import { RussellsObjects } from '../utils/objects'

export interface QuickEnquiryFormDetails {
    name: string
    email: string
    phone: string
    message: string
    machineBrand?: string
    machineModel?: string
    machineSerial?: string
}

/**
 * /quick-enquiry-form — a CMS-driven contact form. Doesn't extend a
 * shared abstract page: this contact-form feature isn't part of the
 * cross-project HomePage/AccountPage/etc. contracts.
 */
export class RussellsQuickEnquiryFormPage {

    readonly page: Page;
    readonly nameInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.nameInput>;
    readonly emailInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.emailInput>;
    readonly phoneInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.phoneInput>;
    readonly machineBrandInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.machineBrandInput>;
    readonly machineModelInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.machineModelInput>;
    readonly machineSerialInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.machineSerialInput>;
    readonly messageInput: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.messageInput>;
    readonly submitButton: ReturnType<typeof RussellsObjects.QuickEnquiryFormPage.submitButton>;

    constructor(page: Page) {
        this.page = page;
        this.nameInput = RussellsObjects.QuickEnquiryFormPage.nameInput(this.page);
        this.emailInput = RussellsObjects.QuickEnquiryFormPage.emailInput(this.page);
        this.phoneInput = RussellsObjects.QuickEnquiryFormPage.phoneInput(this.page);
        this.machineBrandInput = RussellsObjects.QuickEnquiryFormPage.machineBrandInput(this.page);
        this.machineModelInput = RussellsObjects.QuickEnquiryFormPage.machineModelInput(this.page);
        this.machineSerialInput = RussellsObjects.QuickEnquiryFormPage.machineSerialInput(this.page);
        this.messageInput = RussellsObjects.QuickEnquiryFormPage.messageInput(this.page);
        this.submitButton = RussellsObjects.QuickEnquiryFormPage.submitButton(this.page);
    }

    async navigateToQuickEnquiryForm(): Promise<void> {
        await this.page.goto('/quick-enquiry-form', { timeout: 45000 })
        await expect(this.nameInput).toBeVisible({ timeout: 30000 })
    }

    async fillRequiredFields(details: QuickEnquiryFormDetails): Promise<void> {
        await this.nameInput.fill(details.name)
        await this.emailInput.fill(details.email)
        await this.phoneInput.fill(details.phone)
        await this.messageInput.fill(details.message)
        if (details.machineBrand) await this.machineBrandInput.fill(details.machineBrand)
        if (details.machineModel) await this.machineModelInput.fill(details.machineModel)
        if (details.machineSerial) await this.machineSerialInput.fill(details.machineSerial)
    }

    // VERIFIED live (staging, 2026-08-02): Name, Email, Telephone and
    // Message are native HTML5 `required` fields — submitting blank
    // blocks the request (confirmed via network inspection: no
    // /form-submissions request fires) and leaves each field's own
    // validity.valueMissing true, same native-validation pattern as
    // RussellsHomePage's newsletter form (no rendered client-side error
    // message for this case either).
    async validateEmptyFormIsRejected(): Promise<void> {
        await this.submitButton.click()
        for (const field of [this.nameInput, this.emailInput, this.phoneInput, this.messageInput]) {
            const validity = await field.evaluate((el: HTMLInputElement) => ({
                valid: el.validity.valid,
                valueMissing: el.validity.valueMissing
            }))
            expect(validity.valid).toBe(false)
            expect(validity.valueMissing).toBe(true)
        }
    }

    // VERIFIED live (staging, 2026-08-02): Email is a native type="email"
    // input — a malformed value blocks submission via the browser's own
    // type-mismatch validation (confirmed via network inspection: no
    // /form-submissions request fires).
    async validateMalformedEmailIsRejected(malformedEmail: string): Promise<void> {
        await this.nameInput.fill('Playwright QA Test')
        await this.emailInput.fill(malformedEmail)
        await this.phoneInput.fill('07700900000')
        await this.messageInput.fill('Automated Playwright test enquiry - please ignore.')
        await this.submitButton.click()
        const validity = await this.emailInput.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            typeMismatch: el.validity.typeMismatch
        }))
        expect(validity.valid).toBe(false)
        expect(validity.typeMismatch).toBe(true)
    }

    // VERIFIED live (staging, 2026-08-02): a fully valid submission DOES
    // reach the backend successfully (POST .../form-submissions => 201) -
    // confirmed via this real network response, not just a lack of
    // errors.
    async submitAndGetResponseStatus(details: QuickEnquiryFormDetails): Promise<number> {
        await this.fillRequiredFields(details)
        const [response] = await Promise.all([
            this.page.waitForResponse(
                (resp) => resp.url().includes('/form-submissions') && resp.request().method() === 'POST',
                { timeout: 20000 }
            ),
            this.submitButton.click()
        ])
        return response.status()
    }

    // EXPECTED behaviour: after a successful submission, the user should
    // see some visible confirmation (a success/thank-you message, the
    // form resetting, or a redirect) - the same basic contract as this
    // site's own footer newsletter form. RUS-474: staging currently shows
    // NONE of this (confirmed live, 2026-08-02 - the form silently sits
    // there fully filled in after a real, backend-accepted submission),
    // so this assertion is expected to fail until that's fixed. It's
    // written against the correct behaviour on purpose, not against
    // today's broken one - a bug should show up as a red test, not get
    // quietly asserted as "working as intended".
    async validateSuccessFeedbackIsShown(): Promise<void> {
        await expect(this.page.locator('body')).toContainText(/thank you|successfully submitted|we.?ll be in touch|enquiry received/i, { timeout: 10000 })
    }
}
