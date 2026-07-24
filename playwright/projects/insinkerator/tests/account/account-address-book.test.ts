import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkerator } from '@utils/testUsers'
import { generateDeliveryAddress } from '@utils/fakeData'

/**
 * MY ACCOUNT - ADDRESS BOOK (Logged-in, Portugal)
 * ================================================
 * Covers: home -> select country -> login -> account -> address book ->
 * add a delivery address -> edit it -> remove it.
 *
 * NOTE (2026-07-22): accountTestUser_1 now has a PERMANENT fixture
 * delivery + billing address (added deliberately so
 * logged-in-purchase-journey.test.ts's checkout step always has a saved address to
 * select), so the book is no longer reliably empty. This test adds ONE
 * more delivery address on top of that fixture, edits it, then removes
 * it, leaving the permanent fixture untouched — accountPage.addDeliveryAddress()
 * returns the actual index the new address landed at (never assume "1").
 *
 * Logs in via the UI directly (loginPage), matching logged-in-purchase-journey.test.ts
 * - the /auth API setup has never been confirmed working for this project.
 */
test.describe('Account Address Book (Logged-in, Portugal)', () => {
    test('User can add, edit and remove a delivery address', async ({
        page,
        homePage,
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, insinkerator.accountTestUser_1)
        const newAddress = generateDeliveryAddress()
        const editedAddress = generateDeliveryAddress()

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

        await test.step(`Validate Account page`, async () => {
            console.log(`[STEP] Validate Account page`)
            await accountPage.navigateToAccountPage()
            await accountPage.waitForLoginToBeCompleted()
            await accountPage.validateAccountPage()
        })

        let addressNumber: number

        await test.step(`Add a delivery address`, async () => {
            console.log(`[STEP] Add a delivery address`)
            addressNumber = await accountPage.addDeliveryAddress(newAddress)
        })

        await test.step(`Edit the delivery address`, async () => {
            console.log(`[STEP] Edit the delivery address`)
            await accountPage.editDeliveryAddress(addressNumber, editedAddress)
        })

        await test.step(`Remove the delivery address`, async () => {
            console.log(`[STEP] Remove the delivery address`)
            await accountPage.removeDeliveryAddress(addressNumber)
        })
    })
})
