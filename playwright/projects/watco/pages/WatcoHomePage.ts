import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { WatcoObjects } from '../utils/objects'

export class WatcoHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly searchInput = WatcoObjects.HomePage.searchInput(this.page);
    readonly categoryNav = WatcoObjects.HomePage.categoryNav(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.searchInput).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        const menuItem = this.categoryNav.getByRole('link', { name: category, exact: true })
        await expect(menuItem).toBeVisible({ timeout: 30000 })
        await menuItem.click()
    }

    // VERIFIED live (staging, 2026-08-05): unlike Mipa (fill-only, results
    // shown inline), Enter here navigates to a dedicated /search?query=
    // results page — a more stable target for automation than the
    // autocomplete dropdown overlay, so this searches AND submits.
    async searchForProduct(searchTerm: string): Promise<void> {
        await expect(this.searchInput).toBeVisible({ timeout: 30000 })
        await this.searchInput.click()
        await this.searchInput.fill(searchTerm)
        await this.searchInput.press('Enter')
        await this.page.waitForLoadState('load')
    }
}
