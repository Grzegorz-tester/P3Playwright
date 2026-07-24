import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * PURCHASE JOURNEY (Guest, Portugal)
 * ====================================
 * Guest counterpart to logged-in-purchase-journey.test.ts. Covers: reaching
 * checkout as a GUEST (no login) - "Guest checkout" radio -> email -> a
 * BLANK delivery address FORM, genuinely different from the LOGGED-IN
 * shape (a saved-address SELECTION list) covered by the other test - then
 * continuing all the way through address autocomplete, delivery, billing
 * and a real CyberSource payment to the thank-you page.
 *
 * VERIFIED live (staging, 2026-07-24) end-to-end, INCLUDING a real
 * submitted order:
 * - Address Line 1 is a genuine TWO-LEVEL autocomplete (street ->
 *   specific numbered address) - see fillGuestAddressForm() in
 *   InsinkeratorCheckoutPage.ts for the full mechanism.
 * - Billing's "Same as delivery address" is a CHECKBOX for guests
 *   (confirmed different from the logged-in flow's radio-selection UI).
 * - Payment goes through CyberSource's Unified Checkout widget
 *   ("Checkout With Card"), paid with the standard CyberSource test card
 *   (4111 1111 1111 1111) - the payment-provider gap documented in
 *   earlier revisions of this project is FIXED.
 *
 * The thank-you page itself is VERIFIED WORKING (staging, 2026-07-24)
 * across 2 independent real completed orders in clean automated runs -
 * each rendered a correct confirmation (order number, receipt email,
 * delivery details). An earlier manual exploration session saw this page
 * return an HTTP 500 "Oops! Something Went Wrong" error twice in a row;
 * that did not reproduce here and is treated as a manual-session false
 * alarm - see the class-level comment on InsinkeratorCheckoutSuccessPage.ts
 * for the full writeup.
 *
 * Every run places a REAL (test-mode) CyberSource order - this test
 * deliberately runs only once per suite execution, not repeated across
 * retries/configs beyond what's needed, since each run creates real order
 * data on staging.
 */
test.describe('Purchase Journey (Guest, Portugal)', () => {
    test('User can complete a guest purchase through to the thank-you page', async ({
        page,
        homePage,
        productDetailPage,
        basketPage,
        checkoutPage,
        checkoutSuccessPage,
    }) => {
        const guestEmail = `guest.qa.${Date.now()}@velstar.co.uk`

        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Add a product to basket as a guest`, async () => {
            console.log(`[STEP] Add a product to basket as a guest`)
            await page.goto('/products/sink-flange-oil-rubbed-bronze')
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Proceed to checkout`, async () => {
            console.log(`[STEP] Proceed to checkout`)
            await page.goto('/basket')
            await basketPage.proceedToSecureCheckout()
        })

        await test.step(`Continue as guest`, async () => {
            console.log(`[STEP] Continue as guest`)
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Verify the blank guest delivery address form is reached`, async () => {
            console.log(`[STEP] Verify the blank guest delivery address form is reached`)
            await checkoutPage.validateGuestAddressFormReached()
        })

        await test.step(`Fill the guest delivery address via autocomplete`, async () => {
            console.log(`[STEP] Fill the guest delivery address via autocomplete`)
            await checkoutPage.fillGuestAddressForm({
                firstName: 'Guest',
                lastName: 'Tester',
                addressSearchTerm: 'Rua Augusta',
            })
        })

        await test.step(`Enter delivery phone number and choose delivery method`, async () => {
            console.log(`[STEP] Enter delivery phone number and choose delivery method`)
            // NOTE: only UK-format numbers currently validate here, regardless
            // of delivery country — a known, temporary limitation.
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07911123456')
        })

        await test.step(`Confirm guest billing address is the same as delivery`, async () => {
            console.log(`[STEP] Confirm guest billing address is the same as delivery`)
            await checkoutPage.confirmGuestBillingSameAsDelivery()
        })

        await test.step(`Verify Review & Payment page reached`, async () => {
            console.log(`[STEP] Verify Review & Payment page reached`)
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Pay with a CyberSource test card`, async () => {
            console.log(`[STEP] Pay with a CyberSource test card`)
            await checkoutPage.payWithCyberSourceTestCard({
                number: '4111111111111111',
                expiryMonth: '12',
                expiryYear: '30',
                securityCode: '123',
            })
        })

        await test.step(`Verify the thank-you page shows the order confirmation`, async () => {
            console.log(`[STEP] Verify the thank-you page shows the order confirmation`)
            await checkoutSuccessPage.verifyThankYouPage(guestEmail)
        })
    })
})
