import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { watcoIe } from '@utils/testUsers'
import { WatcoHomePage } from '../../pages/WatcoHomePage'
import { WatcoProductListPage } from '../../pages/WatcoProductListPage'
import { WatcoPDPage } from '../../pages/WatcoPDPage'
import { WatcoBasketPage } from '../../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../../pages/WatcoCheckoutPage'

/**
 * WAT-305 — VAT registration number field, logged-in checkout (IE).
 * IE mirror of logged-in-checkout-vat-field.test.ts (UK) — same rationale
 * for three separate self-contained tests in one file (see that file's
 * docblock). VAT number used throughout is IE1234567L.
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
    await basketPage.proceedToBasketPage()
    await basketPage.proceedToSecureCheckout()
    await checkoutPage.chooseDeliveryAddress(undefined, {
        city: 'Dublin',
        postcode: 'D01 F5P2',
        country: 'Ireland',
    })
    await checkoutPage.chooseDeliveryDateAndOptions(1)
}

test('IE logged-in checkout, no saved VAT: field is empty and POA is available', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has no saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has no saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoIe.accountTestUser_1.email, watcoIe.accountTestUser_1.password)
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is empty, Apply is disabled, and Pay on Account is offered', async () => {
        console.log('[STEP] VAT field is empty, Apply is disabled, and Pay on Account is offered')
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.payOnAccountMethodRadio).toBeVisible()
    })
})

test('IE logged-in checkout, has saved VAT: field is pre-populated and editable', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoIe.accountTestUserWithVat.email, watcoIe.accountTestUserWithVat.password)
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is pre-populated with the saved VAT number', async () => {
        console.log('[STEP] VAT field is pre-populated with the saved VAT number')
        await expect(checkoutPage.vatNumberInput).toHaveValue('IE1234567L')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('Editing and applying a new VAT number updates the field', async () => {
        console.log('[STEP] Editing and applying a new VAT number updates the field')
        await checkoutPage.applyVatNumber('IE7654321W')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('IE7654321W')
    })
})

test('IE logged-in checkout, has saved VAT: clearing and applying persists an empty value', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoIe.accountTestUserWithVat.email, watcoIe.accountTestUserWithVat.password)
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Explicitly (re-)apply a known VAT value, regardless of the account\'s current state', async () => {
        console.log('[STEP] Explicitly (re-)apply a known VAT value, regardless of the account\'s current state')
        const currentValue = await checkoutPage.vatNumberInput.inputValue()
        if (currentValue !== 'IE1234567L') {
            await checkoutPage.applyVatNumber('IE1234567L')
        }
        await expect(checkoutPage.vatNumberInput).toHaveValue('IE1234567L')
    })

    await test.step('Clearing the field and applying persists a genuinely empty value', async () => {
        console.log('[STEP] Clearing the field and applying persists a genuinely empty value')
        await checkoutPage.vatNumberInput.fill('')
        await expect(checkoutPage.vatApplyButton).toBeEnabled({ timeout: 10000 })
        await checkoutPage.vatApplyButton.click()
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
    })
})
