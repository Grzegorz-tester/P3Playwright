import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { testConfig } from '@utils/testConfig'

/**
 * MY DOVE ACCOUNT - SIGN OUT
 * ============================
 * Automates case 155 from the "My DOVE Account" suite
 * (JTDOVE-2026-08-11.json). VERIFIED live (staging, 2026-08-11).
 */
test.use({ storageState: testConfig.getAuthFile() })

test.describe('My DOVE Account - Sign Out', () => {

    // Case 155: Sign out from My DOVE account.
    test('Sign out from My DOVE account (case 155)', async ({ accountDashboardPage }) => {
        await test.step(`Navigate to the account dashboard`, async () => {
            console.log(`[STEP] Navigate to the account dashboard`)
            await accountDashboardPage.navigateToAccountPage()
        })

        await test.step(`Click Sign Out and verify the user is redirected away from the account area`, async () => {
            console.log(`[STEP] Click Sign Out and verify the user is redirected away from the account area`)
            await accountDashboardPage.signOut()
            await expect(accountDashboardPage.page).not.toHaveURL(/\/account/, { timeout: 20000 })
        })

        await test.step(`Verify accessing an account page afterwards requires authentication`, async () => {
            console.log(`[STEP] Verify accessing an account page afterwards requires authentication`)
            await accountDashboardPage.page.goto('/account')
            await expect(accountDashboardPage.page).toHaveURL(/\/login/, { timeout: 20000 })
        })
    })
})
