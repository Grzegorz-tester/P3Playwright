import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

// UK pricing: "£" prefix, comma thousands separator, period decimal.
function parsePrice(text: string): number {
    const match = text.match(/£\s*([\d,]+\.\d+)/)
    if (!match) {
        throw new Error(`Could not parse a price out of "${text}"`)
    }
    return parseFloat(match[1].replace(/,/g, ''))
}

function formatPrice(amount: number): string {
    return `£${amount.toFixed(2)}`
}

/**
 * PURCHASE JOURNEY (Logged-in)
 * =============================
 * Covers: home -> login -> category -> PLP -> PDP -> add to basket ->
 * basket -> checkout (delivery method, saved-address selection, phone +
 * delivery speed, billing "same as delivery") -> review & pay -> a real
 * Global Payments card payment -> the thank-you page, verified in full
 * (order line, delivery method/address, order summary, payment section)
 * against values captured live during the journey rather than hardcoded.
 *
 * VERIFIED live (staging, 2026-07-31) end-to-end with a real completed
 * order, using accountTestUser_1's permanent fixture delivery/billing
 * address and the standard Global Payments test card
 * (4263970000005262, any future expiry, any 3-digit CVV).
 *
 * CONFIRMED live (staging, 2026-08-01): the basket is tied to the account
 * server-side, not the browser session — leftover items from an earlier
 * interrupted run/manual exploration on this SAME shared test account
 * silently carry into the next run's order, breaking an exact-line-count
 * assertion. Clearing the basket first makes this deterministic.
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

        await test.step(`Clear the basket so the order contains exactly one known line`, async () => {
            console.log(`[STEP] Clear the basket so the order contains exactly one known line`)
            await basketPage.clearBasket()
        })

        await test.step(`Navigate to General Parts, then a sub-category PLP`, async () => {
            console.log(`[STEP] Navigate to General Parts, then a sub-category PLP`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('General Parts')
            await homePage.clickSubCategoryTile('general-parts-pto-driveline-components')
        })

        let productName: string
        let productSku: string
        let productPrice: string

        await test.step(`Choose first product, capture its name and SKU, and add to basket`, async () => {
            console.log(`[STEP] Choose first product, capture its name and SKU, and add to basket`)
            await productListPage.clickOnFirstItemToProceedToPDP()
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
            await page.goto('/basket')
            productPrice = await basketPage.getFirstLinePrice()
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

        await test.step(`Verify the delivery method and address`, async () => {
            console.log(`[STEP] Verify the delivery method and address`)
            await checkoutSuccessPage.verifyDeliveryMethod('DPD')
            await checkoutSuccessPage.verifyDeliveryAddressContains(['Fred Automation', '221B Baker Street', 'London', 'NW1 6XE', '07700900000'])
        })

        await test.step(`Verify the order summary`, async () => {
            console.log(`[STEP] Verify the order summary`)
            await checkoutSuccessPage.verifyOrderSummary({
                subtotal: productPrice,
                shippingTotal: shippingCost,
                total: formatPrice(parsePrice(productPrice) + parsePrice(shippingCost)),
            })
        })

        await test.step(`Verify the payment section is present`, async () => {
            console.log(`[STEP] Verify the payment section is present`)
            await checkoutSuccessPage.verifyPaymentDetailsSectionPresent()
        })
    })
})
