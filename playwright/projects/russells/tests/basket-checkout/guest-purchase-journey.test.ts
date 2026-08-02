import test from '../../utils/Pages'
import { generateDeliveryAddress } from '@utils/fakeData'

/**
 * PURCHASE JOURNEY (Guest)
 * =========================
 * Guest counterpart to logged-in-purchase-journey.test.ts. Covers: PDP ->
 * add to basket -> checkout, choosing "Guest checkout" (email only, no
 * account) -> Delivery -> a blank delivery address form (no saved
 * addresses, no autocomplete - unlike Insinkerator's Loqate lookup) ->
 * phone + delivery speed -> payment method -> billing ("same as
 * delivery" checkbox, always shown for guest - there's no saved billing
 * address to offer instead) -> review & pay -> a real Global Payments
 * card payment -> the thank-you page, verified in full against values
 * captured live during the journey.
 *
 * VERIFIED live (staging, 2026-08-01) end-to-end with a real completed
 * order (000168), using the standard Global Payments test card
 * (4263970000005262, any future expiry, any 3-digit CVV).
 *
 * NOTE: an earlier manual exploration session saw "Add to Basket" fail
 * with "An error has occurred" for every guest attempt - traced to stale
 * cookies left over from hours of logged-in testing on the SAME browser
 * profile, not a real site bug (confirmed working immediately in a fresh
 * incognito window, and again here after clearing cookies). A real
 * Playwright test gets its own fresh browser context per run, so this
 * was never a risk to the automated suite - documented here only so a
 * future "guest add-to-basket is broken" scare is recognised as this
 * same false alarm rather than re-investigated from scratch.
 *
 * This deliberately completes a real order every run — keep it to one run
 * per suite execution.
 */
test.describe('Purchase Journey (Guest)', () => {
    test('User can complete a real guest order end-to-end', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
        checkoutSuccessPage,
    }) => {
        const guestEmail = `velstar.qa.guest.${Date.now()}@velstar.co.uk`
        const address = generateDeliveryAddress()

        let productName: string
        let productSku: string

        await test.step(`Navigate to a PDP, capture its details, and add to basket`, async () => {
            console.log(`[STEP] Navigate to a PDP, capture its details, and add to basket`)
            await page.goto('/products/walterscheid-universal-joint-32-x-76mm-standard-duty')
            await productDetailPage.validatePDPLoaded()
            productName = (await productDetailPage.productName.textContent()) ?? ''
            productSku = (await productDetailPage.productSku.first().textContent()) ?? ''
            await productDetailPage.addToBasket(1)
        })

        let productPrice: string

        await test.step(`Capture the price and proceed to Secure Checkout`, async () => {
            console.log(`[STEP] Capture the price and proceed to Secure Checkout`)
            await basketPage.proceedToBasketPage()
            productPrice = await basketPage.getFirstLinePrice()
            await basketPage.proceedToSecureCheckout()
        })

        await test.step(`Continue as guest`, async () => {
            console.log(`[STEP] Continue as guest`)
            await checkoutPage.continueAsGuest(guestEmail)
        })

        await test.step(`Choose Delivery`, async () => {
            console.log(`[STEP] Choose Delivery`)
            await checkoutPage.chooseDeliveryOption('Delivery')
        })

        await test.step(`Fill in the guest delivery address`, async () => {
            console.log(`[STEP] Fill in the guest delivery address`)
            await checkoutPage.fillGuestAddressForm({
                firstName: address.firstName,
                lastName: address.lastName,
                addressLine1: address.addressLine1,
                city: address.city,
                postcode: address.postcode,
            })
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

        let shippingCost: string

        await test.step(`Verify Review & Payment page reached and capture the shipping cost`, async () => {
            console.log(`[STEP] Verify Review & Payment page reached and capture the shipping cost`)
            await checkoutPage.verifyReachedReviewAndPayment()
            shippingCost = await checkoutPage.getReviewShippingCost()
        })

        await test.step(`Pay with a Global Payments test card`, async () => {
            console.log(`[STEP] Pay with a Global Payments test card`)
            await checkoutPage.payWithGlobalPaymentsTestCard({
                number: '4263970000005262',
                expiry: '12/29',
                securityCode: '123',
                cardHolderName: `${address.firstName} ${address.lastName}`,
            })
        })

        await test.step(`Verify the thank-you page shows the order confirmation`, async () => {
            console.log(`[STEP] Verify the thank-you page shows the order confirmation`)
            await checkoutSuccessPage.verifyThankYouPage(guestEmail)
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

        await test.step(`Verify the delivery method and address`, async () => {
            console.log(`[STEP] Verify the delivery method and address`)
            await checkoutSuccessPage.verifyDeliveryMethod('DPD')
            await checkoutSuccessPage.verifyDeliveryAddressContains([
                `${address.firstName} ${address.lastName}`,
                address.addressLine1,
                address.city,
                address.postcode,
                '07700900000',
            ])
        })

        await test.step(`Verify the order summary`, async () => {
            console.log(`[STEP] Verify the order summary`)
            const subtotal = parseFloat(productPrice.replace(/[£,]/g, ''))
            const shipping = parseFloat(shippingCost.replace(/[£,]/g, ''))
            await checkoutSuccessPage.verifyOrderSummary({
                subtotal: productPrice,
                shippingTotal: shippingCost,
                total: `£${(subtotal + shipping).toFixed(2)}`,
            })
        })

        await test.step(`Verify the payment section is present`, async () => {
            console.log(`[STEP] Verify the payment section is present`)
            await checkoutSuccessPage.verifyPaymentDetailsSectionPresent()
        })
    })
})
