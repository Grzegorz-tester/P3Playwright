import { Page } from '@playwright/test';

export abstract class HomePage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto('/', { timeout: 45000 });
        await this.page.waitForLoadState('networkidle');
    }

    async waitForPageLoad(): Promise<void> {
        await this.page.waitForLoadState('networkidle');
    }

    abstract validateHomePage(): Promise<void>;

    abstract chooseMenuCategory(category: string): Promise<void>;
}
