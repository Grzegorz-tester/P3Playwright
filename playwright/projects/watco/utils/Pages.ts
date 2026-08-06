import { test as baseTest } from '@playwright/test'
import { WatcoLoginPage } from '../pages/WatcoLoginPage'
import { WatcoHomePage } from '../pages/WatcoHomePage'
import { WatcoProductListPage } from '../pages/WatcoProductListPage'
import { WatcoPDPage } from '../pages/WatcoPDPage'
import { WatcoBasketPage } from '../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../pages/WatcoCheckoutPage'
import { WatcoAccountPage } from '../pages/WatcoAccountPage'
import { WatcoRegisterPage } from '../pages/WatcoRegisterPage'

const test = baseTest.extend<{
    loginPage: WatcoLoginPage
    homePage: WatcoHomePage
    productListPage: WatcoProductListPage
    productDetailPage: WatcoPDPage
    basketPage: WatcoBasketPage
    checkoutPage: WatcoCheckoutPage
    accountPage: WatcoAccountPage
    registerPage: WatcoRegisterPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new WatcoLoginPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new WatcoHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new WatcoProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new WatcoPDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new WatcoBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new WatcoCheckoutPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new WatcoAccountPage(page))
    },
    registerPage: async ({ page }, use) => {
        await use(new WatcoRegisterPage(page))
    },
})

export default test
