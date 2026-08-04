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
    //
    // CONFIRMED live (prod, 2026-08-04): CookieYes' consent banner has
    // been observed to reappear on this page even after being dismissed
    // once earlier in the test - the same third-party initialization race
    // documented in RussellsSitemapPage.openCategory, not something this
    // storefront controls. Dismissed defensively here too, with the whole
    // fill-submit-verify sequence retried since a single attempt isn't
    // reliable against a race.
    async requestPasswordReset(email: string): Promise<void> {
        await expect(async () => {
            await RussellsObjects.Footer.cookieBannerAcceptButton(this.page).click({ timeout: 2000 }).catch(() => { })
            await this.emailInput.fill(email)
            await this.submitButton.click()
            await expect(this.successMessage).toBeVisible({ timeout: 15000 })
        }).toPass({ timeout: 45000 })
    }
}
