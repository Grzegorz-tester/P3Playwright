import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { MipaObjects } from '../utils/objects'

// On Mipa the product listing is the Algolia search-hits panel rather than a category grid.
export class MipaProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly hitsContainer = MipaObjects.ProductListPage.hitsContainer(this.page);
    readonly productLink = MipaObjects.ProductListPage.productLink(this.page);

    async validatePLP(): Promise<void> {
        await expect(this.hitsContainer).toBeVisible({ timeout: 30000 })
        await expect(this.productLink.first()).toBeVisible({ timeout: 30000 })
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstProduct = this.productLink.first()
        await expect(firstProduct).toBeVisible({ timeout: 30000 })
        await firstProduct.click()
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        const productLink = MipaObjects.ProductListPage.productLinkFiltered(productName)(this.page).first()
        await expect(productLink).toBeVisible({ timeout: 30000 })
        await productLink.click()
    }
}
