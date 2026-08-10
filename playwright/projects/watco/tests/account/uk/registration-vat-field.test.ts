import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-335 — VAT registration number field, account registration (UK).
 * Covers QA scenarios 16, 26, 27.
 */
test('registration: VAT number field', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage()
        await dismissCookieBanner(page)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and no comment text')
        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'GB123456789')
        await expect(page.getByText('VAT number', { exact: true })).toBeVisible()
        await expect(registerPage.vatNumberError).toBeHidden()
        await expect(registerPage.vatNumberComment).toHaveCount(0)
    })

    await test.step('An invalid VAT number is rejected on submit with a validation error', async () => {
        console.log('[STEP] An invalid VAT number is rejected on submit with a validation error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watco_register_invalid_vat'), '07700900002', 'Testing123!')
        await registerPage.vatNumberInput.fill('GB12345')
        await registerPage.submit()

        const errorAppeared = await registerPage.vatNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Observed once: the submit click can be silently swallowed
            // (same class of stray-overlay collision as elsewhere on this
            // site) leaving the form completely unsubmitted — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.vatNumberError).toBeVisible()
        expect((await registerPage.vatNumberError.textContent())?.trim()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format GB123456789.'
        )
    })

    await test.step('Registration succeeds with the VAT number left blank', async () => {
        console.log('[STEP] Registration succeeds with the VAT number left blank')
        // CONFIRMED SITE BEHAVIOUR: after a failed submit, the password
        // fields (only) are cleared server-side — re-fill everything
        // rather than assuming the previous step's values survived.
        await registerPage.fillMandatoryFields(generateGuestEmail('watco_register_no_vat'), '07700900002', 'Testing123!')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/register-confirmed$/, { timeout: 30000 })
    })
})
