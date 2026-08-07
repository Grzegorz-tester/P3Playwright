import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { generateWarrantyRegistration } from '@utils/fakeData'

/**
 * WARRANTY FINDER (/warranty-finder) — INSE-764/INSE-770
 * ========================================================
 * Covers: form visibility, a not-found lookup, and a success lookup for a
 * product registered moments earlier via the registration form — this
 * avoids depending on any fixed/pre-seeded record, since the finder only
 * ever matches an exact last name + serial number pair.
 *
 * VERIFIED live (staging, 2026-08-07): the page is NOT gated by the
 * selected country (unlike ecommerce features elsewhere in this project)
 * and works identically regardless of which country the mandatory
 * fresh-load modal is dismissed with.
 */
test.describe('Warranty Finder (Germany)', () => {
    test('User can see the warranty finder form, and the submit button is disabled until both fields are filled', async ({
        page,
        warrantyFinderPage,
    }) => {
        await test.step(`Navigate to Warranty Finder and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Warranty Finder and dismiss the country modal`)
            await warrantyFinderPage.navigateToWarrantyFinderPage()
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Validate the warranty finder form is visible with the submit button disabled`, async () => {
            console.log(`[STEP] Validate the warranty finder form is visible with the submit button disabled`)
            await warrantyFinderPage.validateFormDisplays()
        })
    })

    test('Looking up a warranty with no matching registration shows a not-found message with a contact CTA', async ({
        page,
        warrantyFinderPage,
    }) => {
        await test.step(`Navigate to Warranty Finder and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Warranty Finder and dismiss the country modal`)
            await warrantyFinderPage.navigateToWarrantyFinderPage()
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Look up a last name and serial number that don't match any registration`, async () => {
            console.log(`[STEP] Look up a last name and serial number that don't match any registration`)
            await warrantyFinderPage.lookupWarranty('Smith', `NOMATCH${Date.now()}`)
        })

        await test.step(`Validate the not-found message and "Get in touch" CTA are shown`, async () => {
            console.log(`[STEP] Validate the not-found message and "Get in touch" CTA are shown`)
            await warrantyFinderPage.validateNotFoundMessageWithContactCta()
        })
    })

    test('Looking up a warranty for a freshly registered product returns a success message with the registration date, product and serial number', async ({
        page,
        productRegistrationPage,
        warrantyFinderPage,
    }) => {
        const registration = generateWarrantyRegistration('finder')

        await test.step(`Register a new product on the EU (en-gb) registration form`, async () => {
            console.log(`[STEP] Register a new product on the EU (en-gb) registration form`)
            await productRegistrationPage.navigateToProductRegistrationPage('en-gb')
            await selectCountryOnFreshLoad(page, 'Germany')
            await productRegistrationPage.fillRegistrationForm(registration)
            await productRegistrationPage.submitRegistrationForm()
            await productRegistrationPage.validateSubmissionSucceeded()
        })

        await test.step(`Navigate to Warranty Finder and look up the same last name and serial number`, async () => {
            console.log(`[STEP] Navigate to Warranty Finder and look up the same last name and serial number`)
            await warrantyFinderPage.navigateToWarrantyFinderPage()
            // Fresh navigation — the mandatory country modal reappears
            // (see countrySelector.ts) and would otherwise intercept the
            // submit click below.
            await selectCountryOnFreshLoad(page, 'Germany')
            await warrantyFinderPage.lookupWarranty(registration.lastName, registration.serialNumber)
        })

        await test.step(`Validate the success message shows the registration date, product and serial number`, async () => {
            console.log(`[STEP] Validate the success message shows the registration date, product and serial number`)
            await warrantyFinderPage.validateSuccessMessage('Standard 460', registration.serialNumber)
        })
    })
})
