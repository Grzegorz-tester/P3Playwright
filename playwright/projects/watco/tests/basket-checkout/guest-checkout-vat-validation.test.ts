import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-335 — VAT registration number field validation, guest checkout (UK).
 * Covers QA scenarios 7, 8, 23, 24, 25.
 */
test('guest checkout: VAT number field validation', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watco_guest_vat_validation'))
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid VAT number is rejected with an error message and a red field', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message and a red field')
        await checkoutPage.applyVatNumber('GB12345')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format GB123456789.'
        )
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A GB VAT number with too few or too many digits is rejected', async () => {
        console.log('[STEP] A GB VAT number with too few or too many digits is rejected')
        await checkoutPage.applyVatNumber('GB1234567890123')
        await expect(checkoutPage.vatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('An XI-prefixed VAT number is accepted', async () => {
        console.log('[STEP] An XI-prefixed VAT number is accepted')
        await checkoutPage.applyVatNumber('XI123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })

    await test.step('Editing the field without Applying blocks proceeding with an unsaved-changes warning', async () => {
        console.log('[STEP] Editing the field without Applying blocks proceeding with an unsaved-changes warning')
        await checkoutPage.vatNumberInput.fill('GB987654321')
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

// AC: "The customer cannot proceed past the payment step until the error
// is resolved or the field is cleared" — the test above only covers an
// unapplied EDIT blocking proceeding; this covers an invalid value that
// WAS Applied and is still showing is-invalid. Kept as its own test
// (fresh checkout session) rather than a further step in the test
// above — appending it there as a 5th sequential step on top of already
// stacked field-state changes proved flaky live (the error element
// sometimes never rendered), while a clean session reproduced it
// reliably. VERIFIED live, staging, 2026-08-06: this uses the exact same
// blocking mechanism and the same generic message as the dirty-unapplied
// case, not a separate invalid-specific one.
test('guest checkout: an invalid, applied VAT number also blocks proceeding', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watco_guest_vat_invalid_block'))
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit', async () => {
        console.log('[STEP] An invalid, applied VAT number blocks proceeding via the same mechanism as an unsaved edit')
        await checkoutPage.applyVatNumber('GB12345')
        expect(await checkoutPage.getVatApplyErrorMessage()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format GB123456789.'
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
