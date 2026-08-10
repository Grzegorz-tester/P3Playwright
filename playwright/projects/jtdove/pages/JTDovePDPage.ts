import { expect, Locator, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { JTDoveObjects } from '../utils/objects'

export class JTDovePDPage extends ProductDetailPage {

    readonly basketButton: Locator;
    readonly productName = JTDoveObjects.ProductDetailPage.productName(this.page);
    readonly productSku = JTDoveObjects.ProductDetailPage.productSku(this.page);
    readonly productPrice = JTDoveObjects.ProductDetailPage.productPrice(this.page);
    readonly quantityInput = JTDoveObjects.ProductDetailPage.quantityInput(this.page);
    readonly basketLinkText = JTDoveObjects.ProductDetailPage.basketLinkText(this.page);
    readonly accordionTriggers = JTDoveObjects.ProductDetailPage.accordionTriggers(this.page);

    constructor(page: Page) {
        super(page);
        this.basketButton = JTDoveObjects.ProductDetailPage.addToBasketButton(this.page);
    }

    // VERIFIED live (staging, 2026-08-10): name/SKU/price are all visible
    // on load.
    async validatePDPLoaded(): Promise<void> {
        await expect(this.productName.first()).toBeVisible({ timeout: 30000 })
        await expect(this.productSku.first()).toBeVisible()
        await expect(this.productPrice.first()).toBeVisible()
    }

    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton.first()).toBeEnabled()
        if (quantityToBuy !== 1) {
            await this.quantityInput.first().fill(String(quantityToBuy))
        }
        const countBefore = Number(await this.getBasketCount())
        await this.basketButton.first().click()
        await expect(async () => {
            const countAfter = Number(await this.getBasketCount())
            expect(countAfter).toBe(countBefore + quantityToBuy)
        }).toPass({ timeout: 15000 })
    }

    async getBasketCount(): Promise<string> {
        return this.basketLinkText.textContent().then(text => (text ?? '').replace(/\D/g, ''))
    }
}
