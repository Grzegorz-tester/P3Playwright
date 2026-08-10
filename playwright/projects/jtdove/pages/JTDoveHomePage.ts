import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { JTDoveObjects } from '../utils/objects'

export class JTDoveHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly brandBar = JTDoveObjects.HomePage.brandBar(this.page);
    readonly navigationBar = JTDoveObjects.HomePage.navigationBar(this.page);
    readonly searchInput = JTDoveObjects.HomePage.searchInput(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    // VERIFIED live (staging, 2026-08-10): the category links are always
    // visible in the top nav bar - no menu button to open first.
    async chooseMenuCategory(category: string): Promise<void> {
        const menuLink = JTDoveObjects.HomePage.menuLinkFiltered(category)(this.page)
        await expect(menuLink).toBeVisible({ timeout: 30000 })
        await menuLink.click()
    }
}
