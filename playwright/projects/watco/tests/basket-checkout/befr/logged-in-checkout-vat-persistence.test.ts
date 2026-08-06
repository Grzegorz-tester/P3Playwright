import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoBeFr } from '@utils/testUsers'

/**
 * WAT-305 — BE-FR mirror of logged-in-checkout-vat-persistence.test.ts
 * (UK) / -fr.test.ts. Same paths as FR — /panier, /valider-la-commande,
 * /mon-compte, profile page /mon-compte/informations-personnelles
 * (inferred from FR's own path, not independently re-verified — will
 * self-correct via a failing URL assertion if wrong). Like DE/NL/BE-NL,
 * Pay on Account is VAT-gated, but every step here always has a valid
 * VAT number applied, so no extra handling needed. See the UK file's
 * docblock for the payNowButton / clearBasket background this depends
 * on, and for why this self-heals against its own prior interrupted
 * runs.
 */
test('BE-FR logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/se-connecter')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoBeFr.accountTestUserWithVat.email, watcoBeFr.accountTestUserWithVat.password, '/mon-compte')
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
            addressLine1: 'Rue de Test 1',
            city: 'Bruxelles',
            postcode: '1000',
            country: 'Belgique',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'BE0411905847') {
            await checkoutPage.applyVatNumber('BE0411905847')
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
                addressLine1: 'Rue de Test 1',
                city: 'Bruxelles',
                postcode: '1000',
                country: 'Belgique',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('BE0403294259')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/valider-la-commande\/merci$/, { timeout: 30000 })
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile('/mon-compte/informations-personnelles')
        await expect(accountPage.vatNumberInput).toHaveValue('BE0403294259')
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
            addressLine1: 'Rue de Test 1',
            city: 'Bruxelles',
            postcode: '1000',
            country: 'Belgique',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('BE0411905847')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/valider-la-commande\/merci$/, { timeout: 30000 })

        await accountPage.navigateToProfile('/mon-compte/informations-personnelles')
        await expect(accountPage.vatNumberInput).toHaveValue('BE0411905847')
    })
})
