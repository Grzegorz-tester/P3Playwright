import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'

/**
 * WAT-305 — VAT registration number field, Express Checkout (BE-NL).
 * Mirrors express-checkout-vat-field-nl.test.ts — same deferred scope
 * (real wallet-sheet interaction) applies here too.
 */
test('BE-NL express checkout: VAT number field', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and open Express Checkout', async () => {
        console.log('[STEP] Add a product to basket and open Express Checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.openExpressCheckout()
    })

    await test.step('VAT field is visible above the wallet buttons, with its comment, and Pay on Account is not offered', async () => {
        console.log('[STEP] VAT field is visible above the wallet buttons, with its comment, and Pay on Account is not offered')
        await expect(checkoutPage.expressVatNumberInput).toBeVisible()
        await expect(checkoutPage.expressVatNumberInput).toHaveAttribute('placeholder', 'BE1234567890')
        await expect(checkoutPage.expressGooglePayButton).toBeVisible({ timeout: 20000 })

        const vatBox = await checkoutPage.expressVatNumberInput.boundingBox()
        const payBox = await checkoutPage.expressGooglePayButton.boundingBox()
        expect(vatBox!.y).toBeLessThan(payBox!.y)

        await expect(checkoutPage.expressOptionContainer.getByText('Betaling op facturatie')).toHaveCount(0)
    })

    await test.step('An invalid VAT number is rejected with an error message', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message')
        await checkoutPage.applyExpressVatNumber('BE12')
        expect(await checkoutPage.getExpressVatApplyErrorMessage()).toBe(
            'Het ingevoerde btw-nummer is ongeldig. Voer een btw-nummer in met het formaat BE1234567890.'
        )
        await expect(checkoutPage.expressVatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A valid VAT number is applied cleanly', async () => {
        console.log('[STEP] A valid VAT number is applied cleanly')
        await checkoutPage.applyExpressVatNumber('BE0123456749')
        await expect(checkoutPage.expressVatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.expressVatNumberInput).toHaveValue('BE0123456749')
    })
})
