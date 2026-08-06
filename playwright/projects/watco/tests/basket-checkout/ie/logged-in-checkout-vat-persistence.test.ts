import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoIe } from '@utils/testUsers'

/**
 * WAT-305 — IE mirror of logged-in-checkout-vat-persistence.test.ts (UK).
 * Same mechanics, IE's own English-route paths (no overrides needed —
 * matches UK). See the UK file's docblock for the payNowButton /
 * clearBasket background this depends on.
 *
 * This test mutates watcoIe.accountTestUserWithVat's saved VAT number and
 * restores it to its documented baseline (IE1234567L) by placing a
 * second real order — NOT via the account profile page's own save form,
 * which is a confirmed-broken persistence path (see
 * account-profile-vat-save.test.ts, found on the UK site; not
 * independently re-verified per-market, but there's no reason to expect
 * it behaves differently here since it's the same underlying platform).
 *
 * Self-heals against its own prior interrupted runs the same way the UK
 * file does — see that file's docblock for why.
 */
test('IE logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoIe.accountTestUserWithVat.email, watcoIe.accountTestUserWithVat.password)
    })

    await test.step('Start from a clean single-item basket and reach the payment step', async () => {
        console.log('[STEP] Start from a clean single-item basket and reach the payment step')
        await basketPage.clearBasket()
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.chooseDeliveryAddress(undefined, {
            city: 'Dublin',
            postcode: 'D01 F5P2',
            country: 'Ireland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'IE1234567L') {
            await checkoutPage.applyVatNumber('IE1234567L')
            await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
            await checkoutPage.payOnAccount()
            await expect(page).toHaveURL(/\/checkout\/thanks$/, { timeout: 30000 })

            await basketPage.clearBasket()
            await homePage.navigateToHomePage()
            await homePage.searchForProduct('epoxy')
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage()
            await basketPage.proceedToSecureCheckout()
            await checkoutPage.chooseDeliveryAddress(undefined, {
                city: 'Dublin',
                postcode: 'D01 F5P2',
                country: 'Ireland',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('IE9999999L')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/checkout\/thanks$/, { timeout: 30000 })
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile()
        await expect(accountPage.vatNumberInput).toHaveValue('IE9999999L')
    })

    await test.step('Restore the shared account to its documented baseline by placing a second order with the original VAT number', async () => {
        console.log('[STEP] Restore the shared account to its documented baseline by placing a second order with the original VAT number')
        await basketPage.clearBasket()
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage()
        await basketPage.proceedToSecureCheckout()
        await checkoutPage.chooseDeliveryAddress(undefined, {
            city: 'Dublin',
            postcode: 'D01 F5P2',
            country: 'Ireland',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('IE1234567L')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/checkout\/thanks$/, { timeout: 30000 })

        await accountPage.navigateToProfile()
        await expect(accountPage.vatNumberInput).toHaveValue('IE1234567L')
    })
})
