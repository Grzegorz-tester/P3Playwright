import {expect, Page} from '@playwright/test'
import { Locator } from '@playwright/test'
import {Product} from "../carbon/utils/products/products";

export abstract class AbstractBasketPage {
    readonly page: Page;
    public abstract secureCheckoutButton: Locator;
    public abstract basketTotalString: Locator;
    public abstract basketProductsList: Locator;
    public abstract addPromocodeButton: Locator;
    public abstract promocodeInput: Locator;
    public abstract applyPromoocodeButton: Locator;

    // These methods return locators dynamically, so they are abstract
    public abstract deleteProductButton(productLink: string): Locator;
    public abstract updateProductButton(productLink: string): Locator;
    public abstract productBasketTotalString(productLink: string):Locator;

    basketTotal: number; // This is a property to store value, not a locator

    protected constructor(page: Page) {
        this.page = page;
    }

    async proceedToBasketPage () {
        await this.page.goto('/basket', { timeout: 30000 });
    }

    abstract deleteProductFromBasket(product: Product, productTotalAmount: number): Promise<void>;

    async applyAndValidatePromotionInBasket(promoCode: string) {
        await expect(this.basketTotalString).toBeVisible({timeout: 8000});
        this.basketTotal = +await this.basketTotalString.textContent(); // "+" turns string into number
        // Further implementation for applying promo code would go here
    }

    async proceedToSecureCheckout(): Promise<void> {
        await this.secureCheckoutButton.focus();
        await this.secureCheckoutButton.click();
    }
}