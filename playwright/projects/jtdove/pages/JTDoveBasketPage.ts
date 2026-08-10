import { expect, Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { JTDoveObjects } from '../utils/objects'

export class JTDoveBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly checkoutButton = JTDoveObjects.BasketPage.checkoutButton(this.page);
    readonly firstLineRemoveButton = JTDoveObjects.BasketPage.firstLineRemoveButton(this.page);
    readonly anyLine = JTDoveObjects.BasketPage.anyLine(this.page);
    readonly summaryTotal = JTDoveObjects.BasketPage.summaryTotal(this.page);
    readonly quantityInput = JTDoveObjects.BasketPage.quantityInput(this.page);
    readonly quantityMinusButton = JTDoveObjects.BasketPage.quantityMinusButton(this.page);
    readonly quantityPlusButton = JTDoveObjects.BasketPage.quantityPlusButton(this.page);

    async proceedToSecureCheckout(): Promise<void> {
        await this.checkoutButton.click()
    }

    // CONFIRMED live (staging, 2026-08-10): same pattern already
    // documented for Russells - the basket is tied to the account
    // server-side, so leftover items from an earlier interrupted run can
    // silently carry into a later one. Call this before adding anything
    // in any test whose assertions assume a known, exact basket content.
    async clearBasket(): Promise<void> {
        await this.proceedToBasketPage()
        let remaining = await this.anyLine.count()
        while (remaining > 0) {
            await this.firstLineRemoveButton.click()
            await expect(async () => {
                expect(await this.anyLine.count()).toBeLessThan(remaining)
            }).toPass({ timeout: 10000 })
            remaining = await this.anyLine.count()
        }
    }

    // UK pricing uses "£" and a comma thousands separator.
    private parsePrice(text: string | null): number {
        const match = text?.match(/£\s*([\d,]+\.\d+)/)
        return match ? parseFloat(match[1].replace(/,/g, '')) : 0
    }

    // VERIFIED live (staging, 2026-08-10): incrementing recalculates the
    // grand total correctly. Derives the expected total from the CURRENT
    // unit price rather than hardcoding a multiplier.
    async incrementQuantityAndValidateTotal(): Promise<void> {
        const qtyBefore = Number(await this.quantityInput.inputValue())
        const totalBefore = this.parsePrice(await this.summaryTotal.textContent())
        const unitPrice = totalBefore / qtyBefore
        await this.quantityPlusButton.click()
        await expect(this.quantityInput).toHaveValue(String(qtyBefore + 1), { timeout: 15000 })
        await expect(async () => {
            const totalAfter = this.parsePrice(await this.summaryTotal.textContent())
            expect(totalAfter).toBeCloseTo(unitPrice * (qtyBefore + 1), 2)
        }).toPass({ timeout: 10000 })
    }

    async decrementQuantityAndValidateTotal(): Promise<void> {
        const qtyBefore = Number(await this.quantityInput.inputValue())
        const totalBefore = this.parsePrice(await this.summaryTotal.textContent())
        const unitPrice = totalBefore / qtyBefore
        await this.quantityMinusButton.click()
        await expect(this.quantityInput).toHaveValue(String(qtyBefore - 1), { timeout: 15000 })
        await expect(async () => {
            const totalAfter = this.parsePrice(await this.summaryTotal.textContent())
            expect(totalAfter).toBeCloseTo(unitPrice * (qtyBefore - 1), 2)
        }).toPass({ timeout: 10000 })
    }

    async validateMinusButtonDisabledAtMinimumQuantity(): Promise<void> {
        await expect(this.quantityInput).toHaveValue('1')
        await expect(this.quantityMinusButton).toBeDisabled()
    }
}
