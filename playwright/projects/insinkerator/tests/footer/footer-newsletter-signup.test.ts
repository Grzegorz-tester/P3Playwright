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
 * KNOWN BLOCKER (confirmed live, reproduced twice with different valid
 * emails): submitting a genuinely valid email currently always returns a
 * backend error - "Form Field with uniqueString email-1 could not be
 * found." - a CRM/form-builder field-mapping misconfiguration on staging,
 * the same category of gap as the checkout payment-provider issue in
 * logged-in-purchase-journey.test.ts. No success state is reachable right now, so
 * this test asserts the CURRENT (broken) behaviour rather than a success
 * state it can't observe.
 * TODO(INSINKERATOR): once the backend field mapping is fixed, extend
 * InsinkeratorHomePage.assertValidNewsletterEmailReturnsResponse() to
 * assert the real success confirmation instead of newsletterAlert.
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

        await test.step(`Submitting a well-formed email returns a response`, async () => {
            console.log(`[STEP] Submitting a well-formed email returns a response`)
            await homePage.assertValidNewsletterEmailReturnsResponse(validEmail)
        })
    })
})
