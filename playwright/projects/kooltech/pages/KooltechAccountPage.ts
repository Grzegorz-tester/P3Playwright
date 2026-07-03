import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { KooltechObjects } from '../utils/objects'

export class KooltechAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly dashboardMenuButton = KooltechObjects.AccountPage.dashboardMenuButton(this.page);
    readonly addressBookMenuButton = KooltechObjects.AccountPage.addressBookMenuButton(this.page);
    readonly ordersMenuButton = KooltechObjects.AccountPage.ordersMenuButton(this.page);
    readonly addDeliveryAddressButton = KooltechObjects.AccountPage.addDeliveryAddressButton(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
        await this.dashboardMenuButton.click()
        await this.addressBookMenuButton.click()
        await expect(this.addDeliveryAddressButton).toHaveCount(1)
        await this.ordersMenuButton.click()
    }
}
