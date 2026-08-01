import { expect, Locator, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsPDPage extends ProductDetailPage {

    readonly basketButton: Locator;
    readonly productName = RussellsObjects.ProductDetailPage.productName(this.page);
    readonly productSku = RussellsObjects.ProductDetailPage.productSku(this.page);
    readonly productPrice = RussellsObjects.ProductDetailPage.productPrice(this.page);
    readonly quantityInput = RussellsObjects.ProductDetailPage.quantityInput(this.page);
    readonly basketLinkText = RussellsObjects.ProductDetailPage.basketLinkText(this.page);
    readonly accordionTriggers = RussellsObjects.ProductDetailPage.accordionTriggers(this.page);
    readonly thumbnailNextButton = RussellsObjects.ProductDetailPage.thumbnailNextButton(this.page);
    readonly thumbnailPrevButton = RussellsObjects.ProductDetailPage.thumbnailPrevButton(this.page);
    readonly collectionChangeButton = RussellsObjects.ProductDetailPage.collectionChangeButton(this.page);
    readonly collectionDialog = RussellsObjects.ProductDetailPage.collectionDialog(this.page);
    readonly depotSearchInput = RussellsObjects.ProductDetailPage.depotSearchInput(this.page);
    readonly depotSearchButton = RussellsObjects.ProductDetailPage.depotSearchButton(this.page);
    readonly depotResultCards = RussellsObjects.ProductDetailPage.depotResultCards(this.page);

    constructor(page: Page) {
        super(page);
        this.basketButton = RussellsObjects.ProductDetailPage.addToBasketButton(this.page);
    }

    // Used to confirm a PLP click landed on the right product.
    async validateProductNameMatches(expectedName: string): Promise<void> {
        await expect(this.productName).toBeVisible({ timeout: 30000 })
        await expect(this.productName).toHaveText(expectedName)
    }

    // VERIFIED live (staging, 2026-07-31): product name, SKU and price are
    // all visible on load.
    async validatePDPLoaded(): Promise<void> {
        await expect(this.productName).toBeVisible({ timeout: 30000 })
        await expect(this.productSku.first()).toBeVisible()
        await expect(this.productPrice.first()).toBeVisible()
    }

    // VERIFIED live (staging, 2026-07-31): opening one accordion section
    // collapses whichever other was open — confirmed on a product with
    // neither section expanded by default (content-dependent, see
    // objects.ts note), so this doesn't assume any initial state.
    async validateAccordionSingleOpenBehaviour(): Promise<void> {
        const count = await this.accordionTriggers.count()
        expect(count, 'Expected at least 2 accordion sections to test single-open behaviour').toBeGreaterThanOrEqual(2)
        await this.accordionTriggers.nth(0).click()
        await expect(this.accordionTriggers.nth(0)).toHaveAttribute('aria-expanded', 'true')
        await this.accordionTriggers.nth(1).click()
        await expect(this.accordionTriggers.nth(1)).toHaveAttribute('aria-expanded', 'true')
        await expect(this.accordionTriggers.nth(0)).toHaveAttribute('aria-expanded', 'false')
    }

    // VERIFIED live (staging, 2026-07-31): Previous starts disabled; after
    // clicking Next once, both Previous and Next are enabled.
    async validateThumbnailCarouselNavigation(): Promise<void> {
        await expect(this.thumbnailPrevButton.first()).toBeDisabled()
        await this.thumbnailNextButton.first().click()
        await expect(this.thumbnailPrevButton.first()).toBeEnabled()
    }

    // VERIFIED live (staging, 2026-07-31): before any depot is selected,
    // the button reads "Set your local depot".
    async validateNoDepotSelectedYet(): Promise<void> {
        await expect(this.collectionChangeButton).toHaveText('Set your local depot')
    }

    // VERIFIED live (staging, 2026-07-31): opens the "Collection
    // Information" panel, searches by location, and selects the first
    // depot result. Returns the selected depot's name AND address (read
    // from the result card before clicking it, since the card itself
    // disappears once the panel closes) so the caller can verify both
    // against the PDP and, later, the order confirmation.
    async selectFirstDepotForLocation(location: string): Promise<{ name: string, address: string }> {
        await this.collectionChangeButton.click()
        await expect(this.collectionDialog).toBeVisible({ timeout: 15000 })
        await this.depotSearchInput.fill(location)
        await this.depotSearchButton.click()
        const firstResult = this.depotResultCards.first()
        await expect(firstResult).toBeVisible({ timeout: 15000 })
        const depot = await firstResult.evaluate(el => {
            const card = el.closest('div.border')
            return {
                name: card?.querySelector('p')?.textContent?.trim() ?? '',
                address: card?.querySelector('div.max-w-\\[240px\\]')?.textContent?.trim() ?? ''
            }
        })
        expect(depot.name).not.toBe('')
        expect(depot.address).not.toBe('')
        await firstResult.click()
        await expect(this.collectionDialog).toBeHidden({ timeout: 15000 })
        return depot
    }

    // VERIFIED live (staging, 2026-07-31): once a depot is selected, the
    // button's text changes to "Change", and the depot's name appears next
    // to it.
    async validateDepotSelected(depotName: string): Promise<void> {
        await expect(this.collectionChangeButton).toHaveText('Change')
        await expect(this.page.getByText(depotName, { exact: true }).first()).toBeVisible()
    }

    // CONFIRMED live (staging, 2026-07-31): a real automated run showed the
    // basket genuinely empty after this method returned ("You have no
    // items in your basket.") despite the click reporting success — filling
    // the quantity input to "1" (already its default) right before the
    // click looks to interfere with the click registering. Only touching
    // the quantity field when a non-default quantity is actually requested,
    // and verifying the basket count actually increments afterwards, avoids
    // both the interference and silently reporting success on a no-op add.
    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.basketButton).toBeEnabled()
        if (quantityToBuy !== 1) {
            await this.quantityInput.fill(String(quantityToBuy))
        }
        const countBefore = Number(await this.getBasketCount())
        await this.basketButton.click()
        await expect(async () => {
            const countAfter = Number(await this.getBasketCount())
            expect(countAfter).toBe(countBefore + quantityToBuy)
        }).toPass({ timeout: 15000 })
    }

    async getBasketCount(): Promise<string> {
        return this.basketLinkText.textContent().then(text => (text ?? '').replace(/\D/g, ''))
    }
}
