import { expect, Page } from '@playwright/test'
import { LoginPage } from '../../../common/abstract-pages/LoginPage'
import { InsinkeratorEuObjects } from '../utils/objects'

export class InsinkeratorEuLoginPage extends LoginPage {

    constructor(page: Page) {
        super(page);
    }

    readonly loginHeader = InsinkeratorEuObjects.LoginPage.loginHeader(this.page);
    readonly emailInput = InsinkeratorEuObjects.LoginPage.emailInput(this.page);
    readonly passwordInput = InsinkeratorEuObjects.LoginPage.passwordInput(this.page);
    readonly signInButton = InsinkeratorEuObjects.LoginPage.signInButton(this.page);
    readonly welcomeUserTopbarDiv = InsinkeratorEuObjects.LoginPage.welcomeUserTopbarDiv(this.page);
    readonly alertMessage = InsinkeratorEuObjects.LoginPage.alertMessage(this.page);
    readonly forgotPasswordLink = InsinkeratorEuObjects.LoginPage.forgotPasswordLink(this.page);
    readonly signOutLink = InsinkeratorEuObjects.LoginPage.signOutLink(this.page);

    async navigateToLoginPage(): Promise<void> {
        // VERIFIED: /login is the correct path (confirmed by browsing).
        await this.page.goto('/login', { timeout: 40000 })
        await expect(this.loginHeader).toBeVisible({ timeout: 60000 })
    }

    async loginToApplication(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()

        // NOTE(INSINKERATOR): a real automated run (and manual re-testing)
        // showed the login form behaving unreliably — sometimes the typed
        // value doesn't "stick" (the field reads back empty, or on a
        // repeated attempt shows the OLD value concatenated with the new
        // one), and the whole login silently fails without any visible
        // error. Suspected cause: this page likely renders a skeleton/
        // placeholder version of the form first, then remounts with the
        // real interactive form shortly after (common in Next.js apps) —
        // anything typed into the first-rendered instance is lost when
        // the real one replaces it, even though our locator (matched by
        // stable testid) transparently resolves to whichever instance
        // exists at call time. This is NOT reliably fixed by switching
        // between fill() and pressSequentially() alone — it reproduced
        // both ways during investigation.
        //
        // Workaround: fill, then READ BACK the value to confirm it
        // actually stuck before proceeding, retrying a few times if not.
        // This can't be fully eliminated without root-causing the
        // remount on the site's side, but it makes the test resilient to
        // it rather than silently proceeding with an empty/wrong field.
        await this.fillAndVerify(this.emailInput, email)
        await this.fillAndVerify(this.passwordInput, password)

        await this.signInButton.click()
        await expect(this.welcomeUserTopbarDiv).toBeVisible({ timeout: 60000 })
    }

    // VERIFIED — confirmed live (staging, 2026-07-22): a wrong password
    // shows this alert and stays on /login rather than redirecting.
    async assertLoginFailsWithInvalidCredentials(email: string, password: string): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.fillAndVerify(this.emailInput, email)
        await this.fillAndVerify(this.passwordInput, password)
        await this.signInButton.click()
        await expect(this.alertMessage).toContainText('Invalid credentials.', { timeout: 15000 })
        await expect(this.page).toHaveURL(/\/login$/)
    }

    // Native HTML5 validity state — there is no rendered client-side error
    // message for an empty submission, same pattern as the newsletter and
    // reset-password forms elsewhere in this project.
    async assertEmptySubmissionIsRejected(): Promise<void> {
        await expect(this.loginHeader).toBeVisible()
        await this.signInButton.click()
        const emailValidity = await this.emailInput.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing
        }))
        expect(emailValidity.valid).toBe(false)
        expect(emailValidity.valueMissing).toBe(true)
        await expect(this.alertMessage).toHaveCount(0)
    }

    async clickForgotPasswordLink(): Promise<void> {
        await this.forgotPasswordLink.click()
        await expect(this.page).toHaveURL(/\/reset-password$/, { timeout: 15000 })
    }

    async signOut(): Promise<void> {
        await this.signOutLink.click()
        await expect(this.welcomeUserTopbarDiv).toHaveCount(0, { timeout: 15000 })
    }

    private async fillAndVerify(locator: ReturnType<Page['locator']>, value: string, maxAttempts: number = 4): Promise<void> {
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await locator.fill(value)
            const actual = await locator.inputValue()
            if (actual === value) {
                return
            }
            // Value didn't stick (empty, partial, or doubled-up from a
            // stale element) — wait briefly for any remount to settle,
            // then retry.
            await this.page.waitForTimeout(500)
        }
        throw new Error(`Field value did not stick after ${maxAttempts} attempts (expected "${value}", got "${await locator.inputValue()}"). This likely indicates the login form is remounting — see fillAndVerify note in InsinkeratorEuLoginPage.ts.`)
    }
}
