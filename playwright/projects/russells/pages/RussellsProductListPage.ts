import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly hitsHeading = RussellsObjects.ProductListPage.hitsHeading(this.page);
    readonly hitCount = RussellsObjects.ProductListPage.hitCount(this.page);
    readonly productCardLink = RussellsObjects.ProductListPage.productCardLink(this.page);
    readonly productCardPrice = RussellsObjects.ProductListPage.productCardPrice(this.page);
    readonly filterAndSortOpenButton = RussellsObjects.ProductListPage.filterAndSortOpenButton(this.page);
    readonly facetCheckboxes = RussellsObjects.ProductListPage.facetCheckboxes(this.page);
    readonly sortByOptions = RussellsObjects.ProductListPage.sortByOptions(this.page);
    readonly loadMoreButton = RussellsObjects.ProductListPage.loadMoreButton(this.page);
    readonly currentItemsCount = RussellsObjects.ProductListPage.currentItemsCount(this.page);
    readonly totalItemsCount = RussellsObjects.ProductListPage.totalItemsCount(this.page);

    // The /search results page reuses these exact same testids — no
    // separate search-results locator group needed (unlike Insinkerator).
    async validateSearchResultsPage(query: string): Promise<void> {
        await expect(this.hitsHeading).toBeVisible({ timeout: 30000 })
        await expect(this.hitCount).toBeVisible()
        const hitCountText = await this.hitCount.textContent()
        const hitCount = parseInt((hitCountText ?? '').replace(/\D/g, ''), 10)
        expect(hitCount).toBeGreaterThan(0)
        await expect(this.productCardLink.first()).toBeVisible()
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

    // VERIFIED live (staging, 2026-07-31): each facet checkbox's own
    // sibling <label> carries its live result count, e.g.
    // "PTO YOKES & JOINT ASSEMBLIES (348)".
    async applyFirstFacetFilterAndValidate(): Promise<void> {
        const checkbox = this.facetCheckboxes.first()
        const labelText = await checkbox.evaluate(el => el.parentElement?.parentElement?.querySelector('label')?.textContent ?? '')
        const match = labelText.match(/\((\d+)\)/)
        expect(match).not.toBeNull()
        const expectedCount = match![1]
        await checkbox.click()
        await expect(this.hitCount).toHaveText(`(${expectedCount})`, { timeout: 15000 })
    }

    // UK pricing uses "£" and a comma thousands separator (e.g.
    // "£1,234.56") — the opposite convention from Insinkerator's EU
    // "1.234,56 €" format.
    private parsePrice(text: string): number {
        const match = text.match(/£\s*([\d,]+\.\d+)/)
        if (!match) {
            throw new Error(`Could not parse a price out of "${text}"`)
        }
        return parseFloat(match[1].replace(/,/g, ''))
    }

    async getFirstCardPriceValue(): Promise<number> {
        await expect(this.productCardPrice.first()).toBeVisible({ timeout: 15000 })
        const text = (await this.productCardPrice.first().textContent()) ?? ''
        return this.parsePrice(text)
    }

    async selectSortByPriceLowToHighAndValidateAscendingOrder(): Promise<void> {
        const expectedCount = await this.currentItemsCount.textContent()
        await this.sortByOptions.nth(1).click()
        await expect(this.sortByOptions.nth(1)).toHaveAttribute('aria-checked', 'true', { timeout: 15000 })
        await expect(this.currentItemsCount).toHaveText(expectedCount ?? '', { timeout: 15000 })
        const priceTexts = await this.productCardPrice.allTextContents()
        const prices = priceTexts.map(text => this.parsePrice(text))
        for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1])
        }
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

    async clickFirstResult(): Promise<string> {
        const firstLink = this.productCardLink.first()
        // productCardLink is scoped to the image-wrapping anchor, a direct
        // child of the product-card container — one level up (not two)
        // reaches the sibling name link.
        const expectedName = await firstLink.evaluate(el => el.parentElement?.querySelector('[data-testid="product-card__name"]')?.textContent?.trim() ?? '')
        expect(expectedName).not.toBe('')
        await expect(firstLink).toBeVisible({ timeout: 15000 })
        await firstLink.click()
        return expectedName
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstProduct = this.productCardLink.first()
        await expect(firstProduct).toBeVisible({ timeout: 15000 })
        await firstProduct.click()
        await expect(this.page).toHaveURL(/\/products\//, { timeout: 30000 })
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const productLink = RussellsObjects.ProductListPage.productCardNameFiltered(productName)(this.page)
        await expect(productLink).toBeVisible({ timeout: 60000 })
        await productLink.click({ timeout: 10000 })
        await expect(this.page).toHaveURL(/\/products\//, { timeout: 30000 })
    }
}
