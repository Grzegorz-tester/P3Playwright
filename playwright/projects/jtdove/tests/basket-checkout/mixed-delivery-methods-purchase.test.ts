import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { products } from '../../utils/products/products'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * MIXED DELIVERY METHODS PURCHASE JOURNEY (Smoke) - JTD-325
 * ===========================================================
 * One product delivered by JT Dove's own fleet, one delivered by 3rd-party
 * courier, one collection-only - verifies the single-branch-per-basket
 * collection rule, stock-based branch blocking, and a full guest checkout
 * to a real completed order. VERIFIED live (staging, 2026-08-10).
 *
 * NOTE: the test case names "Scruffs Black Trade Reflective Beanie Hat
 * T55337" as the 3rd-party-courier product, but that product's PDP 404s
 * on staging despite being correctly indexed in search (CONFIRMED live,
 * 2026-08-10 - a real bug, raised separately). Per explicit user
 * direction, "Scruffs Trade Bobble Hat" is used instead - same
 * courier-only fulfilment, working PDP.
 *
 * Per standing instruction: every completed purchase uses "Velstar" /
 * "Test" as the billing AND delivery name, and carries an order note
 * containing "Velstar test".
 */

const GUEST_EMAIL = generateGuestEmail('jtdove')
const MOBILE_NUMBER = '07700900000'
const DELIVERY_NOTE = 'Velstar test'
const CUSTOMER_NAME = { firstName: 'Velstar', lastName: 'Test' }
// JT Dove's own real registered office address (see the site footer) -
// used via the "Change address" flow rather than relying on Loqate to
// resolve to it (see JTDoveCheckoutPage.fillGuestDeliveryAddress).
const DELIVERY_ADDRESS = {
    addressLine1: '1 Riversdale Way, Newburn Haugh Industrial Estate',
    city: 'Newcastle Upon Tyne',
    county: 'Tyne & Wear',
    postcode: 'NE15 8SF',
}
// Opayo's own published sandbox test Visa card.
const OPAYO_TEST_CARD = { number: '4929000000006', expiryMonth: '12', expiryYear: '30', cvc: '123' }

