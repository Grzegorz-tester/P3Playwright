import { expect, Page } from '@playwright/test'
import { LoginPage } from '../../../common/abstract-pages/LoginPage'
import { WatcoObjects } from '../utils/objects'

export class WatcoLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly emailInput = WatcoObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = WatcoObjects.LoginPage.passwordInput(this.page);
    readonly submitButton = WatcoObjects.LoginPage.submitButton(this.page);

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login', { timeout: 45000 })
        await expect(this.emailInput).toBeVisible({ timeout: 30000 })
    }

    // VERIFIED live (staging, 2026-08-05): a successful login redirects to
    // /account ("Account Overview | Watco"). Waiting on the URL rather
    // than a page element, since no data-testid exists to anchor on here.
    async loginToApplication(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email)
        await this.passwordInput.fill(password)
        await this.submitButton.click()
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 30000 })
    }
}
