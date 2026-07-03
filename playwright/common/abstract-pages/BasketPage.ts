import { Page } from '@playwright/test';

export abstract class BasketPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async proceedToBasketPage(): Promise<void> {
        await this.page.goto('/basket', { timeout: 30000 });
    }

    abstract proceedToSecureCheckout(): Promise<void>;
}
