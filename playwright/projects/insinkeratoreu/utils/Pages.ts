import { test as baseTest } from '@playwright/test'
import { InsinkeratorEuLoginPage } from '../pages/InsinkeratorEuLoginPage'
import { InsinkeratorEuAccountPage } from '../pages/InsinkeratorEuAccountPage'
import { InsinkeratorEuHomePage } from '../pages/InsinkeratorEuHomePage'
import { InsinkeratorEuProductListPage } from '../pages/InsinkeratorEuProductListPage'
import { InsinkeratorEuPDPage } from '../pages/InsinkeratorEuPDPage'
import { InsinkeratorEuBasketPage } from '../pages/InsinkeratorEuBasketPage'
import { InsinkeratorEuCheckoutPage } from '../pages/InsinkeratorEuCheckoutPage'
import { InsinkeratorEuCheckoutSuccessPage } from '../pages/InsinkeratorEuCheckoutSuccessPage'
import { InsinkeratorEuResetPasswordPage } from '../pages/InsinkeratorEuResetPasswordPage'
import { InsinkeratorEuSitemapPage } from '../pages/InsinkeratorEuSitemapPage'

const test = baseTest.extend<{
    loginPage: InsinkeratorEuLoginPage
    accountPage: InsinkeratorEuAccountPage
    homePage: InsinkeratorEuHomePage
    productListPage: InsinkeratorEuProductListPage
    productDetailPage: InsinkeratorEuPDPage
    basketPage: InsinkeratorEuBasketPage
    checkoutPage: InsinkeratorEuCheckoutPage
    checkoutSuccessPage: InsinkeratorEuCheckoutSuccessPage
    resetPasswordPage: InsinkeratorEuResetPasswordPage
    sitemapPage: InsinkeratorEuSitemapPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new InsinkeratorEuLoginPage(page))
    },
    resetPasswordPage: async ({ page }, use) => {
        await use(new InsinkeratorEuResetPasswordPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new InsinkeratorEuAccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new InsinkeratorEuHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new InsinkeratorEuProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new InsinkeratorEuPDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new InsinkeratorEuBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new InsinkeratorEuCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new InsinkeratorEuCheckoutSuccessPage(page))
    },
    sitemapPage: async ({ page }, use) => {
        await use(new InsinkeratorEuSitemapPage(page))
    },
})

export default test
