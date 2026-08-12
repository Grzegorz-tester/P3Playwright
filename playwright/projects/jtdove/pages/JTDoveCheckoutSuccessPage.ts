import { expect, Page } from '@playwright/test'
import { AbstractCheckoutSuccessPage } from '../../../common/abstract-pages/CheckoutSuccessPage'
import { JTDoveObjects } from '../utils/objects'

export class JTDoveCheckoutSuccessPage extends AbstractCheckoutSuccessPage {

    constructor(page: Page) {
        super(page);
    }

    readonly orderReference = JTDoveObjects.CheckoutSuccessPage.orderReference(this.page);
    readonly orderConfirmationEmail = JTDoveObjects.CheckoutSuccessPage.orderConfirmationEmail(this.page);
    readonly orderDeliveryNote = JTDoveObjects.CheckoutSuccessPage.orderDeliveryNote(this.page);
    readonly orderLines = JTDoveObjects.CheckoutSuccessPage.orderLines(this.page);
    readonly orderLinesContainer = JTDoveObjects.CheckoutSuccessPage.orderLinesContainer(this.page);
    readonly paymentDetails = JTDoveObjects.CheckoutSuccessPage.paymentDetails(this.page);

    // VERIFIED live (staging, 2026-08-10) through a real completed order.
    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.page).toHaveURL(/\/checkout\/thank-you$/, { timeout: 30000 })
        await expect(this.orderReference).toContainText('Order No.', { timeout: 20000 })
        await expect(this.orderConfirmationEmail).toContainText(username)
    }

    async getOrderReferenceNumber(): Promise<string> {
        const text = (await this.orderReference.textContent()) ?? ''
        return text.replace('Order No.', '').trim()
    }

    // VERIFIED live (staging, 2026-08-10) with a real completed mixed
    // basket: lines are grouped under a "Click & Collect" heading
    // (showing "Collect at <branch name>") and/or a "Courier" heading
    // (showing the delivery address and the delivery notes entered at
    // checkout) - not a flat list. Callers pass the substrings they care
    // about rather than an exact structural match, since the grouping
    // headings/order aren't testid'd (TODO: JTD-325 - text on
    // orders-details__order-lines, no per-group testid available).
    async verifyOrderLinesContainText(...expectedSubstrings: string[]): Promise<void> {
        for (const expected of expectedSubstrings) {
            await expect(this.orderLinesContainer).toContainText(expected)
        }
    }

    async verifyOrderDeliveryNote(expectedNote: string): Promise<void> {
        await expect(this.orderDeliveryNote).toContainText(expectedNote)
    }
}
