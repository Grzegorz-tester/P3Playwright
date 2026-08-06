import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, account registration (BE-NL).
 * Mirrors registration-vat-field-nl.test.ts — this market also shows a
 * business-customer comment below the field, identical text to NL's
 * (VERIFIED live, staging, 2026-08-06). The field's own label ("Btw-
 * nummer") differs from NL's ("Belasting over de toegevoegde waarde").
 */
test('BE-NL registration: VAT number field', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage('/registreren')
        await dismissCookieBanner(page)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and business-customer comment', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and business-customer comment')
        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'BE1234567890')
        await expect(page.getByText('Btw-nummer', { exact: true })).toBeVisible()
        await expect(registerPage.vatNumberError).toBeHidden()
        await expect(registerPage.vatNumberComment).toHaveText(
            'Als u ons een btw-nummer verstrekt, zullen wij voor intracommunautaire transacties een btw-tarief van 0% hanteren'
        )
    })

    await test.step('An invalid VAT number is rejected on submit with a validation error', async () => {
        console.log('[STEP] An invalid VAT number is rejected on submit with a validation error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcobenl_register_invalid_vat'), '0470000005', 'Testing123!')
        await registerPage.vatNumberInput.fill('BE12')
        await registerPage.submit()

        const errorAppeared = await registerPage.vatNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Same reCAPTCHA-timing / stray-overlay collision documented on
            // the UK file — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.vatNumberError).toBeVisible()
        expect((await registerPage.vatNumberError.textContent())?.trim()).toBe(
            'Het ingevoerde btw-nummer is ongeldig. Voer een btw-nummer in met het formaat BE1234567890.'
        )
    })

    await test.step('Registration succeeds with the VAT number left blank', async () => {
        console.log('[STEP] Registration succeeds with the VAT number left blank')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcobenl_register_no_vat'), '0470000006', 'Testing123!')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/registratie-geldig$/, { timeout: 30000 })
    })
})
