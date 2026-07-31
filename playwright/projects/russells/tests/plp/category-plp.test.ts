import test from '../../utils/Pages'

/**
 * CATEGORY PLP
 * ============
 * Covers: header nav General Parts -> a real sub-category tile ->
 * /category/general-parts-pto-driveline-components (a genuine, filterable
 * Algolia-backed PLP) -> filtering, sorting, load more, and clicking
 * through to the correct PDP.
 *
 * VERIFIED live (staging, 2026-07-31):
 * - "Hub" pages like /general-parts-parts (reached via the header nav) are
 *   landing pages with sub-category tiles; the PTO Driveline & Components
 *   tile is what reaches the real, filterable PLP.
 * - Facet groups (Brand, Sub Product Category, Sub Sub Product Category,
 *   Model List) are collapsed accordions - the first visible facet
 *   checkbox's own label carries its live result count, e.g.
 *   "PTO YOKES & JOINT ASSEMBLIES (348)".
 * - Sorting by Price: Low to High works correctly - results re-render in
 *   real ascending price order (UK "£1,234.56" format).
 * - Load more appends the next page of results.
 */
test.describe('Category PLP', () => {
    test('User can filter, sort, load more, and reach the correct PDP', async ({
        homePage,
        productListPage,
        productDetailPage,
    }) => {
        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        await test.step(`Go to General Parts, then a sub-category, to reach the PLP`, async () => {
            console.log(`[STEP] Go to General Parts, then a sub-category, to reach the PLP`)
            await homePage.chooseMenuCategory('General Parts')
            await homePage.clickSubCategoryTile('general-parts-pto-driveline-components')
            await productListPage.validatePLPLoaded()
        })

        await test.step(`Filter results by the first available facet`, async () => {
            console.log(`[STEP] Filter results by the first available facet`)
            await productListPage.openFilterAndSortDrawer()
            await productListPage.applyFirstFacetFilterAndValidate()
        })

        await test.step(`Sort by price and verify ascending order`, async () => {
            console.log(`[STEP] Sort by price and verify ascending order`)
            await productListPage.selectSortByPriceLowToHighAndValidateAscendingOrder()
        })

        await test.step(`Load more results`, async () => {
            console.log(`[STEP] Load more results`)
            await productListPage.loadMoreAndValidate()
        })

        await test.step(`Click the first result and verify the correct PDP`, async () => {
            console.log(`[STEP] Click the first result and verify the correct PDP`)
            const expectedName = await productListPage.clickFirstResult()
            await productDetailPage.validateProductNameMatches(expectedName)
        })
    })
})
