import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * KNOWN FAILING TEST — WAT-305, discovered while adding order-completion
 * coverage, not something the QA doc or AC asked for directly.
 *
 * CONFIRMED SITE BUG (staging, 2026-08-06): editing the VAT number on
 * /account/profile and clicking "Save details" does NOT persist the
 * change. No request to any profile-save endpoint fires at all (checked
 * via page.on('request') — only analytics/tracking POSTs appear), and
 * the field silently reverts to its previous value on reload. This
 * assertion is written against the CORRECT/expected behaviour per this
 * repo's convention for confirmed bugs (see feedback memory on this) —
 * it must stay red until fixed, not be softened to match today's broken
 * behaviour.
 *
 * Uses a throwaway freshly-registered account rather than the shared
 * accountTestUserWithVat account, since this test's whole point is to
 * mutate a saved VAT number and a bug here should never risk leaving a
 * shared account in an unexpected state for other tests.
 */
test('Account profile: editing the VAT number and saving persists the new value', async ({ page, registerPage, loginPage, accountPage }) => {
    const email = generateGuestEmail('watco_profile_vat_save')

    await test.step('Register a fresh throwaway account with a known VAT number', async () => {
        console.log('[STEP] Register a fresh throwaway account with a known VAT number')
        await registerPage.navigateToRegisterPage('/register')
        await dismissCookieBanner(page)
        await registerPage.fillMandatoryFields(email, '07700900123', 'Testing123!')
        await registerPage.vatNumberInput.fill('GB111111111')
        await registerPage.submit()
        // Wait for the confirmation redirect to fully land before moving
        // on — otherwise the next step's navigateToLoginPage() can race
        // an in-flight redirect and abort (seen live: net::ERR_ABORTED).
        await expect(page).toHaveURL(/\/register-confirmed$/, { timeout: 30000 })
    })

    await test.step('Log in and edit the saved VAT number on the profile page', async () => {
        console.log('[STEP] Log in and edit the saved VAT number on the profile page')
        await loginPage.navigateToLoginPage('/login')
        await loginPage.loginToApplication(email, 'Testing123!', '/account')
        await accountPage.navigateToProfile()
        await expect(accountPage.vatNumberInput).toHaveValue('GB111111111')

        await accountPage.vatNumberInput.fill('GB222222222')
        await accountPage.saveDetailsButton.click()
    })

    await test.step('The edited VAT number persists after a reload', async () => {
        console.log('[STEP] The edited VAT number persists after a reload')
        await page.reload()
        await expect(accountPage.vatNumberInput).toHaveValue('GB222222222', { timeout: 15000 })
    })
})
