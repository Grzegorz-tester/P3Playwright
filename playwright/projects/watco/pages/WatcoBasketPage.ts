import { expect, Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { WatcoObjects } from '../utils/objects'

export class WatcoBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    // A getter, not a readonly field: it re-evaluates page.url() on every
    // access. This page object is constructed before any navigation
    // happens (Pages.ts fixtures build it up front), so a readonly field
    // would have frozen in whatever blank URL existed at construction —
    // the locator needs the basket page's ACTUAL path at the moment
    // proceedToSecureCheckout() is called on it.
    get checkoutSubmitButton() {
        return WatcoObjects.BasketPage.checkoutSubmitButton(this.page)
    }

    // path defaults to the UK/IE English route — FR (and any other
    // localized market) passes its own route (e.g. "/panier").
    async proceedToBasketPage(path: string = '/basket'): Promise<void> {
        await this.page.goto(path, { timeout: 30000 })
    }

    // The shared test accounts reused across this whole suite accumulate
    // basket lines from every prior test run (basket state is server-side,
    // per account, and nothing here has ever cleared it) — a real
    // order-completing test needs a known, single-item basket first, not
    // whatever junk a previous run left behind. Remove-link hrefs are
    // "/basket/<market-path>/remove/<lineId>" — scoped generically by
    // "/remove/" rather than a market-specific prefix, and re-queried
    // fresh on each loop iteration since removing a line reflows the DOM.
    async clearBasket(path: string = '/basket'): Promise<void> {
        await this.proceedToBasketPage(path)
        const removeLink = this.page.locator('a[href*="/remove/"]').first()
        while (await removeLink.count() > 0) {
            await removeLink.click()
            await this.page.waitForLoadState('load')
        }
    }

    // VERIFIED live (staging, 2026-08-05): a guest lands on the checkout
    // landing page (the "Welcome to checkout" guest/sign-in/express
    // choice, e.g. /checkout on UK/IE, /valider-la-commande on FR); a
    // logged-in account skips that landing entirely and goes straight to
    // its own delivery step — both are valid outcomes of this same click.
    // checkoutBasePath defaults to the UK/IE English route.
    async proceedToSecureCheckout(checkoutBasePath: string = '/checkout'): Promise<void> {
        await expect(this.checkoutSubmitButton).toBeVisible({ timeout: 30000 })
        await this.checkoutSubmitButton.click()
        await expect(this.page).toHaveURL(new RegExp(`${checkoutBasePath}(/delivery)?$`), { timeout: 30000 })
    }
}
