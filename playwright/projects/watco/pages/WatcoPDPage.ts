import { expect, Locator, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { WatcoObjects } from '../utils/objects'
import { dismissStrayPreferenceCentre } from '../utils/cookieBanner'

export class WatcoPDPage extends ProductDetailPage {

    constructor(page: Page) {
        super(page);
    }

    readonly basketButton: Locator = WatcoObjects.ProductDetailPage.basketHeaderLink(this.page);
    readonly addToBasketButton = WatcoObjects.ProductDetailPage.addToBasketButton(this.page);

    // VERIFIED live (staging, 2026-08-05): clicking Add to basket replaces
    // the PDP's buy box with an "Added to basket" confirmation panel and
    // removes .pdp-atb-btn from the DOM entirely — there is no PDP-level
    // quantity control to set a quantity up front. Quantity is basket-line-
    // level on this site (see BasketPage), so for quantityToBuy > 1 this
    // adds one line here, then adjusts that line's quantity on the basket
    // page — the only place on the site that control exists.
    // NOTE: compares against the count *before* adding rather than
    // asserting a fixed "1" — a logged-in account's basket can already
    // hold items from a previous run (it persists server-side per
    // account, unlike a guest's always-fresh session).
    async addToBasket(quantityToBuy: number): Promise<void> {
        const countBefore = Number((await this.basketButton.getAttribute('data-basket-qty')) ?? '0')
        await expect(this.addToBasketButton).toBeVisible({ timeout: 30000 })
        await dismissStrayPreferenceCentre(this.page)
        // The dark-filter overlay has been observed appearing mid-click
        // (after this point-in-time check passed) rather than only before
        // it, so on a collision we dismiss again and retry once rather
        // than trusting a single pre-click check.
        try {
            await this.addToBasketButton.click({ timeout: 10000 })
        } catch {
            await dismissStrayPreferenceCentre(this.page)
            await this.addToBasketButton.click()
        }
        await expect(this.basketButton).toHaveAttribute('data-basket-qty', String(countBefore + 1), { timeout: 15000 })

        if (quantityToBuy > 1) {
            const qtyInput = WatcoObjects.BasketPage.basketLineQtyInput(this.page)
            const updateButton = WatcoObjects.BasketPage.basketUpdateSubmitButton(this.page)
            await this.page.goto('/basket', { timeout: 30000 })
            await expect(qtyInput.first()).toBeVisible({ timeout: 30000 })
            await qtyInput.first().fill(String(quantityToBuy))
            await updateButton.first().click()
            await expect(this.basketButton).toHaveAttribute('data-basket-qty', String(quantityToBuy), { timeout: 15000 })
        }
    }

    async getBasketCount(): Promise<string> {
        return await this.basketButton.getAttribute('data-basket-qty') ?? '0'
    }
}
