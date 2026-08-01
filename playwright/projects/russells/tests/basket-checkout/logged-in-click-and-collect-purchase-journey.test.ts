import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

/**
 * PURCHASE JOURNEY (Logged-in, Click & Collect)
 * ================================================
 * Click & Collect counterpart to logged-in-purchase-journey.test.ts. Covers:
 * setting a collection depot on the PDP -> add to basket -> checkout,
 * choosing "Click & Collect" instead of "Delivery" -> confirming the
 * depot (carried through from the PDP) -> phone -> payment method ->
 * billing -> review & pay (verifying the chosen depot is shown) -> a real
 * Global Payments card payment -> the thank-you page.
 *
 * VERIFIED live (staging, 2026-08-01) end-to-end with a real completed
 * order. /checkout/click-and-collect mirrors /checkout/delivery's
 * two-render shape (depot selection, then phone + continue) rather than
 * reusing the same route - see RussellsCheckoutPage for the full step
 * order.
 *
 * This deliberately completes a real order every run — keep it to one run
 * per suite execution.
 */
test.describe('Purchase Journey (Logged-in, Click & Collect)', () => {
    test('User can complete a real Click & Collect order end-to-end', async ({
        page,
        loginPage,
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

        let depotName: string

        await test.step(`Navigate to a PDP and select a collection depot`, async () => {
            console.log(`[STEP] Navigate to a PDP and select a collection depot`)
            await page.goto('/products/roller-for-cnh-nh-92087109')
            await productDetailPage.validatePDPLoaded()
            depotName = await productDetailPage.selectFirstDepotForLocation('York')
            await productDetailPage.validateDepotSelected(depotName)
        })

        await test.step(`Add to basket and proceed to Secure Checkout`, async () => {
            console.log(`[STEP] Add to basket and proceed to Secure Checkout`)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
        })

        await test.step(`Choose Click & Collect`, async () => {
            console.log(`[STEP] Choose Click & Collect`)
            await checkoutPage.chooseDeliveryOption('Click & Collect')
        })

        await test.step(`Confirm the collection depot carried through from the PDP`, async () => {
            console.log(`[STEP] Confirm the collection depot carried through from the PDP`)
            await checkoutPage.confirmCollectionDepotAndContinue()
        })

        await test.step(`Enter a phone number and continue`, async () => {
            console.log(`[STEP] Enter a phone number and continue`)
            await checkoutPage.enterCollectionPhoneNumberAndContinue('07700900000')
        })

        await test.step(`Choose to pay with card`, async () => {
            console.log(`[STEP] Choose to pay with card`)
            await checkoutPage.choosePaymentMethodCard()
        })

        await test.step(`Confirm billing address is same as delivery`, async () => {
            console.log(`[STEP] Confirm billing address is same as delivery`)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })

        await test.step(`Verify Review & Payment page shows the chosen depot`, async () => {
            console.log(`[STEP] Verify Review & Payment page shows the chosen depot`)
            await checkoutPage.verifyReachedReviewAndPayment()
            await checkoutPage.verifyReviewShowsCollectionDepot()
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
