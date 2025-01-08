import {expect, Locator, Page} from '@playwright/test'
import { AccountPage } from '../../carbon/pages/AccountPage'

export class KooltechAccountPage extends AccountPage{
    readonly page: Page
    readonly dashboardMenuButton: Locator
    readonly addressBookMenuButton: Locator
    readonly addDeliveryAddressButton: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.dashboardMenuButton = page.locator('[href="/account"][data-testid="account-menu-item"]')
        this.addressBookMenuButton = page.locator('[href="/account/address-book"][data-testid="account-menu-item"]')
        this.addDeliveryAddressButton = page.getByTestId('header__right-link').first()
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 20000 })
        await this.dashboardMenuButton.click()
        await this.addressBookMenuButton.click()
        await expect(this.addDeliveryAddressButton).toHaveCount(1)
        await this.ordersButton.click()
    }
}