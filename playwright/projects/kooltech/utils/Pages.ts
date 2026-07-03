import { test as baseTest } from '@playwright/test'
import { KooltechLoginPage } from '../pages/KooltechLoginPage'
import { KooltechAccountPage } from '../pages/KooltechAccountPage'
import { KooltechHomePage } from '../pages/KooltechHomePage'
import { KooltechProductListPage } from '../pages/KooltechProductListPage'
import { KooltechPDPage } from '../pages/KooltechPDPage'
import { KooltechBasketPage } from '../pages/KooltechBasketPage'
import { KooltechCheckoutPage } from '../pages/KooltechCheckoutPage'
import { KooltechCheckoutSuccessPage } from '../pages/KooltechCheckoutSuccessPage'

const test = baseTest.extend<{
    loginPage: KooltechLoginPage
    accountPage: KooltechAccountPage
    homePage: KooltechHomePage
    productListPage: KooltechProductListPage
    productDetailPage: KooltechPDPage
    basketPage: KooltechBasketPage
    checkoutPage: KooltechCheckoutPage
    checkoutSuccessPage: KooltechCheckoutSuccessPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new KooltechLoginPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new KooltechAccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new KooltechHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new KooltechProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new KooltechPDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new KooltechBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new KooltechCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new KooltechCheckoutSuccessPage(page))
    },
})

export default test
