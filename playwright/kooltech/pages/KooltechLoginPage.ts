import { expect, Locator, Page } from '@playwright/test'
import {LoginPage} from "../../carbon/pages/LoginPage";

export class KooltechLoginPage extends LoginPage{
    readonly page: Page
    public signInButton: Locator


    constructor(page: Page) {
        super(page);
        this.page = page;
        this.signInButton = page.locator('//*[@data-testid="login-form"]//button')
    }
   /* async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.emailInput.pressSequentially(email, { delay: 50, timeout: 5000 })
        await this.passwordInput.pressSequentially(password, { delay: 50, timeout: 5000 })
        await this.signInButton.focus()
        await this.signInButton.click()
        await expect(this.signInButtonInProgress).toHaveCount(0, { timeout: 25000 })
    }*/

}
