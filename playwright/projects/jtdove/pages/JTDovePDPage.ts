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

    readonly clickAndCollectButton = JTDoveObjects.ProductDetailPage.clickAndCollectAddToBasketButton(this.page);

    // VERIFIED live (staging, 2026-08-10): collection-only, per-length
    // products (e.g. C16 Carcassing) require a non-zero length quantity
    // before either add-to-basket action enables - there is no direct
    // numeric input, only +/- steppers per length option. lengthIndex
    // matches the on-page order (0 = the first length option, e.g.
    // "3.6m"). Clicking clickAndCollectButton opens the branch
    // stock-availability dialog (see JTDoveBasketPage) rather than adding
    // straight to basket.
    async addToBasketViaClickAndCollect(lengthIndex: number, clicks: number = 1): Promise<void> {
        const plusButton = this.page.getByTestId('quantity-picker__plus-button').nth(lengthIndex)
        for (let i = 0; i < clicks; i++) {
            await plusButton.click()
        }
        await expect(this.clickAndCollectButton).toBeEnabled({ timeout: 10000 })
        await this.clickAndCollectButton.click()
    }

    // VERIFIED live (staging, 2026-08-11): the length-based product's
    // "DELIVERY" action shares the regular product-add-to-basket__button
    // testid with simple quantity-based products, but has no direct
    // numeric quantityInput to fill - addToBasket() would misbehave here,
    // hence this separate method using the same length steppers as
    // addToBasketViaClickAndCollect.
    async addToBasketViaDelivery(lengthIndex: number, clicks: number = 1): Promise<void> {
        const plusButton = this.page.getByTestId('quantity-picker__plus-button').nth(lengthIndex)
        for (let i = 0; i < clicks; i++) {
            await plusButton.click()
        }
        const countBefore = Number(await this.getBasketCount())
        await expect(this.basketButton.first()).toBeEnabled({ timeout: 10000 })
        await this.basketButton.first().click()
        await expect(async () => {
            const countAfter = Number(await this.getBasketCount())
            expect(countAfter).toBeGreaterThan(countBefore)
        }).toPass({ timeout: 15000 })
    }
}
