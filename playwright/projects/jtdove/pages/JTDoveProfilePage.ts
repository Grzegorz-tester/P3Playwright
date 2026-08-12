import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

// VERIFIED live (staging, 2026-08-11): /account/profile - the "My
// Details" form, pre-filled with the logged-in user's data.
export class JTDoveProfilePage {

    readonly page: Page;
    readonly emailInput: Locator;
    readonly titleInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly contactNumberInput: Locator;
    readonly saveChangesButton: Locator;
    readonly resetPasswordButton: Locator;
    readonly changePasswordHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = JTDoveObjects.AccountProfilePage.emailInput(this.page);
        this.titleInput = JTDoveObjects.AccountProfilePage.titleInput(this.page);
        this.firstNameInput = JTDoveObjects.AccountProfilePage.firstNameInput(this.page);
        this.lastNameInput = JTDoveObjects.AccountProfilePage.lastNameInput(this.page);
        this.contactNumberInput = JTDoveObjects.AccountProfilePage.contactNumberInput(this.page);
        this.saveChangesButton = JTDoveObjects.AccountProfilePage.saveChangesButton(this.page);
        this.resetPasswordButton = JTDoveObjects.AccountProfilePage.resetPasswordButton(this.page);
        this.changePasswordHeading = JTDoveObjects.AccountProfilePage.changePasswordHeading(this.page);
    }

    async navigateToProfilePage(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 30000 })
    }

    // CONFIRMED live (staging, 2026-08-11): the form can render visually
    // before the user's actual profile data has finished loading into it
    // (a separate, slightly-delayed fetch from whatever populates the
    // email field instantly) - a fill() landing in that window can be
    // silently overwritten a moment later when the real data arrives.
    // Waiting for firstNameInput to be genuinely non-empty is a more
    // reliable "actually ready" signal than just checking visibility.
    async validateProfilePageLoaded(): Promise<void> {
        await expect(this.emailInput).toBeVisible({ timeout: 20000 })
        await expect(async () => {
            expect(await this.firstNameInput.inputValue()).not.toBe('')
        }).toPass({ timeout: 15000 })
    }

    // CONFIRMED live (staging, 2026-08-11): right after a reload, the
    // form can briefly show a stale/cached value before the real
    // persisted value hydrates in - a one-shot read of inputValue() can
    // land in that window and wrongly look like the save didn't take.
    // toHaveValue() is a web-first assertion that polls until it
    // matches (or times out), which actually waits the hydration out
    // instead of sampling it once.
    async verifyFirstNameValue(expected: string): Promise<void> {
        await expect(this.firstNameInput).toHaveValue(expected, { timeout: 20000 })
    }

    // CONFIRMED SITE BUG (JTD-325, staging, 2026-08-11): the Save
    // Changes request for this field POSTs {"telephone": "<value>"} to
    // /account/profile and gets a 200 back, but the user record it
    // actually reads from only has "mobile" and
    // "businessTelephoneNumber" fields (both null) - there is no
    // "telephone" field on the backend model, so the new number is
    // silently dropped despite the "successful" response. Confirmed by
    // inspecting the request/response payloads directly: the field
    // never changes on reload, however long you wait. firstName saves
    // correctly via the same form, so this is specific to this field,
    // not a general persistence race. Written against the expected
    // (correct) behaviour on purpose - see verifyContactNumberValue's
    // caller - so this shows up as a red test until devs fix the
    // payload key, not as a silently-passing bug.
    async verifyContactNumberValue(expected: string): Promise<void> {
        await expect(this.contactNumberInput).toHaveValue(expected, { timeout: 20000 })
    }

    async getFieldValues(): Promise<{ email: string, firstName: string, lastName: string, contactNumber: string }> {
        return {
            email: await this.emailInput.inputValue(),
            firstName: await this.firstNameInput.inputValue(),
            lastName: await this.lastNameInput.inputValue(),
            contactNumber: await this.contactNumberInput.inputValue(),
        }
    }

    // CONFIRMED live (staging, 2026-08-11): the save itself is an async
    // request - navigating away immediately after clicking can abort it
    // before it persists, silently losing the change. Two more-principled
    // signals were tried and ruled out here: the button going back to
    // disabled flips near-instantly (an optimistic UI update, well before
    // the request necessarily completes), and `networkidle` never
    // resolves at all on this storefront (some persistent background
    // connection - analytics/chat widget - keeps the network busy
    // indefinitely, a documented Playwright gotcha with networkidle on
    // real sites). A short fixed wait is the pragmatic fallback,
    // confirmed sufficient live (a 2s pause reliably showed the saved
    // value survive a fresh reload).
    async saveChanges(): Promise<void> {
        await this.saveChangesButton.click()
        await expect(this.saveChangesButton).toBeDisabled({ timeout: 15000 })
        await this.page.waitForTimeout(2500)
    }

    async updateContactNumberAndSave(contactNumber: string): Promise<void> {
        await this.contactNumberInput.fill(contactNumber)
        await this.saveChanges()
    }

    async clearFirstName(): Promise<void> {
        await this.firstNameInput.fill('')
    }

    // CONFIRMED live (staging, 2026-08-11): a plain fill() right after
    // validateProfilePageLoaded() can still be reverted a moment later
    // by a late hydration overwrite (the same class of race documented
    // on validateProfilePageLoaded, just with a narrower window) -
    // symptom is Save Changes never leaving "disabled" because the
    // input silently reverted to whatever's actually persisted. Retrying
    // the fill until it verifiably sticks avoids fighting that race.
    async fillFirstNameStable(value: string): Promise<void> {
        await expect(async () => {
            await this.firstNameInput.fill(value)
            await this.page.waitForTimeout(300)
            expect(await this.firstNameInput.inputValue()).toBe(value)
        }).toPass({ timeout: 10000 })
    }

    async verifySaveChangesDisabled(): Promise<void> {
        await expect(this.saveChangesButton).toBeDisabled({ timeout: 10000 })
    }

    async verifySaveChangesEnabled(): Promise<void> {
        await expect(this.saveChangesButton).toBeEnabled({ timeout: 10000 })
    }
}
