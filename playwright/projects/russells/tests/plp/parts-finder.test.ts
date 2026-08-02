import test from '../../utils/Pages'
import { expect } from '@playwright/test'

/**
 * QUICK PARTS FINDER
 * ==================
 * Covers: the "Quick Parts Finder" cascading machine type -> brand ->
 * model widget, present on multiple category hub pages (VERIFIED live,
 * 2026-08-02, on both /agriculture - the example given - and /groundcare;
 * same component and testids, different option sets per page).
 * Submitting takes the user to /parts-finder, a results page that reuses
 * the exact same Algolia PLP testids as a category PLP (validated here
 * via the shared productListPage fixture, not duplicate locators).
 *
 * VERIFIED live: only "Select machine type" starts enabled; choosing one
 * enables BOTH brand and model at once (not strictly sequential); the
 * brand list is genuinely re-filtered per machine type, not just
 * re-enabled the same regardless (TRACTOR: 39 brands, COMBINE: 11,
 * confirmed different sets); Search parts only enables once all three
 * are chosen; the whole selection is pure client-side state, NOT
 * reflected in the URL or a cookie - /parts-finder always lands on a
 * bare URL, and visiting it directly shows ALL products unfiltered
 * rather than remembering a previous selection.
 *
 * TODO: RUS-474 - no testid on the Search parts button or the
 * "Showing results for..." banner/Change Vehicle button - see the
 * locator notes in objects.ts.
 */
test.describe('Quick Parts Finder', () => {
    test('User can cascade machine type -> brand -> model and reach filtered results', async ({
        page,
        partsFinderPage,
        productListPage,
    }) => {
        await test.step(`Navigate to the Agriculture category page`, async () => {
            console.log(`[STEP] Navigate to the Agriculture category page`)
            await page.goto('/agriculture')
        })

        await test.step(`Validate the widget's initial state`, async () => {
            console.log(`[STEP] Validate the widget's initial state`)
            await partsFinderPage.validateInitialState()
        })

        await test.step(`Select machine type and validate brand/model become selectable`, async () => {
            console.log(`[STEP] Select machine type and validate brand/model become selectable`)
            await partsFinderPage.selectMachineType('TRACTOR')
        })

        await test.step(`Select a brand`, async () => {
            console.log(`[STEP] Select a brand`)
            await partsFinderPage.selectBrand('New Holland')
        })

        await test.step(`Search for and select a model`, async () => {
            console.log(`[STEP] Search for and select a model`)
            await partsFinderPage.searchAndSelectModel('TS100', 'New Holland - TS100')
        })

        await test.step(`Submit the search and reach the Parts Finder results`, async () => {
            console.log(`[STEP] Submit the search and reach the Parts Finder results`)
            await partsFinderPage.submitSearch()
            await productListPage.validatePLPLoaded()
        })

        await test.step(`Validate the results banner shows the selected vehicle`, async () => {
            console.log(`[STEP] Validate the results banner shows the selected vehicle`)
            await partsFinderPage.validateResultsBannerShows('TRACTOR', 'New Holland', 'New Holland - TS100')
        })
    })

    test('Brand options are filtered by the selected machine type', async ({
        page,
        partsFinderPage,
    }) => {
        let tractorBrands: string[]

        await test.step(`Select TRACTOR and capture its brand options`, async () => {
            console.log(`[STEP] Select TRACTOR and capture its brand options`)
            await page.goto('/agriculture')
            await partsFinderPage.selectMachineType('TRACTOR')
            tractorBrands = await partsFinderPage.getBrandOptionValues()
        })

        await test.step(`Select COMBINE and validate its brand options differ`, async () => {
            console.log(`[STEP] Select COMBINE and validate its brand options differ`)
            await page.goto('/agriculture')
            await partsFinderPage.selectMachineType('COMBINE')
            const combineBrands = await partsFinderPage.getBrandOptionValues()
            expect(combineBrands).not.toEqual(tractorBrands)
            expect(combineBrands).toContain('MacDon')
            expect(tractorBrands).not.toContain('MacDon')
        })
    })

    test('Searching for a model with no matches shows no results and keeps search disabled', async ({
        page,
        partsFinderPage,
    }) => {
        await test.step(`Select machine type and brand`, async () => {
            console.log(`[STEP] Select machine type and brand`)
            await page.goto('/agriculture')
            await partsFinderPage.selectMachineType('TRACTOR')
            await partsFinderPage.selectBrand('New Holland')
        })

        await test.step(`Search for a nonsense model and validate no results appear`, async () => {
            console.log(`[STEP] Search for a nonsense model and validate no results appear`)
            await partsFinderPage.validateModelSearchShowsNoResults('8360')
        })

        await test.step(`Validate Search parts is still disabled`, async () => {
            console.log(`[STEP] Validate Search parts is still disabled`)
            await expect(partsFinderPage.searchButton).toBeDisabled()
        })
    })

    test('User can change their vehicle selection from the results page', async ({
        page,
        partsFinderPage,
        productListPage,
    }) => {
        await test.step(`Reach Parts Finder results for a New Holland TS100 tractor`, async () => {
            console.log(`[STEP] Reach Parts Finder results for a New Holland TS100 tractor`)
            await page.goto('/agriculture')
            await partsFinderPage.selectMachineType('TRACTOR')
            await partsFinderPage.selectBrand('New Holland')
            await partsFinderPage.searchAndSelectModel('TS100', 'New Holland - TS100')
            await partsFinderPage.submitSearch()
        })

        await test.step(`Validate Change Vehicle doesn't reset the current selection`, async () => {
            console.log(`[STEP] Validate Change Vehicle doesn't reset the current selection`)
            await partsFinderPage.validateChangeVehicleButtonDoesNotResetSelection()
        })

        await test.step(`Pick a different brand and model directly on the results page`, async () => {
            console.log(`[STEP] Pick a different brand and model directly on the results page`)
            await partsFinderPage.selectBrand('Case IH')
            await partsFinderPage.searchAndSelectModel('MX', 'Case IH - MX100')
        })

        await test.step(`Re-submit and validate the results now reflect the new selection`, async () => {
            console.log(`[STEP] Re-submit and validate the results now reflect the new selection`)
            await partsFinderPage.submitSearch()
            await productListPage.validatePLPLoaded()
            await partsFinderPage.validateResultsBannerShows('TRACTOR', 'Case IH', 'Case IH - MX100')
        })
    })
})
