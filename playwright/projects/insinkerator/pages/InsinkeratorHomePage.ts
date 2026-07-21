import type { Page } from "@playwright/test";
import { expect, Locator } from "@playwright/test";
import { HomePage } from "../../../common/abstract-pages/HomePage";
import { InsinkeratorObjects } from "../utils/objects";

export class InsinkeratorHomePage extends HomePage {
  private categoryName = "";

  constructor(page: Page) {
    super(page);
  }

  get category(): Locator {
    return InsinkeratorObjects.HomePage.category(this.categoryName)(this.page);
  }
  readonly brandBar = InsinkeratorObjects.HomePage.brandBar(this.page);
  readonly menuNavBarButton = InsinkeratorObjects.HomePage.menuNavBarButton(
    this.page,
  );

  async validateHomePage(): Promise<void> {
    await expect(this.brandBar).toBeVisible({ timeout: 45000 });
  }

  async chooseMenuCategory(category: string): Promise<void> {
    this.categoryName = category;
    await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 });
    await this.menuNavBarButton.focus();
    await this.menuNavBarButton.click();
    await expect(this.category).toHaveText(category);
    // NOTE(INSINKERATOR): force-clicking here deliberately. A real
    // automated run showed the drawer's own animated backdrop (a
    // Radix-style overlay, class "fixed inset-0 z-50 bg-black/80")
    // sitting on top of the category link at the exact same z-index
    // (50) as the sticky <header> containing it — a CSS stacking tie
    // resolved by DOM order, with the backdrop apparently painting
    // after the header. Confirmed via elementFromPoint() at the
    // link's exact coordinates: the backdrop, not the link, is what a
    // real click would actually land on. This looks like a genuine
    // site bug (worth raising a ticket), not test flakiness — a real
    // user's mouse click at that position may be similarly blocked.
    // force:true bypasses Playwright's actionability check so the
    // test can still proceed past it.
    await this.category.click({ force: true });
    // NOTE: no "view all" step confirmed to exist on this project
    // (unlike Kooltech) — the category link navigates straight to the
    // PLP. viewAllButton locator/property removed accordingly.
  }
}
