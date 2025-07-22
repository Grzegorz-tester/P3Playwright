import { expect, Locator, Page } from '@playwright/test';

export abstract class AbstractLoginPage {
    readonly page: Page;
    public abstract loginHeader: Locator;
    public abstract emailInput: Locator;
    public abstract passwordInput: Locator;
    public abstract signInButton: Locator;
    public abstract signInButtonInProgress: Locator;
    public abstract welcomeUserTopbarDiv: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async navigateToLoginPage(): Promise<void> {
        await this.page.goto('/login?to=%2Faccount', { timeout: 40000 });
        await expect(this.loginHeader).toBeVisible({timeout: 60000 });
        await this.page.waitForLoadState('networkidle');
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible();
        await this.emailInput.pressSequentially(email, { delay: 50, timeout: 5000 });
        await this.passwordInput.pressSequentially(password, { delay: 50, timeout: 5000 });
        await this.signInButton.focus();
        await this.signInButton.click();
        await expect(this.signInButtonInProgress).toBeHidden({ timeout: 60000 });
        await expect(this.welcomeUserTopbarDiv).toBeVisible({ timeout: 60000 });
        console.log("Logged in successfully.")
        await this.page.waitForLoadState('networkidle');
    }
}
