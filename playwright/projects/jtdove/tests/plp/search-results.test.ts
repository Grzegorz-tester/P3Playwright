import test from '../../utils/Pages'
import { expect } from '@playwright/test'

/**
 * SEARCH RESULTS (PLP)
 * ======================
 * Covers: the Algolia-powered /search results page - the same PLP
 * component and testids used by a real category page. VERIFIED live
 * (staging, 2026-08-10).
 */
test.describe('Search Results', () => {
    test('User can search from the header and reach a filterable results page', async ({
        page,
        homePage,
        productListPage,
    }) => {
        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        await test.step(`Search for a common product term`, async () => {
            console.log(`[STEP] Search for a common product term`)
            await homePage.searchInput.first().fill('cement')
            await homePage.searchInput.first().press('Enter')
        })

        await test.step(`Validate the results page is loaded`, async () => {
            console.log(`[STEP] Validate the results page is loaded`)
            await productListPage.validatePLPLoaded()
        })

        await test.step(`Click the first result and reach a real PDP`, async () => {
            console.log(`[STEP] Click the first result and reach a real PDP`)
            await productListPage.clickOnFirstItemToProceedToPDP()
            await expect(page).toHaveURL(/\/products\//, { timeout: 30000 })
        })
    })
})
