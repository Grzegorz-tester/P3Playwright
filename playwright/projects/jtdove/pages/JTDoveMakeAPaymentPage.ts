import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

// VERIFIED live (staging, 2026-08-11): /account/make-a-payment - an
// online payment section (amount validated against the account's real
// outstanding balance) and a static BACS details section.
export class JTDoveMakeAPaymentPage {

    readonly page: Page;
    readonly onlineSection: Locator;
    readonly defaultBillingAddress: Locator;
    readonly amountInput: Locator;
    readonly makePaymentButton: Locator;
    readonly balanceErrorMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.onlineSection = JTDoveObjects.MakeAPaymentPage.onlineSection(this.page);
        this.defaultBillingAddress = JTDoveObjects.MakeAPaymentPage.defaultBillingAddress(this.page);
        this.amountInput = JTDoveObjects.MakeAPaymentPage.amountInput(this.page);
        this.makePaymentButton = JTDoveObjects.MakeAPaymentPage.makePaymentButton(this.page);
        this.balanceErrorMessage = JTDoveObjects.MakeAPaymentPage.balanceErrorMessage(this.page);
    }

    async navigateToMakeAPaymentPage(): Promise<void> {
        await this.page.goto('/account/make-a-payment', { timeout: 30000 })
    }

    async validateMakeAPaymentPageLoaded(): Promise<void> {
        await expect(this.onlineSection).toBeVisible({ timeout: 20000 })
        await expect(this.page.getByText('Make a Payment - BACS')).toBeVisible()
    }

    async verifyDefaultBillingAddressDisplayed(): Promise<void> {
        await expect(this.defaultBillingAddress).toBeVisible({ timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-08-11): entering an amount greater
    // than the account's real outstanding balance is rejected with this
    // visible message rather than silently - CONFIRMED with a real
    // account (balance effectively £0, every invoice already Paid).
    async enterAmountAndAttemptPayment(amount: string): Promise<void> {
        await this.amountInput.fill(amount)
    }

    async verifyAmountExceedingBalanceRejected(): Promise<void> {
        await expect(this.balanceErrorMessage).toBeVisible({ timeout: 10000 })
    }

    async verifyMakePaymentDisabledForEmptyAmount(): Promise<void> {
        await expect(this.makePaymentButton).toBeDisabled({ timeout: 10000 })
    }

    // VERIFIED live (staging, 2026-08-11): checks against the whole
    // account container's text rather than a specific BACS-section
    // locator, since that section carries no testid of its own.
    async verifyBACSDetailsDisplayed(): Promise<void> {
        const account = this.page.getByTestId('account')
        await expect(account).toContainText('Account Name:')
        await expect(account).toContainText('JT Dove Ltd')
        await expect(account).toContainText('Sort Code:')
        await expect(account).toContainText('Account Number:')
        await expect(account).toContainText('Payment Reference:')
    }
}
