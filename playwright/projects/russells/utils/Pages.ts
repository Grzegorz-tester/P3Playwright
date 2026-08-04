import { test as baseTest } from '@playwright/test'
import { RussellsHomePage } from "../pages/RussellsHomePage";
import { RussellsLoginPage } from "../pages/RussellsLoginPage";
import { RussellsResetPasswordPage } from "../pages/RussellsResetPasswordPage";
import { RussellsAccountPage } from "../pages/RussellsAccountPage";
import { RussellsSitemapPage } from "../pages/RussellsSitemapPage";
import { RussellsProductListPage } from "../pages/RussellsProductListPage";
import { RussellsPDPage } from "../pages/RussellsPDPage";
import { RussellsBasketPage } from "../pages/RussellsBasketPage";
import { RussellsCheckoutPage } from "../pages/RussellsCheckoutPage";
import { RussellsCheckoutSuccessPage } from "../pages/RussellsCheckoutSuccessPage";
import { RussellsDepotFinderPage } from "../pages/RussellsDepotFinderPage";
import { RussellsQuickEnquiryFormPage } from "../pages/RussellsQuickEnquiryFormPage";
import { RussellsPartsFinderPage } from "../pages/RussellsPartsFinderPage";
import { RussellsObjects } from "./objects";

const test = baseTest.extend<{
    homePage: RussellsHomePage
    loginPage: RussellsLoginPage
    resetPasswordPage: RussellsResetPasswordPage
    accountPage: RussellsAccountPage
    sitemapPage: RussellsSitemapPage
    productListPage: RussellsProductListPage
    productDetailPage: RussellsPDPage
    basketPage: RussellsBasketPage
    checkoutPage: RussellsCheckoutPage
    checkoutSuccessPage: RussellsCheckoutSuccessPage
    depotFinderPage: RussellsDepotFinderPage
    quickEnquiryFormPage: RussellsQuickEnquiryFormPage
    partsFinderPage: RussellsPartsFinderPage
}>({
    homePage: async ({ page }, use) => {
        await use(new RussellsHomePage(page))
    },
    loginPage: async ({ page }, use) => {
        await use(new RussellsLoginPage(page))
    },
    resetPasswordPage: async ({ page }, use) => {
        await use(new RussellsResetPasswordPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new RussellsAccountPage(page))
    },
    sitemapPage: async ({ page }, use) => {
        await use(new RussellsSitemapPage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new RussellsProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new RussellsPDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new RussellsBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new RussellsCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new RussellsCheckoutSuccessPage(page))
    },
    depotFinderPage: async ({ page }, use) => {
        await use(new RussellsDepotFinderPage(page))
    },
    quickEnquiryFormPage: async ({ page }, use) => {
        await use(new RussellsQuickEnquiryFormPage(page))
    },
    partsFinderPage: async ({ page }, use) => {
        await use(new RussellsPartsFinderPage(page))
    },
})

// VERIFIED live (2026-08-04): production (www.russellsparts.com) shows a
// real, un-dismissed CookieYes consent banner that intercepts pointer
// events on every page load - staging never shows it at all (its console
// logs a CookieYes "website URL has changed" error, so the widget appears
// to be registered against the prod domain only and fails silently on
// staging). Dismissed once here, deterministically, before any test's own
// steps run - a page.on('load', ...) hook was tried first but raced with
// the test body instead of reliably completing first. Consent persists via
// a cookie for the rest of the test once accepted, so this one dismissal
// covers whatever pages the test navigates to afterwards. A no-op on
// staging, where the button never appears.
test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await RussellsObjects.Footer.cookieBannerAcceptButton(page).click({ timeout: 5000 }).catch(() => { })
})

export default test
