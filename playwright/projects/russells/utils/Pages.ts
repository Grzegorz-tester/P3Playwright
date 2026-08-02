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
})

export default test
