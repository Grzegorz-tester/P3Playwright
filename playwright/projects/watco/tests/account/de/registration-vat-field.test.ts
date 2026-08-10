import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, account registration (DE).
 * DE mirror of registration-vat-field.test.ts (UK), but unlike UK/IE/FR
 * this market DOES show a business-customer comment below the field
 * (same .vat-form-group__comment element as checkout) — VERIFIED live,
 * staging, 2026-08-06.
 */
test('DE registration: VAT number field', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage('/registrieren')
        await dismissCookieBanner(page)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and business-customer comment', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and business-customer comment')
        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'DE123456789 oder ATU12345678')
        await expect(page.getByText('USt-IDNr', { exact: true })).toBeVisible()
        await expect(registerPage.vatNumberError).toBeHidden()
        await expect(registerPage.vatNumberComment).toHaveText(
            'Durch die Angabe der USt-IdNr. weisen Sie sich bei uns als Geschäftskunde aus. Beispiel: DE123456789'
        )
    })

    await test.step('An invalid VAT number is rejected on submit with a validation error', async () => {
        console.log('[STEP] An invalid VAT number is rejected on submit with a validation error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcode_register_invalid_vat'), '017000000005', 'Testing123!')
        await registerPage.vatNumberInput.fill('DE12')
        await registerPage.submit()

        const errorAppeared = await registerPage.vatNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Same reCAPTCHA-timing / stray-overlay collision documented on
            // the UK file — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.vatNumberError).toBeVisible()
        expect((await registerPage.vatNumberError.textContent())?.trim()).toBe(
            'Die eingegebene USt-IdNr. ist ungültig. Bitte geben Sie eine Umsatzsteuer-Identifikationsnummer im Format DE123456789 ein'
        )
    })

    await test.step('Registration succeeds with the VAT number left blank', async () => {
        console.log('[STEP] Registration succeeds with the VAT number left blank')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcode_register_no_vat'), '017000000006', 'Testing123!')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/registrierungsbestatigung$/, { timeout: 30000 })
    })
})
