import test from '../utils/Pages'
import {carbon, kooltech} from "@utils/testUsers";

let productPrice_1

// We can use Steps like in Cucumber format as shown below
test.skip(`Verify User's e2e PLP to Checkout flow: wishlist.`, async ({
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

    await test.step(`Login to Carbon`, async () => {
        //await loginPage.loginToApplication()
    })
    await test.step(`Validate Account page`, async () => {
        await accountPage.waitForLoginToBeCompleted()
        await accountPage.navigateToAccountPage()
        //await accountPage.validateAccountPage()
    })
    await test.step(`Navigate to Category PLP`, async () => {
        await homePage.navigateToHomePage()
        await homePage.chooseMenuCategory('Floor Care')
    })
    await test.step(`Choose an Item from the list and proceed to it's PDP`, async () => {
        await productListPage.clickOnFirstItemToProceedToPDP()
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
