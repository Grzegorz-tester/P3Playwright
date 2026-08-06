import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (PL — Poland).
 *
 * VERIFIED live, staging, 2026-08-06. PL is the ONE market with
 * genuinely TWO separate fields:
 *  - NIP — the domestic Polish tax ID (id=payment_customer_nip_number,
 *    placeholder "0123456789"). Has NO tax effect by itself and no
 *    comment text below it.
 *  - NIP-EU — the EU VAT number (id=payment_customer_vat_number, same id
 *    every other market uses for its single VAT field, placeholder
 *    "PL1234567890"). This is the ONLY field that zero-rates the order,
 *    and it has a comment: "Jeśli jesteś podatnikiem VAT w UE, podaj
 *    numer z przedrostkiem PL — zastosujemy stawkę 0% dla transakcji
 *    wewnątrzwspólnotowych."
 *
 * Pay on Account is not just hidden here — it's entirely ABSENT from the
 * DOM at every stage, regardless of VAT (confirmed via .count() === 0),
 * unlike DE/NL/BE-NL/BE-FR's CSS-based hide/reveal gating.
 */
test('PL guest checkout: NIP and NIP-EU fields on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/koszyk')
        await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcopl_guest_vat'), '/realizacja-transakcji')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Testowa 1',
            city: 'Warszawa',
            postcode: '00-001',
            country: 'Polska',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Both fields are visible with the correct label/placeholder; NIP-EU has a comment, NIP does not', async () => {
        console.log('[STEP] Both fields are visible with the correct label/placeholder; NIP-EU has a comment, NIP does not')
        await expect(checkoutPage.nipNumberInput).toBeVisible()
        await expect(checkoutPage.nipNumberInput).toHaveAttribute('placeholder', '0123456789')
        // Scoped via the label's own `for` attribute rather than text
        // content — more stable than the getByText pattern earlier market
        // files use for this same kind of label check.
        await expect(checkoutPage.page.locator('label[for="payment_customer_nip_number"]')).toHaveText('NIP')
        await expect(checkoutPage.nipNumberComment).toHaveCount(0)

        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'PL1234567890')
        await expect(checkoutPage.page.locator('label[for="payment_customer_vat_number"]')).toHaveText('NIP-EU')
        await expect(checkoutPage.vatNumberComment).toHaveText(
            'Jeśli jesteś podatnikiem VAT w UE, podaj numer z przedrostkiem PL — zastosujemy stawkę 0% dla transakcji wewnątrzwspólnotowych.'
        )
    })

    await test.step('Both fields are optional and Apply starts disabled', async () => {
        console.log('[STEP] Both fields are optional and Apply starts disabled')
        await expect(checkoutPage.nipApplyButton).toBeDisabled()
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('23%')
    })

    await test.step('Pay on Account is never offered, with or without VAT', async () => {
        console.log('[STEP] Pay on Account is never offered, with or without VAT')
        await expect(checkoutPage.payOnAccountMethodRadio).toHaveCount(0)
    })

    await test.step('NIP alone has no tax effect', async () => {
        console.log('[STEP] NIP alone has no tax effect')
        await checkoutPage.applyNipNumber('9876543210')
        await expect(checkoutPage.nipNumberInput).not.toHaveClass(/is-invalid/)
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('23%')
    })

    await test.step('Applying a valid NIP-EU zero-rates the order; Pay on Account still never appears', async () => {
        console.log('[STEP] Applying a valid NIP-EU zero-rates the order; Pay on Account still never appears')
        await checkoutPage.applyVatNumber('PL1234567890')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)

        // No Pay on Account to use as a "recalculation finished" signal on
        // this market (see docblock) — poll the summary row itself instead
        // of reading it immediately, since the AJAX recalculation is not
        // synchronous with the Apply click resolving.
        await expect(checkoutPage.summaryVatRow).toContainText('0%', { timeout: 15000 })

        const vatText = (await checkoutPage.summaryVatAmount.textContent())?.replace(/\s+/g, ' ').trim()
        expect(vatText).toBe('0,00 zł')
        await expect(checkoutPage.payOnAccountMethodRadio).toHaveCount(0)

        // AC: new-customer minimum-order notice is "UK and IE only" — on
        // PL this is doubly true since Pay on Account itself never
        // renders, so the notice (which only ever shows beneath it)
        // can't either. Asserted explicitly for AC traceability rather
        // than left as an implication of the count(0) above.
        await expect(checkoutPage.payOnAccountMinimumOrderNotice).toHaveCount(0)
    })
})
