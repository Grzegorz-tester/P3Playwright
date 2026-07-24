import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * PURCHASE JOURNEY (Guest, Portugal)
 * ====================================
 * Guest counterpart to logged-in-purchase-journey.test.ts. Covers: reaching
 * checkout as a GUEST (no login) and confirming the guest-specific branch -
 * "Guest checkout" radio -> email -> a BLANK delivery address FORM - which
 * is genuinely different from the LOGGED-IN shape (a saved-address
 * SELECTION list) covered by the other test.
 *
 * VERIFIED live (staging, 2026-07-22): confirmed guest checkout reaches
 * /checkout/delivery with checkout-address-form visible and no saved-
 * address options present. Stops there deliberately - filling/submitting
 * that form depends on the Address Line 1 autocomplete-suggestion
 * mechanism, already flagged elsewhere in InsinkeratorCheckoutPage.ts as
 * unverified past this point.
 */
test.describe('Purchase Journey (Guest, Portugal)', () => {
    test('User can proceed from PDP through to the guest delivery address form', async ({
        page,
        homePage,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
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
            await checkoutPage.continueAsGuest(`guest.qa.${Date.now()}@velstar.co.uk`)
        })

        await test.step(`Verify the blank guest delivery address form is reached`, async () => {
            console.log(`[STEP] Verify the blank guest delivery address form is reached`)
            await checkoutPage.validateGuestAddressFormReached()
        })
    })
})
