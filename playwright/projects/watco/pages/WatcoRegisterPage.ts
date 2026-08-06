import { expect, Page } from '@playwright/test'
import { WatcoObjects } from '../utils/objects'
import { dismissStrayPreferenceCentre } from '../utils/cookieBanner'

// Concrete-only — no abstract contract. Registration isn't a shared
// behaviour across this repo's storefronts (see CLAUDE.md's guidance on
// not forcing unrelated abstract methods onto projects that don't need
// them), and WAT-335's registration scenarios only concern this one field.
export class WatcoRegisterPage {
    constructor(readonly page: Page) {
    }

    readonly emailInput = WatcoObjects.RegisterPage.emailInput(this.page)
    readonly titleSelect = WatcoObjects.RegisterPage.titleSelect(this.page)
    readonly firstNameInput = WatcoObjects.RegisterPage.firstNameInput(this.page)
    readonly lastNameInput = WatcoObjects.RegisterPage.lastNameInput(this.page)
    readonly telephoneInput = WatcoObjects.RegisterPage.telephoneInput(this.page)
    readonly vatNumberInput = WatcoObjects.RegisterPage.vatNumberInput(this.page)
    readonly passwordInput = WatcoObjects.RegisterPage.passwordInput(this.page)
    readonly confirmPasswordInput = WatcoObjects.RegisterPage.confirmPasswordInput(this.page)
    readonly marketingAgreementCheckbox = WatcoObjects.RegisterPage.marketingAgreementCheckbox(this.page)
    readonly submitButton = WatcoObjects.RegisterPage.submitButton(this.page)
    readonly vatNumberError = WatcoObjects.RegisterPage.vatNumberError(this.page)
    readonly vatNumberComment = WatcoObjects.RegisterPage.vatNumberComment(this.page)

    // path defaults to the UK/IE English route — FR (and any other
    // localized market) passes its own route (e.g. "/senregistrer").
    async navigateToRegisterPage(path: string = '/register'): Promise<void> {
        await this.page.goto(path, { timeout: 45000 })
        await expect(this.emailInput).toBeVisible({ timeout: 30000 })
    }

    async fillMandatoryFields(email: string, telephone: string, password: string): Promise<void> {
        await this.emailInput.fill(email)
        await this.titleSelect.selectOption({ index: 1 })
        await this.firstNameInput.fill('Grzegorz')
        await this.lastNameInput.fill('AutomationTest')
        await this.telephoneInput.fill(telephone)
        await this.passwordInput.fill(password)
        await this.confirmPasswordInput.fill(password)
        await this.marketingAgreementCheckbox.check({ force: true })
    }

    // CONFIRMED SITE BEHAVIOUR: this button is gated by an invisible
    // reCAPTCHA (class="... g-recaptcha") and stays disabled until the
    // token resolves. On a slow resolve, the form has been observed to
    // auto-submit itself the instant the token is ready, navigating away
    // while our own click is still mid-retry — waiting for "enabled" first
    // avoids that race in the common case, and swallowing a click error
    // covers the rare case where it auto-submits regardless.
    async submit(): Promise<void> {
        await dismissStrayPreferenceCentre(this.page)
        await expect(this.submitButton).toBeEnabled({ timeout: 30000 }).catch(() => {})
        await this.submitButton.click({ timeout: 5000 }).catch(() => {})
        await this.page.waitForLoadState('load')
    }
}
