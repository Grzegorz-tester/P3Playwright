import { expect, Page } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { IndespensionObjects } from '../utils/objects'

export class IndespensionHomePage extends HomePage {

    constructor(page: Page) {
        super(page);
    }

    readonly brandBar = IndespensionObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = IndespensionObjects.HomePage.menuNavBarButton(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        const menuLink = IndespensionObjects.HomePage.menuLinkFiltered(category)(this.page)
        await expect(menuLink).toBeVisible({ timeout: 30000 })
        await menuLink.click()
    }
}
