import { Page, Locator } from '@playwright/test';

export abstract class ProductDetailPage {
    readonly page: Page;
    abstract readonly basketButton: Locator;

    constructor(page: Page) {
        this.page = page;
    }

    async proceedToBasketPage(): Promise<void> {
        await this.basketButton.click();
    }

    abstract addToBasket(quantityToBuy: number): Promise<void>;
    abstract getBasketCount(): Promise<string>;
}