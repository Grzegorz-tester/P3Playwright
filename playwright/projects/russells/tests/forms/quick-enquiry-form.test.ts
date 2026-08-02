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
 * KNOWN FAILING TEST (RUS-474): "shows a success confirmation" below is
 * written against the CORRECT/expected behaviour, not today's actual
 * one - staging currently shows the user no feedback at all after a
 * valid submission (confirmed live, 2026-08-02), so this test is
 * expected to fail until that's fixed. A real bug should show up as a
 * red test, not get quietly asserted as "working as intended" - see
 * validateSuccessFeedbackIsShown in RussellsQuickEnquiryFormPage.
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

    test('A valid submission reaches the backend and shows a success confirmation', async ({
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

        await test.step(`Validate a success confirmation is shown to the user`, async () => {
            console.log(`[STEP] Validate a success confirmation is shown to the user`)
            await quickEnquiryFormPage.validateSuccessFeedbackIsShown()
        })
    })
})
