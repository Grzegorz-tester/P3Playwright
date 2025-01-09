import { expect, Locator, Page } from '@playwright/test'
import { testConfig } from "@utils/testConfig";

export class CheckoutSuccessPage {
    readonly page: Page
    readonly thankYouHeader: Locator
    readonly orderDetailsEmailString: Locator

    constructor(page: Page) {
        this.page = page
        this.thankYouHeader = page.locator('[data-testid="basket__header__title"]')
        this.orderDetailsEmailString = page.locator('[data-testid="order-details"] > div > div > div > p:nth-child(2) > b')
    }

    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.thankYouHeader).toHaveText("Thank you for your order", {timeout: 80000})
        await expect(this.orderDetailsEmailString).toHaveText(`${username}`)
    }
}
