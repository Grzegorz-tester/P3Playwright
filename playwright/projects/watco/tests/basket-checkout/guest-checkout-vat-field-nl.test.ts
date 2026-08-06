import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (NL).
 * NL behaves like DE (Pay on Account hidden until VAT applied, a real
 * business-customer comment below the field), but its zero-rating rule is
 * SIMPLER than DE's delivery-country-aware one — VERIFIED live, staging,
 * 2026-08-06: applying a valid NL VAT number zero-rates the order even
 * for a domestic NL→NL delivery (DE only zero-rates for a delivery
 * country DIFFERENT from the merchant's own). No separate cross-border
 * test is needed here as a result.
 */
test('NL guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watconl_guest_vat'), '/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Amsterdam',
            postcode: '1011AA',
            country: 'Nederland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and business-customer comment', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and business-customer comment')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'NL000099998B57')
        await expect(checkoutPage.page.getByText('Belasting over de toegevoegde waarde', { exact: true })).toBeVisible()
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
        await checkoutPage.applyVatNumber('NL000099998B57')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        // Pay on Account's reveal is the signal the recalculation is done.
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()

        const vatText = (await checkoutPage.summaryVatAmount.textContent())?.replace(/\s+/g, ' ').trim()
        expect(vatText).toBe('€ 0,00')
    })
})
