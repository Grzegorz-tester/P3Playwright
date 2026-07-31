import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly myDetailsForm = RussellsObjects.AccountPage.myDetailsForm(this.page);
    readonly resetPasswordToggleButton = RussellsObjects.AccountPage.resetPasswordToggleButton(this.page);
    readonly changePasswordForm = RussellsObjects.AccountPage.changePasswordForm(this.page);
    readonly existingPasswordInput = RussellsObjects.AccountPage.existingPasswordInput(this.page);
    readonly newPasswordInput = RussellsObjects.AccountPage.newPasswordInput(this.page);
    readonly repeatNewPasswordInput = RussellsObjects.AccountPage.repeatNewPasswordInput(this.page);
    readonly changePasswordSaveButton = RussellsObjects.AccountPage.changePasswordSaveButton(this.page);
    readonly changePasswordAlert = RussellsObjects.AccountPage.changePasswordAlert(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 60000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 60000 })
    }

    async navigateToProfilePage(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 45000 })
        await expect(this.myDetailsForm.or(this.changePasswordForm)).toBeVisible({ timeout: 35000 })
    }

    // VERIFIED live (staging, 2026-07-31, then reverted): the "Reset
    // Password" link on the My Details form swaps the same card over to
    // this Change Password form in place. A successful change shows
    // "Password successfully updated".
    async changePassword(existingPassword: string, newPassword: string): Promise<void> {
        if (await this.myDetailsForm.isVisible()) {
            await this.resetPasswordToggleButton.click()
            await expect(this.changePasswordForm).toBeVisible({ timeout: 15000 })
        }
        await this.existingPasswordInput.fill(existingPassword)
        await this.newPasswordInput.fill(newPassword)
        await this.repeatNewPasswordInput.fill(newPassword)
        await this.changePasswordSaveButton.click()
        await expect(this.changePasswordAlert).toHaveText('Password successfully updated', { timeout: 15000 })
    }
}
