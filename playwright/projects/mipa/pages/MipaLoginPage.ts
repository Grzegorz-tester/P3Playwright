import { expect, Page } from '@playwright/test'
import { LoginPage } from '../../../common/abstract-pages/LoginPage'
import { MipaObjects } from '../utils/objects'

export class MipaLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly loginHeader = MipaObjects.LoginPage.loginHeader(this.page);
    readonly emailInput = MipaObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = MipaObjects.LoginPage.passwordInput(this.page);
    readonly signInButton = MipaObjects.LoginPage.signInButton(this.page);
    readonly welcomeUserTopbarDiv = MipaObjects.LoginPage.welcomeUserTopbarDiv(this.page);

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login?to=/account', { timeout: 40000 })
        await expect(this.loginHeader).toBeVisible({ timeout: 60000 })
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.emailInput.pressSequentially(email, { delay: 50, timeout: 5000 })
        await this.passwordInput.pressSequentially(password, { delay: 50, timeout: 5000 })
        await this.signInButton.focus()
        await this.signInButton.click()
        await expect(this.welcomeUserTopbarDiv).toBeVisible({ timeout: 60000 })
    }
}
