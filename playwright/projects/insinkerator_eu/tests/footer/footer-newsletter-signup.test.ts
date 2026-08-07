import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * FOOTER - "FOLLOW US" NEWSLETTER SIGN-UP
 * ========================================
 * Covers: the newsletter sign-up form in the site footer (present on every
 * page, not just Home) - form visibility, native HTML5 validation on an
 * empty/malformed email, and submitting a well-formed email.
 *
 * VERIFIED live (staging, 2026-07-21): the email input is a native
 * <input type="email" required> with NO custom client-side validation UI,
 * so empty/malformed submissions are asserted via the input's own validity
 * state, not a rendered error locator.
 *
 * CORRECTED (staging, 2026-07-31): submitting a genuinely valid email
 * used to always return a backend error - "Form Field with uniqueString
 * email-1 could not be found." - a CRM/form-builder field-mapping
 * misconfiguration, the same category of gap as the checkout
 * payment-provider issue that was also fixed (see
 * logged-in-purchase-journey.test.ts). Retested live and it now shows a
 * real success confirmation ("Thank you for subscribing to our
 * newsletter.") through the same alert element instead.
 */
test.describe('Footer Newsletter Sign-up (Portugal)', () => {
    test('User can submit the newsletter form, which validates email input and surfaces a response', async ({
        page,
        homePage,
    }) => {
        const validEmail = `velstar.qa.${Date.now()}@velstar.co.uk`

        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
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
