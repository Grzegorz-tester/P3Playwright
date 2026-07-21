import { expect, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorPDPage extends ProductDetailPage {

    constructor(page: Page) {
        super(page);
    }

    // VERIFIED locators — confirmed on staging with country set to Portugal
    // (an ecommerce-enabled country). See objects.ts for the country-gating
    // note: none of this renders at all on non-ecommerce countries.
    readonly addToBasketButton = InsinkeratorObjects.ProductDetailPage.addToBasketButton(this.page);
    readonly checkoutPopup = InsinkeratorObjects.ProductDetailPage.checkoutPopup(this.page);
    readonly closeAddedToBasketPopupButton = InsinkeratorObjects.ProductDetailPage.closeAddedToBasketPopupButton(this.page);
    readonly goToBasketButton = InsinkeratorObjects.ProductDetailPage.goToBasketButton(this.page);
    readonly basketButton = InsinkeratorObjects.ProductDetailPage.basketButton(this.page);
    readonly actualPricePDP = InsinkeratorObjects.ProductDetailPage.actualPricePDP(this.page);
    // TODO(INSINKERATOR): no quantity-input testid found — this project may
    // only support adding a single unit at a time from the PDP. Confirm.
    readonly itemAmountToAddInput = InsinkeratorObjects.ProductDetailPage.itemAmountToAddInput(this.page);
    readonly basketCount = InsinkeratorObjects.ProductDetailPage.basketCount(this.page);

    // NOTE: unlike Kooltech, there is no visible quantity input on this PDP
    // (confirmed absent) — quantityToBuy is accepted for interface
    // compatibility with the abstract contract but currently unused. Update
    // this once/if a quantity control is confirmed to exist.
    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.addToBasketButton).toBeEnabled()
        const basketCountBefore = await this.basketCount.count() > 0
            ? Number(await this.basketCount.textContent())
            : 0
        await this.addToBasketButton.click({ timeout: 5000 })
        await expect(this.checkoutPopup).toBeVisible({ timeout: 25000 })
        await this.closeAddedToBasketPopupButton.click()
        await expect(this.basketCount).toHaveText((basketCountBefore + 1).toString())
    }

    async getBasketCount(): Promise<string> {
        return this.basketCount.textContent()
    }
}
