import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoPl } from '@utils/testUsers'

/**
 * WAT-305 — PL mirror of logged-in-checkout-vat-persistence.test.ts (UK),
 * closing the gap documented in that file's project memory: PL never
 * offers Pay on Account, so this uses a REAL Adyen test-card payment via
 * WatcoCheckoutPage.completeCardPaymentWithTestCard() instead — VERIFIED
 * live, staging, 2026-08-06, staging's Adyen client config has
 * "environment":"test", so the standard Adyen test card is accepted with
 * no 3-D Secure challenge.
 *
 * Own localized paths — /koszyk, /realizacja-transakcji, confirmation is
 * /realizacja-transakcji/dziekujemy (a different path shape than the
 * checkout base, same pattern already seen on NL/BE-NL), /konto, profile
 * page /konto/profil-klienta.
 *
 * NIP-EU is the field that drives VAT treatment (see PL market
 * docblocks elsewhere) — this test edits NIP-EU, not NIP, matching the
 * other markets' single-VAT-field persistence tests. NIP itself is left
 * untouched throughout.
 *
 * Also checks VAT correctness on the thank-you page itself — see the
 * "Edit NIP-EU..." step below. PL zero-rates for ANY valid NIP-EU
 * (domestic or not), so the expected carried-through amount here is
 * zero.
 *
 * Self-heals against its own prior interrupted runs the same way the UK
 * file does — see that file's docblock for why.
 */
test('PL logged-in checkout: an edited NIP-EU persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved NIP-EU', async () => {
        console.log('[STEP] Log in with the account that has a saved NIP-EU')
        await loginPage.navigateToLoginPage('/logowanie')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoPl.accountTestUserWithVat.email, watcoPl.accountTestUserWithVat.password, '/konto')
    })

    await test.step('Start from a clean single-item basket and reach the payment step', async () => {
        console.log('[STEP] Start from a clean single-item basket and reach the payment step')
        await basketPage.clearBasket('/koszyk')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/koszyk')
        await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Testowa 1',
            city: 'Warszawa',
            postcode: '00-001',
            country: 'Polska',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'PL9876543210') {
            await checkoutPage.applyVatNumber('PL9876543210')
            await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
            await checkoutPage.completeCardPaymentWithTestCard()
            await expect(page).toHaveURL(/\/realizacja-transakcji\/dziekujemy$/, { timeout: 30000 })

            await basketPage.clearBasket('/koszyk')
            await homePage.navigateToHomePage()
            await homePage.searchForProduct('epoxy')
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage('/koszyk')
            await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
            await checkoutPage.chooseDeliveryAddress(undefined, {
                addressLine1: 'Testowa 1',
                city: 'Warszawa',
                postcode: '00-001',
                country: 'Polska',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit NIP-EU and complete the order via a real card payment', async () => {
        console.log('[STEP] Edit NIP-EU and complete the order via a real card payment')
        await checkoutPage.applyVatNumber('PL0123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        const vatBeforeOrder = await checkoutPage.summaryVatAmount.textContent()
        await checkoutPage.completeCardPaymentWithTestCard()
        await expect(page).toHaveURL(/\/realizacja-transakcji\/dziekujemy$/, { timeout: 30000 })
        await expect(checkoutPage.thankYouVatAmount).toHaveText(vatBeforeOrder ?? '')
    })

    await test.step('The account\'s saved NIP-EU now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved NIP-EU now reflects the edited value')
        await accountPage.navigateToProfile('/konto/profil-klienta')
        await expect(accountPage.vatNumberInput).toHaveValue('PL0123456789')
    })

    await test.step('Restore the shared account to its documented baseline by placing a second order with the original NIP-EU', async () => {
        console.log('[STEP] Restore the shared account to its documented baseline by placing a second order with the original NIP-EU')
        await basketPage.clearBasket('/koszyk')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/koszyk')
        await basketPage.proceedToSecureCheckout('/realizacja-transakcji')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Testowa 1',
            city: 'Warszawa',
            postcode: '00-001',
            country: 'Polska',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('PL9876543210')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.completeCardPaymentWithTestCard()
        await expect(page).toHaveURL(/\/realizacja-transakcji\/dziekujemy$/, { timeout: 30000 })

        await accountPage.navigateToProfile('/konto/profil-klienta')
        await expect(accountPage.vatNumberInput).toHaveValue('PL9876543210')
    })
})
