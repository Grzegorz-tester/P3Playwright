import { expect, Page } from "@playwright/test";
import { LoginPage } from "../../../common/abstract-pages/LoginPage";
import { InsinkeratorObjects } from "../utils/objects";

export class InsinkeratorLoginPage extends LoginPage {
  constructor(page: Page) {
    super(page);
  }

  readonly loginHeader = InsinkeratorObjects.LoginPage.loginHeader(this.page);
  readonly emailInput = InsinkeratorObjects.LoginPage.emailInput(this.page);
  readonly passwordInput = InsinkeratorObjects.LoginPage.passwordInput(
    this.page,
  );
  readonly signInButton = InsinkeratorObjects.LoginPage.signInButton(this.page);
  readonly welcomeUserTopbarDiv =
    InsinkeratorObjects.LoginPage.welcomeUserTopbarDiv(this.page);

  async navigateToLoginPage(): Promise<void> {
    // VERIFIED: /login is the correct path (confirmed by browsing).
    await this.page.goto("/login", { timeout: 40000 });
    await expect(this.loginHeader).toBeVisible({ timeout: 60000 });
  }

  async loginToApplication(email: string, password: string): Promise<void> {
    await expect(this.loginHeader).toBeVisible();

    // NOTE(INSINKERATOR): a real automated run (and manual re-testing)
    // showed the login form behaving unreliably — sometimes the typed
    // value doesn't "stick" (the field reads back empty, or on a
    // repeated attempt shows the OLD value concatenated with the new
    // one). Separately, login itself was observed to sometimes take
    // noticeably longer than expected to redirect after a valid
    // submit — most likely intermittent slowness/flakiness on the
    // staging auth backend rather than a permanently broken form (a
    // manual retest with confirmed-correct field values did
    // eventually succeed). This is NOT reliably fixed by switching
    // between fill() and pressSequentially() alone.
    //
    // Workaround for the field-value issue: fill, then READ BACK the
    // value to confirm it actually stuck before proceeding, retrying
    // a few times if not. The generous 60s timeout on the assertion
    // below is there to absorb normal backend slowness.
    await this.fillAndVerify(this.emailInput, email);
    await this.fillAndVerify(this.passwordInput, password);

    await this.signInButton.click();
    await expect(this.welcomeUserTopbarDiv).toBeVisible({ timeout: 60000 });
  }

  private async fillAndVerify(
    locator: ReturnType<Page["locator"]>,
    value: string,
    maxAttempts: number = 4,
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await locator.fill(value);
      const actual = await locator.inputValue();
      if (actual === value) {
        return;
      }
      // Value didn't stick (empty, partial, or doubled-up from a
      // stale element) — wait briefly for any remount to settle,
      // then retry.
      await this.page.waitForTimeout(500);
    }
    throw new Error(
      `Field value did not stick after ${maxAttempts} attempts (expected "${value}", got "${await locator.inputValue()}"). This likely indicates the login form is remounting — see fillAndVerify note in InsinkeratorLoginPage.ts.`,
    );
  }
}
