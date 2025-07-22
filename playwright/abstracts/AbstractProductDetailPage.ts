import type {Page} from '@playwright/test'
import {expect, Locator} from '@playwright/test'

export abstract class AbstractProductDetailPage {
    readonly page: Page;
    public abstract addToBasketButton: Locator;
    public abstract chechkoutPopup: Locator;
    public abstract closeAddedToBasketPopupButton: Locator;
    public abstract basketButton: Locator;
    public abstract actualPricePDP: Locator;
    public abstract itemAmountToAddInput: Locator;
    public abstract basketCount: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled();
        await expect(this.basketCount).toBeAttached();
        const basketCountNumber = Number(await this.basketCount.textContent());
        console.log(`Initial basket count: ${basketCountNumber}`);
        await this.itemAmountToAddInput.clear();
        await this.itemAmountToAddInput.pressSequentially(quantityToBuy.toString(), {delay: 500});
        await this.addToBasketButton.click({ timeout: 5000 });
        await expect(this.chechkoutPopup).toBeVisible({timeout: 25000});
        await this.closeAddedToBasketPopupButton.click();
        const basketTotalQuantity = quantityToBuy + basketCountNumber;
        await expect(this.basketCount).toHaveText(basketTotalQuantity.toString());
    }

    async getBasketCount () :Promise<string> {
        return this.basketCount.textContent();
    }

    async proceedToBasketPage(): Promise<void> {
        await this.basketButton.click();
    }
}