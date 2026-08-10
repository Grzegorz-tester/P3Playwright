import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watcoBeNl } from '@utils/testUsers'

/**
 * WAT-305 — BE-NL mirror of logged-in-checkout-vat-persistence.test.ts
 * (UK) / -nl.test.ts. Same paths as NL — /winkelmandje,
 * /de-bestelling-valideren, confirmation /bestelling-bevestigen/bedankt,
 * /mijn-account, profile page /mijn-account/persoonlijke-informatie.
 * Like NL/DE, Pay on Account is VAT-gated, but every step here always
 * has a valid VAT number applied, so no extra handling needed. See the
 * UK file's docblock for the payNowButton / clearBasket background this
 * depends on, and for why this self-heals against its own prior
 * interrupted runs.
 *
 * Also checks VAT correctness on the thank-you page itself — see the
 * "Edit the VAT number..." step below. BE-NL zero-rates even for
 * domestic delivery, so the expected carried-through amount here is
 * zero.
 */
test('BE-NL logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/inloggen')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watcoBeNl.accountTestUserWithVat.email, watcoBeNl.accountTestUserWithVat.password, '/mijn-account')
    })

    await test.step('Start from a clean single-item basket and reach the payment step', async () => {
        console.log('[STEP] Start from a clean single-item basket and reach the payment step')
        await basketPage.clearBasket('/winkelmandje')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Brussel',
            postcode: '1000',
            country: 'België',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'BE0123456749') {
            await checkoutPage.applyVatNumber('BE0123456749')
            await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
            await checkoutPage.payOnAccount()
            await expect(page).toHaveURL(/\/bestelling-bevestigen\/bedankt$/, { timeout: 30000 })

            await basketPage.clearBasket('/winkelmandje')
            await homePage.navigateToHomePage()
            await homePage.searchForProduct('epoxy')
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
            await basketPage.proceedToBasketPage('/winkelmandje')
            await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
            await checkoutPage.chooseDeliveryAddress(undefined, {
                addressLine1: 'Teststraat 1',
                city: 'Brussel',
                postcode: '1000',
                country: 'België',
            })
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('BE0403294259')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        const vatBeforeOrder = await checkoutPage.summaryVatAmount.textContent()
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/bestelling-bevestigen\/bedankt$/, { timeout: 30000 })
        await expect(checkoutPage.thankYouVatAmount).toHaveText(vatBeforeOrder ?? '')
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile('/mijn-account/persoonlijke-informatie')
        await expect(accountPage.vatNumberInput).toHaveValue('BE0403294259')
    })

    await test.step('Restore the shared account to its documented baseline by placing a second order with the original VAT number', async () => {
        console.log('[STEP] Restore the shared account to its documented baseline by placing a second order with the original VAT number')
        await basketPage.clearBasket('/winkelmandje')
        await homePage.navigateToHomePage()
        await homePage.searchForProduct('epoxy')
        await productListPage.clickOnFirstItemToProceedToPDP()
        await productDetailPage.addToBasket(1)
        await basketPage.proceedToBasketPage('/winkelmandje')
        await basketPage.proceedToSecureCheckout('/de-bestelling-valideren')
        await checkoutPage.chooseDeliveryAddress(undefined, {
            addressLine1: 'Teststraat 1',
            city: 'Brussel',
            postcode: '1000',
            country: 'België',
        })
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('BE0123456749')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/bestelling-bevestigen\/bedankt$/, { timeout: 30000 })

        await accountPage.navigateToProfile('/mijn-account/persoonlijke-informatie')
        await expect(accountPage.vatNumberInput).toHaveValue('BE0123456749')
    })
})
