import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

/**
 * LOGIN & PASSWORD RESET
 * =======================
 * Covers: wrong-password / empty-submission handling on /login, and the
 * "Forgotten your password?" link through to a working password reset
 * request on /reset-password.
 *
 * VERIFIED live (staging, 2026-07-31):
 * - Wrong password shows login-form__alert ("Invalid credentials."),
 *   staying on /login rather than redirecting.
 * - Empty submission is blocked by native HTML5 validity (required
 *   attribute) - no rendered error message for that case.
 * - /reset-password is a standalone email-only form; submitting a real
 *   account's email shows a static success message.
 */
test.describe('Login & Password Reset', () => {
    test('User cannot log in with a wrong password or an empty form', async ({
        loginPage,
    }) => {
        const user = Object.assign({}, russells.accountTestUser_1)

        await test.step(`Submitting an empty login form is blocked by validation`, async () => {
            console.log(`[STEP] Submitting an empty login form is blocked by validation`)
            await loginPage.navigateToLoginPage()
            await loginPage.assertEmptySubmissionIsRejected()
        })

        await test.step(`Wrong password shows an error and stays on the login page`, async () => {
            console.log(`[STEP] Wrong password shows an error and stays on the login page`)
            await loginPage.assertLoginFailsWithInvalidCredentials(user.email, 'WrongPassword123!')
        })
    })

    test('User can request a password reset via the Forgotten password link', async ({
        loginPage,
        resetPasswordPage,
    }) => {
        const user = Object.assign({}, russells.accountTestUser_1)

        await test.step(`Click Forgotten your password?`, async () => {
            console.log(`[STEP] Click Forgotten your password?`)
            await loginPage.navigateToLoginPage()
            await loginPage.clickForgotPasswordLink()
        })

        await test.step(`Request a password reset`, async () => {
            console.log(`[STEP] Request a password reset`)
            await resetPasswordPage.requestPasswordReset(user.email)
        })
    })
})
