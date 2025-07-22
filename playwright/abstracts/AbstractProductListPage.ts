import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import {Product} from "../carbon/utils/products/products";

export abstract class AbstractProductListPage {
    readonly page: Page;
    public abstract firstProductBlock: Locator;
    public abstract addFirstProductToBasketButton: Locator;
    public abstract successfulGoToCheckoutButton: Locator;
    public abstract productNameLink: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async validatePLP(): Promise<void> {
        await expect(this.page).toHaveURL(/category\/*/);
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        await expect(this.firstProductBlock).toHaveCount(1, { timeout: 15000 });
        await this.firstProductBlock.focus();
        await this.firstProductBlock.click();
        await expect(this.firstProductBlock).toHaveCount(0, { timeout: 30000 });
    }

    async clickOnAProductToProceedToPDP(product: Product): Promise<void> {
        await expect(this.productNameLink.filter({hasText: `${product.title}`})).toBeVisible({ timeout: 60000 });
        await this.productNameLink.filter({hasText: `${product.title}`}).focus({ timeout: 15000 });
        await this.productNameLink.filter({hasText: `${product.title}`}).click({ timeout: 10000 });
        await expect(this.productNameLink.filter({hasText: `${product.title}`})).toHaveCount(0, { timeout: 30000 });
    }

    async clickOnFirstItemToProceedToCheckout(): Promise<void> {
        await expect(this.firstProductBlock).toHaveCount(1, { timeout: 15000 });
        await this.firstProductBlock.focus();
        await this.addFirstProductToBasketButton.focus();
        await this.addFirstProductToBasketButton.click();
        await expect(this.successfulGoToCheckoutButton).toHaveCount(1, { timeout: 30000 });
        await this.successfulGoToCheckoutButton.click();
    }
}