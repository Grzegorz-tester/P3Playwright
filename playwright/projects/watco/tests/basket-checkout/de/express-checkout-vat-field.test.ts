import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'

/**
 * WAT-305 — VAT registration number field, Express Checkout (DE).
 * DE mirror of express-checkout-vat-field.test.ts (UK) — same deferred
 * scope (real wallet-sheet interaction) applies here too. Cross-border
 * delivery is out of scope for this project, so only within-country
 * (DE) delivery is exercised.
 */
test('DE express checkout: VAT number field', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and open Express Checkout', async () => {
        console.log('[STEP] Add a product to basket and open Express Checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.openExpressCheckout()
    })

    await test.step('VAT field is visible above the wallet buttons, with its comment, and Pay on Account is not offered', async () => {
        console.log('[STEP] VAT field is visible above the wallet buttons, with its comment, and Pay on Account is not offered')
        await expect(checkoutPage.expressVatNumberInput).toBeVisible()
        await expect(checkoutPage.expressVatNumberInput).toHaveAttribute('placeholder', 'DE123456789 oder ATU12345678')
        await expect(checkoutPage.expressGooglePayButton).toBeVisible({ timeout: 20000 })

        const vatBox = await checkoutPage.expressVatNumberInput.boundingBox()
        const payBox = await checkoutPage.expressGooglePayButton.boundingBox()
        expect(vatBox!.y).toBeLessThan(payBox!.y)

        await expect(checkoutPage.expressOptionContainer.getByText('Zahlung auf Rechnung')).toHaveCount(0)
    })

    await test.step('An invalid VAT number is rejected with an error message', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message')
        await checkoutPage.applyExpressVatNumber('DE12')
        expect(await checkoutPage.getExpressVatApplyErrorMessage()).toBe(
            'Die eingegebene USt-IdNr. ist ungültig. Bitte geben Sie eine Umsatzsteuer-Identifikationsnummer im Format DE123456789 ein'
        )
        await expect(checkoutPage.expressVatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A valid VAT number is applied cleanly', async () => {
        console.log('[STEP] A valid VAT number is applied cleanly')
        await checkoutPage.applyExpressVatNumber('DE123456789')
        await expect(checkoutPage.expressVatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.expressVatNumberInput).toHaveValue('DE123456789')
    })
})
