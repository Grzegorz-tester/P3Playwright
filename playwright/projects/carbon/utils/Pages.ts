import { test as baseTest } from '@playwright/test'
import { CarbonLoginPage } from '../pages/CarbonLoginPage'
import { CarbonAccountPage } from '../pages/CarbonAccountPage'
import { CarbonHomePage } from '../pages/CarbonHomePage'
import { CarbonProductListPage } from '../pages/CarbonProductListPage'
import { CarbonProductDetailPage } from '../pages/CarbonProductDetailPage'
import { CarbonBasketPage } from '../pages/CarbonBasketPage'
import { CarbonCheckoutPage } from '../pages/CarbonCheckoutPage'
import { CarbonCheckoutSuccessPage } from '../pages/CarbonCheckoutSuccessPage'

const test = baseTest.extend<{
    loginPage: CarbonLoginPage
    accountPage: CarbonAccountPage
    homePage: CarbonHomePage
    productListPage: CarbonProductListPage
    productDetailPage: CarbonProductDetailPage
    basketPage: CarbonBasketPage
    checkoutPage: CarbonCheckoutPage
    checkoutSuccessPage: CarbonCheckoutSuccessPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new CarbonLoginPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new CarbonAccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new CarbonHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new CarbonProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new CarbonProductDetailPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new CarbonBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CarbonCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new CarbonCheckoutSuccessPage(page))
    },
})

export default test
