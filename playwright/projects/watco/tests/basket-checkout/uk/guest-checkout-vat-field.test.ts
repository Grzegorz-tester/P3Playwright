import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-335 — VAT registration number field, guest checkout (UK).
 * Covers QA scenarios 1, 2, 3, 4, 5, 6, 11.
 *
 * NOT YET AUTOMATED this pass (documented, not stubbed):
 * - Scenario 9/10 (order placed successfully; confirmation-page VAT
 *   display): completing payment requires a real Adyen card/3DS flow in a
 *   cross-origin iframe — Pay on Account is unusable for a guest's first
 *   low-value order (site enforces a £500 minimum, confirmed live — see
 *   the POA-notice assertion below). Same class of gap as this project's
 *   already-deferred Apple/Google Pay completion.
 * - Email content (part of scenario 10): no email-reading infrastructure
 *   exists in this repo.
 */
test('guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.startGuestCheckout(generateGuestEmail('watco_guest_vat'))
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label and placeholder, and no comment text', async () => {
        console.log('[STEP] VAT field is visible with the correct label and placeholder, and no comment text')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'GB123456789')
        await expect(checkoutPage.page.getByText('VAT number', { exact: true })).toBeVisible()
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

        await checkoutPage.applyVatNumber('GB123456789')

        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('GB123456789')
        expect(await checkoutPage.summaryVatAmount.textContent()).toBe(vatBefore)
        expect(await checkoutPage.summaryOrderTotal.textContent()).toBe(totalBefore)
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
    })
})
