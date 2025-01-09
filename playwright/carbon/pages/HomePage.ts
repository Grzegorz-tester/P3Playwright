import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'

export class HomePage {
    readonly page: Page
    public category: Locator
    readonly menuNavBar: Locator
    readonly menuNavBarButton: Locator
    readonly viewAllButton: Locator

    private categoryName = ''

    constructor(page: Page) {
        this.page = page
        this.category = this.page.locator('h2')
        this.menuNavBar = page.locator('[data-testid="navigation-bar"]')
        this.menuNavBarButton = page.locator(
            '//*[@data-testid="basket__product-card--sku"]',
        )
        this.viewAllButton = page.locator('[data-testid="nav__view-all"]')
    }

    async navigateToHomePage(): Promise<void> {
        await this.page.goto('/', { timeout: 40000 })
    }

    async chooseMenuCategory(category: string): Promise<void> {
        this.categoryName = category
        this.category = this.page.locator('h2', { hasText: `${this.categoryName}` })
        await expect(this.menuNavBarButton).toBeVisible({timeout: 30000})
        await this.menuNavBarButton.focus()
        await this.menuNavBarButton.click()
        await expect(this.category).toHaveText(category)
        await this.category.click()
        if(await this.viewAllButton.isVisible({timeout: 5000})){
            await this.viewAllButton.click()
        }
        //await expect(this.page).toHaveURL(new RegExp(`^/category/${this.categoryName.replace(' ', '-')}`,))
    }
}
