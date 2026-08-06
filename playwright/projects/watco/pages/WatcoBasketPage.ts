import { expect, Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { WatcoObjects } from '../utils/objects'

export class WatcoBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly checkoutSubmitButton = WatcoObjects.BasketPage.checkoutSubmitButton(this.page);

    // VERIFIED live (staging, 2026-08-05): a guest lands on /checkout (the
    // "Welcome to checkout" guest/sign-in/express choice); a logged-in
    // account skips that landing entirely and goes straight to
    // /checkout/delivery — both are valid outcomes of this same click.
    async proceedToSecureCheckout(): Promise<void> {
        await expect(this.checkoutSubmitButton).toBeVisible({ timeout: 30000 })
        await this.checkoutSubmitButton.click()
        await expect(this.page).toHaveURL(/\/checkout(\/delivery)?$/, { timeout: 30000 })
    }
}
