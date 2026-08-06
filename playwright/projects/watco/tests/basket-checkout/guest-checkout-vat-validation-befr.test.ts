import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field validation, guest checkout
 * (BE-FR — Belgium, French language). VERIFIED live, staging, 2026-08-06.
 *
 * The invalid-VAT error text uses a TYPOGRAPHIC apostrophe (U+2019) in
 * "n’est" — confirmed via codePointAt, not assumed from FR's own
 * registration test (which asserts a straight U+0027 apostrophe for the
 * same sentence shape; whether that's a genuine FR/BE-FR difference or a
 * latent mismatch in that FR test is out of scope here).
 *
 * The unsaved-changes message has no trailing full stop (read directly
 * off the `data-unsaved-message` attribute) and no special characters —
 * unlike NL/BE-NL's non-breaking hyphen, there's nothing hyphenated in
 * this sentence to worry about.
 */
test('BE-FR guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcobefr_guest_vat_validation'), '/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Rue de Test 1',
            city: 'Bruxelles',
            postcode: '1000',
            country: 'Belgique',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('BE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Le numéro de TVA entré n’est pas valable. Veuillez entrer un numéro de TVA au format: BE1234567890.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A correctly-formatted BE VAT number is accepted', async () => {
        console.log('[STEP] A correctly-formatted BE VAT number is accepted')
        await checkoutPage.applyVatNumber('BE0411905847')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })

    await test.step('Editing the field without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing the field without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('BE0987654321')
        await checkoutPage.vatNumberInput.blur()
        await expect.poll(() => checkoutPage.isVatFieldDirty()).toBe(true)

        // Pay on Account is already visible but not necessarily selected —
        // select it explicitly before its T&Cs checkbox can be interacted
        // with (same mistake already caught and fixed on the NL/BE-NL
        // files — applying the fix here from the start).
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
