import { Page } from '@playwright/test';

export abstract class WarrantyFinderPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToWarrantyFinderPage(): Promise<void> {
        await this.page.goto('/warranty-finder', { timeout: 45000 });
        await this.page.waitForLoadState('networkidle');
    }

    abstract lookupWarranty(lastName: string, serialNumber: string): Promise<void>;

    abstract getNotFoundMessage(): Promise<string>;

    abstract getSuccessMessage(): Promise<string>;
}
