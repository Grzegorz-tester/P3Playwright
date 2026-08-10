import { expect, Page } from '@playwright/test'
import { ResetPasswordPage } from '../../../common/abstract-pages/ResetPasswordPage'
import { InsinkeratorEuObjects } from '../utils/objects'

export class InsinkeratorEuResetPasswordPage extends ResetPasswordPage {

    constructor(page: Page) {
        super(page);
    }

    readonly emailInput = InsinkeratorEuObjects.ResetPasswordPage.emailInput(this.page);
    readonly submitButton = InsinkeratorEuObjects.ResetPasswordPage.submitButton(this.page);
    readonly successMessage = InsinkeratorEuObjects.ResetPasswordPage.successMessage(this.page);

    // VERIFIED — confirmed live (staging, 2026-07-22): submitting a real
    // account's email shows this static success message. NOT cross-checked
    // against a nonexistent email, so it's unconfirmed whether the same
    // message would show either way (no email-enumeration leak) or only
    // for real accounts.
    async requestPasswordReset(email: string): Promise<void> {
        await this.emailInput.fill(email)
        await this.submitButton.click()
        await expect(this.successMessage).toBeVisible({ timeout: 15000 })
    }
}
