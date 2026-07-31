import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkerator } from '@utils/testUsers'

/**
 * PURCHASE JOURNEY (Logged-in, Portugal)
 * ========================================
 * Logged-in counterpart to guest-purchase-journey.test.ts. Covers: home ->
 * login -> category -> PDP -> add to basket -> basket -> checkout (saved
 * address selection) -> delivery method + phone -> billing -> review &
 * payment -> a real CyberSource payment -> the thank-you page.
 *
 * CORRECTED (staging, 2026-07-31): this used to stop at
 * verifyReachedReviewAndPayment() because no payment provider was
 * configured for this country/order on staging at the time ("Payment
 * provider not valid for this order"). Retested live and the same
 * "Checkout With Card" CyberSource widget now renders here as it does for
 * guest checkout (see guest-purchase-journey.test.ts) - confirmed with a
 * real completed test-mode order. Like the guest test, this deliberately
 * completes a real order every run, so keep it to one run per suite
 * execution.
 *
 * Also CORRECTED as a side effect of fixing the header nav drawer bug
 * (see InsinkeratorHomePage.chooseMenuCategory()): the "Navigate to Shop
 * category" step below used to silently not test real category
 * navigation at all (masked by the home page's bestseller carousel
 * sharing the product-card__name testid with the category PLP). It's a
 * genuine navigation test now, and "Choose first product and add to
 * basket" was corrected to click productCardLink (the actual PDP anchor)
 * instead of productNameLink (a plain, non-clickable <h5> on this
 * category) - see InsinkeratorProductListPage.clickOnFirstItemToProceedToPDP().
 *
 * Logs in via the UI directly (loginPage), not via auth.setup.ts's API
 * call — that setup file's /auth endpoint has never been confirmed
 * working, only the UI login form has (and even that needed a
 * fill-and-verify retry to be reliable — see InsinkeratorLoginPage.ts).
 */
test.describe('Purchase Journey (Logged-in, Portugal)', () => {
    test('User can proceed from PDP through to Review & Payment', async ({
        page,
        homePage,
        loginPage,
        productListPage,
        productDetailPage,
        basketPage,
        checkoutPage,
        checkoutSuccessPage,
    }) => {
        const user = Object.assign({}, insinkerator.accountTestUser_1)

        await test.step(`Navigate to Home Page and select Portugal...`, async () => {
            console.log(`[STEP] Navigate to Home Page and select Portugal...`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Log in to account...`, async () => {
            console.log(`[STEP] Log in to account...`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate to Shop category...`, async () => {
            console.log(`[STEP] Navigate to Shop category...`)
            await homePage.navigateToHomePage()
            await homePage.chooseMenuCategory('Shop')
        })

        await test.step(`Choose first product and add to basket...`, async () => {
            console.log(`[STEP] Choose first product and add to basket...`)
            await productListPage.clickOnFirstItemToProceedToPDP()
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Proceed to Secure Checkout...`, async () => {
            console.log(`[STEP] Proceed to Secure Checkout...`)
            await page.goto('/basket')
            await basketPage.proceedToSecureCheckout()
        })

        await test.step(`Select saved delivery address...`, async () => {
            console.log(`[STEP] Select saved delivery address...`)
            await checkoutPage.chooseDeliveryAddress(1)
        })

        await test.step(`Enter delivery phone number and choose delivery method...`, async () => {
            console.log(`[STEP] Enter delivery phone number and choose delivery method...`)
            // NOTE: only UK-format numbers currently validate here, regardless
            // of delivery country — a known, temporary limitation.
            await checkoutPage.enterDeliveryPhoneNumberAndContinue('07911123456')
        })

        await test.step(`Confirm billing address...`, async () => {
            console.log(`[STEP] Confirm billing address...`)
            await checkoutPage.chooseBillingAddressSameAsDelivery()
        })

        await test.step(`Verify Review & Payment page reached...`, async () => {
            console.log(`[STEP] Verify Review & Payment page reached...`)
            await checkoutPage.verifyReachedReviewAndPayment()
        })

        await test.step(`Pay with a CyberSource test card...`, async () => {
            console.log(`[STEP] Pay with a CyberSource test card...`)
            await checkoutPage.payWithCyberSourceTestCard({
                number: '4111111111111111',
                expiryMonth: '12',
                expiryYear: '30',
                securityCode: '123',
            })
        })

        await test.step(`Verify the thank-you page shows the order confirmation...`, async () => {
            console.log(`[STEP] Verify the thank-you page shows the order confirmation...`)
            await checkoutSuccessPage.verifyThankYouPage(user.email)
        })
    })
})
