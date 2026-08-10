import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoBeFr } from '@utils/testUsers'
import { WatcoHomePage } from '../../../pages/WatcoHomePage'
import { WatcoProductListPage } from '../../../pages/WatcoProductListPage'
import { WatcoPDPage } from '../../../pages/WatcoPDPage'
import { WatcoBasketPage } from '../../../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../../../pages/WatcoCheckoutPage'

/**
 * WAT-305 — VAT registration number field, logged-in checkout (BE-FR).
 * Same VAT-gated Pay on Account behaviour as BE-NL/NL/DE — see
 * guest-checkout-vat-field-befr.test.ts docblock for why that's notable
 * (BE-FR's language sibling FR does NOT gate Pay on Account this way).
 */

async function addProductAndReachPayment(
    homePage: WatcoHomePage,
    productListPage: WatcoProductListPage,
    productDetailPage: WatcoPDPage,
    basketPage: WatcoBasketPage,
    checkoutPage: WatcoCheckoutPage
) {
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

test('BE-FR logged-in checkout, no saved VAT: field is empty and Pay on Account is hidden', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has no saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has no saved VAT number')
        await loginPage.navigateToLoginPage('/se-connecter')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoBeFr.accountTestUser_1.email, watcoBeFr.accountTestUser_1.password, '/mon-compte')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is empty, Apply is disabled, and Pay on Account is hidden', async () => {
        console.log('[STEP] VAT field is empty, Apply is disabled, and Pay on Account is hidden')
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeHidden()
    })
})

test('BE-FR logged-in checkout, has saved VAT: field is pre-populated, Pay on Account is visible on load, and both are editable', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/se-connecter')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoBeFr.accountTestUserWithVat.email, watcoBeFr.accountTestUserWithVat.password, '/mon-compte')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is pre-populated and Pay on Account is already visible, with no Apply click needed', async () => {
        console.log('[STEP] VAT field is pre-populated and Pay on Account is already visible, with no Apply click needed')
        await expect(checkoutPage.vatNumberInput).toHaveValue('BE0411905847')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })

    await test.step('Editing and applying a new VAT number updates the field', async () => {
        console.log('[STEP] Editing and applying a new VAT number updates the field')
        await checkoutPage.applyVatNumber('BE0403294259')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('BE0403294259')
    })
})

test('BE-FR logged-in checkout, has saved VAT: clearing and applying persists an empty value and hides Pay on Account again', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/se-connecter')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoBeFr.accountTestUserWithVat.email, watcoBeFr.accountTestUserWithVat.password, '/mon-compte')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Explicitly (re-)apply a known VAT value, regardless of the account\'s current state', async () => {
        console.log('[STEP] Explicitly (re-)apply a known VAT value, regardless of the account\'s current state')
        const currentValue = await checkoutPage.vatNumberInput.inputValue()
        if (currentValue !== 'BE0411905847') {
            await checkoutPage.applyVatNumber('BE0411905847')
        }
        await expect(checkoutPage.vatNumberInput).toHaveValue('BE0411905847')
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })

    await test.step('Clearing the field and applying persists a genuinely empty value and hides Pay on Account again', async () => {
        console.log('[STEP] Clearing the field and applying persists a genuinely empty value and hides Pay on Account again')
        await checkoutPage.vatNumberInput.fill('')
        await expect(checkoutPage.vatApplyButton).toBeEnabled({ timeout: 10000 })
        await checkoutPage.vatApplyButton.click()
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.payOnAccountMethodRadio).toBeHidden()
    })
})
