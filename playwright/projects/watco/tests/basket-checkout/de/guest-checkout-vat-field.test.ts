import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { generateGuestEmail } from '@utils/fakeData'

/**
 * WAT-305 — VAT registration number field, guest checkout (DE).
 * DE mirrors IE/FR structurally (own localized paths: /warenkorb, /kasse)
 * but diverges behaviourally from every other market checked so far —
 * VERIFIED live, staging, 2026-08-06:
 * - Pay on Account is HIDDEN (wrapper carries a Bootstrap "d-none" class,
 *   confirmed via computed style, not just a guess) until a valid VAT
 *   number is applied — UK/IE/FR always show it regardless of VAT.
 * - The VAT field has a real comment line explaining its purpose
 *   (.vat-form-group__comment) — UK/IE/FR confirmed this element absent.
 *
 * Cross-border delivery (e.g. a DE VAT number zero-rating a delivery to
 * Austria, per the standard EU intra-community reverse-charge rule) is
 * explicitly OUT OF SCOPE for this project — only within-country (DE to
 * DE) delivery is tested. A cross-border test existed here previously
 * and was removed on that basis, not because the behaviour was wrong.
 */
test('DE guest checkout: VAT number field on payment step', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcode_guest_vat'), '/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Berlin',
            postcode: '10115',
            country: 'Deutschland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('VAT field is visible with the correct label, placeholder, and business-customer comment', async () => {
        console.log('[STEP] VAT field is visible with the correct label, placeholder, and business-customer comment')
        await expect(checkoutPage.vatNumberInput).toBeVisible()
        await expect(checkoutPage.vatNumberInput).toHaveAttribute('placeholder', 'DE123456789 oder ATU12345678')
        await expect(checkoutPage.page.getByText('USt-IDNr', { exact: true })).toBeVisible()
        await expect(checkoutPage.vatApplyButton).toBeVisible()
        await expect(checkoutPage.vatNumberComment).toHaveText(
            'Durch die Angabe der USt-IdNr. weisen Sie sich bei uns als Geschäftskunde aus. Beispiel: DE123456789'
        )
    })

    await test.step('Pay on Account is hidden until a VAT number is applied', async () => {
        console.log('[STEP] Pay on Account is hidden until a VAT number is applied')
        await expect(checkoutPage.payOnAccountMethodRadio).toBeHidden()
    })

    await test.step('Applying a valid VAT number leaves the German VAT rate unchanged and reveals Pay on Account', async () => {
        console.log('[STEP] Applying a valid VAT number leaves the German VAT rate unchanged and reveals Pay on Account')
        const vatBefore = await checkoutPage.summaryVatAmount.textContent()

        await checkoutPage.applyVatNumber('DE123456789')

        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('DE123456789')
        expect(await checkoutPage.summaryVatAmount.textContent()).toBe(vatBefore)
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()

        // AC: new-customer minimum-order notice is "UK and IE only" —
        // VERIFIED live, staging, 2026-08-06: no such message renders on
        // DE regardless of order value.
        await checkoutPage.payOnAccountMethodRadio.check({ force: true })
        await expect(checkoutPage.payOnAccountMinimumOrderNotice).toHaveCount(0)
    })
})
