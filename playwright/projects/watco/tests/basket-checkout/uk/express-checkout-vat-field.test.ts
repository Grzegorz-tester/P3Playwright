import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'

/**
 * WAT-335 — VAT registration number field, Express Checkout (UK).
 * Covers QA scenarios 17, 18, 19, 22.
 *
 * NOT YET AUTOMATED this pass (documented, not stubbed): actually opening
 * an Apple Pay / Google Pay wallet sheet, cancelling it, and re-checking
 * the sheet's own in-payment-sheet total — same class of gap as this
 * project's already-deferred real payment completion elsewhere. Chromium
 * also has no ApplePaySession, so Apple Pay only ever renders here as an
 * inert placeholder, never a real invokable button.
 */
test('express checkout: VAT number field', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and open Express Checkout', async () => {
        console.log('[STEP] Add a product to basket and open Express Checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.openExpressCheckout()
    })

    await test.step('VAT field is visible above the wallet buttons, and Pay on Account is not offered', async () => {
        console.log('[STEP] VAT field is visible above the wallet buttons, and Pay on Account is not offered')
        await expect(checkoutPage.expressVatNumberInput).toBeVisible()
        await expect(checkoutPage.expressVatNumberInput).toHaveAttribute('placeholder', 'GB123456789')
        // Google Pay's own SDK renders this button asynchronously — give
        // it more than the default assertion timeout to initialise.
        await expect(checkoutPage.expressGooglePayButton).toBeVisible({ timeout: 20000 })

        const vatBox = await checkoutPage.expressVatNumberInput.boundingBox()
        const payBox = await checkoutPage.expressGooglePayButton.boundingBox()
        expect(vatBox!.y).toBeLessThan(payBox!.y)

        await expect(checkoutPage.expressOptionContainer.getByText('Pay on Account')).toHaveCount(0)
    })

    await test.step('An invalid VAT number is rejected with an error message', async () => {
        console.log('[STEP] An invalid VAT number is rejected with an error message')
        await checkoutPage.applyExpressVatNumber('GB12345')
        expect(await checkoutPage.getExpressVatApplyErrorMessage()).toBe(
            'The entered VAT number is invalid. Enter a VAT number in the format GB123456789.'
        )
        await expect(checkoutPage.expressVatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('A valid VAT number is applied cleanly', async () => {
        console.log('[STEP] A valid VAT number is applied cleanly')
        await checkoutPage.applyExpressVatNumber('GB123456789')
        await expect(checkoutPage.expressVatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.expressVatNumberInput).toHaveValue('GB123456789')
    })
})
