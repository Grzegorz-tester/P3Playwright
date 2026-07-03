import { expect, Locator, Page } from '@playwright/test'
import { LoginPage } from "../../../common/abstract-pages/LoginPage";
import { CarbonObjects } from "../utils/objects";

export class CarbonLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly loginHeader = CarbonObjects.LoginPage.loginHeader(this.page);
    readonly emailInput = CarbonObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = CarbonObjects.LoginPage.passwordInput(this.page);
    readonly signInButton = CarbonObjects.LoginPage.signInButton(this.page);
    readonly signInButtonInProgress = CarbonObjects.LoginPage.signInButtonInProgress(this.page);
    readonly welcomeUserTopbarDiv = CarbonObjects.LoginPage.welcomeUserTopbarDiv(this.page);



    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login?to=%2Faccount', { timeout: 40000 })
        await expect(this.loginHeader).toBeVisible({ timeout: 60000 })
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        console.log('Entering credentials...')
        await this.emailInput.pressSequentially(email, { delay: 50, timeout: 5000 })
        await this.passwordInput.pressSequentially(password, { delay: 50, timeout: 5000 })
        await this.signInButton.focus()
        await this.signInButton.click()
        await expect(this.welcomeUserTopbarDiv).toBeVisible({ timeout: 60000 })
    }
}
