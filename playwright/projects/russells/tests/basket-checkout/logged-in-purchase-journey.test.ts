import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

/**
 * PURCHASE JOURNEY (Logged-in)
 * =============================
 * Covers: home -> login -> category -> PLP -> PDP -> add to basket ->
 * basket -> checkout (delivery method, saved-address selection, phone +
 * delivery speed, billing "same as delivery") -> review & pay -> a real
 * Global Payments card payment -> the thank-you page.
 *
 * VERIFIED live (staging, 2026-07-31) end-to-end with a real completed
 * order, using accountTestUser_1's permanent fixture delivery/billing
 * address and the standard Global Payments test card
 * (4263970000005262, any future expiry, any 3-digit CVV).
 *
 * This deliberately completes a real order every run — keep it to one run
 * per suite execution. orders.test.ts depends on this having run first.
 */
test.describe('Purchase Journey (Logged-in)', () => {
    test('User can complete a real order end-to-end', async ({
        page,
        homePage,
        loginPage,
        productListPage,
        productDetailPage,
        basketPage,
        checkoutPage,
        checkoutSuccessPage,
    }) => {
        const user = Object.assign({}, russells.accountTestUser_1)

        await test.step(`Log in to account`, async () => {
            console.log(`[STEP] Log in to account`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate to General Parts, then a sub-category PLP`, async () => {
            console.log(`[STEP] Navigate to General Parts, then a sub-category PLP`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('General Parts')
            await homePage.clickSubCategoryTile('general-parts-pto-driveline-components')
        })

        await test.step(`Choose first product and add to basket`, async () => {
            console.log(`[STEP] Choose first product and add to basket`)
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Proceed to Secure Checkout`, async () => {
            console.log(`[STEP] Proceed to Secure Checkout`)
            await page.goto('/basket')
            await basketPage.proceedToSecureCheckout()
        })

        await test.step(`Choose Delivery`, async () => {
            console.log(`[STEP] Choose Delivery`)
            await checkoutPage.chooseDeliveryOption('Delivery')
        })

        await test.step(`Select saved delivery address`, async () => {
            console.log(`[STEP] Select saved delivery address`)
            await checkoutPage.chooseDeliveryAddress(1)
        })

        await test.step(`Enter delivery phone number and choose delivery method`, async () => {
            console.log(`[STEP] Enter delivery phone number and choose delivery method`)
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
        })

        await test.step(`Choose to pay with card`, async () => {
            console.log(`[STEP] Choose to pay with card`)
            await checkoutPage.choosePaymentMethodCard()
        })

        await test.step(`Confirm billing address is same as delivery`, async () => {
            console.log(`[STEP] Confirm billing address is same as delivery`)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })

        await test.step(`Verify Review & Payment page reached`, async () => {
            console.log(`[STEP] Verify Review & Payment page reached`)
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Pay with a Global Payments test card`, async () => {
            console.log(`[STEP] Pay with a Global Payments test card`)
            await checkoutPage.payWithGlobalPaymentsTestCard({
                number: '4263970000005262',
                expiry: '12/29',
                securityCode: '123',
                cardHolderName: 'Fred Automation',
            })
        })

        await test.step(`Verify the thank-you page shows the order confirmation`, async () => {
            console.log(`[STEP] Verify the thank-you page shows the order confirmation`)
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
