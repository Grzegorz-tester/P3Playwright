import test from '../../utils/Pages'
import { expect } from '@playwright/test'

/**
 * QUICK ENQUIRY FORM
 * ==================
 * Covers: /quick-enquiry-form, a CMS-driven contact form (Name, Email,
 * Telephone and Message required; Machine Brand/Model/Serial and Images
 * optional). Verifies required-field and malformed-email validation both
 * block submission, and that a fully valid submission genuinely reaches
 * the backend.
 *
 * TODO: RUS-474 - no data-testid anywhere on this form or its fields -
 * see the locator notes in objects.ts.
 *
 * CONFIRMED SITE BUG (RUS-474, confirmed live, staging, 2026-08-02): a
 * successful submission reaches the backend fine (a real 201 from
 * POST .../form-submissions) but the user gets NO visible feedback at
 * all - no success message, no error, no field reset, no redirect. See
 * validateNoSuccessFeedbackIsShown in RussellsQuickEnquiryFormPage for
 * the full investigation. Documented below as today's actual behaviour
 * rather than skipped, per this repo's convention.
 *
 * The valid-submission test deliberately creates a real backend
 * form-submission every run (same tradeoff already accepted for the
 * newsletter signup and guest checkout tests) - the email is tagged
 * so it's identifiable as automated traffic.
 */
test.describe('Quick Enquiry Form', () => {
    test('Submitting the form with all required fields empty is rejected', async ({
        quickEnquiryFormPage,
    }) => {
        await test.step(`Navigate to the Quick Enquiry Form`, async () => {
            console.log(`[STEP] Navigate to the Quick Enquiry Form`)
            await quickEnquiryFormPage.navigateToQuickEnquiryForm()
        })

        await test.step(`Submit with everything blank and validate it's rejected`, async () => {
            console.log(`[STEP] Submit with everything blank and validate it's rejected`)
            await quickEnquiryFormPage.validateEmptyFormIsRejected()
        })
    })

    test('Submitting the form with a malformed email is rejected', async ({
        quickEnquiryFormPage,
    }) => {
        await test.step(`Navigate to the Quick Enquiry Form`, async () => {
            console.log(`[STEP] Navigate to the Quick Enquiry Form`)
            await quickEnquiryFormPage.navigateToQuickEnquiryForm()
        })

        await test.step(`Submit with a malformed email and validate it's rejected`, async () => {
            console.log(`[STEP] Submit with a malformed email and validate it's rejected`)
            await quickEnquiryFormPage.validateMalformedEmailIsRejected('not-an-email')
        })
    })

    test('CONFIRMED BUG (RUS-474): a valid submission reaches the backend but shows no success feedback', async ({
        quickEnquiryFormPage,
    }) => {
        const enquiry = {
            name: 'Playwright QA Test',
            email: `velstar.qa.enquiry.${Date.now()}@velstar.co.uk`,
            phone: '07700900000',
            message: 'Automated Playwright test enquiry - please ignore.',
        }

        await test.step(`Navigate to the Quick Enquiry Form`, async () => {
            console.log(`[STEP] Navigate to the Quick Enquiry Form`)
            await quickEnquiryFormPage.navigateToQuickEnquiryForm()
        })

        await test.step(`Submit a fully valid enquiry and validate the backend accepts it`, async () => {
            console.log(`[STEP] Submit a fully valid enquiry and validate the backend accepts it`)
            const status = await quickEnquiryFormPage.submitAndGetResponseStatus(enquiry)
            expect(status).toBe(201)
        })

        await test.step(`Validate no success feedback is shown to the user`, async () => {
            console.log(`[STEP] Validate no success feedback is shown to the user`)
            await quickEnquiryFormPage.validateNoSuccessFeedbackIsShown(enquiry.name)
        })
    })
})
