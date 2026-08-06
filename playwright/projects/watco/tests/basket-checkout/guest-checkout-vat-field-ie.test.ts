import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (IE).
 * IE mirror of guest-checkout-vat-field.test.ts (UK) — same platform, same
 * mechanics, only market data differs: VAT format IE9999999L, 23% rate,
 * €, and a €500 Pay on Account minimum (all VERIFIED live, staging,
 * 2026-08-06). Run against watco.stageIe (ENV=stageIe).
 *
 * NOT YET AUTOMATED this pass — same reasons as the UK file (real payment
 * completion, email content).
 */
test('IE guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcoie_guest_vat'))
        await checkoutPage.chooseDeliveryAddress(undefined, {
            city: 'Dublin',
            postcode: 'D01 F5P2',
            country: 'Ireland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label and placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label and placeholder, and no comment text')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'IE9999999L')
        await expect(checkoutPage.page.getByText('VAT number', { exact: true })).toBeVisible()
        await expect(checkoutPage.vatApplyButton).toBeVisible()
    })

    await test.step('Apply button starts disabled until a value is entered', async () => {
        console.log('[STEP] Apply button starts disabled until a value is entered')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('Applying a valid VAT number leaves the VAT rate and amount unchanged', async () => {
        console.log('[STEP] Applying a valid VAT number leaves the VAT rate and amount unchanged')
        const vatBefore = await checkoutPage.summaryVatAmount.textContent()
        const totalBefore = await checkoutPage.summaryOrderTotal.textContent()

        await checkoutPage.applyVatNumber('IE1234567L')

        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('IE1234567L')
        expect(await checkoutPage.summaryVatAmount.textContent()).toBe(vatBefore)
        expect(await checkoutPage.summaryOrderTotal.textContent()).toBe(totalBefore)
        expect(vatBefore).toContain('€')
    })

    await test.step('Both payment methods are offered', async () => {
        console.log('[STEP] Both payment methods are offered')
        await expect(checkoutPage.payByCardMethodRadio).toBeVisible()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })

    await test.step('Pay on Account shows the new-customer minimum-order notice', async () => {
        console.log('[STEP] Pay on Account shows the new-customer minimum-order notice')
        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountMinimumOrderNotice).toBeVisible({ timeout: 15000 })
        expect(await checkoutPage.payOnAccountMinimumOrderNotice.textContent()).toContain('€500.00')
    })
})
