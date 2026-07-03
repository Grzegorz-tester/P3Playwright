import { expect, Locator, Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { CarbonObjects } from '../utils/objects'
import { products } from '../utils/products/products'

export class CarbonBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly secureCheckoutButton = CarbonObjects.BasketPage.secureCheckoutButton(this.page);
    readonly basketTotalString = CarbonObjects.BasketPage.basketTotalString(this.page);
    readonly basketProductsList = CarbonObjects.BasketPage.basketProductsList(this.page);
    readonly addPromocodeButton = CarbonObjects.BasketPage.addPromocodeButton(this.page);
    readonly promocodeInput = CarbonObjects.BasketPage.promocodeInput(this.page);
    readonly applyPromocodeButton = CarbonObjects.BasketPage.applyPromocodeButton(this.page);

    async deleteProductFromBasket(product: string): Promise<void> {
        await expect(this.basketTotalString).toBeVisible({ timeout: 8000 })
        const basketTotalAmount = Number(await this.basketTotalString.textContent())
        const productLink = products[product].link
        const productBasketTotalString = CarbonObjects.BasketPage.productBasketTotalString(productLink)(this.page)
        const productTotalAmount = Number(await productBasketTotalString.textContent())
        const deleteProductButton = CarbonObjects.BasketPage.deleteProductButton(productLink)(this.page)
        await expect(deleteProductButton).toBeVisible({ timeout: 5000 })
        await deleteProductButton.focus({ timeout: 5000 })
        await deleteProductButton.click()
        const expectedBasketTotalAfterProductDeleted = (basketTotalAmount - productTotalAmount).toFixed(2)
        await expect(this.basketTotalString).toHaveText(expectedBasketTotalAfterProductDeleted, { timeout: 10000 })
    }

    async applyAndValidatePromotionInBasket(promoCode: string): Promise<void> {
        await expect(this.basketTotalString).toBeVisible({ timeout: 8000 })
        const basketTotalBeforePromotion = await this.basketTotalString.textContent()
        await this.addPromocodeButton.click()
        await this.promocodeInput.fill(promoCode)
        await this.applyPromocodeButton.click()
        await expect(this.basketTotalString).not.toHaveText(basketTotalBeforePromotion, { timeout: 10000 })
    }

    async proceedToSecureCheckout(): Promise<void> {
        await this.secureCheckoutButton.focus()
        await this.secureCheckoutButton.click()
    }
}
