import test from '../utils/Pages'

let productPrice_1

// We can use Steps like in Cucumber format as shown below
test(`Verify User's e2e PLP to Checkout flow: Click& Collect.`, async ({
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
    await test.step(`Navigate to Carbon Home Page`, async () => {
        await loginPage.navigateToLoginPage()
    })
    await test.step(`Login to Carbon`, async () => {
       // await loginPage.loginToApplication()
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
    /* await test.step(`Proceed to Basket and through Checkout`, async () => {
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.chooseDeliveryOption('Delivery')
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseBillingAddressSameAsDelivery()
        await checkoutPage.payOnAccount()
    })
    await test.step(`Proceed to Thank You page`, async () => {
        await checkoutSuccessPage.verifyThankYouPage()
    })*/
})
