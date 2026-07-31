import test from '../../utils/Pages'
import { russells } from '@utils/testUsers'

/**
 * ACCOUNT ORDERS (Logged-in)
 * ===========================
 * Covers: /account/orders showing a real order - column headers (Order
 * Number, Placed On, Amount), the filter controls, the most recent order
 * row, and its order detail page.
 *
 * Depends on logged-in-purchase-journey.test.ts having already placed a
 * real order against this same account - accountTestUser_1 permanently
 * has at least one real order from that test.
 */
test.describe('Account Orders (Logged-in)', () => {
    test('User can view a real order in the Orders page', async ({
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, russells.accountTestUser_1)

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
