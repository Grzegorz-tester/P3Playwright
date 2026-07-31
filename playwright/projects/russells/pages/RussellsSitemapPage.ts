import { expect, Page, Response } from '@playwright/test'
import { SitemapPage } from '../../../common/abstract-pages/SitemapPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsSitemapPage extends SitemapPage {

    constructor(page: Page) {
        super(page);
    }

    readonly wrapper = RussellsObjects.SitemapPage.wrapper(this.page);
    readonly heading = RussellsObjects.SitemapPage.heading(this.page);
    readonly categoryItemLinks = RussellsObjects.SitemapPage.categoryItemLinks(this.page);

    async validateSitemapPageReached(): Promise<void> {
        await expect(this.page).toHaveURL(/\/sitemap$/, { timeout: 20000 })
        await expect(this.heading).toHaveText('Sitemap', { timeout: 15000 })
    }

    // category is the tab's href slug, e.g. 'products', 'article_categories'.
    async openCategory(category: string): Promise<void> {
        const tabLink = RussellsObjects.SitemapPage.categoryTabLink(category)(this.page)
        await expect(tabLink).toBeVisible({ timeout: 20000 })
        await tabLink.click()
        await expect(this.categoryItemLinks.first()).toBeVisible({ timeout: 20000 })
    }

    // CONFIRMED live (staging, 2026-07-31): this app prefetches nearly
    // every visible link's RSC payload as soon as /sitemap loads (Next.js
    // Link prefetching) — by the time a real click fires, that exact
    // response may already have happened during prefetch, or the click may
    // resolve entirely from the prefetched cache with no new network
    // response at all. Waiting for a browser Response matching the href
    // (Playwright only sees responses AFTER it starts listening) is
    // therefore a race that intermittently times out — this abstract-
    // contract method still returns null in that case; the real,
    // timing-independent status check lives in
    // clickFirstCategoryItemAndValidateRealPageReached() below, via a
    // direct request rather than the browser's own navigation Response.
    async clickFirstCategoryItem(): Promise<Response | null> {
        const firstItem = this.categoryItemLinks.first()
        const href = await firstItem.getAttribute('href')
        if (!href) {
            throw new Error('First sitemap category item has no href')
        }
        await firstItem.click()
        await this.page.waitForURL(href, { timeout: 30000 })
        return null
    }

    async clickFirstCategoryItemAndValidateRealPageReached(): Promise<void> {
        const firstItem = this.categoryItemLinks.first()
        const href = await firstItem.getAttribute('href')
        if (!href) {
            throw new Error('First sitemap category item has no href')
        }
        await firstItem.click()
        await this.page.waitForURL(href, { timeout: 30000 })
        const response = await this.page.request.get(href)
        expect(response.status(), 'Expected the sitemap item to load a real page').toBeLessThan(400)
    }
}
