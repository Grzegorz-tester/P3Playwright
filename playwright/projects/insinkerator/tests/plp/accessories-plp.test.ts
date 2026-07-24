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
 * CONFIRMED SITE BUG: sorting does NOT work. Selecting a sort option (e.g.
 * "Price: Low to High") closes the Filter & Sort dialog immediately, but
 * never actually changes the result order, and re-opening the dialog shows
 * "Relevance" selected again. Reproduced consistently. This test asserts
 * TODAY's actual (broken) behaviour rather than pretending sorting works -
 * see the TODO on InsinkeratorProductListPage.selectSortByPriceLowToHighAndValidateCurrentBehaviour().
 * Worth raising as a UI ticket; a real fix should surface as a failing
 * assertion here, prompting an update to check real price ordering.
 *
 * CONFIRMED SITE BUG (bigger one): clicking a link INSIDE the header nav
 * drawer does not navigate at all - reproduced identically for BOTH "Shop"
 * and "Our Accessories" via every method tried (plain click, force click,
 * native DOM click, keyboard Enter; ruled out timing with waits up to 5s).
 * See navigateToAccessoriesLandingPage() in InsinkeratorHomePage.ts for the
 * full writeup - this ALSO means logged-in-purchase-journey.test.ts's "Navigate to
 * Shop category" step has been silently not testing category navigation
 * at all (masked by the home page's bestseller carousel sharing the same
 * product-card__name testid). Worth a UI ticket and revisiting that test
 * separately. This spec verifies the nav link's wiring (visible, correct
 * href) without relying on the broken click, then navigates directly.
 */
test.describe('Accessories PLP (Portugal)', () => {
    test('User can filter, attempt to sort, load more, and reach the correct PDP', async ({
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

        await test.step(`Attempt to sort by price (known site bug - see file header)`, async () => {
            console.log(`[STEP] Attempt to sort by price (known site bug - see file header)`)
            await productListPage.selectSortByPriceLowToHighAndValidateCurrentBehaviour()
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
