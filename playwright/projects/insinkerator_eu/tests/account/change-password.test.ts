import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkerator_eu } from '@utils/testUsers'

/**
 * ACCOUNT CHANGE PASSWORD (Logged-in, Portugal)
 * ================================================
 * Covers: changing the account password from Account > Profile > My
 * Details > "Reset Password", which swaps the card over to a Change
 * Password form (Existing/New/Repeat Password). This is a DIFFERENT flow
 * from login.test.ts's "Forgotten your password?" - that one is an
 * unauthenticated, email-based reset request; this one requires being
 * logged in and knowing the current password.
 *
 * accountTestUser_1 is the SAME shared staging account every other
 * logged-in test in this project authenticates with (see testUsers.ts).
 *
 * CORRECTED (staging, 2026-08-07): this used to change the real password
 * to a random temporary value, verify it, then revert back to the
 * original in a try/finally. That left a real window where a hard
 * process kill (or any failure between the temporary change and the
 * revert) would leave the shared account permanently on the temporary
 * password, breaking every other login-dependent test until someone
 * manually reset it - which is exactly what happened before this fix.
 * VERIFIED live: this project's change-password form does NOT reject
 * reusing the existing password (submitting new = existing still returns
 * "Password successfully updated"), so changing the password to ITSELF
 * exercises the exact same form submission and success path without
 * ever putting the account on a different password - there's no
 * divergent state to revert from, even under a hard kill.
 */
test.describe('Account Change Password (Logged-in, Portugal)', () => {
    test('User can submit the change-password form with the existing password, and it still works afterwards', async ({
        page,
        homePage,
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, insinkerator_eu.accountTestUser_1)

        await test.step(`Navigate to Home Page and select Portugal`, async () => {
            console.log(`[STEP] Navigate to Home Page and select Portugal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Log in to account`, async () => {
            console.log(`[STEP] Log in to account`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Submit the change-password form with the existing password as both fields`, async () => {
            console.log(`[STEP] Submit the change-password form with the existing password as both fields`)
            await accountPage.navigateToProfilePage()
            await accountPage.changePassword(user.password, user.password)
        })

        await test.step(`Verify the (unchanged) password still works`, async () => {
            console.log(`[STEP] Verify the (unchanged) password still works`)
            await loginPage.signOut()
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })
    })
})
