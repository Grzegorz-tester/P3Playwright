import test from '../../utils/Pages'

/**
 * DEPOT FINDER
 * =============
 * Covers: the standalone /depot-finder store locator - the "All Depots"
 * list loads, searching a location recenters the map (the list itself
 * always shows all depots alphabetically, unaffected by search - see
 * objects.ts note), clicking a depot reaches its detail page (address,
 * phone, email, opening hours, a working "Get Directions" link), and
 * "Back to search" returns to the finder.
 *
 * This is a SEPARATE feature from the PDP's "Collection" depot picker
 * (see pdp-collection-depot.test.ts) - different component, different
 * search behaviour (that one filters/sorts a result list; this one only
 * recenters the map).
 *
 * TODO: RUS-474 - the search input and its clear/search buttons carry no
 * data-testid or id (confirmed live, 2026-08-02) - see the locator notes
 * in objects.ts.
 *
 * CONFIRMED SITE BUG (RUS-474, confirmed with the user 2026-08-02): the
 * /depot-finder search never shows a results dropdown - see
 * validateNoResultsDropdownAppears in RussellsDepotFinderPage for the full
 * investigation. Documented below as today's actual behaviour rather than
 * skipped, per this repo's convention.
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

    // CONFIRMED SITE BUG - see the class-level comment above and
    // validateNoResultsDropdownAppears for the full investigation. This
    // test documents today's actual (broken) behaviour; once RUS-474 is
    // fixed, rewrite it to assert the dropdown DOES appear and shows
    // matching depots.
    test('CONFIRMED BUG (RUS-474): searching does not show a results dropdown', async ({
        depotFinderPage,
    }) => {
        await test.step(`Navigate to the Depot Finder`, async () => {
            console.log(`[STEP] Navigate to the Depot Finder`)
            await depotFinderPage.navigateToDepotFinder()
        })

        await test.step(`Search for a location and confirm no results dropdown appears`, async () => {
            console.log(`[STEP] Search for a location and confirm no results dropdown appears`)
            await depotFinderPage.validateNoResultsDropdownAppears('York')
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
