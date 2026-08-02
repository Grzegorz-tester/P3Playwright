import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { russells } from '@utils/testUsers'

/**
 * ACCOUNT WISHLISTS (Admin-only)
 * ===============================
 * Covers: /account/wishlists - an admin-only feature. accountTestUser_1
 * (used by every other account test) gets NO "Wishlists" sidebar link and
 * a genuine 404 on this URL even while logged in - confirmed live,
 * 2026-08-02, after initially mistaking this for a bug before the user
 * clarified only admin accounts have access. accountAdminUser (see
 * testUsers.ts) is used for every test below except the permission check.
 *
 * List page (/account/wishlists): create (name required), live
 * search-as-you-type, sort-by-name toggling, and per-row delete - all
 * confirmed live. The list page itself is notably testid-sparse (only a
 * generic account-card wrapper) - TODO: RUS-474, see the locator notes in
 * objects.ts.
 *
 * Detail page (/account/wishlists/<id>): a genuinely well-covered page by
 * contrast - Quick Buy search adds a real product line with live
 * price/quantity/total recalculation, Remove, inline Edit Name, Delete,
 * and a Share Wishlist dialog (validated only as far as its Proceed
 * button gating on a valid email - not actually submitted, since that
 * would send a real email to whatever address is entered for no real
 * benefit over the validation check itself).
 *
 * Each test that creates wishlists deletes them all again at the end.
 * Every wishlist this suite creates is named "Playwright QA ..." so
 * cleanupPlaywrightTestWishlists() (called at the start of both admin
 * tests, to remove anything a previous failed run left behind) can never
 * touch anything else in the account. The sort-toggle check creates its
 * OWN two wishlists rather than assuming any other data already exists in
 * the account - the account is NOT assumed to hold any permanent fixture
 * wishlists (an earlier version of this suite had a bug that deleted 5
 * pre-existing ones - see the incident note on
 * cleanupPlaywrightTestWishlists - so this suite is deliberately
 * self-sufficient rather than relying on ambient account state).
 *
 * The two admin tests below share one real account's wishlist list, which
 * is genuinely mutated by each (create/delete) - CONFIRMED live running
 * them in parallel: one test's created wishlist showed up in the other's
 * row count mid-test, breaking the sort-toggle check. Forced serial for
 * this file so they never run concurrently against that shared list -
 * same class of shared-account contention as the login retry and basket
 * cross-test pollution documented elsewhere in this project.
 */
test.describe.configure({ mode: 'serial' })

