import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { InsinkeratorEuObjects } from '../utils/objects'

export class InsinkeratorEuHomePage extends HomePage {

    private categoryName = '';

    constructor(page: Page) {
        super(page);
    }

    get category(): Locator {
        return InsinkeratorEuObjects.HomePage.category(this.categoryName)(this.page);
    }
    readonly brandBar = InsinkeratorEuObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = InsinkeratorEuObjects.HomePage.menuNavBarButton(this.page);
    readonly newsletterForm = InsinkeratorEuObjects.Footer.newsletterForm(this.page);
    readonly newsletterTitle = InsinkeratorEuObjects.Footer.newsletterTitle(this.page);
    readonly newsletterEmailInput = InsinkeratorEuObjects.Footer.newsletterEmailInput(this.page);
    readonly newsletterSubmitButton = InsinkeratorEuObjects.Footer.newsletterSubmitButton(this.page);
    readonly newsletterPrivacyPolicyLink = InsinkeratorEuObjects.Footer.newsletterPrivacyPolicyLink(this.page);
    readonly newsletterAlert = InsinkeratorEuObjects.Footer.newsletterAlert(this.page);
    readonly sitemapLink = InsinkeratorEuObjects.Footer.sitemapLink(this.page);
    readonly cookieBannerAcceptButton = InsinkeratorEuObjects.Footer.cookieBannerAcceptButton(this.page);
    readonly searchDrawerOpenButton = InsinkeratorEuObjects.SearchDrawer.openButton(this.page);
    readonly searchDrawer = InsinkeratorEuObjects.SearchDrawer.drawer(this.page);
    readonly searchDrawerInput = InsinkeratorEuObjects.SearchDrawer.searchInput(this.page);
    readonly searchDrawerRecommendedProducts = InsinkeratorEuObjects.SearchDrawer.recommendedProducts(this.page);
    readonly searchDrawerHitProductNames = InsinkeratorEuObjects.SearchDrawer.hitProductNames(this.page);
    readonly searchDrawerNoResultsMessage = InsinkeratorEuObjects.SearchDrawer.noResultsMessage(this.page);
    readonly searchDrawerCloseButton = InsinkeratorEuObjects.SearchDrawer.closeButton(this.page);
    readonly accessoriesLandingShopButton = InsinkeratorEuObjects.AccessoriesLandingPage.shopButton(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    // CONFIRMED — a real automated run showed the OneTrust cookie-consent
    // banner intercepting this click (the first interaction in this whole
    // project to touch anything at the bottom of the page, where that
    // banner renders). Dismissing it first only if actually present avoids
    // a hard dependency on it — some sessions may have already dismissed
    // it earlier. waitFor({state:'visible'}) genuinely polls, unlike
    // isVisible() — see the identical gotcha already documented on
    // InsinkeratorEuCheckoutPage.chooseDeliveryAddress().
    async clickSitemapLink(): Promise<void> {
        const bannerPresent = await this.cookieBannerAcceptButton
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false)
        if (bannerPresent) {
            await this.cookieBannerAcceptButton.click()
        }
        await this.sitemapLink.click()
    }

    async validateFooterNewsletterForm(): Promise<void> {
        await this.newsletterForm.scrollIntoViewIfNeeded()
        await expect(this.newsletterTitle).toBeVisible()
        await expect(this.newsletterEmailInput).toBeVisible()
        await expect(this.newsletterSubmitButton).toBeVisible()
        await expect(this.newsletterPrivacyPolicyLink).toBeVisible()
    }

