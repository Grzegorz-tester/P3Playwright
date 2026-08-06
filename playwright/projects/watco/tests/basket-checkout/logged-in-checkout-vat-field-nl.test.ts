import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { watcoNl } from '@utils/testUsers'
import { WatcoHomePage } from '../../pages/WatcoHomePage'
import { WatcoProductListPage } from '../../pages/WatcoProductListPage'
import { WatcoPDPage } from '../../pages/WatcoPDPage'
import { WatcoBasketPage } from '../../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../../pages/WatcoCheckoutPage'

/**
 * WAT-305 — VAT registration number field, logged-in checkout (NL).
 * NL mirror of logged-in-checkout-vat-field-de.test.ts — same VAT-gated
 * Pay on Account behaviour (see guest-checkout-vat-field-nl.test.ts
 * docblock), same three-self-contained-tests rationale.
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
    await basketPage.proceedToBasketPage('/winkelmandje')
    await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
    await checkoutPage.chooseDeliveryAddress(undefined, {
        addressLine1: 'Teststraat 1',
        city: 'Amsterdam',
        postcode: '1011AA',
        country: 'Nederland',
    })
    await checkoutPage.chooseDeliveryDateAndOptions(1)
}

test('NL logged-in checkout, no saved VAT: field is empty and Pay on Account is hidden', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has no saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has no saved VAT number')
        await loginPage.navigateToLoginPage('/inloggen')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoNl.accountTestUser_1.email, watcoNl.accountTestUser_1.password, '/mijn-account')
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

test('NL logged-in checkout, has saved VAT: field is pre-populated, Pay on Account is visible on load, and both are editable', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/inloggen')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoNl.accountTestUserWithVat.email, watcoNl.accountTestUserWithVat.password, '/mijn-account')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is pre-populated and Pay on Account is already visible, with no Apply click needed', async () => {
        console.log('[STEP] VAT field is pre-populated and Pay on Account is already visible, with no Apply click needed')
        await expect(checkoutPage.vatNumberInput).toHaveValue('NL000099998B57')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })

    await test.step('Editing and applying a new VAT number updates the field', async () => {
        console.log('[STEP] Editing and applying a new VAT number updates the field')
        await checkoutPage.applyVatNumber('NL999999999B01')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('NL999999999B01')
    })
})

test('NL logged-in checkout, has saved VAT: clearing and applying persists an empty value and hides Pay on Account again', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/inloggen')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoNl.accountTestUserWithVat.email, watcoNl.accountTestUserWithVat.password, '/mijn-account')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Explicitly (re-)apply a known VAT value, regardless of the account\'s current state', async () => {
        console.log('[STEP] Explicitly (re-)apply a known VAT value, regardless of the account\'s current state')
        const currentValue = await checkoutPage.vatNumberInput.inputValue()
        if (currentValue !== 'NL000099998B57') {
            await checkoutPage.applyVatNumber('NL000099998B57')
        }
        await expect(checkoutPage.vatNumberInput).toHaveValue('NL000099998B57')
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
