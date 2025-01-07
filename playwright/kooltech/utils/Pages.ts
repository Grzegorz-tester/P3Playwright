import { test as baseTest } from '@playwright/test'
import { LoginPage } from '../pages/LoginPage'
import { AccountPage } from '../pages/AccountPage'
import { KooltechHomePage } from '../pages/KooltechHomePage'
import { ProductListPage } from '../pages/ProductListPage'
import { ProductDetailPage } from '../pages/ProductDetailPage'
import { BasketPage } from '../pages/BasketPage'
import { CheckoutPage } from '../pages/CheckoutPage'
import { CheckoutSuccessPage } from '../pages/CheckoutSuccessPage'

const test = baseTest.extend<{
    loginPage: LoginPage
    accountPage: AccountPage
    homePage: KooltechHomePage
    productListPage: ProductListPage
    productDetailPage: ProductDetailPage
    basketPage: BasketPage
    checkoutPage: CheckoutPage
    checkoutSuccessPage: CheckoutSuccessPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new KooltechHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new ProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new ProductDetailPage(page))
    },
    basketPage: async ({ page }, use) => {
        await use(new BasketPage(page))
    },
    checkoutPage: async ({ page }, use) => {
        await use(new CheckoutPage(page))
    },
    checkoutSuccessPage: async ({ page }, use) => {
        await use(new CheckoutSuccessPage(page))
    },
})

export default test
