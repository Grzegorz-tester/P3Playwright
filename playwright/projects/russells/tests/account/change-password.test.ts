import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

/**
 * ACCOUNT CHANGE PASSWORD (Logged-in)
 * =====================================
 * Covers: changing the account password from Account > Profile > My
 * Details > "Reset Password", which swaps the card over to a Change
 * Password form (Existing/New/Repeat Password). This is a DIFFERENT flow
 * from login.test.ts's "Forgotten your password?" - that one is an
 * unauthenticated, email-based reset request; this one requires being
 * logged in and knowing the current password.
 *
 * VERIFIED live (staging, 2026-07-31): a successful change shows
 * "Password successfully updated" and takes effect immediately (confirmed
 * by signing out and back in with the new password).
 *
 * accountTestUser_1 is the SAME shared staging account every other
 * logged-in test for this project authenticates with (see testUsers.ts).
 * This test genuinely changes its real password twice - to a temporary
 * value, then back to the original - so every other login-dependent test
 * keeps working. The revert runs in a finally block, keyed off whether the
 * temporary change actually succeeded.
 *
 * TODO: RUS-474 - the "Reset Password" toggle, its "Save Changes" button
 * and "Back to User Form" have no data-testid (confirmed live,
 * 2026-07-31) - see the text-locator TODOs in RussellsObjects.AccountPage.
 */
test.describe('Account Change Password (Logged-in)', () => {
    test('User can change their account password', async ({
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, russells.accountTestUser_1)
        const temporaryPassword = `Temp${Date.now()}!`
        let changedToTemporaryPassword = false

        await test.step(`Log in to account`, async () => {
            console.log(`[STEP] Log in to account`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        try {
            await test.step(`Change password to a temporary value`, async () => {
                console.log(`[STEP] Change password to a temporary value`)
                await accountPage.navigateToProfilePage()
                await accountPage.changePassword(user.password, temporaryPassword)
                changedToTemporaryPassword = true
            })

            await test.step(`Verify the temporary password works by signing out and back in`, async () => {
                console.log(`[STEP] Verify the temporary password works by signing out and back in`)
                await loginPage.signOut()
                await loginPage.navigateToLoginPage()
                await loginPage.loginToApplication(user.email, temporaryPassword)
            })
        } finally {
            if (changedToTemporaryPassword) {
                await test.step(`Revert password back to the original`, async () => {
                    console.log(`[STEP] Revert password back to the original`)
                    if (!(await loginPage.isLoggedIn())) {
                        await loginPage.navigateToLoginPage()
                        await loginPage.loginToApplication(user.email, temporaryPassword)
                    }
                    await accountPage.navigateToProfilePage()
                    await accountPage.changePassword(temporaryPassword, user.password)
                })
            }
        }

        await test.step(`Verify the original password still works after reverting`, async () => {
            console.log(`[STEP] Verify the original password still works after reverting`)
            await loginPage.signOut()
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })
    })
})
