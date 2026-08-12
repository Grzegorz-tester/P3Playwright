import { test as baseTest } from '@playwright/test'
import { JTDoveHomePage } from "../pages/JTDoveHomePage";
import { JTDovePDPage } from "../pages/JTDovePDPage";
import { JTDoveBasketPage } from "../pages/JTDoveBasketPage";
import { JTDoveProductListPage } from "../pages/JTDoveProductListPage";
import { JTDoveCheckoutPage } from "../pages/JTDoveCheckoutPage";
import { JTDoveCheckoutSuccessPage } from "../pages/JTDoveCheckoutSuccessPage";
import { JTDoveBranchFinderPage } from "../pages/JTDoveBranchFinderPage";
import { JTDoveLoginPage } from "../pages/JTDoveLoginPage";
import { JTDoveAccountDashboardPage } from "../pages/JTDoveAccountDashboardPage";
import { JTDoveProfilePage } from "../pages/JTDoveProfilePage";
import { JTDoveAddressBookPage } from "../pages/JTDoveAddressBookPage";
import { JTDoveInvoicesPage } from "../pages/JTDoveInvoicesPage";
import { JTDoveWishlistsPage } from "../pages/JTDoveWishlistsPage";
import { JTDoveMakeAPaymentPage } from "../pages/JTDoveMakeAPaymentPage";
import { JTDoveObjects } from "./objects";

const test = baseTest.extend<{
    homePage: JTDoveHomePage
    productDetailPage: JTDovePDPage
    basketPage: JTDoveBasketPage
    productListPage: JTDoveProductListPage
    checkoutPage: JTDoveCheckoutPage
    checkoutSuccessPage: JTDoveCheckoutSuccessPage
    branchFinderPage: JTDoveBranchFinderPage
    loginPage: JTDoveLoginPage
    accountDashboardPage: JTDoveAccountDashboardPage
    profilePage: JTDoveProfilePage
    addressBookPage: JTDoveAddressBookPage
    invoicesPage: JTDoveInvoicesPage
    wishlistsPage: JTDoveWishlistsPage
    makeAPaymentPage: JTDoveMakeAPaymentPage
}>({
    homePage: async ({ page }, use) => {
        await use(new JTDoveHomePage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new JTDovePDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new JTDoveBasketPage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new JTDoveProductListPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new JTDoveCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new JTDoveCheckoutSuccessPage(page))
    },
    branchFinderPage: async ({ page }, use) => {
        await use(new JTDoveBranchFinderPage(page))
    },
    loginPage: async ({ page }, use) => {
        await use(new JTDoveLoginPage(page))
    },
    accountDashboardPage: async ({ page }, use) => {
        await use(new JTDoveAccountDashboardPage(page))
    },
    profilePage: async ({ page }, use) => {
        await use(new JTDoveProfilePage(page))
    },
    addressBookPage: async ({ page }, use) => {
        await use(new JTDoveAddressBookPage(page))
    },
    invoicesPage: async ({ page }, use) => {
        await use(new JTDoveInvoicesPage(page))
    },
    wishlistsPage: async ({ page }, use) => {
        await use(new JTDoveWishlistsPage(page))
    },
    makeAPaymentPage: async ({ page }, use) => {
        await use(new JTDoveMakeAPaymentPage(page))
    },
})

// VERIFIED live (staging, 2026-08-10): staging.jtdove.pub shows a real,
// un-dismissed Cookiebot consent banner that intercepts pointer events on
// every page load (unlike Russells' CookieYes, which only ever appeared on
// production - this one shows on staging too). Dismissed once here,
// deterministically, before any test's own steps run, following the same
// pattern already proven for Russells: a page.on('load', ...) hook raced
// with the test body instead of reliably completing first, so this
// dismisses on a real navigation before the test body runs instead.
// Consent persists via a cookie for the rest of the test once accepted.
test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await JTDoveObjects.Footer.cookieBannerAcceptButton(page).click({ timeout: 5000 }).catch(() => { })
})

export default test
