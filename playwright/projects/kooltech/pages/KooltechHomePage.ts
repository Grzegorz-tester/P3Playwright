import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import { HomePage } from '../../../common/abstract-pages/HomePage'
import { KooltechObjects } from '../utils/objects'

export class KooltechHomePage extends HomePage {

    private categoryName = '';

    constructor(page: Page) {
        super(page);
    }

    get category(): Locator {
        return KooltechObjects.HomePage.category(this.categoryName)(this.page);
    }
    readonly brandBar = KooltechObjects.HomePage.brandBar(this.page);
    readonly menuNavBarButton = KooltechObjects.HomePage.menuNavBarButton(this.page);
    readonly viewAllButton = KooltechObjects.HomePage.viewAllButton(this.page);

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        this.categoryName = category
        await expect(this.menuNavBarButton).toBeVisible({timeout: 30000})
        await this.menuNavBarButton.focus()
        await this.menuNavBarButton.click()
        await expect(this.category).toHaveText(category)
        await this.category.click()
        if(await this.viewAllButton.isVisible({timeout: 5000})){
            await this.viewAllButton.click()
        }
    }
}
