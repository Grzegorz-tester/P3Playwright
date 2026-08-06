import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field validation, guest checkout (DE).
 * DE mirror of guest-checkout-vat-validation.test.ts (UK). Format accepts
 * either DE + 9 digits or an Austrian ATU + 8 digits (VERIFIED live,
 * staging, 2026-08-06 — the placeholder itself reads "DE123456789 oder
 * ATU12345678").
 */
test('DE guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcode_guest_vat_validation'), '/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Berlin',
            postcode: '10115',
            country: 'Deutschland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('DE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Die eingegebene USt-IdNr. ist ungültig. Bitte geben Sie eine Umsatzsteuer-Identifikationsnummer im Format DE123456789 ein'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('Clearing the field after an invalid entry cleans up the error state', async () => {
        console.log('[STEP] Clearing the field after an invalid entry cleans up the error state')
        await checkoutPage.vatNumberInput.fill('')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('A correctly-formatted DE VAT number is accepted', async () => {
        console.log('[STEP] A correctly-formatted DE VAT number is accepted')
        await checkoutPage.applyVatNumber('DE123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    await test.step('Editing the field without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing the field without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('DE987654321')
        await checkoutPage.vatNumberInput.blur()
        await expect.poll(() => checkoutPage.isVatFieldDirty()).toBe(true)

        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Es liegen nicht gespeicherte Änderungen in diesem Feld vor. Bitte übernehmen Sie die Änderungen oder leeren Sie das Feld, bevor Sie fortfahren'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})

// See the UK file's equivalent test for why this is kept separate (fresh
// checkout session) rather than a further step above. Uses the card/
// Adyen method rather than Pay on Account — Pay on Account is VAT-gated
// on DE and this test never applies a VALID VAT, so it never appears.
test('DE guest checkout: an invalid, applied VAT number also blocks proceeding', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcode_guest_vat_invalid_block'), '/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Berlin',
            postcode: '10115',
            country: 'Deutschland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit', async () => {
        console.log('[STEP] An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit')
        await checkoutPage.applyVatNumber('DE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Die eingegebene USt-IdNr. ist ungültig. Bitte geben Sie eine Umsatzsteuer-Identifikationsnummer im Format DE123456789 ein'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)

        await checkoutPage.payByCardMethodRadio.check({ force: true })
        await expect(checkoutPage.adyenTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Es liegen nicht gespeicherte Änderungen in diesem Feld vor. Bitte übernehmen Sie die Änderungen oder leeren Sie das Feld, bevor Sie fortfahren'
        )
        await expect(checkoutPage.adyenTermsCheckbox).not.toBeChecked()
    })
})
