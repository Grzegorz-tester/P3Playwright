import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watco } from '@utils/testUsers'
import { WatcoHomePage } from '../../../pages/WatcoHomePage'
import { WatcoProductListPage } from '../../../pages/WatcoProductListPage'
import { WatcoPDPage } from '../../../pages/WatcoPDPage'
import { WatcoBasketPage } from '../../../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../../../pages/WatcoCheckoutPage'

/**
 * WAT-335 — VAT registration number field, logged-in checkout (UK).
 * Covers QA scenarios 13, 14, 15, 28, 29.
 *
 * Three separate, self-contained tests in this one file (same file ⇒ same
 * worker ⇒ Playwright runs them sequentially by default) rather than a
 * single chained journey — this repo has no describe.serial() precedent to
 * rely on instead, and accountTestUserWithVat is a SHARED account mutated
 * by every run (its basket and saved address persist across runs, unlike
 * the guest tests' always-fresh email). Test (c) explicitly re-applies a
 * known VAT value itself before clearing it, rather than assuming test (b)
 * left a particular value behind.
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
    await checkoutPage.chooseDeliveryAddress()
    await checkoutPage.chooseDeliveryDateAndOptions(1)
}

test('logged-in checkout, no saved VAT: field is empty and POA is available', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has no saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has no saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watco.accountTestUser_1.email, watco.accountTestUser_1.password)
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

test('logged-in checkout, has saved VAT: field is pre-populated and editable', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watco.accountTestUserWithVat.email, watco.accountTestUserWithVat.password)
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('VAT field is pre-populated with the saved VAT number', async () => {
        console.log('[STEP] VAT field is pre-populated with the saved VAT number')
        await expect(checkoutPage.vatNumberInput).toHaveValue('GB123456789')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
    })

    await test.step('Editing and applying a new VAT number updates the field', async () => {
        console.log('[STEP] Editing and applying a new VAT number updates the field')
        await checkoutPage.applyVatNumber('GB987654321')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('GB987654321')
    })
})

test('logged-in checkout, has saved VAT: clearing and applying persists an empty value', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with an account that has a saved VAT number')
        await loginPage.navigateToLoginPage()
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watco.accountTestUserWithVat.email, watco.accountTestUserWithVat.password)
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Explicitly (re-)apply a known VAT value, regardless of the account\'s current state', async () => {
        console.log('[STEP] Explicitly (re-)apply a known VAT value, regardless of the account\'s current state')
        const currentValue = await checkoutPage.vatNumberInput.inputValue()
        if (currentValue !== 'GB123456789') {
            await checkoutPage.applyVatNumber('GB123456789')
        }
        await expect(checkoutPage.vatNumberInput).toHaveValue('GB123456789')
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
