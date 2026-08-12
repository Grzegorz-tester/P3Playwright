import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { testConfig } from '@utils/testConfig'

/**
 * MY DOVE ACCOUNT - MAKE A PAYMENT
 * ==================================
 * Automates cases 152-154 from the "My DOVE Account" suite
 * (JTDOVE-2026-08-11.json). VERIFIED live (staging, 2026-08-11).
 *
 * NOTE (case 153): this test account's real outstanding balance is
 * effectively £0 (every invoice already "Paid"), so a genuinely valid,
 * acceptable payment amount can't be demonstrated here without
 * fabricating account data - the rejection path (amount greater than
 * balance) IS fully verified instead, which is the behaviour this
 * account can actually exercise.
 */
test.use({ storageState: testConfig.getAuthFile() })

test.describe('My DOVE Account - Make a Payment', () => {

    // Case 152: Open Make a Payment page.
    test('Open Make a Payment page (case 152)', async ({ makeAPaymentPage }) => {
        await test.step(`Navigate to the Make a Payment page`, async () => {
            console.log(`[STEP] Navigate to the Make a Payment page`)
            await makeAPaymentPage.navigateToMakeAPaymentPage()
        })

        await test.step(`Verify Online Payment and BACS sections are visible with the default billing address`, async () => {
            console.log(`[STEP] Verify Online Payment and BACS sections are visible with the default billing address`)
            await makeAPaymentPage.validateMakeAPaymentPageLoaded()
            await makeAPaymentPage.verifyDefaultBillingAddressDisplayed()
        })
    })

    // Case 153: Validate and submit online payment.
    test('Validate and submit online payment (case 153)', async ({ makeAPaymentPage }) => {
        await test.step(`Navigate to the Make a Payment page`, async () => {
            console.log(`[STEP] Navigate to the Make a Payment page`)
            await makeAPaymentPage.navigateToMakeAPaymentPage()
        })

        await test.step(`Verify Make a Payment is disabled with an empty amount`, async () => {
            console.log(`[STEP] Verify Make a Payment is disabled with an empty amount`)
            await makeAPaymentPage.verifyMakePaymentDisabledForEmptyAmount()
        })

        await test.step(`Enter an amount greater than the account's real outstanding balance and verify it is rejected`, async () => {
            console.log(`[STEP] Enter an amount greater than the account's real outstanding balance and verify it is rejected`)
            await makeAPaymentPage.enterAmountAndAttemptPayment('999999')
            await makeAPaymentPage.verifyAmountExceedingBalanceRejected()
        })
    })

    // Case 154: Display BACS payment details.
    test('Display BACS payment details (case 154)', async ({ makeAPaymentPage }) => {
        await test.step(`Navigate to the Make a Payment page`, async () => {
            console.log(`[STEP] Navigate to the Make a Payment page`)
            await makeAPaymentPage.navigateToMakeAPaymentPage()
        })

        await test.step(`Verify BACS details are displayed, with Payment Reference indicating the account number`, async () => {
            console.log(`[STEP] Verify BACS details are displayed, with Payment Reference indicating the account number`)
            await makeAPaymentPage.verifyBACSDetailsDisplayed()
            await expect(makeAPaymentPage.page.getByTestId('account')).toContainText('(Your Account Number)')
        })
    })
})
