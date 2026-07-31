import { test as baseTest } from '@playwright/test'
import { RussellsHomePage } from "../pages/RussellsHomePage";
import { RussellsLoginPage } from "../pages/RussellsLoginPage";
import { RussellsResetPasswordPage } from "../pages/RussellsResetPasswordPage";
import { RussellsAccountPage } from "../pages/RussellsAccountPage";
import { RussellsSitemapPage } from "../pages/RussellsSitemapPage";
import { RussellsProductListPage } from "../pages/RussellsProductListPage";
import { RussellsPDPage } from "../pages/RussellsPDPage";

const test = baseTest.extend<{
    homePage: RussellsHomePage
    loginPage: RussellsLoginPage
    resetPasswordPage: RussellsResetPasswordPage
    accountPage: RussellsAccountPage
    sitemapPage: RussellsSitemapPage
    productListPage: RussellsProductListPage
    productDetailPage: RussellsPDPage
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
})

export default test
