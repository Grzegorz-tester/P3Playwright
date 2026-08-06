import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field validation, guest checkout
 * (BE-NL). Mirrors guest-checkout-vat-validation-nl.test.ts. VERIFIED
 * live, staging, 2026-08-06 — the unsaved-changes message is identical
 * to NL's, including the same non-breaking hyphen (U+2011) between
 * "niet" and "toegepaste"; the ‑ below is intentional, not a typo.
 */
test('BE-NL guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcobenl_guest_vat_validation'), '/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Brussel',
            postcode: '1000',
            country: 'België',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('BE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Het ingevoerde btw-nummer is ongeldig. Voer een btw-nummer in met het formaat BE1234567890.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A correctly-formatted BE VAT number is accepted', async () => {
        console.log('[STEP] A correctly-formatted BE VAT number is accepted')
        await checkoutPage.applyVatNumber('BE0123456749')
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
        // with (this exact mistake was caught and fixed on the NL file).
        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Dit veld bevat niet‑toegepaste wijzigingen. Pas deze toe of maak het veld leeg voordat je verdergaat'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})

// See the UK file's equivalent test for why this is kept separate (fresh
// checkout session) rather than a further step above. Uses the card/
// Adyen method rather than Pay on Account — Pay on Account is VAT-gated
// on BE-NL and this test never applies a VALID VAT, so it never appears.
test('BE-NL guest checkout: an invalid, applied VAT number also blocks proceeding', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcobenl_guest_vat_invalid_block'), '/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Brussel',
            postcode: '1000',
            country: 'België',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit', async () => {
        console.log('[STEP] An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit')
        await checkoutPage.applyVatNumber('BE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Het ingevoerde btw-nummer is ongeldig. Voer een btw-nummer in met het formaat BE1234567890.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)

        await checkoutPage.payByCardMethodRadio.check({ force: true })
        await expect(checkoutPage.adyenTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.adyenTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'Dit veld bevat niet‑toegepaste wijzigingen. Pas deze toe of maak het veld leeg voordat je verdergaat'
        )
        await expect(checkoutPage.adyenTermsCheckbox).not.toBeChecked()
    })
})
