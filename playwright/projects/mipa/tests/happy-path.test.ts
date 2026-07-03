import test from '../utils/Pages'
import { products } from "../utils/products/products";
import { mipa } from "@utils/testUsers";
import { testConfig } from "@utils/testConfig";

// Mipa is a search-driven, account-only storefront. This happy path verifies a signed-in
// user can reach the home page, search the catalogue and open a product detail page.
test.describe('Tests with Mipa test user 1: ', () => {
    test.use({storageState: testConfig.getAuthFile()});
    test(`Verify signed-in user can search and view a product.`, async ({
        accountPage,
        homePage,
        productListPage,
        productDetailPage,
    }) => {

        const product = products.KLARLACK_CLEARCOAT

        await test.step(`Navigate and validate Account page`, async () => {
            console.log(`[STEP] Navigate and validate Account page`)
            await accountPage.navigateToAccountPage()
            await accountPage.waitForLoginToBeCompleted()
        })
        await test.step(`Navigate to and validate the Home page`, async () => {
            console.log(`[STEP] Navigate to and validate the Home page`)
            await homePage.navigateToHomePage()
            await homePage.validateHomePage()
        })
        await test.step(`Search the catalogue for a product`, async () => {
            console.log(`[STEP] Search the catalogue for a product`)
            await homePage.searchForProduct(product.searchTerm)
            await productListPage.validatePLP()
        })
        await test.step(`Open the product from the search results and validate its detail page`, async () => {
            console.log(`[STEP] Open the product from the search results and validate its detail page`)
            await productListPage.clickOnAProductToProceedToPDP(product.title)
            await productDetailPage.validateProductDetailPage(product.title)
        })
    })
})
