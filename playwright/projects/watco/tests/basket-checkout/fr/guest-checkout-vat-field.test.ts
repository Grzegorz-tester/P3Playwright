import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (FR).
 * FR mirror of guest-checkout-vat-field.test.ts (UK) — same platform, same
 * mechanics, but FR also localizes its own URL PATHS (not just VAT
 * format/rate/currency): /panier, /valider-la-commande, France as the
 * delivery country. All VERIFIED live, staging, 2026-08-06.
 *
 * Unlike UK/IE, selecting Pay on Account on FR shows no new-customer
 * minimum-order notice — asserted explicitly below, not just noted.
 */
test('FR guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcofr_guest_vat'), '/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: '1 Rue de Test',
            city: 'Paris',
            postcode: '75001',
            country: 'France',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label and placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label and placeholder, and no comment text')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'FRXX123456789')
        await expect(checkoutPage.page.getByText('Numéro de TVA', { exact: true })).toBeVisible()
        await expect(checkoutPage.vatApplyButton).toBeVisible()
        await expect(checkoutPage.vatNumberComment).toHaveCount(0)
    })

    await test.step('Apply button starts disabled until a value is entered', async () => {
        console.log('[STEP] Apply button starts disabled until a value is entered')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('Applying a valid VAT number leaves the VAT rate and amount unchanged', async () => {
        console.log('[STEP] Applying a valid VAT number leaves the VAT rate and amount unchanged')
        const vatBefore = await checkoutPage.summaryVatAmount.textContent()
        const totalBefore = await checkoutPage.summaryOrderTotal.textContent()

        await checkoutPage.applyVatNumber('FRAB123456789')

        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('FRAB123456789')
        expect(await checkoutPage.summaryVatAmount.textContent()).toBe(vatBefore)
        expect(await checkoutPage.summaryOrderTotal.textContent()).toBe(totalBefore)
        expect(vatBefore).toContain('€')
    })

    await test.step('Both payment methods are offered, with no new-customer minimum-order notice for Pay on Account', async () => {
        console.log('[STEP] Both payment methods are offered, with no new-customer minimum-order notice for Pay on Account')
        await expect(checkoutPage.payByCardMethodRadio).toBeVisible()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()

        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountMinimumOrderNotice).toHaveCount(0)
    })
})
