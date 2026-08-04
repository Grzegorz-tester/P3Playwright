import test from '../../utils/Pages'
import { generateDeliveryAddress } from '@utils/fakeData'
import { products } from '../../utils/products/products'

/**
 * PAYMENT ALTERNATIVES AND FAILURES
 * ==================================
 * Covers two payment-related paths the purchase-journey tests don't touch:
 * the PayPal option offered alongside Global Payments card at
 * /checkout/payment-method, and a declined card at Review & Pay.
 *
 * PAYPAL (VERIFIED live, staging, 2026-08-03): the PayPal button on
 * /checkout/payment-method renders inside the PayPal SDK's own iframe (no
 * testid, no stable frame name — a third-party widget, not this
 * storefront's markup) and opens a POPUP window rather than redirecting
 * in-tab. That popup's URL carries "env=production" — this integration
 * points at PayPal's real, production environment even on staging, so
 * clicking through and authenticating would place a genuine PayPal
 * transaction. This test deliberately stops at confirming the popup opens
 * and lands on paypal.com, and never logs in or completes a payment.
 *
 * DECLINED CARD (CONFIRMED live, staging, 2026-08-03): Global Payments'
 * own decline test card (4000120000001154, any future expiry, any 3-digit
 * CVV) fails gracefully with a "Payment Error" alert instead of
 * completing the order - the customer stays on /checkout/review-and-payment
 * with the card form still filled in and can retry immediately, no basket
 * lost and no order created.
 */
test.describe('Payment Alternatives and Failures', () => {
    test('PayPal button opens a popup that redirects to paypal.com', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        const guestEmail = `velstar.qa.guest.paypal.${Date.now()}@velstar.co.uk`
        const address = generateDeliveryAddress()

        await test.step(`Add a product to basket and continue as guest`, async () => {
            console.log(`[STEP] Add a product to basket and continue as guest`)
            await page.goto(products.WALTERSCHEID_UNIVERSAL_JOINT.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Choose Delivery, fill in the address and reach Payment Method`, async () => {
            console.log(`[STEP] Choose Delivery, fill in the address and reach Payment Method`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.fillGuestAddressForm({
                firstName: address.firstName,
                lastName: address.lastName,
                addressLine1: address.addressLine1,
                city: address.city,
                postcode: address.postcode,
            })
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
        })

        await test.step(`Click PayPal and verify it opens a popup redirecting to paypal.com`, async () => {
            console.log(`[STEP] Click PayPal and verify it opens a popup redirecting to paypal.com`)
            await checkoutPage.clickPayPalAndVerifyRedirectsToPayPal()
        })
    })

    test('A declined card fails gracefully at Review & Pay without losing the order', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        const guestEmail = `velstar.qa.guest.decline.${Date.now()}@velstar.co.uk`
        const address = generateDeliveryAddress()

        await test.step(`Add a product to basket and continue as guest`, async () => {
            console.log(`[STEP] Add a product to basket and continue as guest`)
            await page.goto(products.WALTERSCHEID_UNIVERSAL_JOINT.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Complete Delivery, Payment Method and Billing (same as delivery)`, async () => {
            console.log(`[STEP] Complete Delivery, Payment Method and Billing (same as delivery)`)
            await checkoutPage.chooseDeliveryOption('Delivery')
            await checkoutPage.fillGuestAddressForm({
                firstName: address.firstName,
                lastName: address.lastName,
                addressLine1: address.addressLine1,
                city: address.city,
                postcode: address.postcode,
            })
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07700900000')
            await checkoutPage.choosePaymentMethodCard()
            await checkoutPage.chooseBillingAddressSameAsDelivery()
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Pay with a declining Global Payments test card and verify the graceful failure`, async () => {
            console.log(`[STEP] Pay with a declining Global Payments test card and verify the graceful failure`)
            await checkoutPage.payWithDecliningGlobalPaymentsTestCard({
                number: '4000120000001154',
                expiry: '12/29',
                securityCode: '123',
                cardHolderName: `${address.firstName} ${address.lastName}`,
            })
        })
    })
})
