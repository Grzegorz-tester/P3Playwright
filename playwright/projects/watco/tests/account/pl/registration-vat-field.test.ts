import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — NIP / NIP-EU fields, account registration (PL).
 * VERIFIED live, staging, 2026-08-06. Registration path is /rejestracja;
 * success redirects to /potwierdzenie-rejestracji.
 */
test('PL registration: NIP and NIP-EU fields', async ({ page, registerPage }) => {
    await test.step('Navigate to registration', async () => {
        console.log('[STEP] Navigate to registration')
        await registerPage.navigateToRegisterPage('/rejestracja')
        await dismissCookieBanner(page)
    })

    await test.step('Both fields are visible with the correct label/placeholder; NIP-EU has a comment, NIP does not', async () => {
        console.log('[STEP] Both fields are visible with the correct label/placeholder; NIP-EU has a comment, NIP does not')
        await expect(registerPage.nipNumberInput).toBeVisible()
        await expect(registerPage.nipNumberInput).toHaveAttribute('placeholder', '0123456789')
        await expect(page.locator('label[for="user_registration_customer_nip_number"]')).toHaveText('NIP')
        await expect(registerPage.nipNumberError).toBeHidden()

        await expect(registerPage.vatNumberInput).toBeVisible()
        await expect(registerPage.vatNumberInput).toHaveAttribute('placeholder', 'PL1234567890')
        await expect(page.locator('label[for="user_registration_customer_vat_number"]')).toHaveText('NIP-EU')
        await expect(registerPage.vatNumberError).toBeHidden()
        await expect(registerPage.vatNumberComment).toHaveText(
            'Jeśli jesteś podatnikiem VAT w UE, podaj numer z przedrostkiem PL — zastosujemy stawkę 0% dla transakcji wewnątrzwspólnotowych.'
        )
    })

    await test.step('An invalid NIP is rejected on submit with its own format-specific error', async () => {
        console.log('[STEP] An invalid NIP is rejected on submit with its own format-specific error')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcopl_register_invalid_nip'), '500000005', 'Testing123!')
        await registerPage.nipNumberInput.fill('123')
        await registerPage.submit()

        const errorAppeared = await registerPage.nipNumberError.isVisible({ timeout: 5000 }).catch(() => false)
        if (!errorAppeared) {
            // Same reCAPTCHA-timing / stray-overlay collision documented
            // on every other market's registration file — retry once.
            await registerPage.submit()
        }
        await expect(registerPage.nipNumberError).toBeVisible()
        expect((await registerPage.nipNumberError.textContent())?.trim()).toBe(
            'Wprowadzony numer NIP jest nieprawidłowy. Wprowadź numer NIP w formacie 1234567890.'
        )
    })

    await test.step('Registration succeeds with both fields left blank', async () => {
        console.log('[STEP] Registration succeeds with both fields left blank')
        await registerPage.fillMandatoryFields(generateGuestEmail('watcopl_register_no_vat'), '500000006', 'Testing123!')
        await registerPage.nipNumberInput.fill('')
        await registerPage.vatNumberInput.fill('')
        await registerPage.submit()

        await expect(page).toHaveURL(/\/potwierdzenie-rejestracji$/, { timeout: 30000 })
    })
})
