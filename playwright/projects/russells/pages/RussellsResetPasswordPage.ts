import { expect, Page } from '@playwright/test'
import { ResetPasswordPage } from '../../../common/abstract-pages/ResetPasswordPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsResetPasswordPage extends ResetPasswordPage {

    constructor(page: Page) {
        super(page);
    }

    readonly emailInput = RussellsObjects.ResetPasswordPage.emailInput(this.page);
    readonly submitButton = RussellsObjects.ResetPasswordPage.submitButton(this.page);
    readonly successMessage = RussellsObjects.ResetPasswordPage.successMessage(this.page);

    // VERIFIED live (staging, 2026-07-31): submitting a real account's
    // email shows this success message.
    async requestPasswordReset(email: string): Promise<void> {
        await this.emailInput.fill(email)
        await this.submitButton.click()
        await expect(this.successMessage).toBeVisible({ timeout: 15000 })
    }
}
