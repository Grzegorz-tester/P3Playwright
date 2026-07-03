import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { CarbonObjects } from '../utils/objects'

export class CarbonProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly productNameLink = CarbonObjects.ProductListPage.productNameLink(this.page);

    async validatePLP(): Promise<void> {
        await expect(this.page).toHaveURL(/\/category\//)
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstProduct = this.productNameLink.first()
        await expect(firstProduct).toBeVisible({ timeout: 15000 })
        await firstProduct.focus()
        await firstProduct.click()
        await expect(firstProduct).toHaveCount(0, { timeout: 30000 })
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const productLink = CarbonObjects.ProductListPage.productNameLinkFiltered(productName)(this.page)
        await expect(productLink).toBeVisible({ timeout: 60000 })
        await productLink.focus({ timeout: 15000 })
        await productLink.click({ timeout: 10000 })
        await expect(productLink).toHaveCount(0, { timeout: 30000 })
    }
}
