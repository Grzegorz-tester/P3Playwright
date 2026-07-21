import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    // VERIFIED — confirmed on /account and /account/address-book after
    // successfully logging in with grzegorz.hajduk@velstar.co.uk / Testing123!
    // NOTE: dashboard/addressBook/orders buttons all share the same
    // underlying testid ("account-menu__item") and are only distinguished
    // by href — see objects.ts.
    readonly dashboardMenuButton = InsinkeratorObjects.AccountPage.dashboardMenuButton(this.page);
    readonly addressBookMenuButton = InsinkeratorObjects.AccountPage.addressBookMenuButton(this.page);
    readonly ordersMenuButton = InsinkeratorObjects.AccountPage.ordersMenuButton(this.page);
    readonly addDeliveryAddressButton = InsinkeratorObjects.AccountPage.addDeliveryAddressButton(this.page);

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
