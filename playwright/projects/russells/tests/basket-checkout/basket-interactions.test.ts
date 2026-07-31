import test from '../../utils/Pages'

/**
 * BASKET INTERACTIONS
 * ====================
 * Covers: the basket page's own quantity picker (increment/decrement,
 * price recalculation, minus-button boundary at quantity 1) and the promo
 * code form's invalid-code error handling.
 *
 * VERIFIED live (staging, 2026-07-31):
 * - Incrementing/decrementing recalculates basket-summary__total
 *   correctly (UK "£1,234.56" format).
 * - The minus button is genuinely disabled at quantity 1.
 * - An invalid promo code shows an inline error ("This is not a valid
 *   promo code.") with no testid of its own — asserted via toContainText
 *   on the stable promo-form container.
 */
test.describe('Basket Interactions', () => {
    test('User can adjust the basket quantity, with Minus disabled at quantity 1', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Add a product to basket`, async () => {
            console.log(`[STEP] Add a product to basket`)
            await page.goto('/products/walterscheid-universal-joint-32-x-76mm-standard-duty')
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Increment quantity and validate the total updates correctly`, async () => {
            console.log(`[STEP] Increment quantity and validate the total updates correctly`)
            await basketPage.incrementQuantityAndValidateTotal()
        })

        await test.step(`Decrement quantity and validate the total updates correctly`, async () => {
            console.log(`[STEP] Decrement quantity and validate the total updates correctly`)
            await basketPage.decrementQuantityAndValidateTotal()
        })

        await test.step(`Validate Minus is disabled at quantity 1`, async () => {
            console.log(`[STEP] Validate Minus is disabled at quantity 1`)
            await basketPage.validateMinusButtonDisabledAtMinimumQuantity()
        })
    })

    test('User sees an error when applying an invalid promo code', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Add a product to basket`, async () => {
            console.log(`[STEP] Add a product to basket`)
            await page.goto('/products/walterscheid-universal-joint-32-x-76mm-standard-duty')
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
        })

        await test.step(`Apply an invalid promo code and validate the error`, async () => {
            console.log(`[STEP] Apply an invalid promo code and validate the error`)
            await basketPage.applyPromoCode('INVALIDCODE123')
            await basketPage.assertInvalidPromoCodeShowsError()
        })
    })
})
