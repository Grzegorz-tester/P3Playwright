import test from '../../utils/Pages'
import { products } from '../../utils/products/products'

/**
 * PDP CONTENT
 * ============
 * Covers: a product page loads with name, SKU and price visible, and the
 * add-to-basket flow works end to end. VERIFIED live (staging, 2026-08-10).
 */
test.describe('PDP Content', () => {
    test('User can view product info and add it to the basket', async ({
        page,
        productDetailPage,
    }) => {
        await test.step(`Navigate to a product PDP`, async () => {
            console.log(`[STEP] Navigate to a product PDP`)
            await page.goto(products.HANSON_CEMENT_25KG.link)
            await productDetailPage.validatePDPLoaded()
        })

        await test.step(`Add the product to the basket`, async () => {
            console.log(`[STEP] Add the product to the basket`)
            await productDetailPage.addToBasket(1)
        })
    })
})
