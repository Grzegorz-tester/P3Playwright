import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { MipaObjects } from '../utils/objects'

export class MipaAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly dashboardMenuButton = MipaObjects.AccountPage.dashboardMenuButton(this.page);
    readonly addressBookMenuButton = MipaObjects.AccountPage.addressBookMenuButton(this.page);
    readonly ordersMenuButton = MipaObjects.AccountPage.ordersMenuButton(this.page);
    readonly welcomeMessage = MipaObjects.AccountPage.welcomeMessage(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.welcomeMessage).toBeVisible({ timeout: 60000 })
        await this.dashboardMenuButton.click()
        await this.addressBookMenuButton.click()
        await this.ordersMenuButton.click()
    }
}
