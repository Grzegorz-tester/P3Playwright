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

    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled()
        await this.quantityInput.fill(String(quantityToBuy))
        await this.basketButton.click()
    }

    async getBasketCount(): Promise<string> {
        return this.basketLinkText.textContent().then(text => (text ?? '').replace(/\D/g, ''))
    }
}
