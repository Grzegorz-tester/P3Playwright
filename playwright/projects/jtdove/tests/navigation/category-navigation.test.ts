import test from '../../utils/Pages'
import { expect } from '@playwright/test'

/**
 * CATEGORY NAVIGATION
 * ====================
 * Covers: the header's category nav bar links through to a real category
 * hub page. VERIFIED live (staging, 2026-08-10) - "Building Materials"
 * leads to /building-materials.
 */
test.describe('Category Navigation', () => {
    test('User can navigate to a top-level category from the header nav', async ({
        page,
        homePage,
    }) => {
        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        await test.step(`Choose the Building Materials category`, async () => {
            console.log(`[STEP] Choose the Building Materials category`)
            await homePage.chooseMenuCategory('Building Materials')
        })

        await test.step(`Verify the category page is reached`, async () => {
            console.log(`[STEP] Verify the category page is reached`)
            await expect(page).toHaveURL(/\/building-materials$/, { timeout: 30000 })
        })
    })
})
