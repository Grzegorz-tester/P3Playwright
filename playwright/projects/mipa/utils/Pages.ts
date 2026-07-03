import { test as baseTest } from '@playwright/test'
import { MipaLoginPage } from '../pages/MipaLoginPage'
import { MipaAccountPage } from '../pages/MipaAccountPage'
import { MipaHomePage } from '../pages/MipaHomePage'
import { MipaProductListPage } from '../pages/MipaProductListPage'
import { MipaProductDetailPage } from '../pages/MipaProductDetailPage'

const test = baseTest.extend<{
    loginPage: MipaLoginPage
    accountPage: MipaAccountPage
    homePage: MipaHomePage
    productListPage: MipaProductListPage
    productDetailPage: MipaProductDetailPage
}>({
    loginPage: async ({ page }, use) => {
        await use(new MipaLoginPage(page))
    },
    accountPage: async ({ page }, use) => {
        await use(new MipaAccountPage(page))
    },
    homePage: async ({ page }, use) => {
        await use(new MipaHomePage(page))
    },
    productListPage: async ({ page }, use) => {
        await use(new MipaProductListPage(page))
    },
    productDetailPage: async ({ page }, use) => {
        await use(new MipaProductDetailPage(page))
    },
})

export default test
