import test from '../../utils/Pages'
import { products } from '../../utils/products/products'

/**
 * BASKET INTERACTIONS
 * ====================
 * Covers: the basket page's own quantity picker (increment/decrement,
 * price recalculation, minus-button boundary at quantity 1). VERIFIED live
 * (staging, 2026-08-10).
 */
test.describe('Basket Interactions', () => {
    test('User can adjust the basket quantity, with Minus disabled at quantity 1', async ({
        page,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Clear the basket so it contains exactly one known line`, async () => {
            console.log(`[STEP] Clear the basket so it contains exactly one known line`)
            await basketPage.clearBasket()
        })

        await test.step(`Add a product to basket`, async () => {
            console.log(`[STEP] Add a product to basket`)
            await page.goto(products.HANSON_CEMENT_25KG.link)
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
})
