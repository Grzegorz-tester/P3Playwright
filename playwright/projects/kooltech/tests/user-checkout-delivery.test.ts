import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {kooltech} from "@utils/testUsers";
import {testConfig} from "@utils/testConfig";

// We can use Steps like in Cucumber format as shown below
test.describe( 'Tests with Auto User 1: ', () => {
    test.use({storageState: testConfig.getAuthFile()});
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
            console.log(`[STEP] Log in to account...`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate and Validate Account page...`, async () => {
            console.log(`[STEP] Navigate and Validate Account page...`)
            await accountPage.waitForLoginToBeCompleted()
            await accountPage.validateAccountPage()
        })
        await test.step(`Navigate to Category PLP...`, async () => {
            console.log(`[STEP] Navigate to Category PLP...`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('Chemicals')
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP...`, async () => {
            console.log(`[STEP] Choose an Item from the list and proceed to it's PDP...`)
            await productListPage.clickOnAProductToProceedToPDP(products.VIOLET_LIGHT_LED_CHEMICALS.title)
        })
        await test.step(
            `Open PDP, validate price, add to basket, validate basket counter...`,
            async () => {
            console.log(`[STEP] Open PDP, validate price, add to basket, validate basket counter...`)
                await productDetailPage.addToBasket(2)
                await productDetailPage.proceedToBasketPage()
            },
        )
        await test.step(`Proceed to Basket and initiate Checkout...`, async () => {
            console.log(`[STEP] Proceed to Basket and initiate Checkout...`)
            await basketPage.proceedToSecureCheckout()
        })
        await test.step(`Selecting delivery options...`, async () => {
            console.log(`[STEP] Selecting delivery options...`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.chooseDeliveryAddress()
            await checkoutPage.chooseDeliveryDateAndOptions(1)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })
        await test.step(`Pay on account...`, async () => {
            console.log(`[STEP] Pay on account...`)
            await checkoutPage.payOnAccount()
        })
        await test.step(`Proceed to Thank You page and verify order email...`, async () => {
            console.log(`[STEP] Proceed to Thank You page and verify order email...`)
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
