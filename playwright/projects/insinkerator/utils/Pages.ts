import { test as baseTest } from '@playwright/test'
import { InsinkeratorLoginPage } from '../pages/InsinkeratorLoginPage'
import { InsinkeratorAccountPage } from '../pages/InsinkeratorAccountPage'
import { InsinkeratorHomePage } from '../pages/InsinkeratorHomePage'
import { InsinkeratorProductListPage } from '../pages/InsinkeratorProductListPage'
import { InsinkeratorPDPage } from '../pages/InsinkeratorPDPage'
import { InsinkeratorBasketPage } from '../pages/InsinkeratorBasketPage'
import { InsinkeratorCheckoutPage } from '../pages/InsinkeratorCheckoutPage'
import { InsinkeratorCheckoutSuccessPage } from '../pages/InsinkeratorCheckoutSuccessPage'
import { InsinkeratorResetPasswordPage } from '../pages/InsinkeratorResetPasswordPage'

const test = baseTest.extend<{
    loginPage: InsinkeratorLoginPage
    accountPage: InsinkeratorAccountPage
    homePage: InsinkeratorHomePage
    productListPage: InsinkeratorProductListPage
    productDetailPage: InsinkeratorPDPage
    basketPage: InsinkeratorBasketPage
    checkoutPage: InsinkeratorCheckoutPage
    checkoutSuccessPage: InsinkeratorCheckoutSuccessPage
    resetPasswordPage: InsinkeratorResetPasswordPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new InsinkeratorLoginPage(page))
    },
    resetPasswordPage: async ({ page }, use) => {
        await use(new InsinkeratorResetPasswordPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new InsinkeratorAccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new InsinkeratorHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new InsinkeratorProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new InsinkeratorPDPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new InsinkeratorBasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new InsinkeratorCheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new InsinkeratorCheckoutSuccessPage(page))
    },
})

export default test
