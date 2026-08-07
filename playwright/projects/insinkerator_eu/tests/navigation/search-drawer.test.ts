import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * HEADER SEARCH DRAWER
 * ====================
 * Covers: opening the search drawer from the header search icon, its
 * default (recommended products) state, closing it, live as-you-type
 * results for a query, and submitting to the full /search results page.
 *
 * VERIFIED live (staging, 2026-07-21): the drawer is an Algolia-backed
 * autocomplete panel present on every page. Its outer [role="dialog"]
 * wrapper has no data-testid and shares that role with the unrelated
 * cookie-consent banner - see SearchDrawer.drawer in objects.ts for how
 * that's disambiguated.
 *
 * CORRECTED (2026-07-22): closing via the "Close" button was earlier
 * (wrongly) flagged as a site bug - a plain Playwright .click() genuinely
 * never closed it. Turns out the button just needs a real mousedown-
 * PAUSE-mouseup gesture rather than an instant click; see
 * InsinkeratorEuHomePage.closeSearchDrawer(), which uses raw page.mouse
 * events with a ~150ms hold instead of .click(). Escape still does not
 * work as an alternative.
 */
test.describe('Header Search Drawer (Portugal)', () => {
    test('User can open the drawer, close it, search live, and reach the results page', async ({
        page,
        homePage,
        productListPage,
    }) => {
        const query = 'sink'

        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Open the search drawer and validate its default state`, async () => {
            console.log(`[STEP] Open the search drawer and validate its default state`)
            await homePage.openSearchDrawer()
            await homePage.validateSearchDrawerDefaultState()
        })

        await test.step(`Close the search drawer`, async () => {
            console.log(`[STEP] Close the search drawer`)
            await homePage.closeSearchDrawer()
        })

        await test.step(`Reopen the search drawer and search for a product`, async () => {
            console.log(`[STEP] Reopen the search drawer and search for a product`)
            await homePage.openSearchDrawer()
            await homePage.searchInDrawer(query)
            await homePage.validateSearchDrawerResultsMatch(query)
        })

        await test.step(`Submit the search and validate the results page`, async () => {
            console.log(`[STEP] Submit the search and validate the results page`)
            await homePage.submitSearchFromDrawer(query)
            await productListPage.validateSearchResultsPage(query)
        })
    })
})
