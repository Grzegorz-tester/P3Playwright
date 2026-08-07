import { expect, Page, Response } from '@playwright/test'
import { SitemapPage, SitemapCategory } from '../../../common/abstract-pages/SitemapPage'
import { InsinkeratorObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-07-24). /sitemap has 5 real tab categories —
 * products, categories, content, locations, product images — confirmed via
 * live exploration, not assumed. Tab links have stable, unique hrefs
 * (/sitemap/<category>); the per-category item links below have entirely
 * dynamic hrefs (real page paths, or raw CDN image URLs for "product
 * images") with no testid/id of their own — see categoryItemLinks in
 * objects.ts for how those are isolated.
 *
 * CONFIRMED SITE BUG (still present, staging, 2026-07-31): "locations"
 * still has exactly ONE entry ("test") whose page renders a "not found"
 * state — stale/dummy CMS data, not a bug in the redirect mechanism
 * itself. UPDATED FINDING: this branch page's navigation response is now
 * a genuine HTTP 404 (previously it was confirmed to be a 200 with a
 * client-side not-found UI) — the content-based assertion below is
 * unaffected either way and still passes, but response status alone
 * would now also be a reliable signal for this category, unlike before.
 * See sitemap-redirects.test.ts, which asserts this as today's actual
 * behaviour. Worth flagging to content editors to remove the stale entry.
 *
 * "product images" items navigate to raw CDN image files, not HTML pages —
 * clickFirstCategoryItem() returns the navigation Response so callers can
 * assert on status code alone in that case, rather than page content.
 */
export class InsinkeratorSitemapPage extends SitemapPage {

    constructor(page: Page) {
        super(page);
    }

    readonly wrapper = InsinkeratorObjects.SitemapPage.wrapper(this.page);
    readonly heading = InsinkeratorObjects.SitemapPage.heading(this.page);
    readonly categoryItemLinks = InsinkeratorObjects.SitemapPage.categoryItemLinks(this.page);

    private readonly tabLinks: Record<SitemapCategory, ReturnType<typeof InsinkeratorObjects.SitemapPage.productsTabLink>> = {
        'products': InsinkeratorObjects.SitemapPage.productsTabLink(this.page),
        'categories': InsinkeratorObjects.SitemapPage.categoriesTabLink(this.page),
        'content': InsinkeratorObjects.SitemapPage.contentTabLink(this.page),
        'locations': InsinkeratorObjects.SitemapPage.locationsTabLink(this.page),
        'product images': InsinkeratorObjects.SitemapPage.productImagesTabLink(this.page),
    }

    async validateSitemapPageReached(): Promise<void> {
        await expect(this.page).toHaveURL(/\/sitemap$/, { timeout: 20000 })
        await expect(this.heading).toHaveText('Sitemap', { timeout: 15000 })
    }

    async openCategory(category: SitemapCategory): Promise<void> {
        await expect(this.tabLinks[category]).toBeVisible({ timeout: 20000 })
        await this.tabLinks[category].click()
        await expect(this.categoryItemLinks.first()).toBeVisible({ timeout: 20000 })
    }

    /**
     * Clicks the first item link in whatever category is currently open
     * and returns the resulting navigation response — every item link on
     * this page is a full, real href (either same-origin or the CDN's
     * origin for "product images"), so a normal click always triggers a
     * real navigation to wait on.
     *
     * CONFIRMED — a real automated run showed this timing out for
     * "product images": some CDN image hrefs contain a literal, UNENCODED
     * space (e.g. ".../Sink flanges/70908D.jpg") while the real network
     * request always uses the encoded form (%20) — others in the same
     * list are already %20-encoded in the href itself, so encoding isn't
     * even consistent across items. Comparing both sides through
     * decodeURI() normalizes either form and matches reliably.
     */
    async clickFirstCategoryItem(): Promise<Response | null> {
        const firstItem = this.categoryItemLinks.first()
        const href = await firstItem.getAttribute('href')
        if (!href) {
            throw new Error('First sitemap category item has no href')
        }
        const [response] = await Promise.all([
            this.page.waitForResponse(response => decodeURI(response.url()) === decodeURI(href), { timeout: 30000 }),
            firstItem.click(),
        ])
        return response
    }

    /** VERIFIED WORKING — asserts the clicked item led to a real (non-404) page. */
    async clickFirstCategoryItemAndValidateRealPageReached(): Promise<void> {
        const response = await this.clickFirstCategoryItem()
        expect(response?.status(), 'Expected the sitemap item to load a real page').toBeLessThan(400)
    }

    /**
     * CONFIRMED SITE BUG — see class-level comment. Asserts today's actual
     * (broken) behaviour for the "locations" category rather than
     * pretending it works.
     *
     * CONFIRMED — the underlying navigation response for this specific
     * branch page returns HTTP 200 (NOT 404) even though it visibly
     * renders a "not found" state — it fetches its own branch data
     * client-side and shows a not-found UI once that comes back empty,
     * rather than the server returning a real 404 status. Response status
     * alone is therefore NOT a reliable signal here (unlike the other
     * categories) — check the rendered content instead.
     * TODO(INSINKERATOR): last-resort text locator — this generic
     * not-found page has no testid of its own. Needs a ticket if this
     * page type is used elsewhere and testids are ever added.
     */
    async clickFirstCategoryItemAndValidateItCurrentlyErrors(): Promise<void> {
        await this.clickFirstCategoryItem()
        await expect(this.page.getByRole('heading', { name: '404' })).toBeVisible({ timeout: 15000 })
    }

    /** VERIFIED WORKING — "product images" items are raw CDN image files, checked by status code alone. */
    async clickFirstCategoryItemAndValidateImageLoads(): Promise<void> {
        const response = await this.clickFirstCategoryItem()
        expect(response?.status()).toBe(200)
    }
}
