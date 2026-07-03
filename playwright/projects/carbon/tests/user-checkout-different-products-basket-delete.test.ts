import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {carbon} from "@utils/testUsers";
import {testConfig} from "@utils/testConfig";

// We can use Steps like in Cucumber format as shown below
test.describe('Tests with Carbon test user 1: ', () => {
    test.use({storageState: testConfig.getAuthFile()});
    test(`Verify User's e2e PLP to Checkout flow: Different products.`, async ({
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

        await test.step(`Navigate and Validate Account page`, async () => {
            console.log(`[STEP] Navigate and Validate Account page`)
            await accountPage.navigateToAccountPage()
            await accountPage.waitForLoginToBeCompleted()
        })
        await test.step(`Navigate to Category PLP`, async () => {
            console.log(`[STEP] Navigate to Category PLP`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('Appliances')
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
            console.log(`[STEP] Choose an Item from the list and proceed to it's PDP`)
            await productListPage.clickOnAProductToProceedToPDP(products.HOTPOINT_NSWR_WASHING_MACHINE.title)
        })
        await test.step(
            `Open PDP, add 2 items to basket, validate basket counter`,
            async () => {
            console.log(`[STEP] Open PDP, add 2 items to basket, validate basket counter`)
                await productDetailPage.addToBasket(2)
                await productDetailPage.proceedToBasketPage()
            })
        await test.step(`Navigate to Category PLP`, async () => {
            console.log(`[STEP] Navigate to Category PLP`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('Floor Care')
        })
        await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
            console.log(`[STEP] Choose an Item from the list and proceed to it's PDP`)
            await productListPage.clickOnAProductToProceedToPDP(products.SUPER_VAC_VACUUM_CLEANER.title)
        })
        await test.step(
            `Open PDP of product #2, add 1 item to basket, validate basket counter, delete 1 of the products & validate basket counter again`,
            async () => {
            console.log(`[STEP] Open PDP of product #2, add 1 item to basket, validate basket counter, delete 1 of the products & validate basket counter again`)
                await productDetailPage.addToBasket(1)
                await productDetailPage.proceedToBasketPage()
            })
        await test.step(`Delete product from basket and validated basket total changes`, async () => {
            console.log(`[STEP] Delete product from basket and validated basket total changes`)
            await basketPage.deleteProductFromBasket('SUPER_VAC_VACUUM_CLEANER')
        })
        await test.step(`Proceed to Basket and through Checkout`, async () => {
            console.log(`[STEP] Proceed to Basket and through Checkout`)
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.chooseDeliveryAddress(1)
            await checkoutPage.chooseDeliveryDateAndOptions(1)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
            await checkoutPage.payOnAccount()
        })
        await test.step(`Proceed to Thank You page`, async () => {
            console.log(`[STEP] Proceed to Thank You page`)
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
