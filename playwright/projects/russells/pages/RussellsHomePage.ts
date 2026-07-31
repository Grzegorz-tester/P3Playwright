import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { RussellsObjects } from '../utils/objects'

export class RussellsHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly brandBar = RussellsObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = RussellsObjects.HomePage.menuNavBarButton(this.page);
    readonly newsletterForm = RussellsObjects.Footer.newsletterForm(this.page);
    readonly newsletterTitle = RussellsObjects.Footer.newsletterTitle(this.page);
    readonly newsletterEmailInput = RussellsObjects.Footer.newsletterEmailInput(this.page);
    readonly newsletterSubmitButton = RussellsObjects.Footer.newsletterSubmitButton(this.page);
    readonly newsletterAlert = RussellsObjects.Footer.newsletterAlert(this.page);
    readonly sitemapLink = RussellsObjects.Footer.sitemapLink(this.page);
    readonly cookieBannerAcceptButton = RussellsObjects.Footer.cookieBannerAcceptButton(this.page);
    readonly searchInput = this.page.getByTestId('algolia-autocomplete__input');
    readonly searchHitProductNames = this.page.getByTestId('algolia-autocomplete-hit-product__name');

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        const menuLink = RussellsObjects.HomePage.menuLinkFiltered(category)(this.page)
        await expect(menuLink).toBeVisible({ timeout: 30000 })
        await menuLink.click()
    }

    // From a category "hub" page (e.g. /general-parts-parts, reached via
    // chooseMenuCategory), clicks through to a real, filterable sub-category
    // PLP (e.g. /category/general-parts-pto-driveline-components).
    async clickSubCategoryTile(categorySlug: string): Promise<void> {
        const tile = RussellsObjects.HomePage.subCategoryTileLink(categorySlug)(this.page)
        await expect(tile).toBeVisible({ timeout: 30000 })
        await tile.click()
        await expect(this.page).toHaveURL(new RegExp(`/category/${categorySlug}$`), { timeout: 30000 })
    }

    // The cookie-consent banner doesn't trigger on every session (unlike
    // Insinkerator's, which appears reliably) — dismiss it only if actually
    // present, never assume presence, so this stays safe either way.
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
    }

    private async getNewsletterEmailValidity(): Promise<{ valid: boolean, valueMissing: boolean, typeMismatch: boolean }> {
        return this.newsletterEmailInput.evaluate((el: HTMLInputElement) => ({
            valid: el.validity.valid,
            valueMissing: el.validity.valueMissing,
            typeMismatch: el.validity.typeMismatch
        }))
    }

    // Native HTML5 validity state — no rendered client-side error message
    // for this case.
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

    // VERIFIED live (staging, 2026-07-31): a well-formed email shows
    // "Success — Thank you for subscribing to our newsletter."
    async assertValidNewsletterEmailReturnsResponse(email: string): Promise<void> {
        await this.newsletterEmailInput.fill(email)
        await this.newsletterSubmitButton.click()
        await expect(this.newsletterAlert).toContainText('Thank you for subscribing', { timeout: 15000 })
    }

    // Unlike Insinkerator's search DRAWER, desktop search here is an inline
    // Algolia autocomplete input always present in the header — no
    // open/close interaction needed.
    async searchInline(query: string): Promise<void> {
        await this.searchInput.fill(query)
    }

    // VERIFIED live (staging, 2026-07-31): live hit names for a broad term
    // like "bearing" all contain the query substring.
    async validateSearchResultsMatch(query: string): Promise<void> {
        await expect(this.searchHitProductNames.first()).toBeVisible({ timeout: 15000 })
        await expect(async () => {
            const names = await this.searchHitProductNames.allTextContents()
            expect(names.length).toBeGreaterThan(0)
            for (const name of names) {
                expect(name.toLowerCase()).toContain(query.toLowerCase())
            }
        }).toPass({ timeout: 10000 })
    }

    async submitSearch(query: string): Promise<void> {
        await this.searchInput.press('Enter')
        await expect(this.page).toHaveURL(`/search?q=${encodeURIComponent(query)}`, { timeout: 30000 })
    }
}
