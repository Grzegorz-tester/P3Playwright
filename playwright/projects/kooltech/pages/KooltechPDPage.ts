import { expect, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { KooltechObjects } from '../utils/objects'

export class KooltechPDPage extends ProductDetailPage {

    constructor(page: Page) {
        super(page);
    }

    readonly addToBasketButton = KooltechObjects.ProductDetailPage.addToBasketButton(this.page);
    readonly checkoutPopup = KooltechObjects.ProductDetailPage.checkoutPopup(this.page);
    readonly closeAddedToBasketPopupButton = KooltechObjects.ProductDetailPage.closeAddedToBasketPopupButton(this.page);
    readonly basketButton = KooltechObjects.ProductDetailPage.basketButton(this.page);
    readonly actualPricePDP = KooltechObjects.ProductDetailPage.actualPricePDP(this.page);
    readonly itemAmountToAddInput = KooltechObjects.ProductDetailPage.itemAmountToAddInput(this.page);
    readonly basketCount = KooltechObjects.ProductDetailPage.basketCount(this.page);

    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled()
        await expect(this.basketCount).toBeAttached()
        const basketCountNumber = Number(await this.basketCount.textContent())
        await this.itemAmountToAddInput.clear()
        await this.itemAmountToAddInput.pressSequentially(quantityToBuy.toString(), { delay: 500 })
        await this.addToBasketButton.click({ timeout: 5000 })
        await expect(this.checkoutPopup).toBeVisible({ timeout: 25000 })
        await this.closeAddedToBasketPopupButton.click()
        const basketTotalQuantity = quantityToBuy + basketCountNumber
        await expect(this.basketCount).toHaveText(basketTotalQuantity.toString())
    }

    async getBasketCount(): Promise<string> {
        return this.basketCount.textContent()
    }
}
