import test from '../../../utils/Pages'
import { expect } from '@playwright/test'
import { dismissCookieBanner } from '../../../utils/cookieBanner'
import { watco } from '@utils/testUsers'

/**
 * WAT-305 — "any changes made during checkout are persisted back to the
 * customer account when the order is placed" (AC, Logged-In Customer
 * Behaviour). VERIFIED live, staging, 2026-08-06.
 *
 * No test in this suite had ever completed a full order before this —
 * every other file stops at the payment step after applying/validating
 * VAT. Getting this far surfaced a real bug in WatcoCheckoutPage: the
 * "Pay now" button (button.btn-checkout) that payOnAccount() used to
 * click stays permanently visibility:hidden in this flow — it is NOT
 * the real submit control. The actual one is a generic accordion-style
 * ".payment__button-proceed" input, gated by a Bootstrap d-none class
 * removed once the T&Cs checkbox is checked (same d-none-toggle
 * mechanism DE's Pay-on-Account visibility uses, on a different
 * element). Fixed in objects.ts/WatcoCheckoutPage.payOnAccount() — this
 * fix benefits every market's future order-completing tests, not just
 * this one.
 *
 * The shared accountTestUserWithVat account's basket also carried lines
 * left over from every prior test run this project ever did (basket
 * state is server-side per account, nothing had ever cleared it) —
 * added WatcoBasketPage.clearBasket() to start from a known single-item
 * state before placing a real order.
 *
 * This test mutates the shared account's saved VAT number, then restores
 * it to its documented baseline (GB123456789) by placing a SECOND real
 * order with the original value — deliberately not via the account
 * profile page's own "Save details" form, which turned out to be a
 * separate confirmed bug (see account-profile-vat-save.test.ts): it
 * silently fails to persist at all, which would have left this cleanup
 * looking like it worked while actually leaving the account contaminated
 * for every other test that assumes GB123456789 (this happened once
 * while writing this file, and needed a manual live fix to recover).
 * If this test fails, check the account's actual saved VAT via
 * accountPage before assuming other tests are broken.
 *
 * Also self-heals against its OWN prior interrupted runs: applying a
 * value that's already the account's CURRENT value leaves the Apply
 * button disabled (no change to apply) — hit live while writing this
 * when an earlier failed run left the account at GB999999999 instead of
 * baseline. The "ensure baseline first" step below forces a known
 * starting state before the real edit, so the edit step is always a
 * genuine change regardless of what a previous run left behind.
 *
 * Also checks VAT correctness on the thank-you page itself (a page no
 * test in this suite had ever inspected) — see the "Edit the VAT
 * number..." step below for what's actually there and what isn't.
 */
test('Logged-in checkout: an edited VAT number persists to the account after the order is placed', async ({ page, loginPage, homePage, productListPage, productDetailPage, basketPage, checkoutPage, accountPage }) => {
    await test.step('Log in with the account that has a saved VAT number', async () => {
        console.log('[STEP] Log in with the account that has a saved VAT number')
        await loginPage.navigateToLoginPage('/login')
        await dismissCookieBanner(page)
        await loginPage.loginToApplication(watco.accountTestUserWithVat.email, watco.accountTestUserWithVat.password, '/account')
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
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseDeliveryDateAndOptions(1)
    })

    await test.step('Ensure the account starts at its documented baseline, regardless of what a previous run left behind', async () => {
        console.log('[STEP] Ensure the account starts at its documented baseline, regardless of what a previous run left behind')
        const current = await checkoutPage.vatNumberInput.inputValue()
        if (current !== 'GB123456789') {
            await checkoutPage.applyVatNumber('GB123456789')
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
            await checkoutPage.chooseDeliveryAddress()
            await checkoutPage.chooseDeliveryDateAndOptions(1)
        }
    })

    await test.step('Edit the VAT number and complete the order via Pay on Account', async () => {
        console.log('[STEP] Edit the VAT number and complete the order via Pay on Account')
        await checkoutPage.applyVatNumber('GB999999999')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        const vatBeforeOrder = await checkoutPage.summaryVatAmount.textContent()
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/checkout\/thanks$/, { timeout: 30000 })

        // UK always charges the standard rate regardless of VAT number —
        // the meaningful check is that the amount shown mid-checkout
        // carried through unchanged to the confirmed order. VERIFIED
        // live, staging, 2026-08-06: the thank-you page shows the VAT
        // AMOUNT but neither its RATE nor the customer's VAT NUMBER
        // anywhere on the page — nothing further to assert there.
        await expect(checkoutPage.thankYouVatAmount).toHaveText(vatBeforeOrder ?? '')
    })

    await test.step('The account\'s saved VAT number now reflects the edited value', async () => {
        console.log('[STEP] The account\'s saved VAT number now reflects the edited value')
        await accountPage.navigateToProfile()
        await expect(accountPage.vatNumberInput).toHaveValue('GB999999999')
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
        await checkoutPage.chooseDeliveryAddress()
        await checkoutPage.chooseDeliveryDateAndOptions(1)
        await checkoutPage.applyVatNumber('GB123456789')
        await expect(checkoutPage.vatNumberInput).not.toHaveClass(/is-invalid/)
        await checkoutPage.payOnAccount()
        await expect(page).toHaveURL(/\/checkout\/thanks$/, { timeout: 30000 })

        await accountPage.navigateToProfile()
        await expect(accountPage.vatNumberInput).toHaveValue('GB123456789')
    })
})
