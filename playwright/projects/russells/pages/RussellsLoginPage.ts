import { expect, Page } from '@playwright/test'
import { LoginPage } from '../../../common/abstract-pages/LoginPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly loginHeader = RussellsObjects.LoginPage.loginHeader(this.page);
    readonly emailInput = RussellsObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = RussellsObjects.LoginPage.passwordInput(this.page);
    readonly signInButton = RussellsObjects.LoginPage.signInButton(this.page);
    readonly alertMessage = RussellsObjects.LoginPage.alertMessage(this.page);
    readonly forgotPasswordLink = RussellsObjects.LoginPage.forgotPasswordLink(this.page);
    readonly welcomeMessage = RussellsObjects.LoginPage.welcomeMessage(this.page);
    readonly signOutLink = RussellsObjects.LoginPage.signOutLink(this.page);

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login', { timeout: 40000 })
        await expect(this.loginHeader).toBeVisible({ timeout: 60000 })
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.signInButton.click()
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 60000 })
    }

    // VERIFIED live (staging, 2026-07-31): a wrong password for a real
    // account shows "Invalid credentials." and stays on /login.
    async assertLoginFailsWithInvalidCredentials(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.signInButton.click()
        await expect(this.alertMessage).toContainText('Invalid credentials.', { timeout: 15000 })
        await expect(this.page).toHaveURL(/\/login$/)
    }

    // Native HTML5 validity state — no rendered client-side error message
    // for an empty submission.
    async assertEmptySubmissionIsRejected(): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.signInButton.click()
        const emailValidity = await this.emailInput.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing
        }))
        expect(emailValidity.valid).toBe(false)
        expect(emailValidity.valueMissing).toBe(true)
        await expect(this.alertMessage).toHaveCount(0)
    }

    async clickForgotPasswordLink(): Promise<void> {
        await this.forgotPasswordLink.click()
        await expect(this.page).toHaveURL(/\/reset-password$/, { timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-07-31): unlike Insinkerator, there is no
    // global header indicator — /account redirecting to /login (rather than
    // rendering the dashboard) is the reliable "logged out" signal instead.
    async isLoggedIn(): Promise<boolean> {
        await this.page.goto('/account', { timeout: 45000 })
        return this.welcomeMessage.isVisible()
    }

    async signOut(): Promise<void> {
        await this.signOutLink.click()
        await expect(this.page).not.toHaveURL(/\/account$/, { timeout: 15000 })
        // The sign-out redirect settles asynchronously — an immediate
        // page.goto() straight after the URL changes can race it and abort
        // (net::ERR_ABORTED), confirmed live (staging, 2026-07-31).
        await this.page.waitForLoadState('networkidle')
    }
}
