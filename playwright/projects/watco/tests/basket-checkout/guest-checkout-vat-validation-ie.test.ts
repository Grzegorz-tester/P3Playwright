import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field validation, guest checkout (IE).
 * IE mirror of guest-checkout-vat-validation.test.ts (UK). Ireland has no
 * XI-style secondary prefix (that's UK/Northern-Ireland-specific), so this
 * covers the IE length boundary instead: IE9999999L is IE + 7 digits + 1
 * letter (8 alphanumeric chars) — VERIFIED live, staging, 2026-08-06.
 */
test('IE guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcoie_guest_vat_validation'))
        await checkoutPage.chooseDeliveryAddress(undefined, {
            city: 'Dublin',
            postcode: 'D01 F5P2',
            country: 'Ireland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('IE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format IE9999999L.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A VAT number shorter than the required length is rejected', async () => {
        console.log('[STEP] A VAT number shorter than the required length is rejected')
        await checkoutPage.applyVatNumber('IE1234567')
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A correctly-formatted IE VAT number is accepted', async () => {
        console.log('[STEP] A correctly-formatted IE VAT number is accepted')
        await checkoutPage.applyVatNumber('IE1234567L')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    // AC says "IE + at least 8 alphanumeric characters" — the step above
    // only covers the exact-8 boundary. VERIFIED live, staging,
    // 2026-08-06: a 9-alphanumeric-character value (7 digits + 2 letters,
    // a real Irish VAT number shape) is also accepted.
    await test.step('A longer-than-minimum IE VAT number is also accepted', async () => {
        console.log('[STEP] A longer-than-minimum IE VAT number is also accepted')
        await checkoutPage.applyVatNumber('IE1234567LW')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    await test.step('Editing the field without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing the field without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('IE7654321W')
        await checkoutPage.vatNumberInput.blur()
        await expect.poll(() => checkoutPage.isVatFieldDirty()).toBe(true)

        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'There are unsaved updates to this field, please apply the changes or clear the field before proceeding.'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})

// See the UK file's equivalent test for why this is kept separate (fresh
// checkout session) rather than a further step above.
test('IE guest checkout: an invalid, applied VAT number also blocks proceeding', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcoie_guest_vat_invalid_block'))
        await checkoutPage.chooseDeliveryAddress(undefined, {
            city: 'Dublin',
            postcode: 'D01 F5P2',
            country: 'Ireland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit', async () => {
        console.log('[STEP] An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit')
        await checkoutPage.applyVatNumber('IE12')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format IE9999999L.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)

        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})
        await checkoutPage.payOnAccountTermsCheckbox.click({ force: true }).catch(() => {})

        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'There are unsaved updates to this field, please apply the changes or clear the field before proceeding.'
        )
        await expect(checkoutPage.payOnAccountTermsCheckbox).not.toBeChecked()
    })
})
