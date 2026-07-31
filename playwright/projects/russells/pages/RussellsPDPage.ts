import { expect, Locator, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsPDPage extends ProductDetailPage {

    readonly basketButton: Locator;
    readonly productName = RussellsObjects.ProductDetailPage.productName(this.page);
    readonly quantityInput = RussellsObjects.ProductDetailPage.quantityInput(this.page);
    readonly basketLinkText = RussellsObjects.ProductDetailPage.basketLinkText(this.page);

    constructor(page: Page) {
        super(page);
        this.basketButton = RussellsObjects.ProductDetailPage.addToBasketButton(this.page);
    }

    // Used to confirm a PLP click landed on the right product.
    async validateProductNameMatches(expectedName: string): Promise<void> {
        await expect(this.productName).toBeVisible({ timeout: 30000 })
        await expect(this.productName).toHaveText(expectedName)
    }

    // CONFIRMED live (staging, 2026-07-31): a real automated run showed the
    // basket genuinely empty after this method returned ("You have no
    // items in your basket.") despite the click reporting success — filling
    // the quantity input to "1" (already its default) right before the
    // click looks to interfere with the click registering. Only touching
    // the quantity field when a non-default quantity is actually requested,
    // and verifying the basket count actually increments afterwards, avoids
    // both the interference and silently reporting success on a no-op add.
    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled()
        if (quantityToBuy !== 1) {
            await this.quantityInput.fill(String(quantityToBuy))
        }
        const countBefore = Number(await this.getBasketCount())
        await this.basketButton.click()
        await expect(async () => {
            const countAfter = Number(await this.getBasketCount())
            expect(countAfter).toBe(countBefore + quantityToBuy)
        }).toPass({ timeout: 15000 })
    }

    async getBasketCount(): Promise<string> {
        return this.basketLinkText.textContent().then(text => (text ?? '').replace(/\D/g, ''))
    }
}
