import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { products } from '../../utils/products/products'

/**
 * GUEST CHECKOUT - ADDRESS EDITING
 * =================================
 * Covers: editing the delivery and billing addresses entered during guest
 * checkout, via the two real edit entry points found live on staging,
 * 2026-08-03:
 *  1. The delivery address's own "Change address" button (shown on its
 *     summary card, before Payment Method/Billing are even reached) -
 *     re-opens the SAME form pre-filled with the current address.
 *  2. The Review & Pay page's "Edit" links, one per address (Delivery,
 *     Billing) - each re-opens that step's form.
 *
 * None of these tests complete a real purchase (they stop at Review &
 * Pay) - editing an address doesn't need a real payment to verify.
 *
 * CONFIRMED SITE BUG (RUS-474): the Review & Pay page's two "Edit" links
 * behave inconsistently with each other. Billing's re-opens correctly
 * pre-filled (VERIFIED live, and covered by a normal passing test below).
 * Delivery's instead comes back completely BLANK, losing the previously
 * entered address - confirmed live TWICE via direct input-value reads,
 * not just a visual snapshot, so not a fluke. The last test below is
 * written against the CORRECT/expected behaviour (matching how Billing's
 * already works) on purpose, so it fails until this is fixed, rather than
 * quietly asserting the data loss as "working as intended".
 */
test.describe('Guest Checkout - Address Editing', () => {
    test('Guest can edit their delivery address via its own Change address button', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        const guestEmail = `velstar.qa.guest.editdelivery.${Date.now()}@velstar.co.uk`

        await test.step(`Add a product to basket and continue as guest`, async () => {
            console.log(`[STEP] Add a product to basket and continue as guest`)
            await page.goto(products.WALTERSCHEID_UNIVERSAL_JOINT.link)
            await productDetailPage.validatePDPLoaded()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Choose Delivery and fill in the initial delivery address`, async () => {
            console.log(`[STEP] Choose Delivery and fill in the initial delivery address`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.fillGuestAddressForm({
                firstName: 'Guest',
                lastName: 'Tester',
                addressLine1: '221B Baker Street',
                city: 'London',
                postcode: 'NW1 6XE',
            })
        })

        await test.step(`Change the delivery address and validate the summary updates`, async () => {
            console.log(`[STEP] Change the delivery address and validate the summary updates`)
            await checkoutPage.changeDeliveryAddress({
                firstName: 'Guest',
                lastName: 'Tester',
                addressLine1: '1 Deansgate',
                city: 'Manchester',
                postcode: 'M1 1AE',
            })
            await expect(page.getByText('Manchester', { exact: false })).toBeVisible({ timeout: 15000 })
            await expect(page.getByText('M1 1AE', { exact: false })).toBeVisible()
        })

        await test.step(`Re-enter phone (reset by the address change) and continue`, async () => {
            console.log(`[STEP] Re-enter phone (reset by the address change) and continue`)
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
            await expect(page).toHaveURL(/\/checkout\/payment-method$/, { timeout: 20000 })
        })
    })

    test('Guest can edit their billing address from the Review & Pay page', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        const guestEmail = `velstar.qa.guest.editbilling.${Date.now()}@velstar.co.uk`

        await test.step(`Add a product to basket and continue as guest`, async () => {
            console.log(`[STEP] Add a product to basket and continue as guest`)
            await page.goto(products.WALTERSCHEID_UNIVERSAL_JOINT.link)
            await productDetailPage.validatePDPLoaded()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Fill in the delivery address and continue to Billing`, async () => {
            console.log(`[STEP] Fill in the delivery address and continue to Billing`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.fillGuestAddressForm({
                firstName: 'Guest',
                lastName: 'Tester',
                addressLine1: '221B Baker Street',
                city: 'London',
                postcode: 'NW1 6XE',
            })
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
            await checkoutPage.choosePaymentMethodCard()
        })

        await test.step(`Fill in a DIFFERENT billing address (not same as delivery)`, async () => {
            console.log(`[STEP] Fill in a DIFFERENT billing address (not same as delivery)`)
            await checkoutPage.fillGuestAddressForm({
                firstName: 'Billy',
                lastName: 'Payer',
                addressLine1: '10 Downing Street',
                city: 'London',
                postcode: 'SW1A 2AA',
            })
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Validate the review page shows both distinct addresses`, async () => {
            console.log(`[STEP] Validate the review page shows both distinct addresses`)
            const deliverySummary = await checkoutPage.getReviewAddressSummary('/checkout/delivery')
            const billingSummary = await checkoutPage.getReviewAddressSummary('/checkout/billing')
            expect(deliverySummary).toContain('Guest Tester')
            expect(deliverySummary).toContain('NW1 6XE')
            expect(billingSummary).toContain('Billy Payer')
            expect(billingSummary).toContain('SW1A 2AA')
        })

        await test.step(`Edit the billing address and validate the review page reflects the change`, async () => {
            console.log(`[STEP] Edit the billing address and validate the review page reflects the change`)
            await checkoutPage.editBillingAddressFromReview({
                firstName: 'Billy',
                lastName: 'Payer',
                addressLine1: '1 Victoria Street',
                city: 'Birmingham',
                postcode: 'B1 1AA',
            })
            const updatedBillingSummary = await checkoutPage.getReviewAddressSummary('/checkout/billing')
            expect(updatedBillingSummary).toContain('Billy Payer')
            expect(updatedBillingSummary).toContain('B1 1AA')
        })
    })

    test('CONFIRMED BUG (RUS-474): editing delivery address from Review & Pay should not lose the address', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        const guestEmail = `velstar.qa.guest.editdeliveryreview.${Date.now()}@velstar.co.uk`
        const deliveryAddress = {
            firstName: 'Guest',
            lastName: 'Tester',
            addressLine1: '221B Baker Street',
            city: 'London',
            postcode: 'NW1 6XE',
        }

        await test.step(`Add a product to basket and continue as guest`, async () => {
            console.log(`[STEP] Add a product to basket and continue as guest`)
            await page.goto(products.WALTERSCHEID_UNIVERSAL_JOINT.link)
            await productDetailPage.validatePDPLoaded()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Complete Delivery, Payment Method and Billing (same as delivery)`, async () => {
            console.log(`[STEP] Complete Delivery, Payment Method and Billing (same as delivery)`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.fillGuestAddressForm(deliveryAddress)
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
            await checkoutPage.choosePaymentMethodCard()
            await checkoutPage.chooseBillingAddressSameAsDelivery()
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Validate editing Delivery from Review pre-fills the existing address`, async () => {
            console.log(`[STEP] Validate editing Delivery from Review pre-fills the existing address`)
            await checkoutPage.validateReviewEditDeliveryAddressIsPreFilled(deliveryAddress)
        })
    })
})
