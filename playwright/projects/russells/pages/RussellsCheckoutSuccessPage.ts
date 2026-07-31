import { expect, Page } from '@playwright/test'
import { AbstractCheckoutSuccessPage } from '../../../common/abstract-pages/CheckoutSuccessPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsCheckoutSuccessPage extends AbstractCheckoutSuccessPage {

    constructor(page: Page) {
        super(page);
    }

    readonly orderReference = RussellsObjects.CheckoutSuccessPage.orderReference(this.page);
    readonly orderConfirmationEmail = RussellsObjects.CheckoutSuccessPage.orderConfirmationEmail(this.page);

    // VERIFIED live (staging, 2026-07-31) through a real completed order.
    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.page).toHaveURL(/\/checkout\/thank-you$/, { timeout: 30000 })
        await expect(this.orderReference).toContainText('Order No.', { timeout: 20000 })
        await expect(this.orderConfirmationEmail).toContainText(username)
    }
}
