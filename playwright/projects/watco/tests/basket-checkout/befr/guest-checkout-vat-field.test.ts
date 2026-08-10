import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (BE-FR —
 * Belgium, French language).
 *
 * VERIFIED live, staging, 2026-08-06. Same URL paths as FR (/panier,
 * /valider-la-commande, Belgique as the delivery country), but NOT the
 * same VAT-gating behaviour as its language sibling FR — a live check on
 * staging-fr.watco.pub confirmed Pay on Account there is visible
 * regardless of VAT, whereas BE-FR hides it until a valid VAT number is
 * applied, matching DE/NL/BE-NL instead. BE-FR combines that gating with
 * NO explanatory comment below the field (FR/UK/IE style) — a
 * combination not seen on any prior market.
 *
 * The QA doc's scenario 1 ("Two fields shown — NIP and NIP-EU, not a
 * single VAT field") does not match live reality or any other scenario
 * in the same doc (all of which describe one field, Belgian VAT format,
 * "Numéro de TVA client"/"TVA" terminology). Confirmed live via DOM
 * inspection: there is exactly one input, id="payment_customer_vat_number"
 * — the same id used platform-wide on every other market. Treated as a
 * copy-paste artifact in the QA doc (likely from a Poland-market
 * template — NIP is the Polish tax-ID abbreviation, not used anywhere in
 * Belgium/France), not a real product difference. Worth flagging back to
 * QA, but not acted on here beyond this note.
 */
test('BE-FR guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcobefr_guest_vat'), '/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Rue de Test 1',
            city: 'Bruxelles',
            postcode: '1000',
            country: 'Belgique',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label and placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label and placeholder, and no comment text')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'BE1234567890')
        await expect(checkoutPage.page.getByText('Numéro de TVA client', { exact: true })).toBeVisible()
        await expect(checkoutPage.vatApplyButton).toBeVisible()
        await expect(checkoutPage.vatNumberComment).toHaveCount(0)
    })

    await test.step('Apply button starts disabled until a value is entered', async () => {
        console.log('[STEP] Apply button starts disabled until a value is entered')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('Pay on Account is hidden until a VAT number is applied', async () => {
        console.log('[STEP] Pay on Account is hidden until a VAT number is applied')
        await expect(checkoutPage.payOnAccountMethodRadio).toBeHidden()
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('21%')
    })

    await test.step('Applying a valid VAT number zero-rates the order and reveals Pay on Account', async () => {
        console.log('[STEP] Applying a valid VAT number zero-rates the order and reveals Pay on Account')
        await checkoutPage.applyVatNumber('BE0411905847')
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)

        // Currency uses a NON-BREAKING space before the € sign here (unlike
        // BE-NL's plain space) — verified via codePointAt before writing
        // this assertion, not assumed from BE-NL.
        const vatText = (await checkoutPage.summaryVatAmount.textContent())?.replace(/\s+/g, ' ').trim()
        expect(vatText).toBe('0,00 €')
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('0%')
    })

    // AC: new-customer minimum-order notice is "UK and IE only" —
    // VERIFIED live, staging, 2026-08-06: no such message renders on
    // BE-FR regardless of order value.
    await test.step('Selecting Pay on Account shows no new-customer minimum-order notice', async () => {
        console.log('[STEP] Selecting Pay on Account shows no new-customer minimum-order notice')
        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountMinimumOrderNotice).toHaveCount(0)
    })
})