    private async getNewsletterEmailValidity(): Promise<{ valid: boolean, valueMissing: boolean, typeMismatch: boolean }> {
        return this.newsletterEmailInput.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing,
            typeMismatch: el.validity.typeMismatch
        }))
    }

    // Native HTML5 validity state (see objects.ts note) — there is no
    // rendered client-side error message to assert on instead.
    async assertEmptyNewsletterEmailIsRejected(): Promise<void> {
        await this.newsletterForm.scrollIntoViewIfNeeded()
        await this.newsletterEmailInput.fill('')
        await this.newsletterSubmitButton.click()
        const validity = await this.getNewsletterEmailValidity()
        expect(validity.valid).toBe(false)
        expect(validity.valueMissing).toBe(true)
        await expect(this.newsletterAlert).toHaveCount(0)
    }

    async assertMalformedNewsletterEmailIsRejected(email: string): Promise<void> {
        await this.newsletterEmailInput.fill(email)
        await this.newsletterSubmitButton.click()
        const validity = await this.getNewsletterEmailValidity()
        expect(validity.valid).toBe(false)
        expect(validity.typeMismatch).toBe(true)
        await expect(this.newsletterAlert).toHaveCount(0)
    }

    // CORRECTED (staging, 2026-07-31): the backend field-mapping bug
    // documented on newsletterAlert in objects.ts is fixed — asserts the
    // real success confirmation now instead of the earlier CRM error.
    async assertValidNewsletterEmailReturnsResponse(email: string): Promise<void> {
        await this.newsletterEmailInput.fill(email)
        await this.newsletterSubmitButton.click()
        await expect(this.newsletterAlert).toContainText('Thank you for subscribing', { timeout: 15000 })
    }

    async openSearchDrawer(): Promise<void> {
        await expect(this.searchDrawerOpenButton).toBeVisible({ timeout: 30000 })
        await this.searchDrawerOpenButton.click()
        await expect(this.searchDrawer).toBeVisible({ timeout: 15000 })
    }

    async validateSearchDrawerDefaultState(): Promise<void> {
        await expect(this.searchDrawerInput).toBeVisible()
        await expect(this.searchDrawerInput).toBeEmpty()
        await expect(this.searchDrawerRecommendedProducts).toBeVisible()
    }

    // NOT A HARD BUG — genuinely functional (confirmed manually: closing
    // the drawer works fine for a real user) but confirmed FLAKY in
    // automation specifically. A plain Playwright .click() (even with
    // .click({ delay })) consistently never closes it — a real
    // mousedown-PAUSE-mouseup gesture (~150ms hold) is required instead,
    // presumably because whatever listener this component uses
    // distinguishes a deliberate press from a fast synthetic click. Even
    // with that gesture, a live run showed it succeed several times and
    // then fail in the exact same browser tab under identical conditions
    // — a real intermittent race in the component, not a timing constant
    // to tune further. Retrying the gesture rides out that flakiness
    // rather than chasing a deterministic fix that doesn't exist.
    async closeSearchDrawer(): Promise<void> {
        await expect(async () => {
            // Settle wait for the drawer's own slide-in transition
            // (data-[state=open]:duration-500) before each attempt.
            await this.page.waitForTimeout(600)
            const box = await this.searchDrawerCloseButton.boundingBox()
            if (!box) {
                throw new Error('Search drawer Close button has no bounding box — is the drawer open?')
            }
            await this.page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
            await this.page.mouse.down()
            await this.page.waitForTimeout(150)
            await this.page.mouse.up()
            await expect(this.searchDrawer).toBeHidden({ timeout: 3000 })
        }).toPass({ timeout: 20000 })
    }

    async searchInDrawer(query: string): Promise<void> {
        await this.searchDrawerInput.fill(query)
    }

    // NOTE(INSINKERATOR): a real run showed a single immediate read of the
    // hit list can catch a brief transitional render (an unrelated name
    // with no connection to the query) before Algolia's debounced results
    // for THIS keystroke land — retrying via toPass rides out that window
    // instead of asserting on a state that's still settling.
    async validateSearchDrawerResultsMatch(query: string): Promise<void> {
        await expect(this.searchDrawerHitProductNames.first()).toBeVisible({ timeout: 15000 })
        await expect(async () => {
            const names = await this.searchDrawerHitProductNames.allTextContents()
            expect(names.length).toBeGreaterThan(0)
            for (const name of names) {
                expect(name.toLowerCase()).toContain(query.toLowerCase())
            }
        }).toPass({ timeout: 10000 })
    }

    async validateSearchDrawerNoResults(query: string): Promise<void> {
        await this.searchInDrawer(query)
        await expect(this.searchDrawerNoResultsMessage).toBeVisible({ timeout: 15000 })
    }

    async submitSearchFromDrawer(query: string): Promise<void> {
        await this.searchDrawerInput.press('Enter')
        await expect(this.page).toHaveURL(`/search?q=${encodeURIComponent(query)}`, { timeout: 30000 })
    }

    // CORRECTED (staging, 2026-07-31): clicking a link inside the header
    // nav drawer was earlier confirmed completely broken (reproduced for
    // both "Shop" and "Our Accessories" via every method tried — plain
    // click, force click, native DOM click, keyboard Enter). Retested live
    // and it now works correctly. "Our Accessories" has children, so
    // clicking it expands the drawer into a tier-2 view with its own
    // "View All" link (-> /our-accessories) rather than navigating on the
    // first click — see viewAllLink in objects.ts. This method now
    // performs the real click-through flow instead of the earlier
    // href-check-then-page.goto() workaround.
    async navigateToAccessoriesLandingPage(): Promise<void> {
        await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 })
        await this.menuNavBarButton.click()
        const accessoriesLink = InsinkeratorEuObjects.HomePage.category('Our Accessories')(this.page)
        await expect(accessoriesLink).toBeVisible({ timeout: 15000 })
        await accessoriesLink.click()
        const viewAllLink = InsinkeratorEuObjects.HomePage.viewAllLink('our-accessories')(this.page)
        await expect(viewAllLink).toBeVisible({ timeout: 15000 })
        await viewAllLink.click()
        await expect(this.page).toHaveURL(/\/our-accessories/, { timeout: 30000 })
    }

    // The /our-accessories landing page's own "Shop" CTA (-> /category/accessories),
    // distinct from the header's "Shop" nav link (-> /category/shop).
    // VERIFIED separately working (unlike navigateToAccessoriesLandingPage
    // above) — this button is a plain page element, not inside the buggy
    // nav-drawer Sheet/Dialog, and a real automated run confirmed a normal
    // click reaches /category/accessories correctly.
    async clickShopOnAccessoriesLandingPage(): Promise<void> {
        await expect(this.accessoriesLandingShopButton).toBeVisible({ timeout: 30000 })
        await this.accessoriesLandingShopButton.click()
        await expect(this.page).toHaveURL(/\/category\/accessories/, { timeout: 30000 })
    }

    // CORRECTED (staging, 2026-07-31): this used to force-click the
    // category link because the drawer's own backdrop overlay shared the
    // header's z-index and intercepted real clicks (confirmed via
    // elementFromPoint at the time). Retested live with a genuine
    // (non-forced) click — the backdrop no longer intercepts it, and the
    // click correctly navigates. Only safe for LEAF categories (no
    // children) such as "Shop" used by existing callers — a category with
    // children instead expands to a tier-2 "View All" view, as
    // navigateToAccessoriesLandingPage() above now handles.
    async chooseMenuCategory(category: string): Promise<void> {
        this.categoryName = category
        await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 })
        await this.menuNavBarButton.focus()
        await this.menuNavBarButton.click()
        await expect(this.category).toHaveText(category)
        await this.category.click()
        await expect(this.page).not.toHaveURL('/', { timeout: 30000 })
    }
}
