import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {carbon} from "@utils/testUsers";

// We can use Steps like in Cucumber format as shown below
test.describe( 'Tests with Auto User 1: ', () => {
    test.use({storageState: (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + 'carbon/tests/.auth/accountTestUser_1.json'});
    test.skip(`Verify User's e2e PLP to Checkout flow: Different products.`, async ({
                                                                                        page,
                                                                                        loginPage,
                                                                                        accountPage,
                                                                                        homePage,
                                                                                        productListPage,
                                                                                        productDetailPage,
                                                                                        basketPage,
                                                                                        checkoutPage,
                                                                                        checkoutSuccessPage,
                                                                                    }) => {

        const user = Object.assign({}, carbon.testUser_1)
        const product_1 = Object.assign({}, products.SIMPLE_PURCHASABLE_PRODUCT_9)
        const product_2= Object.assign({}, products.SIMPLE_PURCHASABLE_PRODUCT_8)


        await test.step(`Login `, async () => {
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate to Category PLP`, async () => {
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory(product_1)
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
            await productListPage.clickOnAProductToProceedToPDP(product_1)
        })
        await test.step(
            `Open PDP, add 2 items to basket, validate basket counter`,
            async () => {
                await productDetailPage.addToBasket(2)
                await productDetailPage.proceedToBasketPage()
            })
        await test.step(`Navigate to Category PLP`, async () => {
            await homePage.navigateToHomePage()
            await accountPage.navigateToAccountPage()
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory(product_2)
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
            await productListPage.clickOnAProductToProceedToPDP(product_2)
        })
        await test.step(
            `Open PDP of product #2, add 1 item to basket, validate basket counter, delete 1 of the products & validate basket counter again`,
            async () => {
                await productDetailPage.addToBasket(1)
                await productDetailPage.proceedToBasketPage()
            })
        /*await test.step('Delete product from basket and validated basket total changes', async () => {
            await basketPage.deleteProductFromBasket(product_1)
        })*/
        await test.step(`Proceed to Basket and through Checkout`, async () => {
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.chooseDeliveryAddress(1)
            //await checkoutPage.chooseDeliveryDateAndOptions("1")
            await checkoutPage.chooseBillingAddressSameAsDelivery()
            await checkoutPage.payOnAccount()
        })
        await test.step(`Proceed to Thank You page`, async () => {
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
