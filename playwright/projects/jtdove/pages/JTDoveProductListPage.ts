import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { JTDoveObjects } from '../utils/objects'

export class JTDoveProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly hitsHeading = JTDoveObjects.ProductListPage.hitsHeading(this.page);
    readonly hitCount = JTDoveObjects.ProductListPage.hitCount(this.page);
    readonly productCardLink = JTDoveObjects.ProductListPage.productCardLink(this.page);
    readonly productCardName = JTDoveObjects.ProductListPage.productCardName(this.page);

    // The /search results page reuses these exact same testids as a
    // category PLP - no separate search-results locator group needed.
    async validatePLPLoaded(): Promise<void> {
        await expect(this.hitsHeading).toBeVisible({ timeout: 30000 })
        await expect(this.hitCount).toBeVisible()
        await expect(this.productCardLink.first()).toBeVisible({ timeout: 15000 })
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        await expect(this.productCardLink.first()).toBeVisible({ timeout: 30000 })
        await this.productCardLink.first().click()
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const card = this.productCardName.filter({ hasText: productName }).first()
        await expect(card).toBeVisible({ timeout: 30000 })
        await card.click()
    }
}
