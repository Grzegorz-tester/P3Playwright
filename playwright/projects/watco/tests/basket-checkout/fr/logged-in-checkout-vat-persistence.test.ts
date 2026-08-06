import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoFr } from '@utils/testUsers'

/**
 * WAT-305 — FR mirror of logged-in-checkout-vat-persistence.test.ts (UK).
 * Own localized paths — /panier, /valider-la-commande, /mon-compte,
 * order confirmation is /valider-la-commande/merci (VERIFIED live,
 * staging, 2026-08-06), profile page is
 * /mon-compte/informations-personnelles. See the UK file's docblock for
 * the payNowButton / clearBasket background this depends on.
 *
 * Self-heals against its own prior interrupted runs the same way the UK
 * file does — see that file's docblock for why.
 */
test('FR logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/se-connecter')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoFr.accountTestUserWithVat.email, watcoFr.accountTestUserWithVat.password, '/mon-compte')
    })

    await test.step('Start from a clean single-item basket and reach the payment step', async () => {
        console.log('[STEP] Start from a clean single-item basket and reach the payment step')
        await basketPage.clearBasket('/panier')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: '1 Rue de Test',
            city: 'Paris',
            postcode: '75001',
            country: 'France',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'FRAB123456789') {
            await checkoutPage.applyVatNumber('FRAB123456789')
            await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
            await checkoutPage.payOnAccount()
            await expect(page).toHaveURL(/\/valider-la-commande\/merci$/, { timeout: 30000 })

            await basketPage.clearBasket('/panier')
            await homePage.navigateToHomePage()
            await homePage.searchForProduct('epoxy')
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage('/panier')
            await basketPage.proceedToSecureCheckout('/valider-la-commande')
            await checkoutPage.chooseDeliveryAddress(undefined, {
                addressLine1: '1 Rue de Test',
                city: 'Paris',
                postcode: '75001',
                country: 'France',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('FRCD987654321')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/valider-la-commande\/merci$/, { timeout: 30000 })
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile('/mon-compte/informations-personnelles')
        await expect(accountPage.vatNumberInput).toHaveValue('FRCD987654321')
    })

    await test.step('Restore the shared account to its documented baseline by placing a second order with the original VAT number', async () => {
        console.log('[STEP] Restore the shared account to its documented baseline by placing a second order with the original VAT number')
        await basketPage.clearBasket('/panier')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/panier')
        await basketPage.proceedToSecureCheckout('/valider-la-commande')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: '1 Rue de Test',
            city: 'Paris',
            postcode: '75001',
            country: 'France',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('FRAB123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/valider-la-commande\/merci$/, { timeout: 30000 })

        await accountPage.navigateToProfile('/mon-compte/informations-personnelles')
        await expect(accountPage.vatNumberInput).toHaveValue('FRAB123456789')
    })
})
