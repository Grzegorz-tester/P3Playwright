import test from '../../utils/Pages'
import { products } from '../../utils/products/products'

/**
 * PDP COLLECTION DEPOT PICKER
 * ============================
 * Covers: the PDP's "Collection" section - before any depot is chosen it
 * shows a "Set your local depot" button; clicking it opens a "Collection
 * Information" slide-in panel with a location search, results list (each
 * with distance, address, availability and a "Select Depot" button); after
 * selecting one, the PDP shows the depot's name and the button changes to
 * "Change" (reopening the same panel to pick a different depot).
 *
 * TODO: RUS-474 - nothing in this whole feature carries a data-testid
 * (confirmed live, 2026-07-31); every locator involved is a last-resort
 * text/role/id anchor - worth a ticket for the dev team.
 */
test.describe('PDP Collection Depot Picker', () => {
    test('User can search for and select a local collection depot', async ({
        page,
        productDetailPage,
    }) => {
        await test.step(`Navigate to a product PDP`, async () => {
            console.log(`[STEP] Navigate to a product PDP`)
            await page.goto(products.ROLLER_FOR_CNH.link)
            await productDetailPage.validatePDPLoaded()
        })

        await test.step(`Validate no depot is selected yet`, async () => {
            console.log(`[STEP] Validate no depot is selected yet`)
            await productDetailPage.validateNoDepotSelectedYet()
        })

        let depotName: string

        await test.step(`Search for and select the first depot near a location`, async () => {
            console.log(`[STEP] Search for and select the first depot near a location`)
            depotName = (await productDetailPage.selectFirstDepotForLocation('York')).name
        })

        await test.step(`Validate the selected depot is now shown`, async () => {
            console.log(`[STEP] Validate the selected depot is now shown`)
            await productDetailPage.validateDepotSelected(depotName)
        })
    })
})
