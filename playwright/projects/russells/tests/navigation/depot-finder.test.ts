import test from '../../utils/Pages'

/**
 * DEPOT FINDER
 * =============
 * Covers: the standalone /depot-finder store locator - the "All Depots"
 * list loads, searching a location shows a results dropdown of nearby
 * depots (sorted by distance) AND recenters the map, clicking a depot
 * (from either the search results or the "All Depots" list) reaches its
 * detail page (address, phone, email, opening hours, a working "Get
 * Directions" link), and "Back to search" returns to the finder.
 *
 * This is a SEPARATE feature from the PDP's "Collection" depot picker
 * (see pdp-collection-depot.test.ts) - a different component with its own
 * separate search.
 *
 * TODO: RUS-474 - the search input, its clear/search buttons, and the
 * results dropdown all carry no data-testid or id (confirmed live,
 * 2026-08-02) - see the locator notes in objects.ts.
 */
test.describe('Depot Finder', () => {
    test('User can browse all depots and reach a depot detail page', async ({
        depotFinderPage,
    }) => {
        await test.step(`Navigate to the Depot Finder`, async () => {
            console.log(`[STEP] Navigate to the Depot Finder`)
            await depotFinderPage.navigateToDepotFinder()
        })

        await test.step(`Validate all depots are listed`, async () => {
            console.log(`[STEP] Validate all depots are listed`)
            await depotFinderPage.validateAllDepotsListed()
        })

        let depotName: string

        await test.step(`Click the first depot`, async () => {
            console.log(`[STEP] Click the first depot`)
            depotName = await depotFinderPage.clickFirstDepot()
        })

        await test.step(`Validate the depot detail page`, async () => {
            console.log(`[STEP] Validate the depot detail page`)
            await depotFinderPage.validateBranchDetailsPage(depotName)
        })

        await test.step(`Return to the Depot Finder via Back to search`, async () => {
            console.log(`[STEP] Return to the Depot Finder via Back to search`)
            await depotFinderPage.clickBackToSearch()
        })
    })

    test('User can search a location and the map recenters', async ({
        depotFinderPage,
    }) => {
        await test.step(`Navigate to the Depot Finder`, async () => {
            console.log(`[STEP] Navigate to the Depot Finder`)
            await depotFinderPage.navigateToDepotFinder()
        })

        await test.step(`Search for a location and validate the map recenters`, async () => {
            console.log(`[STEP] Search for a location and validate the map recenters`)
            await depotFinderPage.searchAndValidateMapRecenters('York')
        })
    })

    test('User can search a location, see the results dropdown, and navigate to a result', async ({
        depotFinderPage,
    }) => {
        await test.step(`Navigate to the Depot Finder`, async () => {
            console.log(`[STEP] Navigate to the Depot Finder`)
            await depotFinderPage.navigateToDepotFinder()
        })

        await test.step(`Search for a location and validate the results dropdown appears`, async () => {
            console.log(`[STEP] Search for a location and validate the results dropdown appears`)
            await depotFinderPage.searchAndValidateResultsDropdownAppears('York')
        })

        let depotName: string

        await test.step(`Click the first search result`, async () => {
            console.log(`[STEP] Click the first search result`)
            depotName = await depotFinderPage.clickFirstSearchResult()
        })

        await test.step(`Validate the depot detail page`, async () => {
            console.log(`[STEP] Validate the depot detail page`)
            await depotFinderPage.validateBranchDetailsPage(depotName)
        })
    })

    test('Map renders one pin marker per depot', async ({
        depotFinderPage,
    }) => {
        let depotCount: number

        await test.step(`Navigate to the Depot Finder`, async () => {
            console.log(`[STEP] Navigate to the Depot Finder`)
            await depotFinderPage.navigateToDepotFinder()
        })

        await test.step(`Capture the number of listed depots`, async () => {
            console.log(`[STEP] Capture the number of listed depots`)
            await depotFinderPage.validateAllDepotsListed()
            depotCount = await depotFinderPage.depotLinks.count()
        })

        await test.step(`Validate the map renders a pin per depot`, async () => {
            console.log(`[STEP] Validate the map renders a pin per depot`)
            await depotFinderPage.validateMapPinsRendered(depotCount)
        })
    })
})
