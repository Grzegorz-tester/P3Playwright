import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly productNameLink = InsinkeratorObjects.ProductListPage.productNameLink(this.page);

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstProduct = this.productNameLink.first()
        await expect(firstProduct).toBeVisible({ timeout: 15000 })
        await firstProduct.focus()
        await firstProduct.click()
        await expect(firstProduct).toHaveCount(0, { timeout: 30000 })
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const productLink = InsinkeratorObjects.ProductListPage.productNameLinkFiltered(productName)(this.page)
        await expect(productLink).toBeVisible({ timeout: 60000 })
        await productLink.focus({ timeout: 15000 })
        await productLink.click({ timeout: 10000 })
        await expect(productLink).toHaveCount(0, { timeout: 30000 })
    }
}
