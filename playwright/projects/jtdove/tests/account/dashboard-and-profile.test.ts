import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { testConfig } from '@utils/testConfig'

/**
 * MY DOVE ACCOUNT - DASHBOARD & PROFILE
 * =======================================
 * Automates cases 133-139 from the "My DOVE Account" suite
 * (JTDOVE-2026-08-11.json). Each test is named after and references its
 * source case id. VERIFIED live (staging, 2026-08-11) against a real
 * trade account (103128) linked to a dedicated "Velstar Test" login.
 *
 * NOTE (case 139): a "Local Branch" selector was NOT found anywhere in
 * the account area (Dashboard or Profile) after a thorough live check -
 * this looks like a not-yet-built feature rather than a locator gap, so
 * it's skipped with a clear comment rather than asserted against
 * nothing.
 *
 * KNOWN FAILING TEST (case 136, JTD-325): "Update the contact number and
 * save, verifying the change persists" is written against the CORRECT/
 * expected behaviour, not today's actual one - the Save Changes request
 * for this field returns 200 but the new number never actually persists
 * (see verifyContactNumberValue in JTDoveProfilePage for the full
 * investigation). A real bug should show up as a red test, not get
 * quietly asserted as "working as intended".
 */
test.use({ storageState: testConfig.getAuthFile() })

