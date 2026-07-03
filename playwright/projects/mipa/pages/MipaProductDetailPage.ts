import { expect, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { MipaObjects } from '../utils/objects'

export class MipaProductDetailPage extends ProductDetailPage {

    constructor(page: Page) {
        super(page);
    }

    readonly title = MipaObjects.ProductDetailPage.title(this.page);
    readonly sku = MipaObjects.ProductDetailPage.sku(this.page);
    readonly priceTitle = MipaObjects.ProductDetailPage.priceTitle(this.page);
    readonly addToBasketButton = MipaObjects.ProductDetailPage.addToBasketButton(this.page);
    readonly quantityInput = MipaObjects.ProductDetailPage.quantityInput(this.page);
    readonly basketButton = MipaObjects.ProductDetailPage.basketButton(this.page);

    async validateProductDetailPage(productName: string): Promise<void> {
        await expect(this.title).toBeVisible({ timeout: 30000 })
        await expect(this.title).toHaveText(productName)
        await expect(this.sku).toBeVisible()
    }

    // Selects the first unit-size variant, sets quantity and adds the product to the basket.
    async addToBasket(quantityToBuy: number): Promise<void> {
        const firstVariant = MipaObjects.ProductDetailPage.variantLozenge(0)(this.page)
        if (await firstVariant.count()) {
            await firstVariant.click()
        }
        await expect(this.addToBasketButton).toBeVisible({ timeout: 20000 })
        await this.quantityInput.first().fill(quantityToBuy.toString())
        await this.addToBasketButton.click()
    }

    async getBasketCount(): Promise<string> {
        return this.basketButton.textContent()
    }
}
