import { Page } from '@playwright/test';

export abstract class AccountPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToAccountPage(): Promise<void> {
        await this.page.goto('/account', { timeout: 45000 });
        await this.page.waitForLoadState('networkidle');
    }

    abstract waitForLoginToBeCompleted(): Promise<void>;

    abstract validateAccountPage(): Promise<void>;
}
