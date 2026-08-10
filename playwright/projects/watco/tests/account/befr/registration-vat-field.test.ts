import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, account registration (BE-FR).
 * Registration path is localized like FR (/senregistrer), and activates
 * accounts immediately (confirmed live by registering
 * watco.stageBeFr's own test accounts this session). The field's label
 * is "Numéro de TVA client" — includes "client", unlike FR's own
 * "Numéro de TVA" — verified live via the label's `for` attribute
 * resolving to the same input id, not assumed from FR.
 */
test('BE-FR registration: VAT number field', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage('/senregistrer')
        await dismissCookieBanner(page)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and no comment text')
        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'BE1234567890')
        await expect(page.getByText('Numéro de TVA client', { exact: true })).toBeVisible()
        await expect(registerPage.vatNumberError).toBeHidden()
        await expect(registerPage.vatNumberComment).toHaveCount(0)
    })

    await test.step('An invalid VAT number is rejected on submit with a validation error', async () => {
        console.log('[STEP] An invalid VAT number is rejected on submit with a validation error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcobefr_register_invalid_vat'), '0470000005', 'Testing123!')
        await registerPage.vatNumberInput.fill('BEA1234567')
        await registerPage.submit()

        const errorAppeared = await registerPage.vatNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Same reCAPTCHA-timing / stray-overlay collision documented on
            // the UK/FR files — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.vatNumberError).toBeVisible()
        expect((await registerPage.vatNumberError.textContent())?.trim()).toBe(
            'Le numéro de TVA entré n’est pas valable. Veuillez entrer un numéro de TVA au format: BE1234567890.'
        )
    })

    await test.step('Registration succeeds with the VAT number left blank', async () => {
        console.log('[STEP] Registration succeeds with the VAT number left blank')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcobefr_register_no_vat'), '0470000006', 'Testing123!')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/enregistrement-valide$/, { timeout: 30000 })
    })
})
