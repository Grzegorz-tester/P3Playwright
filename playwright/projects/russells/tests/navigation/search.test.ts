import test from '../../utils/Pages'

/**
 * HEADER SEARCH
 * =============
 * Covers: the header's inline Algolia-backed search (autocomplete input,
 * always visible - unlike Insinkerator's search DRAWER, opened by an icon),
 * live as-you-type results for a query, and submitting to the full
 * /search results page.
 *
 * VERIFIED live (staging, 2026-07-31): desktop search is a plain input in
 * the brand bar (algolia-autocomplete__input), not a modal/drawer - typing
 * renders live hits (algolia-autocomplete-hit-product__name) directly
 * below it, and pressing Enter submits to /search?q=<term>, which reuses
 * the exact same product-card/algolia-hits testids as a category PLP.
 */
test.describe('Header Search', () => {
    test('User can search live from the header and reach the results page', async ({
        homePage,
        productListPage,
    }) => {
        const query = 'bearing'

        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        await test.step(`Search for a product and validate live results match`, async () => {
            console.log(`[STEP] Search for a product and validate live results match`)
            await homePage.searchInline(query)
            await homePage.validateSearchResultsMatch(query)
        })

        await test.step(`Submit the search and validate the results page`, async () => {
            console.log(`[STEP] Submit the search and validate the results page`)
            await homePage.submitSearch(query)
            await productListPage.validateSearchResultsPage(query)
        })
    })
})
