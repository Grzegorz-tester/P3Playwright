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
 * - VAT rate is delivery-country-aware: a DE VAT number applied against
 *   an Austrian delivery address zero-rates the order (reverse charge) —
 *   see the second test below.
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

test('DE guest checkout: a German VAT number zero-rates delivery to Austria', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and reach guest checkout with an Austrian delivery address', async () => {
        console.log('[STEP] Add a product to basket and reach guest checkout with an Austrian delivery address')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.startGuestCheckout(generateGuestEmail('watcode_guest_vat_at'), '/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Wien',
            postcode: '1010',
            country: 'Österreich',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Without a VAT number, Austria\'s own standard rate (20%) applies', async () => {
        console.log('[STEP] Without a VAT number, Austria\'s own standard rate (20%) applies')
        expect(await checkoutPage.summaryVatRow.textContent()).toContain('20%')
    })

    await test.step('Applying a German VAT number zero-rates the order (reverse charge) and reveals Pay on Account', async () => {
        console.log('[STEP] Applying a German VAT number zero-rates the order (reverse charge) and reveals Pay on Account')
        await checkoutPage.applyVatNumber('DE123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        // Pay on Account only reveals itself once the VAT recalculation has
        // gone through — wait for that as the signal the summary is done
        // updating before reading its (otherwise un-pollable) plain text.
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()

        // Normalise whitespace: the site renders the amount/symbol gap as
        // a non-breaking space (confirmed live), not a plain one.
        const vatText = (await checkoutPage.summaryVatAmount.textContent())?.replace(/\s+/g, ' ').trim()
        expect(vatText).toBe('0,00 €')
    })
})
