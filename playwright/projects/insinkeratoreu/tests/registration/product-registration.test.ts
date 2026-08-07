import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { generateWarrantyRegistration } from '@utils/fakeData'

/**
 * PRODUCT REGISTRATION — EU domain (/<locale>/product-registration)
 * =====================================================================
 * Scope: staging.insinkerator-eu.work only. The UK-domain form
 * (staging.insinkerator.work) needs its own testEnvs entry/base URL and
 * is deliberately out of scope here — see INSE-764 follow-up.
 *
 * CORRECTED (staging, 2026-08-07): placeOfPurchase previously had a
 * documented UI/backend mismatch — not marked required in the UI, but
 * rejected by the backend when blank. Retested live on en-gb: the field
 * now renders with a required asterisk AND the submit button stays
 * disabled while it's empty. The tests below assert that fixed,
 * consistent behaviour rather than the old mismatch.
 */
test.describe('Product Registration (EU domain, Germany)', () => {
    test('The en-gb registration form displays, with Place of purchase marked required', async ({
        page,
        productRegistrationPage,
    }) => {
        await test.step(`Navigate to the en-gb registration form and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to the en-gb registration form and dismiss the country modal`)
            await productRegistrationPage.navigateToProductRegistrationPage('en-gb')
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Validate the registration form is visible`, async () => {
            console.log(`[STEP] Validate the registration form is visible`)
            await productRegistrationPage.validateFormDisplays()
        })

        await test.step(`Validate Place of purchase is marked required`, async () => {
            console.log(`[STEP] Validate Place of purchase is marked required`)
            await productRegistrationPage.validatePlaceOfPurchaseMarkedRequired()
        })
    })

    test('Leaving Place of purchase blank keeps the submit button disabled on en-gb', async ({
        page,
        productRegistrationPage,
    }) => {
        const registration = generateWarrantyRegistration('noplaceofpurchase')
        registration.placeOfPurchase = ''

        await test.step(`Navigate to the en-gb registration form and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to the en-gb registration form and dismiss the country modal`)
            await productRegistrationPage.navigateToProductRegistrationPage('en-gb')
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Fill in every required field except Place of purchase`, async () => {
            console.log(`[STEP] Fill in every required field except Place of purchase`)
            await productRegistrationPage.fillRegistrationForm(registration)
        })

        await test.step(`Validate the submit button stays disabled`, async () => {
            console.log(`[STEP] Validate the submit button stays disabled`)
            await productRegistrationPage.validateSubmitDisabled()
        })
    })

    test('A fully completed en-gb registration submits successfully', async ({
        page,
        productRegistrationPage,
    }) => {
        const registration = generateWarrantyRegistration('registration-engb')

        await test.step(`Navigate to the en-gb registration form and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to the en-gb registration form and dismiss the country modal`)
            await productRegistrationPage.navigateToProductRegistrationPage('en-gb')
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Fill in every field and submit`, async () => {
            console.log(`[STEP] Fill in every field and submit`)
            await productRegistrationPage.fillRegistrationForm(registration)
            await productRegistrationPage.submitRegistrationForm()
        })

        await test.step(`Validate the submission succeeded`, async () => {
            console.log(`[STEP] Validate the submission succeeded`)
            await productRegistrationPage.validateSubmissionSucceeded()
        })
    })

    test('A fully completed de registration submits successfully', async ({
        page,
        productRegistrationPage,
    }) => {
        const registration = generateWarrantyRegistration('registration-de')

        await test.step(`Navigate to the de registration form and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to the de registration form and dismiss the country modal`)
            await productRegistrationPage.navigateToProductRegistrationPage('de')
            await selectCountryOnFreshLoad(page, 'Germany')
        })

        await test.step(`Fill in every field and submit`, async () => {
            console.log(`[STEP] Fill in every field and submit`)
            await productRegistrationPage.fillRegistrationForm(registration)
            await productRegistrationPage.submitRegistrationForm()
        })

        await test.step(`Validate the submission succeeded`, async () => {
            console.log(`[STEP] Validate the submission succeeded`)
            await productRegistrationPage.validateSubmissionSucceeded()
        })
    })
})
