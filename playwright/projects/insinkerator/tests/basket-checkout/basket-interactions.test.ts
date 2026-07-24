import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * BASKET INTERACTIONS (Portugal)
 * ===============================
 * Covers: the basket page's own quantity picker (increment/decrement,
 * price recalculation, minus-button boundary at quantity 1) and the promo
 * code form's invalid-code error handling.
 *
 * VERIFIED live (staging, 2026-07-22):
 * - Incrementing/decrementing recalculates basket-summary__total
 *   correctly (confirmed exact doubling 35,50 € -> 71,00 € for qty 1 -> 2).
 * - The minus button is genuinely disabled at quantity 1 (not just
 *   visually - clicking it while disabled times out rather than silently
 *   doing nothing).
 * - An invalid promo code shows a clear inline error ("This is not a
 *   valid promo code.") with no testid of its own - last-resort text
 *   anchor, see BasketPage.promoCodeError in objects.ts.
 */
test.describe('Basket Interactions (Portugal)', () => {
    test('User can adjust the basket quantity, with Minus disabled at quantity 1', async ({
        page,
        homePage,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Add a product to basket`, async () => {
            console.log(`[STEP] Add a product to basket`)
            await page.goto('/products/sink-flange-oil-rubbed-bronze')
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
        homePage,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Add a product to basket`, async () => {
            console.log(`[STEP] Add a product to basket`)
            await page.goto('/products/sink-flange-oil-rubbed-bronze')
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
