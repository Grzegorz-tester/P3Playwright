import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {kooltech} from "@utils/testUsers";
import {testConfig} from "@utils/testConfig";

// We can use Steps like in Cucumber format as shown below
test.describe( 'Tests with Auto User 1: ', () => {
    test.use({storageState: (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + 'kooltech/tests/.auth/accountTestUser_1.json'});
    test(`Verify User's e2e PLP to Checkout flow: Delivery.`, async ({
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

        const user = Object.assign({}, kooltech.accountTestUser_1)

        await test.step(`Log in to account...`, async () => {
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate and Validate Account page...`, async () => {
            await accountPage.waitForLoginToBeCompleted()
            await accountPage.navigateToAccountPage()
            await accountPage.validateAccountPage()
        })
        await test.step(`Navigate to Category PLP...`, async () => {
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('Chemicals')
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP...`, async () => {
            await productListPage.clickOnAProductToProceedToPDP(products.VIOLET_LIGHT_LED_CHEMICALS.title)
        })
        await test.step(
            `Open PDP, validate price, add to basket, validate basket counter...`,
            async () => {
                await productDetailPage.addToBasket(2)
                await productDetailPage.proceedToBasketPage()
            },
        )
        await test.step(`Proceed to Basket and initiate Checkout...`, async () => {
            await basketPage.proceedToSecureCheckout()
        })
        await test.step(`Selecting delivery options...`, async () => {
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.chooseDeliveryAddress()
            await checkoutPage.chooseDeliveryTimeOptions(1)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })
        await test.step(`Pay on account...`, async () => {
            await checkoutPage.payOnAccount()
        })
        await test.step(`Proceed to Thank You page and verify order email...`, async () => {
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
