import {expect, Page} from '@playwright/test'
import { Locator } from '@playwright/test'
//import { promotions } from "@utils/promotions/promotions";
import { products } from "../utils/products/products";

export class BasketPage {
    readonly page: Page
    readonly secureCheckoutButton: Locator
    readonly basketTotalString: Locator
    readonly basketProductsList: Locator
    readonly addPromocodeButton: Locator
    readonly promocodeInput: Locator
    readonly applyPromoocodeButton: Locator

    deleteProductButton: Locator
    updateProductButton: Locator
    basketTotal: string
    productBasketTotalString: Locator

    constructor(page: Page) {
        this.page = page;
        this.secureCheckoutButton = page.getByTestId('basket__summary__checkout-button')
        this.basketTotalString = page.locator('[data-testid="basket__summary"] > div > div > div:nth-child(2) > div > div > span > span:nth-child(2)')
        this.basketProductsList = page.locator('[data-testid="basket"]')
        this.addPromocodeButton = page.getByTestId('promotion-code__add')
        this.promocodeInput = page.locator('#code')
        this.applyPromoocodeButton = page.getByTestId('promotion-code__apply')
    }

    async proceedToBasketPage () {
        await this.page.goto('/basket', { timeout: 30000 })
    }
    async deleteProductFromBasket(product: string) {
        await expect(this.basketTotalString).toBeVisible({timeout: 8000})
        this.basketTotal = await this.basketTotalString.textContent()
        let basketTotalAmount: number = +this.basketTotal
        let productLink = products[product].link
        let productPrice: number = +products[product].price //could be used for validation instead of product total
        this.productBasketTotalString = this.page.locator(`//*[@href='${productLink}']/../div/div[4]/div/span/span[2][@data-testid="price__price"]`)
        let productTotal = await this.productBasketTotalString.textContent()
        let productTotalAmount: number = +productTotal
        this.deleteProductButton = this.page.locator(`//*[@href='${productLink}']/../div/div[3]/div/div/a[@data-testid="basket__quantity-input__delete"]`)
        await expect(this.deleteProductButton).toBeVisible({timeout: 5000})
        await this.deleteProductButton.focus({timeout: 5000})
        await this.page.waitForTimeout(1000)
        await this.deleteProductButton.click()
        await this.page.waitForTimeout(1000)
        console.log(`${basketTotalAmount} - ${productTotalAmount}: INPUT DATA`)
        let expectedBasketTotalAmountAfterProductDeleted = basketTotalAmount - productTotalAmount
        let expectedBasketTotalAfterProductDeleted = expectedBasketTotalAmountAfterProductDeleted.toString()
        expect(this.basketTotalString.textContent()).toEqual(expectedBasketTotalAfterProductDeleted)
    }

    async applyAndValidatePromotionInBasket(promoCode: string) {
        await expect(this.basketTotalString).toBeVisible({timeout: 8000})
        this.basketTotal = await this.basketTotalString.textContent()
        let basketTotalAmount: number = +this.basketTotal
    }
    async proceedToSecureCheckout(): Promise<void> {
        await this.secureCheckoutButton.focus()
        await this.secureCheckoutButton.click()
    }
}
