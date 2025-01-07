import { expect, Locator, Page } from '@playwright/test'

export class LoginPage {
    readonly page: Page
    readonly loginHeader: Locator
    readonly emailInput: Locator
    readonly passwordInput: Locator
    public signInButton: Locator
    public signInButtonInProgress: Locator

    constructor(page: Page) {
        this.page = page
        this.loginHeader = page.locator('h2', { hasText: 'Sign in to your account' })
        this.emailInput = page.locator('#email')
        this.passwordInput = page.locator('#password')
        this.signInButton = page.getByTestId('login-form__sign-in-button')
        this.signInButtonInProgress = page.locator('[data-icon="spinner"]')
    }

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login?to=%2Faccount', { timeout: 40000 })
        await expect(this.loginHeader).toHaveCount(1)
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.emailInput.type(email, { delay: 50, timeout: 5000 })
        await this.passwordInput.type(password, { delay: 50, timeout: 5000 })
        await this.signInButton.focus()
        await this.signInButton.click()
        await expect(this.signInButtonInProgress).toHaveCount(0, { timeout: 25000 })
    }
}
