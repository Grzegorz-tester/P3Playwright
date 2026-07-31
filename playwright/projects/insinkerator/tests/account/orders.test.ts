import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkerator } from '@utils/testUsers'

/**
 * ACCOUNT ORDERS (Logged-in, Portugal)
 * ======================================
 * Covers: /account/orders showing a real order - column headers (Order
 * Number, Placed On, Amount), the filter controls (Order No., Date Range,
 * Total), the most recent order row, and its order detail page.
 *
 * CORRECTED (staging, 2026-07-31): accountTestUser_1 used to have ZERO
 * real orders on staging (no payment provider was configured, so no
 * automated test could complete a real purchase - the exact same
 * blocker previously documented on logged-in-purchase-journey.test.ts,
 * "Payment provider not valid for this order"). That's fixed now -
 * logged-in-purchase-journey.test.ts completes a real order every run,
 * so this account permanently has at least one real order from now on.
 * This spec now covers the real order row and its detail page instead
 * of only the (now unreachable) empty state.
 */
test.describe('Account Orders (Logged-in, Portugal)', () => {
    test('User can view a real order in the Orders page', async ({
        page,
        homePage,
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, insinkerator.accountTestUser_1)

        await test.step(`Navigate to Home Page and select Portugal`, async () => {
            console.log(`[STEP] Navigate to Home Page and select Portugal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Log in to account`, async () => {
            console.log(`[STEP] Log in to account`)
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })

        await test.step(`Navigate to the Orders page and validate a real order is listed`, async () => {
            console.log(`[STEP] Navigate to the Orders page and validate a real order is listed`)
            await accountPage.navigateToOrdersPage()
            await accountPage.validateOrdersPageHasRealOrder()
        })

        let orderReference: string

        await test.step(`Open the most recent order`, async () => {
            console.log(`[STEP] Open the most recent order`)
            orderReference = await accountPage.openMostRecentOrder()
        })

        await test.step(`Validate the order detail page`, async () => {
            console.log(`[STEP] Validate the order detail page`)
            await accountPage.validateOrderDetailsPage(orderReference, user.email)
        })
    })
})
