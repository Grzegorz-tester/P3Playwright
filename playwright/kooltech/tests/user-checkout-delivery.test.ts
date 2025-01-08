import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {kooltech} from "@utils/testUsers";


let productPrice_1

// We can use Steps like in Cucumber format as shown below
test(`Verify User's e2e PLP to Checkout flow: Delivery.`, async ({
    page,
    accountPage,
    homePage,
    productListPage,
    productDetailPage,
    basketPage,
    checkoutPage,
    checkoutSuccessPage,
}) => {

    const user = Object.assign({}, kooltech.accountTestUser_1)

    await test.step(`Validate Account page`, async () => {
        await accountPage.waitForLoginToBeCompleted()
        await accountPage.navigateToAccountPage()
        await accountPage.validateAccountPage()
    })
    await test.step(`Navigate to Category PLP`, async () => {
        await homePage.navigateToHomePage()
        await homePage.chooseMenuCategory('AC')
    })
    await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
        await productListPage.clickOnAProductToProceedToPDP(products.MUZ_INVERTER_OUTDOOR_AC.title)
    })
    await test.step(
        `Open PDP, validate price, add to basket, validate basket counter`,
        async () => {
            await productDetailPage.addToBasket(2)
            await productDetailPage.proceedToBasketPage()
        },
    )
    await test.step(`Proceed to Basket and through Checkout`, async () => {
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.chooseDeliveryOption('Delivery')
        await checkoutPage.chooseDeliveryAddress(1)
        await checkoutPage.chooseBillingAddressSameAsDelivery()
        await checkoutPage.payOnAccount()
    })
    await test.step(`Proceed to Thank You page`, async () => {
        await checkoutSuccessPage.verifyThankYouPage(user.email)
    })
})
