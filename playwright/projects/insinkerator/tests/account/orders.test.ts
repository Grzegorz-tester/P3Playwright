import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkerator } from '@utils/testUsers'

/**
 * ACCOUNT ORDERS (Logged-in, Portugal)
 * ======================================
 * Covers: /account/orders reaching its EMPTY state - column headers
 * (Order Number, Placed On, Amount), the filter controls (Order No.,
 * Date Range, Total), and the "No results." row.
 *
 * NOT COVERED - BLOCKED: accountTestUser_1 has ZERO real orders on
 * staging. No automated test can populate real order history, since no
 * payment provider is configured on staging - the exact same blocker
 * already documented on logged-in-purchase-journey.test.ts ("Payment
 * provider not valid for this order"). Viewing a real order row or its
 * details is therefore untestable until that's fixed; this spec only
 * covers what's actually reachable today.
 */
test.describe('Account Orders (Logged-in, Portugal)', () => {
    test('User can view the empty Orders page', async ({
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

        await test.step(`Navigate to the Orders page and validate its empty state`, async () => {
            console.log(`[STEP] Navigate to the Orders page and validate its empty state`)
            await accountPage.navigateToOrdersPage()
            await accountPage.validateOrdersPageEmptyState()
        })
    })
})
