import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import { ProductDetailPage } from './ProductDetailPage'

export class ProductListPage {
    readonly page: Page
    readonly firstProductBlock: Locator
    readonly addFirstProductToBasketButton: Locator
    readonly successfulGoToCheckoutButton: Locator

    constructor(page: Page) {
        this.page = page
        this.firstProductBlock = page.locator(
            '[data-testid="search__hits__container"]>[data-testid="product-card"]:nth-child(1)>a>p',
        )
        this.addFirstProductToBasketButton = page.locator(
            '[data-testid="product-card"]:nth-child(2)>div>button:nth-child(1)',
        )
        this.successfulGoToCheckoutButton = page.getByTestId('success-popup-checkout')
        this.productNameLink = this.page.getByTestId('product-card__name')
    }
    productDetailPage = ProductDetailPage
    productNameLink: Locator

    async validatePLP(): Promise<void> {
        await expect(this.page).toHaveURL('/category*/')
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        await expect(this.firstProductBlock).toHaveCount(1, { timeout: 15000 })
        await this.firstProductBlock.focus()
        await this.firstProductBlock.click()
        await expect(this.firstProductBlock).toHaveCount(0, { timeout: 30000 })
    }
    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        await expect(this.productNameLink.filter({hasText: `${productName}`})).toBeVisible({ timeout: 60000 })
        await this.productNameLink.filter({hasText: `${productName}`}).focus({ timeout: 15000 })
        await this.productNameLink.filter({hasText: `${productName}`}).click({ timeout: 10000 })
        await expect(this.productNameLink.filter({hasText: `${productName}`})).toHaveCount(0, { timeout: 30000 })
    }
    async clickOnFirstItemToProceedToCheckout(): Promise<void> {
        await expect(this.firstProductBlock).toHaveCount(1, { timeout: 15000 })
        await this.firstProductBlock.focus()
        await this.addFirstProductToBasketButton.focus()
        await this.addFirstProductToBasketButton.click()
        await expect(this.successfulGoToCheckoutButton).toHaveCount(1, { timeout: 30000 })
        await this.successfulGoToCheckoutButton.click()
        // await expect(this.page).toHaveURL();
    }
}
