import { expect, Page } from '@playwright/test'
import { LoginPage } from '../../../common/abstract-pages/LoginPage'
import { JTDoveObjects } from '../utils/objects'

// VERIFIED live (staging, 2026-08-11) end-to-end: /login -> on success,
// redirects to /account. On failure (e.g. a disabled account), the same
// /login page re-renders with an "Error" message instead of navigating.
export class JTDoveLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly emailInput = JTDoveObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = JTDoveObjects.LoginPage.passwordInput(this.page);
    readonly submitButton = JTDoveObjects.LoginPage.submitButton(this.page);

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login', { timeout: 30000 })
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.emailInput).toBeVisible({ timeout: 20000 })
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.submitButton.click()
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 20000 })
    }
}