test.describe('My DOVE Account - Dashboard & Profile', () => {

    // Case 133: Access My DOVE dashboard after login.
    test('Access My DOVE dashboard after login (case 133)', async ({ accountDashboardPage }) => {
        await test.step(`Navigate to the account dashboard`, async () => {
            console.log(`[STEP] Navigate to the account dashboard`)
            await accountDashboardPage.navigateToAccountPage()
        })

        await test.step(`Verify the dashboard loads with welcome message, menu and account number`, async () => {
            console.log(`[STEP] Verify the dashboard loads with welcome message, menu and account number`)
            await accountDashboardPage.waitForLoginToBeCompleted()
            await accountDashboardPage.validateAccountPage()
            const welcome = await accountDashboardPage.getWelcomeText()
            expect(welcome).toContain('Hi Velstar')
            await expect(accountDashboardPage.page.getByText('Account Number:')).toBeVisible()
            await expect(accountDashboardPage.page.getByText('103128').first()).toBeVisible()
        })
    })

    // Case 134: Display default delivery and billing addresses on dashboard.
    test('Display default delivery and billing addresses on dashboard (case 134)', async ({ accountDashboardPage }) => {
        await test.step(`Navigate to the account dashboard`, async () => {
            console.log(`[STEP] Navigate to the account dashboard`)
            await accountDashboardPage.navigateToAccountPage()
        })

        await test.step(`Verify the default delivery address card shows "Velstar Test" with a View all link`, async () => {
            console.log(`[STEP] Verify the default delivery address card shows "Velstar Test" with a View all link`)
            const content = await accountDashboardPage.getCardContent('Delivery Address')
            expect(content).toContain('Velstar Test')
            expect(content).toContain('Default address')
        })

        await test.step(`Verify the default billing address card shows "Velstar Test" with a View all link`, async () => {
            console.log(`[STEP] Verify the default billing address card shows "Velstar Test" with a View all link`)
            const content = await accountDashboardPage.getCardContent('Billing Address')
            expect(content).toContain('Velstar Test')
            expect(content).toContain('Default address')
        })

        await test.step(`Verify View all navigates to the Address Book`, async () => {
            console.log(`[STEP] Verify View all navigates to the Address Book`)
            await accountDashboardPage.clickCardViewAll('Delivery Address')
            await expect(accountDashboardPage.page).toHaveURL(/\/account\/address-book$/, { timeout: 20000 })
        })
    })

    // Case 135: Navigate between My DOVE account sections.
    test('Navigate between My DOVE account sections (case 135)', async ({ accountDashboardPage }) => {
        await test.step(`Navigate to the account dashboard`, async () => {
            console.log(`[STEP] Navigate to the account dashboard`)
            await accountDashboardPage.navigateToAccountPage()
        })

        const sections: { value: 'Dashboard' | 'Profile' | 'Address Book' | 'Invoices' | 'My Lists' | 'Make a Payment', url: RegExp }[] = [
            { value: 'Profile', url: /\/account\/profile$/ },
            { value: 'Address Book', url: /\/account\/address-book$/ },
            { value: 'Invoices', url: /\/account\/invoices$/ },
            { value: 'My Lists', url: /\/account\/wishlists$/ },
            { value: 'Make a Payment', url: /\/account\/make-a-payment$/ },
            { value: 'Dashboard', url: /\/account$/ },
        ]

        for (const section of sections) {
            await test.step(`Click ${section.value} and verify it opens and is highlighted as active`, async () => {
                console.log(`[STEP] Click ${section.value} and verify it opens and is highlighted as active`)
                await accountDashboardPage.navigateViaMenu(section.value)
                await expect(accountDashboardPage.page).toHaveURL(section.url, { timeout: 20000 })
                await accountDashboardPage.verifyMenuItemActive(section.value)
            })
        }
    })

    // Case 136: View and update profile details.
    test('View and update profile details (case 136)', async ({ profilePage }) => {
        await test.step(`Navigate to the Profile page`, async () => {
            console.log(`[STEP] Navigate to the Profile page`)
            await profilePage.navigateToProfilePage()
            await profilePage.validateProfilePageLoaded()
        })

        await test.step(`Verify profile fields are pre-filled with existing user data`, async () => {
            console.log(`[STEP] Verify profile fields are pre-filled with existing user data`)
            const values = await profilePage.getFieldValues()
            expect(values.email).toBe('velstar.test.jtdove@example.com')
            expect(values.firstName).toBe('Velstar')
            expect(values.lastName).toBe('Test')
        })

        // CONFIRMED live (staging, 2026-08-11): Save Changes uses a
        // dirty-check - it stays disabled if a field is "changed" back
        // to the value it already holds, so a fixed contact number would
        // only work once and then look broken on every later re-run. A
        // freshly-generated number each run avoids that.
        await test.step(`Update the contact number and save, verifying the change persists`, async () => {
            console.log(`[STEP] Update the contact number and save, verifying the change persists`)
            const newContactNumber = `077${Math.floor(10000000 + Math.random() * 89999999)}`
            await profilePage.updateContactNumberAndSave(newContactNumber)
            await profilePage.navigateToProfilePage()
            await profilePage.verifyContactNumberValue(newContactNumber)
        })
    })

    // Case 137: Validate required fields on profile form.
    test('Validate required fields on profile form (case 137)', async ({ profilePage }) => {
        await test.step(`Navigate to the Profile page`, async () => {
            console.log(`[STEP] Navigate to the Profile page`)
            await profilePage.navigateToProfilePage()
            await profilePage.validateProfilePageLoaded()
        })

        await test.step(`Clear a required field and verify Save Changes is blocked`, async () => {
            console.log(`[STEP] Clear a required field and verify Save Changes is blocked`)
            await profilePage.clearFirstName()
            await profilePage.verifySaveChangesDisabled()
        })

        // CONFIRMED live (staging, 2026-08-11): Save Changes uses a
        // dirty-check - restoring the field to its ORIGINAL value leaves
        // nothing to save, so it correctly stays disabled rather than
        // re-enabling. A genuinely different valid value is needed to
        // demonstrate re-enablement without fighting that same check -
        // a fixed string (e.g. always "VelstarUpdated") isn't safe
        // either, since a previous run that failed mid-cleanup can leave
        // that exact value already persisted, making a later run's fill
        // of the same string a no-op. A freshly-generated value each run
        // avoids colliding with whatever the account currently holds.
        await test.step(`Fill the required field with a new valid value and verify Save Changes is enabled again`, async () => {
            console.log(`[STEP] Fill the required field with a new valid value and verify Save Changes is enabled again`)
            const temporaryName = `VelstarTest${Math.floor(Math.random() * 1000000)}`
            await profilePage.fillFirstNameStable(temporaryName)
            await profilePage.verifySaveChangesEnabled()
            // Restore the original name so later runs aren't affected.
            await profilePage.saveChanges()
            await profilePage.navigateToProfilePage()
            await profilePage.validateProfilePageLoaded()
            await profilePage.verifyFirstNameValue(temporaryName)
            await profilePage.fillFirstNameStable('Velstar')
            await profilePage.saveChanges()
        })
    })

    // Case 138: Reset password link availability.
    test('Reset password link availability (case 138)', async ({ profilePage }) => {
        await test.step(`Navigate to the Profile page`, async () => {
            console.log(`[STEP] Navigate to the Profile page`)
            await profilePage.navigateToProfilePage()
            await profilePage.validateProfilePageLoaded()
        })

        // CONFIRMED live (staging, 2026-08-11): this is a plain button
        // that toggles an inline "Change Password" form on the same
        // page, not a link that navigates to a separate route.
        await test.step(`Verify Reset Password is visible and initiates the change-password flow`, async () => {
            console.log(`[STEP] Verify Reset Password is visible and initiates the change-password flow`)
            await expect(profilePage.resetPasswordButton).toBeVisible({ timeout: 10000 })
            await profilePage.resetPasswordButton.click()
            await expect(profilePage.changePasswordHeading).toBeVisible({ timeout: 10000 })
        })
    })

    // Case 139: Select and save local branch.
    // CONFIRMED live (staging, 2026-08-11): no "Local Branch" dropdown
    // exists anywhere in the account area (checked Dashboard and
    // Profile in full) - looks like a not-yet-built feature rather than
    // a locator gap.
    test.skip('Select and save local branch (case 139)', async () => {
        console.log(`[STEP] Skipped - no Local Branch selector exists anywhere in the account area on staging (CONFIRMED live, 2026-08-11)`)
    })
})
