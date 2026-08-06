import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, account registration (IE).
 * IE mirror of registration-vat-field.test.ts (UK).
 */
test('IE registration: VAT number field', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage()
        await dismissCookieBanner(page)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and no comment text')
        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'IE9999999L')
        await expect(page.getByText('VAT number', { exact: true })).toBeVisible()
        await expect(registerPage.vatNumberError).toBeHidden()
    })

    await test.step('An invalid VAT number is rejected on submit with a validation error', async () => {
        console.log('[STEP] An invalid VAT number is rejected on submit with a validation error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcoie_register_invalid_vat'), '0870000005', 'Testing123!')
        await registerPage.vatNumberInput.fill('IE12')
        await registerPage.submit()

        const errorAppeared = await registerPage.vatNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Same reCAPTCHA-timing / stray-overlay collision documented on
            // the UK file — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.vatNumberError).toBeVisible()
        expect((await registerPage.vatNumberError.textContent())?.trim()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format IE9999999L.'
        )
    })

    await test.step('Registration succeeds with the VAT number left blank', async () => {
        console.log('[STEP] Registration succeeds with the VAT number left blank')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcoie_register_no_vat'), '0870000006', 'Testing123!')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/register-confirmed$/, { timeout: 30000 })
    })
})