test.describe('Account Wishlists (Admin-only)', () => {
    test('Non-admin user has no Wishlists link and gets a 404', async ({
        loginPage,
        accountPage,
    }) => {
        const user = russells.accountTestUser_1

        await test.step(`Log in as a non-admin user`, async () => {
            console.log(`[STEP] Log in as a non-admin user`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
            await accountPage.validateAccountPage()
        })

        await test.step(`Validate no Wishlists link is shown`, async () => {
            console.log(`[STEP] Validate no Wishlists link is shown`)
            await expect(accountPage.wishlistsMenuButton).toHaveCount(0)
        })

        await test.step(`Validate /account/wishlists is a 404 for this user`, async () => {
            console.log(`[STEP] Validate /account/wishlists is a 404 for this user`)
            await accountPage.validateWishlistsPageIs404()
        })
    })

    test('Admin can create, search, sort and delete a wishlist from the list', async ({
        loginPage,
        accountPage,
    }) => {
        const admin = russells.accountAdminUser
        const now = Date.now()
        // Two wishlists, not one - the sort-toggle check needs a
        // guaranteed second row to actually reorder against, rather than
        // assuming ambient fixture data exists in the account (it may
        // not - see the cleanupPlaywrightTestWishlists incident note).
        const wishlistNameA = `Playwright QA List A ${now}`
        const wishlistNameB = `Playwright QA List B ${now}`

        await test.step(`Log in as an admin user`, async () => {
            console.log(`[STEP] Log in as an admin user`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(admin.email, admin.password)
            await accountPage.validateAccountPage()
        })

        await test.step(`Clean up any leftover wishlists from a previous failed run`, async () => {
            console.log(`[STEP] Clean up any leftover wishlists from a previous failed run`)
            await accountPage.cleanupPlaywrightTestWishlists()
        })

        await test.step(`Navigate to Wishlists`, async () => {
            console.log(`[STEP] Navigate to Wishlists`)
            await accountPage.navigateToWishlistsPage()
        })

        await test.step(`Validate Create Wishlist is disabled until a name is entered`, async () => {
            console.log(`[STEP] Validate Create Wishlist is disabled until a name is entered`)
            await accountPage.validateCreateWishlistButtonDisabledWhenEmpty()
        })

        await test.step(`Create two new wishlists`, async () => {
            console.log(`[STEP] Create two new wishlists`)
            await accountPage.createWishlist(wishlistNameA)
            await accountPage.navigateToWishlistsPage()
            await accountPage.createWishlist(wishlistNameB)
        })

        // Sort BEFORE search below, both starting from a fresh
        // navigateToWishlistsPage() (a genuine URL change into this page,
        // not a same-URL no-op) rather than clearing the search box
        // in-place afterwards.
        await test.step(`Validate the Wishlist Name sort toggles order`, async () => {
            console.log(`[STEP] Validate the Wishlist Name sort toggles order`)
            await accountPage.navigateToWishlistsPage()
            await accountPage.validateNameSortToggles()
        })

        await test.step(`Search the list and validate it filters to a single wishlist`, async () => {
            console.log(`[STEP] Search the list and validate it filters to a single wishlist`)
            await accountPage.searchWishlistsAndValidateFilteredTo(wishlistNameA, [wishlistNameA])
        })

        await test.step(`Delete both new wishlists directly from the list`, async () => {
            console.log(`[STEP] Delete both new wishlists directly from the list`)
            await accountPage.deleteWishlistFromList(wishlistNameA)
            await accountPage.deleteWishlistFromList(wishlistNameB)
        })
    })

    test('Admin can add, update quantity, remove an item and rename a wishlist', async ({
        loginPage,
        accountPage,
    }) => {
        const admin = russells.accountAdminUser
        const wishlistName = `Playwright QA Detail ${Date.now()}`

        await test.step(`Log in as an admin user`, async () => {
            console.log(`[STEP] Log in as an admin user`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(admin.email, admin.password)
            await accountPage.validateAccountPage()
        })

        await test.step(`Clean up any leftover wishlists from a previous failed run`, async () => {
            console.log(`[STEP] Clean up any leftover wishlists from a previous failed run`)
            await accountPage.cleanupPlaywrightTestWishlists()
        })

        await test.step(`Create a new wishlist`, async () => {
            console.log(`[STEP] Create a new wishlist`)
            await accountPage.navigateToWishlistsPage()
            await accountPage.createWishlist(wishlistName)
        })

        await test.step(`Validate the wishlist starts empty`, async () => {
            console.log(`[STEP] Validate the wishlist starts empty`)
            await accountPage.validateWishlistIsEmpty()
        })

        await test.step(`Add a product via Quick Buy`, async () => {
            console.log(`[STEP] Add a product via Quick Buy`)
            await accountPage.addFirstQuickBuyResult('bearing')
        })

        // Reads unit price and total together, at the SAME moment, and
        // checks total = unit x quantity - rather than comparing a total
        // captured now against one captured earlier. Staging has a live
        // price-sync job (documented elsewhere in this project) that can
        // drift a product's price mid-session, which would make an
        // across-time comparison flaky for reasons unrelated to whether
        // the wishlist's own math is correct.
        await test.step(`Increment the quantity and validate totals recalculate`, async () => {
            console.log(`[STEP] Increment the quantity and validate totals recalculate`)
            await accountPage.incrementLineQuantity(0)
            const quantity = await accountPage.getLineQuantity(0)
            expect(quantity).toBe('2')
            // The line total recalculates a moment after the quantity
            // itself updates (confirmed live, 2026-08-02: reading it
            // immediately caught the still-at-quantity-1 total) - polling
            // rather than a single immediate read.
            await expect(async () => {
                const unitPriceText = await accountPage.getLineUnitPrice(0)
                const totalText = await accountPage.getLineTotalPrice(0)
                const unitPrice = parseFloat(unitPriceText.replace(/[£,]/g, ''))
                const total = parseFloat(totalText.replace(/[£,]/g, ''))
                // 0.02 tolerance (not 0.01) avoids floating-point rounding
                // artifacts right at the boundary (observed 0.010000000000005116
                // from parseFloat/multiplication) - same tolerance already used
                // for the VAT toggle price checks elsewhere in this project.
                expect(Math.abs(total - unitPrice * 2)).toBeLessThan(0.02)
            }).toPass({ timeout: 10000 })
        })

        await test.step(`Remove the item and validate the wishlist is empty again`, async () => {
            console.log(`[STEP] Remove the item and validate the wishlist is empty again`)
            await accountPage.removeLine(0)
            await accountPage.validateWishlistIsEmpty()
        })

        const renamedTo = `${wishlistName} Renamed`

        await test.step(`Rename the wishlist`, async () => {
            console.log(`[STEP] Rename the wishlist`)
            await accountPage.editWishlistName(renamedTo)
        })

        await test.step(`Validate cancelling an edit leaves the name unchanged`, async () => {
            console.log(`[STEP] Validate cancelling an edit leaves the name unchanged`)
            await accountPage.cancelEditWishlistName(`${renamedTo} Should Not Save`)
        })

        await test.step(`Validate the Share Wishlist dialog gates on a valid email`, async () => {
            console.log(`[STEP] Validate the Share Wishlist dialog gates on a valid email`)
            await accountPage.validateShareWishlistDialogGatesOnEmail('velstar.qa.wishlist.share@velstar.co.uk')
        })

        await test.step(`Delete the wishlist`, async () => {
            console.log(`[STEP] Delete the wishlist`)
            await accountPage.deleteWishlistFromDetailsPage()
        })
    })
})
