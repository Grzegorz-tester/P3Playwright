import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { products } from '../../utils/products/products'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * BASKET SHIPPING & COLLECTION
 * =============================
 * Automates the "Basket Shipping & Collection" suite exported from the
 * test-case tool (JTDOVE-2026-08-11.json, case ids 111-119). Each test
 * below is named after and references its source case id for
 * traceability. VERIFIED live (staging, 2026-08-11).
 *
 * Shared background verified live for every case in this file:
 * - Every basket line renders a "COLLECT AT BRANCH"/"DELIVER" toggle -
 *   plain buttons, no testid. The DISABLED button is always the
 *   currently-ACTIVE method (not an unavailable one) - a courier-only
 *   line has BOTH disabled, permanently locked to Deliver.
 * - Basket lines are NOT one flat, globally-indexed list - they split
 *   across up to two separate containers ("Delivery" heading vs "Collect
 *   at Branch <name>" heading), each independently 0-indexed, so lines
 *   are targeted by product name (JTDoveObjects.BasketPage.lineByProductName),
 *   never position.
 * - There is a single, basket-WIDE "Collect at Branch <name> / Change
 *   Branch" banner (not per-line) once any line is set to collect.
 * - Clicking a line's "Collect at Branch" toggle, or the basket-wide
 *   "Change Branch" button, opens the same "Check Stock In Our Branches"
 *   dialog - every branch row's "Select this branch" button is disabled
 *   when that branch lacks stock for ANY collection line already in the
 *   basket (not just the line being changed).
 *
 * Note on case 111's last bullet ("shipping service shown matches the
 * Shipping Service Type set in admin") - not testable from the
 * storefront alone (no frontend-visible admin config to cross-check
 * against), so it's omitted rather than faked.
 */
test.describe('Basket Shipping & Collection', () => {

    // Case 111: Display correct delivery service per product in basket.
    test('Display correct delivery service per product in basket (case 111)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket`, async () => {
            console.log(`[STEP] Clear the basket`)
            await basketPage.clearBasket()
        })

        await test.step(`Add a JT-Dove-delivered product and a courier-only product`, async () => {
            console.log(`[STEP] Add a JT-Dove-delivered product and a courier-only product`)
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await page.goto(products.SCRUFFS_BOBBLE_HAT.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify the JT-Dove-delivered product displays the JT Dove delivery service by default`, async () => {
            console.log(`[STEP] Verify the JT-Dove-delivered product displays the JT Dove delivery service by default`)
            await basketPage.verifyLineShowsDeliver(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyLineDoesNotShowCourierMessaging(products.HANSON_CEMENT_25KG.name)
        })

        await test.step(`Verify the courier product displays "Delivered by Courier"`, async () => {
            console.log(`[STEP] Verify the courier product displays "Delivered by Courier"`)
            await basketPage.verifyLineShowsDeliveredByCourier(products.SCRUFFS_BOBBLE_HAT.name)
        })

        await test.step(`Switch the JT-Dove-delivered product to Collect at Branch and verify it now displays that service`, async () => {
            console.log(`[STEP] Switch the JT-Dove-delivered product to Collect at Branch and verify it now displays that service`)
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifySelectedBranchIs('JT Dove Hetton')
        })
    })

    // Case 112: Show correct delivery messaging for Courier products.
    test('Show correct delivery messaging for Courier products (case 112)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket`, async () => {
            console.log(`[STEP] Clear the basket`)
            await basketPage.clearBasket()
        })

        await test.step(`Add the courier-only product and the JT-Dove-delivered product`, async () => {
            console.log(`[STEP] Add the courier-only product and the JT-Dove-delivered product`)
            await page.goto(products.SCRUFFS_BOBBLE_HAT.link)
            await productDetailPage.addToBasket(1)
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify the courier product's messaging states delivery by courier and a delivery charge calculated at checkout`, async () => {
            console.log(`[STEP] Verify the courier product's messaging states delivery by courier and a delivery charge calculated at checkout`)
            await basketPage.verifyLineShowsCourierDeliveryChargeMessage(products.SCRUFFS_BOBBLE_HAT.name)
        })

        await test.step(`Verify the JT-Dove-delivered product does not show courier messaging`, async () => {
            console.log(`[STEP] Verify the JT-Dove-delivered product does not show courier messaging`)
            await basketPage.verifyLineDoesNotShowCourierMessaging(products.HANSON_CEMENT_25KG.name)
        })

        await test.step(`Switch the JT-Dove-delivered product to Collect at Branch and verify it still shows no courier messaging`, async () => {
            console.log(`[STEP] Switch the JT-Dove-delivered product to Collect at Branch and verify it still shows no courier messaging`)
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineDoesNotShowCourierMessaging(products.HANSON_CEMENT_25KG.name)
        })
    })

    // Case 113: Display Deliver and Collect at Branch buttons per product.
    test('Display Deliver and Collect at Branch buttons per product (case 113)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and add a JT-Dove-delivered product`, async () => {
            console.log(`[STEP] Clear the basket and add a JT-Dove-delivered product`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify both buttons are shown with Deliver highlighted as the default`, async () => {
            console.log(`[STEP] Verify both buttons are shown with Deliver highlighted as the default`)
            await basketPage.verifyLineShowsBothDeliveryToggleButtons(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyLineShowsDeliver(products.HANSON_CEMENT_25KG.name)
        })

        await test.step(`Change the option to Collect at Branch and verify the highlighted state updates`, async () => {
            console.log(`[STEP] Change the option to Collect at Branch and verify the highlighted state updates`)
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.HANSON_CEMENT_25KG.name)
        })

        await test.step(`Change the option back to Deliver and verify the highlighted state updates again`, async () => {
            console.log(`[STEP] Change the option back to Deliver and verify the highlighted state updates again`)
            await basketPage.switchLineToDeliver(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyLineShowsDeliver(products.HANSON_CEMENT_25KG.name)
        })
    })

    // Case 114: Restrict Click & Collect to a single branch.
    test('Restrict Click & Collect to a single branch (case 114)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and add two collection-eligible products`, async () => {
            console.log(`[STEP] Clear the basket and add two collection-eligible products`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
        })

        await test.step(`Verify the selected branch name is displayed in the basket`, async () => {
            console.log(`[STEP] Verify the selected branch name is displayed in the basket`)
            await basketPage.verifySelectedBranchIs('JT Dove Hetton')
        })

        await test.step(`Add the second collection product via Click & Collect and verify it is checked against the same branch`, async () => {
            console.log(`[STEP] Add the second collection product via Click & Collect and verify it is checked against the same branch`)
            await page.goto(products.C16_CARCASSING.link)
            await productDetailPage.addToBasketViaClickAndCollect(0)
            await basketPage.verifyBranchStockDialogOpen()
            await expect(basketPage.branchStockDialog).toContainText('Your selected branch is JT Dove Hetton')
        })

        await test.step(`Verify the user cannot select a different branch that would leave a collection product unavailable`, async () => {
            console.log(`[STEP] Verify the user cannot select a different branch that would leave a collection product unavailable`)
            // CONFIRMED live (staging, 2026-08-11): JT Dove Consett has
            // consistently shown 0 stock of C16 Carcassing across every
            // live check so far, unlike branches with genuinely
            // fluctuating stock (e.g. Seahouses, which went from
            // blocking Hanson Cement to having stock for it between test
            // runs on this live staging environment) - its "Select this
            // branch" button is disabled, which is how this storefront
            // actually enforces "cannot proceed with Click & Collect
            // products unavailable in one branch" (there is no separate
            // checkout-level block to test - the constraint is enforced
            // entirely at selection time).
            await basketPage.verifyBranchIsUnselectable('JT Dove Consett')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            // The click & collect dialog was opened directly from the PDP
            // - navigate to the basket page itself to check the
            // basket-wide banner below.
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify only one branch is used for the whole basket`, async () => {
            console.log(`[STEP] Verify only one branch is used for the whole basket`)
            await basketPage.verifySelectedBranchIs('JT Dove Hetton')
            await expect(basketPage.collectAtBranchBanner).toHaveCount(1)
        })
    })

    // Case 115: Change Branch availability filtering.
    test('Change Branch availability filtering (case 115)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and set up two collection products at JT Dove Hetton`, async () => {
            console.log(`[STEP] Clear the basket and set up two collection products at JT Dove Hetton`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await page.goto(products.C16_CARCASSING.link)
            await productDetailPage.addToBasketViaClickAndCollect(0)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Click Change Branch and verify the branch selection dialog opens`, async () => {
            console.log(`[STEP] Click Change Branch and verify the branch selection dialog opens`)
            await basketPage.openChangeBranchDialog()
            await basketPage.verifyBranchStockDialogOpen()
        })

        await test.step(`Verify only branches with all basket products in stock are selectable`, async () => {
            console.log(`[STEP] Verify only branches with all basket products in stock are selectable`)
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.verifyBranchIsSelectable('JT Dove South Shields')
        })

        await test.step(`Verify branches missing any basket product's stock are not available for selection`, async () => {
            console.log(`[STEP] Verify branches missing any basket product's stock are not available for selection`)
            // JT Dove Consett: C16 Carcassing consistently 0 stock (see
            // case 114's own comment on why this is the more reliable
            // choice over branches with fluctuating live stock).
            await basketPage.verifyBranchIsUnselectable('JT Dove Consett')
            // JT Dove Newburn: 0 stock of either product.
            await basketPage.verifyBranchIsUnselectable('JT Dove Newburn')
            await basketPage.closeBranchStockDialog()
        })
    })

    // Case 116: Disable Collect at Branch when product unavailable.
    test('Disable Collect at Branch when product unavailable (case 116)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and set the collection branch to JT Dove Consett via Hanson Cement`, async () => {
            console.log(`[STEP] Clear the basket and set the collection branch to JT Dove Consett via Hanson Cement`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            // CONFIRMED live (staging, 2026-08-11): JT Dove Consett has
            // stock of Hanson Cement but 0 stock of C16 Carcassing, which
            // is what this case needs to demonstrate.
            await basketPage.selectBranchInStockDialog('JT Dove Consett')
        })

        await test.step(`Add a product with 0 stock at the selected branch, in Deliver mode`, async () => {
            console.log(`[STEP] Add a product with 0 stock at the selected branch, in Deliver mode`)
            await page.goto(products.C16_CARCASSING.link)
            await productDetailPage.addToBasketViaDelivery(0)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify Collect at Branch is disabled for that product at the currently-selected branch`, async () => {
            console.log(`[STEP] Verify Collect at Branch is disabled for that product at the currently-selected branch`)
            // CONFIRMED live (staging, 2026-08-11): the line-level toggle
            // itself stays clickable (it opens the dialog for any
            // product), but the currently-selected branch's own row in
            // that dialog is disabled - this is how the storefront
            // actually surfaces "Collect at Branch disabled for a product
            // unavailable at the selected branch".
            await basketPage.switchLineToCollectAtBranch(products.C16_CARCASSING.name)
            await basketPage.verifyBranchStockDialogOpen()
            await expect(basketPage.branchStockDialog).toContainText('Your selected branch is JT Dove Consett')
            await basketPage.verifyBranchIsUnselectable('JT Dove Consett')
            await basketPage.closeBranchStockDialog()
            await basketPage.verifyLineShowsDeliver(products.C16_CARCASSING.name)
        })

        await test.step(`Switch to a branch with stock for both products and verify Collect at Branch becomes available`, async () => {
            console.log(`[STEP] Switch to a branch with stock for both products and verify Collect at Branch becomes available`)
            await basketPage.openChangeBranchDialog()
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.switchLineToCollectAtBranch(products.C16_CARCASSING.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.C16_CARCASSING.name)
        })
    })

    // Case 117: Mixed shipping types in basket.
    test('Mixed shipping types in basket (case 117)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and add all three shipping types`, async () => {
            console.log(`[STEP] Clear the basket and add all three shipping types`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await page.goto(products.SCRUFFS_BOBBLE_HAT.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify each product displays its own delivery service independently`, async () => {
            console.log(`[STEP] Verify each product displays its own delivery service independently`)
            await basketPage.verifyLineShowsDeliver(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyLineIsLockedToCourier(products.SCRUFFS_BOBBLE_HAT.name)
            await basketPage.verifyLineShowsDeliveredByCourier(products.SCRUFFS_BOBBLE_HAT.name)
        })

        await test.step(`Change the JT-Dove-delivered product to Collect at Branch and verify the courier product is unaffected`, async () => {
            console.log(`[STEP] Change the JT-Dove-delivered product to Collect at Branch and verify the courier product is unaffected`)
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyLineIsLockedToCourier(products.SCRUFFS_BOBBLE_HAT.name)
            await basketPage.verifyLineShowsDeliveredByCourier(products.SCRUFFS_BOBBLE_HAT.name)
        })
    })

    // Case 118: Branch change updates product availability.
    test('Branch change updates product availability (case 118)', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket and set the collection branch to JT Dove Consett`, async () => {
            console.log(`[STEP] Clear the basket and set the collection branch to JT Dove Consett`)
            await basketPage.clearBasket()
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.switchLineToCollectAtBranch(products.HANSON_CEMENT_25KG.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Consett')
            await page.goto(products.C16_CARCASSING.link)
            await productDetailPage.addToBasketViaDelivery(0)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Verify the second product's Collect at Branch is unavailable at the current branch`, async () => {
            console.log(`[STEP] Verify the second product's Collect at Branch is unavailable at the current branch`)
            await basketPage.switchLineToCollectAtBranch(products.C16_CARCASSING.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.verifyBranchIsUnselectable('JT Dove Consett')
            await basketPage.closeBranchStockDialog()
        })

        await test.step(`Change the basket branch to one with stock for both products`, async () => {
            console.log(`[STEP] Change the basket branch to one with stock for both products`)
            await basketPage.openChangeBranchDialog()
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
        })

        await test.step(`Verify the previously-unavailable product now becomes selectable for collection`, async () => {
            console.log(`[STEP] Verify the previously-unavailable product now becomes selectable for collection`)
            await basketPage.switchLineToCollectAtBranch(products.C16_CARCASSING.name)
            await basketPage.verifyBranchStockDialogOpen()
            await basketPage.verifyBranchIsSelectable('JT Dove Hetton')
            await basketPage.selectBranchInStockDialog('JT Dove Hetton')
            await basketPage.verifyLineShowsCollectAtBranch(products.C16_CARCASSING.name)
        })
    })

    // Case 119: Checkout readiness with delivery types.
    test('Checkout readiness with delivery types (case 119)', async ({
        page,
        productDetailPage,
        basketPage,
        checkoutPage,
    }) => {
        // CONFIRMED live (staging, 2026-08-11): adding BOTH a JT-Dove-
        // delivered product (in Deliver mode) and a courier product
        // together triggers a "Your order is coming in multiple
        // deliveries" flow with a separate calendar date-picker for the
        // JT Dove delivery slot - the calendar has no data-testid on any
        // day cell, so it isn't automated here. This case's own
        // assertions only concern the courier charge, so a courier-only
        // basket demonstrates the same requirement without depending on
        // that unrelated, untestid'd calendar widget.
        await test.step(`Clear the basket and add a courier product`, async () => {
            console.log(`[STEP] Clear the basket and add a courier product`)
            await basketPage.clearBasket()
            await page.goto(products.SCRUFFS_BOBBLE_HAT.link)
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Proceed to checkout as a guest`, async () => {
            console.log(`[STEP] Proceed to checkout as a guest`)
            await basketPage.proceedToSecureCheckout()
            await expect(page).toHaveURL(/\/checkout\/sign-in$/, { timeout: 20000 })
            await checkoutPage.continueAsGuest(generateGuestEmail('jtdove-readiness'))
        })

        await test.step(`Fill the delivery address and select a courier service`, async () => {
            console.log(`[STEP] Fill the delivery address and select a courier service`)
            await expect(page).toHaveURL(/\/checkout\/delivery$/, { timeout: 20000 })
            await checkoutPage.fillGuestDeliveryAddress({
                firstName: 'Velstar',
                lastName: 'Test',
                addressSearchText: 'NE1 4ST',
            })
            await checkoutPage.completeDeliveryDetails('07700900000', 'Velstar test')
        })

        await test.step(`Verify the courier delivery charge is calculated in checkout`, async () => {
            console.log(`[STEP] Verify the courier delivery charge is calculated in checkout`)
            await expect(page).toHaveURL(/\/checkout\/billing$/, { timeout: 20000 })
            await checkoutPage.verifyCourierShippingCostCalculated()
        })
    })
})
