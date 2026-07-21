import { Page, expect } from '@playwright/test';
import { InsinkeratorObjects } from './objects';

/**
 * Dismisses the mandatory "Choose your country" modal that appears on every
 * FRESH page load, by selecting a country.
 *
 * CRITICAL: call this at the start of every spec, right after the first
 * navigation, even if the test doesn't care which country it ends up on.
 * This modal's backdrop (data-testid="overlay") sits on top of the entire
 * page and silently intercepts clicks meant for whatever's underneath —
 * login, checkout submits, anything. An unhandled instance of this modal
 * was the root cause of several confusing "form silently resets on
 * submit" symptoms during initial exploration of this project. Don't
 * assume a form is broken until you've confirmed this overlay is gone.
 *
 * VERIFIED behaviour: this project also gates ecommerce features (basket,
 * add-to-basket, checkout) by country. Ecommerce-enabled countries (e.g.
 * Portugal) show the full purchase flow; others (e.g. Poland) show a
 * "Where to buy" distributor-lookup panel on the PDP instead, with none of
 * the ProductDetailPage/BasketPage/CheckoutPage locators present at all.
 * The ground-truth flag for this is `hasEcom` on the country object stored
 * in localStorage under the `selected-country` key — useful for assertions.
 */
export async function selectCountryOnFreshLoad(page: Page, countryName: string): Promise<void> {
    const overlay = InsinkeratorObjects.CountrySelector.blockingOverlay(page);
    if (await overlay.isVisible({ timeout: 5000 }).catch(() => false)) {
        const option = InsinkeratorObjects.CountrySelector.countryModalOption(countryName)(page);
        await expect(option).toBeVisible({ timeout: 15000 });
        await option.click();
        await expect(overlay).toBeHidden({ timeout: 10000 });
    }
}

/**
 * Changes country mid-session via the utility bar's picker (as opposed to
 * the mandatory fresh-load modal above). Use this when a test needs to
 * switch country after the initial load has already been handled.
 */
export async function changeCountry(page: Page, countryName: string): Promise<void> {
    await InsinkeratorObjects.CountrySelector.utilityBarOpenButton(page).click();
    const option = InsinkeratorObjects.CountrySelector.countryOption(countryName)(page);
    await expect(option).toBeVisible({ timeout: 15000 });
    await option.click();
}
