import test from '../../utils/Pages'

/**
 * FOOTER NEWSLETTER SIGN-UP
 * ==========================
 * Covers: the newsletter sign-up form in the site footer (present on every
 * page, not just Home) - form visibility, native HTML5 validation on an
 * empty/malformed email, and submitting a well-formed email.
 *
 * VERIFIED live (staging, 2026-07-31): the email input is a native
 * <input type="email" required> with NO custom client-side validation UI,
 * so empty/malformed submissions are asserted via the input's own validity
 * state, not a rendered error locator. A well-formed submission shows
 * "Success - Thank you for subscribing to our newsletter." through the
 * same alert element.
 */
test.describe('Footer Newsletter Sign-up', () => {
    test('User can submit the newsletter form, which validates email input and surfaces a response', async ({
        homePage,
    }) => {
        const validEmail = `velstar.qa.${Date.now()}@velstar.co.uk`

        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        await test.step(`Validate the footer newsletter form is visible`, async () => {
            console.log(`[STEP] Validate the footer newsletter form is visible`)
            await homePage.validateFooterNewsletterForm()
        })

        await test.step(`Submitting an empty email is blocked by validation`, async () => {
            console.log(`[STEP] Submitting an empty email is blocked by validation`)
            await homePage.assertEmptyNewsletterEmailIsRejected()
        })

        await test.step(`Submitting a malformed email is blocked by validation`, async () => {
            console.log(`[STEP] Submitting a malformed email is blocked by validation`)
            await homePage.assertMalformedNewsletterEmailIsRejected('not-an-email')
        })

        await test.step(`Submitting a well-formed email shows a success confirmation`, async () => {
            console.log(`[STEP] Submitting a well-formed email shows a success confirmation`)
            await homePage.assertValidNewsletterEmailReturnsResponse(validEmail)
        })
    })
})
