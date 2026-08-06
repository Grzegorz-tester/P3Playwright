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

    // path defaults to the UK/IE English route — other markets pass their
    // own route (e.g. "/mon-compte/profil").
    async navigateToProfile(path: string = '/account/profile'): Promise<void> {
        await this.page.goto(path, { timeout: 30000 })
        await expect(this.vatNumberInput).toBeVisible({ timeout: 15000 })
    }

    async getSavedVatNumber(): Promise<string> {
        return await this.vatNumberInput.inputValue()
    }

    // CONFIRMED SITE BUG (staging, 2026-08-06): clicking saveDetailsButton
    // does NOT persist a VAT number edit — no request to any profile-save
    // endpoint fires at all (checked via page.on('request'), only
    // analytics/tracking POSTs appear), and the field silently reverts to
    // its old value on reload. The field updates locally so a same-page
    // assertion right after clicking would wrongly look like it worked —
    // this is exactly the kind of false-positive this repo's "known bugs
    // must fail" convention exists for. DO NOT use this method to reset a
    // shared test account's VAT; use the confirmed-working mechanism
    // instead — apply the desired VAT during checkout and place a real
    // order via payOnAccount(), which DOES persist (see
    // logged-in-checkout-vat-persistence.test.ts). Kept here, unused, as
    // the concrete evidence for this bug rather than deleting it quietly.
    async setSavedVatNumberViaProfileForm_KNOWN_BROKEN(vatNumber: string): Promise<void> {
        await this.vatNumberInput.fill(vatNumber)
        await this.saveDetailsButton.click()
    }
}
