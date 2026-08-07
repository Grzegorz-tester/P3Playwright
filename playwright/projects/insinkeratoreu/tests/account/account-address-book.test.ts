import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'
import { insinkeratoreu } from '@utils/testUsers'
import { generateDeliveryAddress } from '@utils/fakeData'

/**
 * MY ACCOUNT - ADDRESS BOOK (Logged-in, Portugal)
 * ================================================
 * Covers: home -> select country -> login -> account -> address book ->
 * add a delivery/billing address -> edit it -> remove it.
 *
 * NOTE (2026-07-22): accountTestUser_1 now has a PERMANENT fixture
 * delivery + billing address (added deliberately so
 * logged-in-purchase-journey.test.ts's checkout step always has a saved address to
 * select), so the book is no longer reliably empty. Each test here adds ONE
 * more address on top of that fixture, edits it, then removes it, leaving
 * the permanent fixture untouched — accountPage.addDeliveryAddress()/
 * addBillingAddress() return the actual index the new address landed at
 * (never assume "1").
 *
 * VERIFIED live (staging, 2026-07-27): the Billing Addresses card mirrors
 * Delivery exactly, testid-for-testid ("address-book-billing__*" instead
 * of "...-delivery__*") — same fixture-address behaviour, same positional
 * numbering, same "checkout-address-form" field testids and delete-confirm
 * flow. See InsinkeratorEuAccountPage's billing methods and objects.ts.
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
        const user = Object.assign({}, insinkeratoreu.accountTestUser_1)
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

    test('User can add, edit and remove a billing address', async ({
        page,
        homePage,
        loginPage,
        accountPage,
    }) => {
        const user = Object.assign({}, insinkeratoreu.accountTestUser_1)
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

        await test.step(`Add a billing address`, async () => {
            console.log(`[STEP] Add a billing address`)
            addressNumber = await accountPage.addBillingAddress(newAddress)
        })

        await test.step(`Edit the billing address`, async () => {
            console.log(`[STEP] Edit the billing address`)
            await accountPage.editBillingAddress(addressNumber, editedAddress)
        })

        await test.step(`Remove the billing address`, async () => {
            console.log(`[STEP] Remove the billing address`)
            await accountPage.removeBillingAddress(addressNumber)
        })
    })
})
