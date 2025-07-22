import type { Page } from '@playwright/test';
import { expect, Locator } from '@playwright/test';

export abstract class AbstractHomePage {
    readonly page: Page;
    // Removed specific 'category' Locator field to be handled dynamically in methods

    public abstract brandBar: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto('/', { timeout: 40000 });
        await this.page.waitForLoadState('networkidle');
    }

    // Made chooseMenuCategory abstract to allow child classes to implement how category is located
    abstract chooseMenuCategory(...args: any[]): Promise<void>;
    abstract validateHomePage(): Promise<void>;
}