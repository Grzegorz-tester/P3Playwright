import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — NIP / NIP-EU field validation, guest checkout (PL).
 * VERIFIED live, staging, 2026-08-06.
 *
 * The QA doc (scenario 7) flagged the invalid-NIP error copy as a
 * recurring bug — English text, then a non-format-specific Polish
 * placeholder ("Zastosowano niewłaściwy format") as of its last recheck
 * (12/07/26), still not matching its "Expected" text. Live-checking both
 * fields today shows the bug has SINCE been fixed, but not quite as the
 * doc predicted: the doc's expected text (with a "PL" prefix in the
 * format example) is actually what NIP-EU's own error now shows —
 * matched exactly below. NIP's OWN error (a separate, correct message
 * with no "PL" prefix, since NIP itself never takes one) is a different
 * string the doc never separately specified. Both are asserted here as
 * currently-passing, correct behaviour — re-verify live if this doc's
 * bug ever resurfaces, rather than assume today's fix is permanent.
 */
test('PL guest checkout: NIP and NIP-EU field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/koszyk')
        await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcopl_guest_vat_validation'), '/realizacja-transakcji')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Testowa 1',
            city: 'Warszawa',
            postcode: '00-001',
            country: 'Polska',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid NIP is rejected with its own format-specific error', async () => {
        console.log('[STEP] An invalid NIP is rejected with its own format-specific error')
        await checkoutPage.applyNipNumber('123')
        expect(await checkoutPage.getNipApplyErrorMessage()).toBe(
            'Wprowadzony numer NIP jest nieprawidłowy. Wprowadź numer NIP w formacie 1234567890.'
        )
        await expect(checkoutPage.nipNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('An invalid NIP-EU is rejected with its own format-specific error', async () => {
        console.log('[STEP] An invalid NIP-EU is rejected with its own format-specific error')
        await checkoutPage.applyVatNumber('PLX')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Wprowadzony numer NIP jest nieprawidłowy. Wprowadź numer NIP w formacie PL1234567891.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('Correctly-formatted values are accepted for both fields', async () => {
        console.log('[STEP] Correctly-formatted values are accepted for both fields')
        await checkoutPage.applyNipNumber('9876543210')
        await expect(checkoutPage.nipNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.applyVatNumber('PL1234567890')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    await test.step('Editing NIP-EU without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing NIP-EU without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('PL0987654321')
        await checkoutPage.vatNumberInput.blur()
        await expect.poll(() => checkoutPage.isVatFieldDirty()).toBe(true)

        // No Pay on Account on this market to select before the T&Cs
        // checkbox — go straight to the card/Adyen method, which is
        // always offered.
        await checkoutPage.payByCardMethodRadio.check({ force: true })
        await expect(checkoutPage.adyenTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'W tym polu znajdują się niezapisane zmiany. Zastosuj zmiany lub wyczyść pole przed kontynuowaniem'
        )
        await expect(checkoutPage.adyenTermsCheckbox).not.toBeChecked()
    })
})
