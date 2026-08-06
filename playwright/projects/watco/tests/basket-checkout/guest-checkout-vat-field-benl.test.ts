import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (BE-NL —
 * Belgium, Dutch language).
 * Behaves like NL (Pay on Account hidden until VAT applied, a business-
 * customer comment, domestic zero-rating with no cross-border address
 * needed) — VERIFIED live, staging, 2026-08-06. The one market-specific
 * difference from NL is the field's own label text ("Btw-nummer" here vs
 * NL's "Belasting over de toegevoegde waarde") — the comment text below
 * it is identical to NL's.
 */
test('BE-NL guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcobenl_guest_vat'), '/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Brussel',
            postcode: '1000',
            country: 'België',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and business-customer comment', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and business-customer comment')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'BE1234567890')
        await expect(checkoutPage.page.getByText('Btw-nummer', { exact: true })).toBeVisible()
        await expect(checkoutPage.vatApplyButton).toBeVisible()
        await expect(checkoutPage.vatNumberComment).toHaveText(
            'Als u ons een btw-nummer verstrekt, zullen wij voor intracommunautaire transacties een btw-tarief van 0% hanteren'
        )
    })

    await test.step('Pay on Account is hidden until a VAT number is applied', async () => {
        console.log('[STEP] Pay on Account is hidden until a VAT number is applied')
        await expect(checkoutPage.payOnAccountMethodRadio).toBeHidden()
        expect(await checkoutPage.summaryVatRow.textContent()).toContain('21%')
    })

    await test.step('Applying a valid VAT number zero-rates the order and reveals Pay on Account', async () => {
        console.log('[STEP] Applying a valid VAT number zero-rates the order and reveals Pay on Account')
        await checkoutPage.applyVatNumber('BE0123456749')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()

        const vatText = (await checkoutPage.summaryVatAmount.textContent())?.replace(/\s+/g, ' ').trim()
        expect(vatText).toBe('0,00 €')
    })
})
