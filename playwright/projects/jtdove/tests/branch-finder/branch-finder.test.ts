import test from '../../utils/Pages'
import { expect } from '@playwright/test'

/**
 * BRANCH FINDER
 * ==============
 * Automates the "Branch Finder" suite exported from the test-case tool
 * (case ids 103-110). Each test below is named after and references its
 * source case id for traceability. VERIFIED live (staging, 2026-08-11).
 *
 * Background verified live for every case in this file:
 * - The Google Places Autocomplete predictions dropdown never renders on
 *   this storefront (a genuine "Google script not loaded" console
 *   error), but free-text submission via the search button still works
 *   correctly - the site geocodes the typed text server-side and returns
 *   real, distance-sorted results regardless.
 * - Every branch is named "JT Dove <town>" except "Nordstrom Timber
 *   (Sunderland)" - sorted by full display name, only the J and N
 *   letter-filter buttons ever have a match, so every other letter is
 *   correctly disabled rather than broken (confirmed against the real
 *   `disabled` DOM property, not just visual styling).
 */
test.describe('Branch Finder', () => {

    // Case 103: Verify that the Branch Finder page loads successfully.
    test('Branch Finder page loads successfully (case 103)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Verify the page loads with the search widget and branch list visible`, async () => {
            console.log(`[STEP] Verify the page loads with the search widget and branch list visible`)
            await branchFinderPage.validateBranchFinderPageLoaded()
        })
    })

    // Case 104: Verify that all branch names are displayed in the full branch list.
    test('All branch names are displayed in the full branch list (case 104)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Verify the full branch list contains every known branch`, async () => {
            console.log(`[STEP] Verify the full branch list contains every known branch`)
            const names = await branchFinderPage.getAllBranchListNames()
            expect(names.length).toBeGreaterThan(15)
            // Spot-check stable, long-standing branches rather than the
            // exact full list, which changes if a branch opens/closes.
            expect(names).toContain('JT Dove Newcastle')
            expect(names).toContain('JT Dove Hexham')
            expect(names).toContain('Nordstrom Timber (Sunderland)')
        })
    })

    // Case 105: Verify that searching by postcode returns the closest relevant branches.
    test('Searching by postcode returns the closest relevant branches (case 105)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Search by a Newcastle postcode`, async () => {
            console.log(`[STEP] Search by a Newcastle postcode`)
            await branchFinderPage.searchByText('NE1 4ST')
        })

        await test.step(`Verify the closest branches are returned, nearest first`, async () => {
            console.log(`[STEP] Verify the closest branches are returned, nearest first`)
            // CONFIRMED live (staging, 2026-08-11): search results render
            // the branch name in ALL CAPS (e.g. "JT DOVE NEWCASTLE"),
            // unlike the full branch list's title case - compared
            // case-insensitively so this doesn't depend on either
            // section's specific text-transform styling.
            const names = await branchFinderPage.getSearchResultNames()
            expect(names.length).toBeGreaterThan(0)
            expect(names[0].toLowerCase()).toBe('jt dove newcastle')
        })
    })

    // Case 106: Verify that searching by town or city returns the closest relevant branches.
    test('Searching by town or city returns the closest relevant branches (case 106)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Search by the town "Newcastle"`, async () => {
            console.log(`[STEP] Search by the town "Newcastle"`)
            await branchFinderPage.searchByText('Newcastle')
        })

        await test.step(`Verify the closest branch to that town is returned first`, async () => {
            console.log(`[STEP] Verify the closest branch to that town is returned first`)
            const names = await branchFinderPage.getSearchResultNames()
            expect(names.length).toBeGreaterThan(0)
            expect(names[0].toLowerCase()).toBe('jt dove newcastle')
        })
    })

    // Case 107: Verify that searching by town or city returns relevant branches.
    test('Searching by town or city returns relevant branches (case 107)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Search by a different town, "Carlisle"`, async () => {
            console.log(`[STEP] Search by a different town, "Carlisle"`)
            await branchFinderPage.searchByText('Carlisle')
        })

        await test.step(`Verify the results returned are genuinely relevant to that town`, async () => {
            console.log(`[STEP] Verify the results returned are genuinely relevant to that town`)
            const names = await branchFinderPage.getSearchResultNames()
            expect(names.length).toBeGreaterThan(0)
            expect(names.map(n => n.toLowerCase())).toContain('jt dove carlisle')
        })
    })

    // Case 108: Verify that selecting a branch from the list navigates to the branch details page.
    test('Selecting a branch from the list navigates to the branch details page (case 108)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Click the first branch in the full list`, async () => {
            console.log(`[STEP] Click the first branch in the full list`)
            const names = await branchFinderPage.getAllBranchListNames()
            await branchFinderPage.clickFirstBranchListItem()
            await branchFinderPage.verifyBranchDetailPageLoaded(names[0])
        })
    })

    // Case 109: Verify that "View all branches" scrolls to the complete branch list.
    test('"View all branches" scrolls to the complete branch list (case 109)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Click "View all branches"`, async () => {
            console.log(`[STEP] Click "View all branches"`)
            await branchFinderPage.clickViewAllBranches()
        })

        await test.step(`Verify the full branch list is scrolled into view`, async () => {
            console.log(`[STEP] Verify the full branch list is scrolled into view`)
            await branchFinderPage.verifyAllBranchesSectionInView()
        })
    })

    // Case 110: Verify that branches can be filtered by alphabet letters filter.
    test('Branches can be filtered by the alphabet letters filter (case 110)', async ({ branchFinderPage }) => {
        await test.step(`Navigate to the Branch Finder page`, async () => {
            console.log(`[STEP] Navigate to the Branch Finder page`)
            await branchFinderPage.navigateToBranchFinder()
        })

        await test.step(`Verify only J and N are enabled, since every branch name starts with one of those two letters`, async () => {
            console.log(`[STEP] Verify only J and N are enabled, since every branch name starts with one of those two letters`)
            await branchFinderPage.verifyLetterButtonEnabled('j')
            await branchFinderPage.verifyLetterButtonEnabled('n')
            await branchFinderPage.verifyLetterButtonDisabled('a')
            await branchFinderPage.verifyLetterButtonDisabled('h')
            await branchFinderPage.verifyLetterButtonDisabled('z')
        })

        await test.step(`Filter by "J" and verify every "JT Dove" branch is shown`, async () => {
            console.log(`[STEP] Filter by "J" and verify every "JT Dove" branch is shown`)
            await branchFinderPage.filterByLetter('j')
            const names = await branchFinderPage.getAllBranchListNames()
            expect(names.length).toBeGreaterThan(15)
            for (const name of names) {
                expect(name.startsWith('JT Dove')).toBe(true)
            }
        })

        await test.step(`Filter by "N" and verify only Nordstrom Timber is shown`, async () => {
            console.log(`[STEP] Filter by "N" and verify only Nordstrom Timber is shown`)
            await branchFinderPage.filterByLetter('n')
            const names = await branchFinderPage.getAllBranchListNames()
            expect(names).toEqual(['Nordstrom Timber (Sunderland)'])
        })

        await test.step(`Filter by "All" and verify the full list is restored`, async () => {
            console.log(`[STEP] Filter by "All" and verify the full list is restored`)
            await branchFinderPage.filterByAll()
            const names = await branchFinderPage.getAllBranchListNames()
            expect(names.length).toBeGreaterThan(15)
            expect(names).toContain('Nordstrom Timber (Sunderland)')
        })
    })
})
