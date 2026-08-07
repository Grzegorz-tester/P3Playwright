import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * ACCESSORIES PLP
 * ===============
 * Covers: header nav Accessories -> the landing page's own "Shop" CTA ->
 * the actual /category/accessories listing -> filtering, sorting, load
 * more, and clicking through to the correct PDP.
 *
 * VERIFIED live (staging, 2026-07-22):
 * - /our-accessories is an informational landing page; ITS "Shop" button
 *   (-> /category/accessories) is what reaches the real, filterable PLP -
 *   distinct from the header's own "Shop" nav link, which goes to
 *   /category/shop instead.
 * - product-card__name renders as a plain, non-clickable <h5> on THIS
 *   category (unlike /category/shop, where it's the working PDP link used
 *   by clickOnFirstItemToProceedToPDP() elsewhere) - product-card__link
 *   (wrapping the image) is what actually navigates here.
 * - Filtering works correctly: selecting a facet checkbox updates the
 *   result count to exactly match that facet's own advertised count.
 * - Load more works correctly: appends the next page of results.
 *
 * CORRECTED (staging, 2026-07-27): sorting was earlier confirmed broken
 * (selecting "Price: Low to High" reverted to "Relevance" with no order
 * change). Retested live and it now works correctly - the dialog stays
 * open, the radio stays checked, and results re-render in real ascending
 * price order. See InsinkeratorEuProductListPage.selectSortByPriceLowToHighAndValidateAscendingOrder(),
 * which now asserts the real ascending order instead of the earlier
 * revert-to-Relevance workaround.
 *
 * CORRECTED (staging, 2026-07-31): clicking a link inside the header nav
 * drawer was earlier confirmed completely broken for BOTH "Shop" and "Our
 * Accessories" (reproduced via plain click, force click, native DOM
 * click, and keyboard Enter). Retested live and it now works correctly -
 * "Our Accessories" has children, so it expands the drawer to a tier-2
 * "View All" view rather than navigating on the first click; "Shop" (a
 * leaf category) navigates directly. See navigateToAccessoriesLandingPage()
 * in InsinkeratorEuHomePage.ts, which now performs the real click-through
 * flow instead of the earlier href-check-then-page.goto() workaround. This
 * also means logged-in-purchase-journey.test.ts's "Navigate to Shop
 * category" step - previously silently not testing real category
 * navigation, masked by the home page's bestseller carousel sharing the
 * same product-card__name testid - is now a genuine navigation test too.
 */
test.describe('Accessories PLP (Portugal)', () => {
    test('User can filter, sort, load more, and reach the correct PDP', async ({
        page,
        homePage,
        productListPage,
        productDetailPage,
    }) => {
        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Go to Accessories, then Shop, to reach the PLP`, async () => {
            console.log(`[STEP] Go to Accessories, then Shop, to reach the PLP`)
            await homePage.navigateToAccessoriesLandingPage()
            await homePage.clickShopOnAccessoriesLandingPage()
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
