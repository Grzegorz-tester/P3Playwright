import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

// VERIFIED live (staging, 2026-08-11): /account/profile - the "My
// Details" form, pre-filled with the logged-in user's data.
export class JTDoveProfilePage {

    readonly page: Page;
    readonly emailInput: Locator;
    readonly titleInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly contactNumberInput: Locator;
    readonly saveChangesButton: Locator;
    readonly resetPasswordButton: Locator;
    readonly changePasswordHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = JTDoveObjects.AccountProfilePage.emailInput(this.page);
        this.titleInput = JTDoveObjects.AccountProfilePage.titleInput(this.page);
        this.firstNameInput = JTDoveObjects.AccountProfilePage.firstNameInput(this.page);
        this.lastNameInput = JTDoveObjects.AccountProfilePage.lastNameInput(this.page);
        this.contactNumberInput = JTDoveObjects.AccountProfilePage.contactNumberInput(this.page);
        this.saveChangesButton = JTDoveObjects.AccountProfilePage.saveChangesButton(this.page);
        this.resetPasswordButton = JTDoveObjects.AccountProfilePage.resetPasswordButton(this.page);
        this.changePasswordHeading = JTDoveObjects.AccountProfilePage.changePasswordHeading(this.page);
    }

    async navigateToProfilePage(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 30000 })
    }

    // CONFIRMED live (staging, 2026-08-11): the form can render visually
    // before the user's actual profile data has finished loading into it
    // (a separate, slightly-delayed fetch from whatever populates the
    // email field instantly) - a fill() landing in that window can be
    // silently overwritten a moment later when the real data arrives.
    // Waiting for firstNameInput to be genuinely non-empty is a more
    // reliable "actually ready" signal than just checking visibility.
    async validateProfilePageLoaded(): Promise<void> {
        await expect(this.emailInput).toBeVisible({ timeout: 20000 })
        await expect(async () => {
            expect(await this.firstNameInput.inputValue()).not.toBe('')
        }).toPass({ timeout: 15000 })
    }

    // CORRECTED (JTD-325, staging, 2026-08-13): originally documented as
    // "toHaveValue polls it out", but that's not what's actually
    // happening. Confirmed directly by capturing the save request: the
    // POST returns 200 immediately, yet a reload straight after can still
    // render the OLD value for roughly a second afterwards (a server-side
    // cache/propagation delay, not a client hydration flash) - and once
    // that stale HTML has loaded, the input's value is fixed for the rest
    // of that page load, so polling the SAME loaded DOM can never resolve
    // it no matter how long the timeout is. Only a fresh navigation gets
    // the updated render once the delay has passed, so this retries the
    // reload itself, not just the assertion.
    async verifyFirstNameValue(expected: string): Promise<void> {
        await expect(async () => {
            await this.navigateToProfilePage()
            expect(await this.firstNameInput.inputValue()).toBe(expected)
        }).toPass({ timeout: 20000 })
    }

    // CORRECTED (JTD-325, staging, 2026-08-13): previously logged here as
    // a confirmed backend bug (telephone POSTed but not persisted). That
    // diagnosis was wrong on two counts: (1) updateContactNumberAndSave
    // used a plain fill() with no retry, hitting the same late-hydration
    // overwrite race fillFirstNameStable already guards against (fixed via
    // fillContactNumberStable); (2) the SAME reload-propagation delay
    // documented on verifyFirstNameValue applies here too - see that
    // method's comment. No backend fix needed.
    async verifyContactNumberValue(expected: string): Promise<void> {
        await expect(async () => {
            await this.navigateToProfilePage()
            expect(await this.contactNumberInput.inputValue()).toBe(expected)
        }).toPass({ timeout: 20000 })
    }

    async getFieldValues(): Promise<{ email: string, firstName: string, lastName: string, contactNumber: string }> {
        return {
            email: await this.emailInput.inputValue(),
            firstName: await this.firstNameInput.inputValue(),
            lastName: await this.lastNameInput.inputValue(),
            contactNumber: await this.contactNumberInput.inputValue(),
        }
    }

    // CONFIRMED live (staging, 2026-08-11): the save itself is an async
    // request - navigating away immediately after clicking can abort it
    // before it persists, silently losing the change. Two more-principled
    // signals were tried and ruled out here: the button going back to
    // disabled flips near-instantly (an optimistic UI update, well before
    // the request necessarily completes), and `networkidle` never
    // resolves at all on this storefront (some persistent background
    // connection - analytics/chat widget - keeps the network busy
    // indefinitely, a documented Playwright gotcha with networkidle on
    // real sites). A short fixed wait is the pragmatic fallback,
    // confirmed sufficient live (a 2s pause reliably showed the saved
    // value survive a fresh reload).
    async saveChanges(): Promise<void> {
        await this.saveChangesButton.click()
        await expect(this.saveChangesButton).toBeDisabled({ timeout: 15000 })
        await this.page.waitForTimeout(2500)
    }

    async updateContactNumberAndSave(contactNumber: string): Promise<void> {
        await this.fillContactNumberStable(contactNumber)
        await this.saveChanges()
    }

    async clearFirstName(): Promise<void> {
        await this.firstNameInput.fill('')
    }

    // Same late-hydration overwrite race as fillFirstNameStable - retry
    // until the fill verifiably sticks before saving.
    async fillContactNumberStable(value: string): Promise<void> {
        await expect(async () => {
            await this.contactNumberInput.fill(value)
            await this.page.waitForTimeout(300)
            expect(await this.contactNumberInput.inputValue()).toBe(value)
        }).toPass({ timeout: 10000 })
    }

    // CONFIRMED live (staging, 2026-08-11): a plain fill() right after
    // validateProfilePageLoaded() can still be reverted a moment later
    // by a late hydration overwrite (the same class of race documented
    // on validateProfilePageLoaded, just with a narrower window) -
    // symptom is Save Changes never leaving "disabled" because the
    // input silently reverted to whatever's actually persisted. Retrying
    // the fill until it verifiably sticks avoids fighting that race.
    async fillFirstNameStable(value: string): Promise<void> {
        await expect(async () => {
            await this.firstNameInput.fill(value)
            await this.page.waitForTimeout(300)
            expect(await this.firstNameInput.inputValue()).toBe(value)
        }).toPass({ timeout: 10000 })
    }

    async verifySaveChangesDisabled(): Promise<void> {
        await expect(this.saveChangesButton).toBeDisabled({ timeout: 10000 })
    }

    async verifySaveChangesEnabled(): Promise<void> {
        await expect(this.saveChangesButton).toBeEnabled({ timeout: 10000 })
    }
}
