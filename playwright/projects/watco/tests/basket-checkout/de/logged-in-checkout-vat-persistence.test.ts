import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoDe } from '@utils/testUsers'

/**
 * WAT-305 — DE mirror of logged-in-checkout-vat-persistence.test.ts (UK).
 * Own localized paths — /warenkorb, /kasse (confirmation is
 * /kasse/danke), /kundenkonto, /kundenkonto/profil for the profile page
 * (VERIFIED live, staging,
 * 2026-08-06). Unlike UK/IE/FR, Pay on Account is VAT-gated here — but
 * since every step in this test always has a valid VAT number applied
 * (either the baseline or the edited value), Pay on Account is already
 * visible by the time payOnAccount() is called; no extra handling
 * needed. See the UK file's docblock for the payNowButton / clearBasket
 * background this depends on, and for why this self-heals against its
 * own prior interrupted runs.
 *
 * Also checks VAT correctness on the thank-you page itself — see the
 * "Edit the VAT number..." step below. This delivery address is
 * DOMESTIC (Berlin) — cross-border delivery is out of scope for this
 * project — so the amount is expected to carry through UNCHANGED, not
 * drop to zero.
 */
test('DE logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/anmelden')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoDe.accountTestUserWithVat.email, watcoDe.accountTestUserWithVat.password, '/kundenkonto')
    })

    await test.step('Start from a clean single-item basket and reach the payment step', async () => {
        console.log('[STEP] Start from a clean single-item basket and reach the payment step')
        await basketPage.clearBasket('/warenkorb')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Berlin',
            postcode: '10115',
            country: 'Deutschland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'DE123456789') {
            await checkoutPage.applyVatNumber('DE123456789')
            await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
            await checkoutPage.payOnAccount()
            await expect(page).toHaveURL(/\/kasse\/danke$/, { timeout: 30000 })

            await basketPage.clearBasket('/warenkorb')
            await homePage.navigateToHomePage()
            await homePage.searchForProduct('epoxy')
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage('/warenkorb')
            await basketPage.proceedToSecureCheckout('/kasse')
            await checkoutPage.chooseDeliveryAddress(undefined, {
                addressLine1: 'Teststrasse 1',
                city: 'Berlin',
                postcode: '10115',
                country: 'Deutschland',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('DE999999999')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        const vatBeforeOrder = await checkoutPage.summaryVatAmount.textContent()
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/kasse\/danke$/, { timeout: 30000 })
        await expect(checkoutPage.thankYouVatAmount).toHaveText(vatBeforeOrder ?? '')
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile('/kundenkonto/profil')
        await expect(accountPage.vatNumberInput).toHaveValue('DE999999999')
    })

    await test.step('Restore the shared account to its documented baseline by placing a second order with the original VAT number', async () => {
        console.log('[STEP] Restore the shared account to its documented baseline by placing a second order with the original VAT number')
        await basketPage.clearBasket('/warenkorb')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/warenkorb')
        await basketPage.proceedToSecureCheckout('/kasse')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststrasse 1',
            city: 'Berlin',
            postcode: '10115',
            country: 'Deutschland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('DE123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/kasse\/danke$/, { timeout: 30000 })

        await accountPage.navigateToProfile('/kundenkonto/profil')
        await expect(accountPage.vatNumberInput).toHaveValue('DE123456789')
    })
})
