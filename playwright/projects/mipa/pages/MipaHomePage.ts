import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { MipaObjects } from '../utils/objects'

export class MipaHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly brandBar = MipaObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = MipaObjects.HomePage.menuNavBarButton(this.page);
    readonly navItems = MipaObjects.HomePage.navItems(this.page);
    readonly searchInput = MipaObjects.HomePage.searchInput(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        const menuItem = this.navItems.getByRole('link', { name: category, exact: true })
        await expect(menuItem).toBeVisible({ timeout: 30000 })
        await menuItem.click()
    }

    async searchForProduct(searchTerm: string): Promise<void> {
        await expect(this.searchInput).toBeVisible({ timeout: 30000 })
        await this.searchInput.click()
        await this.searchInput.fill(searchTerm)
    }
}
