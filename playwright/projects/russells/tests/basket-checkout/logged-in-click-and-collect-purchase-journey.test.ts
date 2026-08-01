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
 * Global Payments card payment -> the thank-you page, verified in full
 * (order line, collection method/depot, order summary, payment section)
 * against values captured live during the journey rather than hardcoded.
 *
 * VERIFIED live (staging, 2026-08-01) end-to-end with a real completed
 * order. /checkout/click-and-collect mirrors /checkout/delivery's
 * two-render shape (depot selection, then phone + continue) rather than
 * reusing the same route - see RussellsCheckoutPage for the full step
 * order.
 *
 * CONFIRMED live (staging, 2026-08-01): the basket is tied to the account
 * server-side, not the browser session — leftover items from an earlier
 * interrupted run/manual exploration on this SAME shared test account
 * silently carry into the next run's order (this is exactly how a real
 * run once ended up confirming a 2-line order instead of the 1 line this
 * test actually added). Clearing the basket first makes this deterministic.
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

        await test.step(`Clear the basket so the order contains exactly one known line`, async () => {
            console.log(`[STEP] Clear the basket so the order contains exactly one known line`)
            await basketPage.clearBasket()
        })

        let depotName: string
        let productName: string
        let productSku: string
        let productPrice: string

        await test.step(`Navigate to a PDP, select a collection depot, and capture its details`, async () => {
            console.log(`[STEP] Navigate to a PDP, select a collection depot, and capture its details`)
            await page.goto('/products/roller-for-cnh-nh-92087109')
            await productDetailPage.validatePDPLoaded()
            const depot = await productDetailPage.selectFirstDepotForLocation('York')
            depotName = depot.name
            await productDetailPage.validateDepotSelected(depotName)
            productName = (await productDetailPage.productName.textContent()) ?? ''
            productSku = (await productDetailPage.productSku.first().textContent()) ?? ''
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Capture the price and proceed to Secure Checkout`, async () => {
            console.log(`[STEP] Capture the price and proceed to Secure Checkout`)
            // CONFIRMED live (staging, 2026-08-01): reading the price on the
            // PDP and comparing it against the order confirmation later
            // failed intermittently — prices on this environment have been
            // observed to change mid-session (likely a live backend sync
            // job). Reading it here instead, seconds before payment,
            // narrows that window.
            await basketPage.proceedToBasketPage()
            productPrice = await basketPage.getFirstLinePrice()
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

        await test.step(`Verify the order line matches what was actually purchased`, async () => {
            console.log(`[STEP] Verify the order line matches what was actually purchased`)
            await checkoutSuccessPage.verifyOrderLines([{
                name: productName,
                sku: productSku,
                quantity: 1,
                unitPrice: productPrice,
                totalPrice: productPrice,
            }])
        })

        await test.step(`Verify the collection method and depot`, async () => {
            console.log(`[STEP] Verify the collection method and depot`)
            await checkoutSuccessPage.verifyDeliveryMethod('Click & Collect')
            await checkoutSuccessPage.verifyDeliveryAddressContains(['Fred Automation', depotName, '07700900000'])
        })

        await test.step(`Verify the order summary has no shipping cost`, async () => {
            console.log(`[STEP] Verify the order summary has no shipping cost`)
            await checkoutSuccessPage.verifyOrderSummary({
                subtotal: productPrice,
                total: productPrice,
            })
        })

        await test.step(`Verify the payment section is present`, async () => {
            console.log(`[STEP] Verify the payment section is present`)
            await checkoutSuccessPage.verifyPaymentDetailsSectionPresent()
        })
    })
})
