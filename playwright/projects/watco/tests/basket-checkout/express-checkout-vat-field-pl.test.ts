import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'

/**
 * WAT-305 — NIP / NIP-EU fields, Express Checkout (PL).
 * VERIFIED live, staging, 2026-08-06. Same deferred scope (real wallet-
 * sheet interaction) as every other market's express file.
 */
test('PL express checkout: NIP and NIP-EU fields', async ({ page, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Add a product to basket and open Express Checkout', async () => {
        console.log('[STEP] Add a product to basket and open Express Checkout')
        await homePage.navigateToHomePage()
        await dismissCookieBanner(page)
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/koszyk')
        await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
        await checkoutPage.openExpressCheckout()
    })

    await test.step('Both fields are visible above the wallet buttons, and Pay on Account is never offered', async () => {
        console.log('[STEP] Both fields are visible above the wallet buttons, and Pay on Account is never offered')
        await expect(checkoutPage.expressNipNumberInput).toBeVisible()
        await expect(checkoutPage.expressNipNumberInput).toHaveAttribute('placeholder', '0123456789')
        await expect(checkoutPage.expressVatNumberInput).toBeVisible()
        await expect(checkoutPage.expressVatNumberInput).toHaveAttribute('placeholder', 'PL1234567890')
        await expect(checkoutPage.expressGooglePayButton).toBeVisible({ timeout: 20000 })

        const nipBox = await checkoutPage.expressNipNumberInput.boundingBox()
        const vatBox = await checkoutPage.expressVatNumberInput.boundingBox()
        const payBox = await checkoutPage.expressGooglePayButton.boundingBox()
        expect(nipBox!.y).toBeLessThan(payBox!.y)
        expect(vatBox!.y).toBeLessThan(payBox!.y)

        await expect(checkoutPage.payOnAccountMethodRadio).toHaveCount(0)
    })

    await test.step('An invalid NIP is rejected with its own format-specific error', async () => {
        console.log('[STEP] An invalid NIP is rejected with its own format-specific error')
        await checkoutPage.applyExpressNipNumber('123')
        expect(await checkoutPage.getExpressNipApplyErrorMessage()).toBe(
            'Wprowadzony numer NIP jest nieprawidłowy. Wprowadź numer NIP w formacie 1234567890.'
        )
        await expect(checkoutPage.expressNipNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('An invalid NIP-EU is rejected with its own format-specific error', async () => {
        console.log('[STEP] An invalid NIP-EU is rejected with its own format-specific error')
        await checkoutPage.applyExpressVatNumber('PLX')
        expect(await checkoutPage.getExpressVatApplyErrorMessage()).toBe(
            'Wprowadzony numer NIP jest nieprawidłowy. Wprowadź numer NIP w formacie PL1234567891.'
        )
        await expect(checkoutPage.expressVatNumberInput).toHaveClass(/is-invalid/)
    })

    await test.step('Correctly-formatted values are applied cleanly for both fields', async () => {
        console.log('[STEP] Correctly-formatted values are applied cleanly for both fields')
        await checkoutPage.applyExpressNipNumber('9876543210')
        await expect(checkoutPage.expressNipNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.expressNipNumberInput).toHaveValue('9876543210')

        await checkoutPage.applyExpressVatNumber('PL1234567890')
        await expect(checkoutPage.expressVatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.expressVatNumberInput).toHaveValue('PL1234567890')
    })
})
