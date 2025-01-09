import type {Page} from '@playwright/test'
import {expect, Locator} from '@playwright/test'

export class ProductDetailPage {
    readonly page: Page
    readonly addToBasketButton: Locator
    readonly chechkoutPopup: Locator
    readonly closeAddedToBasketPopupButton: Locator
    readonly basketButton: Locator
    readonly actualPricePDP: Locator
    readonly itemAmountToAddInput: Locator
    readonly basketCount: Locator

    constructor(page: Page) {
        this.page = page
        this.addToBasketButton = page.locator('[data-testid="add-to-basket"]')
        this.chechkoutPopup = page.locator('[data-testid="success-popup-checkout"]')
        this.closeAddedToBasketPopupButton = page.locator(
            '[data-testid="modal__close-button--top"]>[data-icon="xmark"]',
        )
        this.basketButton = page.locator('[data-testid="brand-bar__basket-button"]')
        this.actualPricePDP = page.locator(
            '[data-testid="price-to-pay"]>span>[data-testid="price__price"]',
        )
        this.itemAmountToAddInput = page.locator('#quantity')
        this.basketCount = page.locator('//*[@data-testid="brand-bar__basket-button"]/../div')
    }

    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled()
        await expect(this.basketCount).toBeAttached()
        const basketCountNumber = Number(await this.basketCount.textContent())
        console.log(`Initial basket count: ${basketCountNumber}`)
        await this.itemAmountToAddInput.clear()
        await this.itemAmountToAddInput.pressSequentially(quantityToBuy.toString(), {delay: 500})
        await this.addToBasketButton.click({ timeout: 5000 })
        await expect(this.chechkoutPopup).toBeVisible({timeout: 25000}) //making sure the popup's appeared
        await this.closeAddedToBasketPopupButton.click()
        const basketTotalQuantity = quantityToBuy + basketCountNumber
        await expect(this.basketCount).toHaveText(basketTotalQuantity.toString())
    }

    async getBasketCount () :Promise<string> {
        return this.basketCount.textContent()
    }
    async proceedToBasketPage(): Promise<void> {
        await this.basketButton.click()
    }
}
