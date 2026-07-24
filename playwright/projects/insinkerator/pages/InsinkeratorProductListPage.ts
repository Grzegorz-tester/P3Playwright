import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly productNameLink = InsinkeratorObjects.ProductListPage.productNameLink(this.page);
    readonly searchHitsHeading = InsinkeratorObjects.SearchResultsPage.hitsHeading(this.page);
    readonly searchHitCount = InsinkeratorObjects.SearchResultsPage.hitCount(this.page);
    readonly searchResultProductNameLink = InsinkeratorObjects.SearchResultsPage.productNameLink(this.page);
    readonly hitsHeading = InsinkeratorObjects.ProductListPage.hitsHeading(this.page);
    readonly hitCount = InsinkeratorObjects.ProductListPage.hitCount(this.page);
    readonly productCardLink = InsinkeratorObjects.ProductListPage.productCardLink(this.page);
    readonly productCardPrice = InsinkeratorObjects.ProductListPage.productCardPrice(this.page);
    readonly filterAndSortOpenButton = InsinkeratorObjects.ProductListPage.filterAndSortOpenButton(this.page);
    readonly facetCheckboxes = InsinkeratorObjects.ProductListPage.facetCheckboxes(this.page);
    readonly sortByOptions = InsinkeratorObjects.ProductListPage.sortByOptions(this.page);
    readonly loadMoreButton = InsinkeratorObjects.ProductListPage.loadMoreButton(this.page);
    readonly currentItemsCount = InsinkeratorObjects.ProductListPage.currentItemsCount(this.page);
    readonly totalItemsCount = InsinkeratorObjects.ProductListPage.totalItemsCount(this.page);

    // VERIFIED — reached via /search?q=<term> (see
    // InsinkeratorHomePage.submitSearchFromDrawer). Confirmed live that
    // every visible result name contains the query substring for a broad
    // catalog term like "sink" (44 hits, all matching) — Algolia may also
    // match on SKU/description for narrower terms, so this assertion is
    // only safe for terms confirmed to match on product NAME.
    async validateSearchResultsPage(query: string): Promise<void> {
        await expect(this.searchHitsHeading).toBeVisible({ timeout: 30000 })
        await expect(this.searchHitCount).toBeVisible()
        const hitCountText = await this.searchHitCount.textContent()
        const hitCount = parseInt((hitCountText ?? '').replace(/\D/g, ''), 10)
        expect(hitCount).toBeGreaterThan(0)
        await expect(this.searchResultProductNameLink.first()).toBeVisible()
        const names = await this.searchResultProductNameLink.allTextContents()
        for (const name of names) {
            expect(name.toLowerCase()).toContain(query.toLowerCase())
        }
    }

    async validatePLPLoaded(): Promise<void> {
        await expect(this.hitsHeading).toBeVisible({ timeout: 30000 })
        await expect(this.hitCount).toBeVisible()
        await expect(this.productCardLink.first()).toBeVisible({ timeout: 15000 })
    }

    async openFilterAndSortDrawer(): Promise<void> {
        await expect(this.filterAndSortOpenButton).toBeVisible({ timeout: 30000 })
        await this.filterAndSortOpenButton.click()
        await expect(this.facetCheckboxes.first()).toBeVisible({ timeout: 15000 })
    }

    // VERIFIED — each facet checkbox's own sibling <label> carries its live
    // result count (e.g. "Air Switch (26)"). Reading that count and
    // asserting the header's hit-count updates to match is robust against
    // catalog changes — no hardcoded product/category name needed.
    async applyFirstFacetFilterAndValidate(): Promise<void> {
        const checkbox = this.facetCheckboxes.first()
        const labelText = await checkbox.evaluate(el => el.parentElement?.parentElement?.querySelector('label')?.textContent ?? '')
        const match = labelText.match(/\((\d+)\)/)
        expect(match).not.toBeNull()
        const expectedCount = match![1]
        await checkbox.click()
        await expect(this.hitCount).toHaveText(`(${expectedCount})`, { timeout: 15000 })
    }

    // CONFIRMED SITE BUG (staging, 2026-07-22, reproduced twice with the
    // cookie banner cleared): selecting a sort option — here, "Price: Low
    // to High" at index 1 — does NOT persist or change result order. The
    // dialog closes immediately on selection, and re-opening it shows
    // "Relevance" (index 0) checked again with no change to the product
    // order at all. This asserts TODAY's actual (broken) behaviour so a
    // real fix surfaces as a needed test update instead of silently
    // continuing to pass.
    // TODO(INSINKERATOR): once fixed, assert real ascending price order
    // across productCardPrice instead of the current revert-to-Relevance
    // check.
    async selectSortByPriceLowToHighAndValidateCurrentBehaviour(): Promise<void> {
        await this.sortByOptions.nth(1).click()
        await this.openFilterAndSortDrawer()
        await expect(this.sortByOptions.nth(0)).toHaveAttribute('aria-checked', 'true')
        await this.page.keyboard.press('Escape')
        await expect(this.facetCheckboxes.first()).toBeHidden({ timeout: 15000 })
    }

    async loadMoreAndValidate(): Promise<void> {
        const currentBefore = Number(await this.currentItemsCount.textContent())
        await this.loadMoreButton.click()
        await expect(this.currentItemsCount).not.toHaveText(String(currentBefore), { timeout: 15000 })
        const currentAfter = Number(await this.currentItemsCount.textContent())
        expect(currentAfter).toBeGreaterThan(currentBefore)
        await expect(this.productCardLink).toHaveCount(currentAfter)
    }

    // Returns the clicked card's name so the caller can verify the PDP
    // reached afterwards is genuinely the right one (see
    // InsinkeratorPDPage.validateProductNameMatches).
    async clickFirstResult(): Promise<string> {
        const firstLink = this.productCardLink.first()
        const expectedName = await firstLink.evaluate(el => el.parentElement?.parentElement?.querySelector('[data-testid="product-card__name"]')?.textContent?.trim() ?? '')
        expect(expectedName).not.toBe('')
        await expect(firstLink).toBeVisible({ timeout: 15000 })
        await firstLink.click()
        return expectedName
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstProduct = this.productNameLink.first()
        await expect(firstProduct).toBeVisible({ timeout: 15000 })
        await firstProduct.focus()
        await firstProduct.click()
        await expect(firstProduct).toHaveCount(0, { timeout: 30000 })
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const productLink = InsinkeratorObjects.ProductListPage.productNameLinkFiltered(productName)(this.page)
        await expect(productLink).toBeVisible({ timeout: 60000 })
        await productLink.focus({ timeout: 15000 })
        await productLink.click({ timeout: 10000 })
        await expect(productLink).toHaveCount(0, { timeout: 30000 })
    }
}
