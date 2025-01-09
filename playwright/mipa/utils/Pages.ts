import { test as baseTest } from '@playwright/test'
import { LoginPage } from '../../carbon/pages/LoginPage'
import { AccountPage } from '../../carbon/pages/AccountPage'
import { HomePage } from '../../carbon/pages/HomePage'
import { ProductListPage } from '../../carbon/pages/ProductListPage'
import { ProductDetailPage } from '../../carbon/pages/ProductDetailPage'
import { BasketPage } from '../../carbon/pages/BasketPage'
import { CheckoutPage } from '../../carbon/pages/CheckoutPage'
import { CheckoutSuccessPage } from '../../carbon/pages/CheckoutSuccessPage'

const test = baseTest.extend<{
    loginPage: LoginPage
    accountPage: AccountPage
    homePage: HomePage
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
        await use(new HomePage(page))
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
