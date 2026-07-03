import { expect, Page } from '@playwright/test'
import { AbstractCheckoutSuccessPage } from '../../../common/abstract-pages/CheckoutSuccessPage'
import { KooltechObjects } from '../utils/objects'

export class KooltechCheckoutSuccessPage extends AbstractCheckoutSuccessPage {

    constructor(page: Page) {
        super(page);
    }

    readonly thankYouHeader = KooltechObjects.CheckoutSuccessPage.thankYouHeader(this.page);
    readonly orderDetails = KooltechObjects.CheckoutSuccessPage.orderDetails(this.page);

    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.thankYouHeader).toHaveText('Thank you for your order', { timeout: 80000 })
        await expect(this.orderDetails).toContainText(username)
    }
}
