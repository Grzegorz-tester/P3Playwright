import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { KeyliteObjects } from '../utils/objects'

export class KeyliteHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly brandBar = KeyliteObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = KeyliteObjects.HomePage.menuNavBarButton(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 })
        await this.menuNavBarButton.click()
        const menuLink = KeyliteObjects.HomePage.menuTierLinkFiltered(category)(this.page)
        await expect(menuLink).toBeVisible({ timeout: 10000 })
        await menuLink.click()
    }
}
