import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../utils/cookieBanner'
import { watcoPl } from '@utils/testUsers'
import { WatcoHomePage } from '../../pages/WatcoHomePage'
import { WatcoProductListPage } from '../../pages/WatcoProductListPage'
import { WatcoPDPage } from '../../pages/WatcoPDPage'
import { WatcoBasketPage } from '../../pages/WatcoBasketPage'
import { WatcoCheckoutPage } from '../../pages/WatcoCheckoutPage'

/**
 * WAT-305 — NIP / NIP-EU fields, logged-in checkout (PL).
 * VERIFIED live, staging, 2026-08-06. watcoPl.accountTestUserWithVat has
 * a saved NIP-EU (PL9876543210) but no saved NIP — matching the QA doc's
 * own scenario coverage (it never tests a saved NIP).
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

test('PL logged-in checkout, no saved VAT: both fields empty, standard rate, no Pay on Account', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has no saved NIP/NIP-EU', async () => {
        console.log('[STEP] Log in with an account that has no saved NIP/NIP-EU')
        await loginPage.navigateToLoginPage('/logowanie')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoPl.accountTestUser_1.email, watcoPl.accountTestUser_1.password, '/konto')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Both fields are empty, Apply is disabled for both, standard rate applies, and Pay on Account is never offered', async () => {
        console.log('[STEP] Both fields are empty, Apply is disabled for both, standard rate applies, and Pay on Account is never offered')
        await expect(checkoutPage.nipNumberInput).toHaveValue('')
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.nipApplyButton).toBeDisabled()
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.payOnAccountMethodRadio).toHaveCount(0)
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('23%')
    })
})

test('PL logged-in checkout, saved NIP-EU: field is pre-populated and zero-rated on load, and both fields are editable', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved NIP-EU', async () => {
        console.log('[STEP] Log in with an account that has a saved NIP-EU')
        await loginPage.navigateToLoginPage('/logowanie')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoPl.accountTestUserWithVat.email, watcoPl.accountTestUserWithVat.password, '/konto')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('NIP-EU is pre-populated and already zero-rated with no Apply click needed; NIP is empty', async () => {
        console.log('[STEP] NIP-EU is pre-populated and already zero-rated with no Apply click needed; NIP is empty')
        await expect(checkoutPage.vatNumberInput).toHaveValue('PL9876543210')
        await expect(checkoutPage.vatApplyButton).toBeDisabled()
        await expect(checkoutPage.nipNumberInput).toHaveValue('')
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('0%')
    })

    await test.step('Editing and applying a new NIP-EU updates the field', async () => {
        console.log('[STEP] Editing and applying a new NIP-EU updates the field')
        await checkoutPage.applyVatNumber('PL0987654321')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.vatNumberInput).toHaveValue('PL0987654321')
    })

    await test.step('NIP is independently editable and has no effect on the VAT rate', async () => {
        console.log('[STEP] NIP is independently editable and has no effect on the VAT rate')
        await checkoutPage.applyNipNumber('9876543210')
        await expect(checkoutPage.nipNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.nipNumberInput).toHaveValue('9876543210')
        expect((await checkoutPage.summaryVatRow.textContent())?.replace(/\s+/g, ' ')).toContain('0%')
    })
})

test('PL logged-in checkout, saved NIP-EU: clearing and applying persists an empty value and reverts to the standard rate', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage }) => {
    await test.step('Log in with an account that has a saved NIP-EU', async () => {
        console.log('[STEP] Log in with an account that has a saved NIP-EU')
        await loginPage.navigateToLoginPage('/logowanie')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoPl.accountTestUserWithVat.email, watcoPl.accountTestUserWithVat.password, '/konto')
    })

    await test.step('Add a product to basket and reach the payment step', async () => {
        console.log('[STEP] Add a product to basket and reach the payment step')
        await addProductAndReachPayment(homePage, productListPage, productDetailPage, basketPage, checkoutPage)
    })

    await test.step('Explicitly (re-)apply a known NIP-EU value, regardless of the account\'s current state', async () => {
        console.log('[STEP] Explicitly (re-)apply a known NIP-EU value, regardless of the account\'s current state')
        const currentValue = await checkoutPage.vatNumberInput.inputValue()
        if (currentValue !== 'PL9876543210') {
            await checkoutPage.applyVatNumber('PL9876543210')
        }
        await expect(checkoutPage.vatNumberInput).toHaveValue('PL9876543210')
        await expect(checkoutPage.summaryVatRow).toContainText('0%')
    })

    await test.step('Clearing the field and applying persists a genuinely empty value and reverts to the standard rate', async () => {
        console.log('[STEP] Clearing the field and applying persists a genuinely empty value and reverts to the standard rate')
        await checkoutPage.vatNumberInput.fill('')
        await expect(checkoutPage.vatApplyButton).toBeEnabled({ timeout: 10000 })
        await checkoutPage.vatApplyButton.click()
        await expect(checkoutPage.vatNumberInput).toHaveValue('')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await expect(checkoutPage.summaryVatRow).toContainText('23%', { timeout: 15000 })
    })
})
