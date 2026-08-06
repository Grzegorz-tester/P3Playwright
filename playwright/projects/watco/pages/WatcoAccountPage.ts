import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { WatcoObjects } from '../utils/objects'

export class WatcoAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly accountOverviewMarker = WatcoObjects.AccountPage.accountOverviewMarker(this.page);
    readonly vatNumberInput = WatcoObjects.AccountPage.vatNumberInput(this.page);
    readonly saveDetailsButton = WatcoObjects.AccountPage.saveDetailsButton(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 30000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.accountOverviewMarker).toBeVisible({ timeout: 30000 })
    }

    async navigateToProfile(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 30000 })
        await expect(this.vatNumberInput).toBeVisible({ timeout: 15000 })
    }

    async getSavedVatNumber(): Promise<string> {
        return await this.vatNumberInput.inputValue()
    }
}