test.describe('Mixed Delivery Methods Purchase Journey', () => {
    test('Guest can mix JT-Dove delivery, courier delivery and branch collection in one order', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
        checkoutSuccessPage,
    }) => {
        await test.step(`Clear the basket so it contains exactly the three known lines`, async () => {
            console.log(`[STEP] Clear the basket so it contains exactly the three known lines`)
            await basketPage.clearBasket()
        })

        await test.step(`Add the JT-Dove-delivered product to the basket`, async () => {
            console.log(`[STEP] Add the JT-Dove-delivered product to the basket`)
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Add the 3rd-party-courier product to the basket`, async () => {
            console.log(`[STEP] Add the 3rd-party-courier product to the basket`)
            await page.goto(products.SCRUFFS_BOBBLE_HAT.link)
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Switch the JT-Dove-delivered line to Collect at Branch and select a branch with stock greater than 0`, async () => {
            console.log(`[STEP] Switch the JT-Dove-delivered line to Collect at Branch and select a branch with stock greater than 0`)
            await basketPage.proceedToBasketPage()
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await expect(basketPage.branchStockDialog).toContainText('JT Dove South Shields')
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.HANSON_CEMENT_25KG.name)
        })

        await test.step(`Add the second collection-eligible product and verify the system checks stock against the already-selected branch`, async () => {
            console.log(`[STEP] Add the second collection-eligible product and verify the system checks stock against the already-selected branch`)
            await page.goto(products.C16_CARCASSING.link)
            await productDetailPage.addToBasketViaClickAndCollect(0)
            await basketPage.verifyBranchStockDialogOpen()
            await expect(basketPage.branchStockDialog).toContainText('Your selected branch is JT Dove Hetton')
        })

        await test.step(`Verify the product cannot be selected at a branch with 0 stock`, async () => {
            console.log(`[STEP] Verify the product cannot be selected at a branch with 0 stock`)
            await expect(basketPage.branchStockDialog).toContainText('JT Dove Newburn')
            await basketPage.verifyBranchIsUnselectable('JT Dove Newburn')
        })

        await test.step(`Verify the branch cannot be selected if it would leave any collection product in the basket unavailable`, async () => {
            console.log(`[STEP] Verify the branch cannot be selected if it would leave any collection product in the basket unavailable`)
            // CONFIRMED live (staging, 2026-08-11): JT Dove Consett has
            // consistently shown 0 stock of C16 Carcassing across every
            // live check so far (unlike branches with genuinely
            // fluctuating stock, e.g. Seahouses/Hawick/Birtley, which
            // have gone from 0 to non-zero for Hanson Cement between test
            // runs on this live staging environment) - the more reliable
            // choice for this assertion. See basket-shipping-and-collection.test.ts
            // case 116/118 for the dedicated cross-item test using this
            // same branch.
            await basketPage.verifyBranchIsUnselectable('JT Dove Consett')
        })

        await test.step(`Select the already-chosen branch, confirming only one branch is used for the whole basket`, async () => {
            console.log(`[STEP] Select the already-chosen branch, confirming only one branch is used for the whole basket`)
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            // The click & collect dialog was opened directly from the PDP
            // - navigate to the basket page itself for the checks below.
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify the courier-only line still shows Delivered by Courier, unaffected by the collection branch choice`, async () => {
            console.log(`[STEP] Verify the courier-only line still shows Delivered by Courier, unaffected by the collection branch choice`)
            await basketPage.verifyLineShowsDeliveredByCourier(products.SCRUFFS_BOBBLE_HAT.name)
        })

        await test.step(`Proceed to checkout as a guest`, async () => {
            console.log(`[STEP] Proceed to checkout as a guest`)
            await basketPage.proceedToSecureCheckout()
            await expect(page).toHaveURL(/\/checkout\/sign-in$/, { timeout: 20000 })
            await checkoutPage.continueAsGuest(GUEST_EMAIL)
        })

        await test.step(`Complete the Collect at Branch step`, async () => {
            console.log(`[STEP] Complete the Collect at Branch step`)
            await expect(page).toHaveURL(/\/checkout\/click-and-collect$/, { timeout: 20000 })
            await checkoutPage.completeCollectionStep(MOBILE_NUMBER)
        })

        await test.step(`Fill the delivery address using "Velstar Test" as the customer name`, async () => {
            console.log(`[STEP] Fill the delivery address using "Velstar Test" as the customer name`)
            await expect(page).toHaveURL(/\/checkout\/delivery$/, { timeout: 20000 })
            await checkoutPage.fillGuestDeliveryAddress({
                firstName: CUSTOMER_NAME.firstName,
                lastName: CUSTOMER_NAME.lastName,
                ...DELIVERY_ADDRESS,
            })
        })

        await test.step(`Complete delivery details, adding the order note "Velstar test"`, async () => {
            console.log(`[STEP] Complete delivery details, adding the order note "Velstar test"`)
            await checkoutPage.completeDeliveryDetails(MOBILE_NUMBER, DELIVERY_NOTE)
        })

        await test.step(`Use the same address for billing`, async () => {
            console.log(`[STEP] Use the same address for billing`)
            await expect(page).toHaveURL(/\/checkout\/billing$/, { timeout: 20000 })
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })

        await test.step(`Proceed to payment`, async () => {
            console.log(`[STEP] Proceed to payment`)
            await expect(page).toHaveURL(/\/checkout\/review-and-payment$/, { timeout: 20000 })
            await checkoutPage.proceedToPayment()
        })

        await test.step(`Pay with the VISA test card, confirming "Velstar Test" carries through as the cardholder name`, async () => {
            console.log(`[STEP] Pay with the VISA test card, confirming "Velstar Test" carries through as the cardholder name`)
            await expect(page).toHaveURL(/sandbox\.opayo\.eu\.elavon\.com/, { timeout: 30000 })
            await checkoutPage.selectOpayoVisaCard()
            expect(await checkoutPage.getOpayoCardholderName()).toBe('Velstar Test')
            await checkoutPage.payWithOpayoTestCard(
                OPAYO_TEST_CARD.number,
                OPAYO_TEST_CARD.expiryMonth,
                OPAYO_TEST_CARD.expiryYear,
                OPAYO_TEST_CARD.cvc,
            )
        })

        await test.step(`Verify the order is placed successfully`, async () => {
            console.log(`[STEP] Verify the order is placed successfully`)
            await checkoutSuccessPage.verifyThankYouPage(GUEST_EMAIL)
        })

        await test.step(`Verify delivery methods, collection branch and order note are correctly reflected in the order`, async () => {
            console.log(`[STEP] Verify delivery methods, collection branch and order note are correctly reflected in the order`)
            await checkoutSuccessPage.verifyOrderLinesContainText(
                'Collect at JT Dove Hetton',
                products.HANSON_CEMENT_25KG.name,
                products.C16_CARCASSING.name,
                'Courier',
                products.SCRUFFS_BOBBLE_HAT.name,
                'Velstar Test',
            )
            await checkoutSuccessPage.verifyOrderDeliveryNote(DELIVERY_NOTE)
        })
    })
})
