import { expect, Page } from '@playwright/test'
import { AbstractProductListPage } from '../../../common/abstract-pages/ProductListPage'
import { WatcoObjects } from '../utils/objects'

// See objects.ts ProductListPage comment: every product link on this page
// points at a broken internal staging host (1-69-0.uk.watco.pub), so we
// read the href and rewrite it onto the current origin instead of clicking.
export class WatcoProductListPage extends AbstractProductListPage {

    constructor(page: Page) {
        super(page);
    }

    readonly resultLink = WatcoObjects.ProductListPage.resultLink(this.page);
    readonly resultCard = WatcoObjects.ProductListPage.resultCard(this.page);
    readonly resultCardTitle = WatcoObjects.ProductListPage.resultCardTitle(this.page);

    private async navigateToRewrittenProductUrl(rawHref: string): Promise<void> {
        const rewritten = new URL(rawHref)
        rewritten.protocol = new URL(this.page.url()).protocol
        rewritten.hostname = new URL(this.page.url()).hostname
        await this.page.goto(rewritten.toString(), { timeout: 45000 })
    }

    async clickOnFirstItemToProceedToPDP(): Promise<void> {
        const firstResult = this.resultLink.first()
        await expect(firstResult).toBeVisible({ timeout: 30000 })
        const href = await firstResult.getAttribute('href')
        await this.navigateToRewrittenProductUrl(href!)
    }

    async clickOnAProductToProceedToPDP(productName: string): Promise<void> {
        // TODO: WAT-305 - no data-testid/id on search-result product cards;
        // raise with Watco devs for a dedicated ticket to add a stable
        // identifier so this can move off text matching.
        const card = this.resultCard.filter({ has: this.resultCardTitle.getByText(productName, { exact: true }) })
        const link = card.locator('a.view-product-btn').first()
        await expect(link).toBeVisible({ timeout: 30000 })
        const href = await link.getAttribute('href')
        await this.navigateToRewrittenProductUrl(href!)
    }
}
