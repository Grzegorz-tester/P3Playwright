import { expect, Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { RussellsObjects } from '../utils/objects'

export class RussellsBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly checkoutButton = RussellsObjects.BasketPage.checkoutButton(this.page);
    readonly firstLineRemoveButton = RussellsObjects.BasketPage.firstLineRemoveButton(this.page);
    readonly anyLine = RussellsObjects.BasketPage.anyLine(this.page);
    readonly summaryTotal = RussellsObjects.BasketPage.summaryTotal(this.page);
    readonly quantityInput = RussellsObjects.BasketPage.quantityInput(this.page);
    readonly quantityMinusButton = RussellsObjects.BasketPage.quantityMinusButton(this.page);
    readonly quantityPlusButton = RussellsObjects.BasketPage.quantityPlusButton(this.page);
    readonly promoCodeToggleButton = RussellsObjects.BasketPage.promoCodeToggleButton(this.page);
    readonly promoCodeInput = RussellsObjects.BasketPage.promoCodeInput(this.page);
    readonly promoCodeForm = RussellsObjects.BasketPage.promoCodeForm(this.page);

    async proceedToSecureCheckout(): Promise<void> {
        await this.checkoutButton.click()
    }

    // Reads the first line's unit price — call this immediately before
    // checking out (not from the PDP) since prices on this environment can
    // change mid-session; see the objects.ts note on linePrice.
    async getFirstLinePrice(): Promise<string> {
        return (await RussellsObjects.BasketPage.linePrice(0)(this.page).textContent()) ?? ''
    }

    // CONFIRMED live (staging, 2026-08-01): the basket is tied to the
    // account server-side — leftover items from an earlier interrupted
    // session on this SAME shared test account silently carried into a
    // later automated run's order. Call this before adding anything, in
    // any test whose assertions assume a known, exact basket content.
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

    // VERIFIED live (staging, 2026-07-31): incrementing recalculates the
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

    // VERIFIED live (staging, 2026-07-31): "Add a promotional code?"
    // toggles to reveal an input, and the SAME testid is reused for the
    // toggle AND the "Apply" submit button once expanded.
    async applyPromoCode(code: string): Promise<void> {
        await this.promoCodeToggleButton.click()
        await expect(this.promoCodeInput).toBeVisible({ timeout: 15000 })
        await this.promoCodeInput.fill(code)
        await this.promoCodeToggleButton.click()
    }

    // No testid on the error message itself — asserted via toContainText
    // on the stable promo-form container rather than located by text.
    async assertInvalidPromoCodeShowsError(): Promise<void> {
        await expect(this.promoCodeForm).toContainText('This is not a valid promo code.', { timeout: 15000 })
    }
}
