import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field validation, guest checkout (FR).
 * FR mirror of guest-checkout-vat-validation.test.ts (UK). Format is FR +
 * 2 letters + 9 digits (11 alphanumeric chars) — VERIFIED live, staging,
 * 2026-08-06.
 */
test('FR guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcofr_guest_vat_validation'), '/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: '1 Rue de Test',
            city: 'Paris',
            postcode: '75001',
            country: 'France',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('FRA1234567')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            "Le numéro de TVA entré n'est pas valable. Veuillez entrer un numéro de TVA au format: FRXX123456789."
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A correctly-formatted FR VAT number is accepted', async () => {
        console.log('[STEP] A correctly-formatted FR VAT number is accepted')
        await checkoutPage.applyVatNumber('FRAB123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    await test.step('Editing the field without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing the field without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('FRCD987654321')
        await checkoutPage.vatNumberInput.blur()
        await expect.poll(() => checkoutPage.isVatFieldDirty()).toBe(true)

        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Des modifications ne sont pas enregistrées. Veuillez valider ou vider le champ avant de continuer'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})

// See the UK file's equivalent test for why this is kept separate (fresh
// checkout session) rather than a further step above.
test('FR guest checkout: an invalid, applied VAT number also blocks proceeding', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcofr_guest_vat_invalid_block'), '/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: '1 Rue de Test',
            city: 'Paris',
            postcode: '75001',
            country: 'France',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit', async () => {
        console.log('[STEP] An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit')
        await checkoutPage.applyVatNumber('FRA1234567')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            "Le numéro de TVA entré n'est pas valable. Veuillez entrer un numéro de TVA au format: FRXX123456789."
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)

        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Des modifications ne sont pas enregistrées. Veuillez valider ou vider le champ avant de continuer'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})
