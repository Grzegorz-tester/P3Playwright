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

    // VERIFIED live (staging, 2026-08-10): clicking "Collect at branch" on
    // a basket line opens the "Check Stock In Our Branches" dialog (see
    // BranchStockDialog in objects.ts) - EXCEPT when the line's toggle is
    // already disabled (already selected, or courier-locked - see
    // verifyLineShowsCollectAtBranch), in which case nothing happens.
    // Lines are targeted by their product name, not position - see
    // lineByProductName in objects.ts for why index-based targeting is
    // unsafe on this basket page.
    async switchLineToCollectAtBranch(productName: string): Promise<void> {
        await JTDoveObjects.BasketPage.collectAtBranchToggleFiltered(productName)(this.page).click()
    }

    async switchLineToDeliver(productName: string): Promise<void> {
        await JTDoveObjects.BasketPage.deliverToggleFiltered(productName)(this.page).click()
    }

    readonly branchStockDialog = JTDoveObjects.BranchStockDialog.dialog(this.page);

    // CONFIRMED live (staging, 2026-08-11): the dialog shell can render
    // before its branch list finishes loading - waits for at least one
    // real branch row, not just the dialog container, so callers never
    // race an empty dialog.
    async verifyBranchStockDialogOpen(): Promise<void> {
        await expect(this.branchStockDialog).toBeVisible({ timeout: 15000 })
        await expect(JTDoveObjects.BranchStockDialog.anyBranchRow(this.page).first()).toBeVisible({ timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-08-10): selecting a branch here closes
    // the dialog automatically - no separate confirm step.
    async selectBranchInStockDialog(branchName: string): Promise<void> {
        await JTDoveObjects.BranchStockDialog.selectBranchButtonFiltered(branchName)(this.page).click()
        await expect(this.branchStockDialog).toBeHidden({ timeout: 15000 })
    }

    // CONFIRMED live (staging, 2026-08-10): once a branch is selected
    // elsewhere in the basket, a branch with insufficient stock for ANY
    // collection line renders its "Select this branch" button disabled -
    // this asserts that block, matching the test case's "cannot be added
    // if stock at the selected branch is 0" / "cannot be changed if any
    // collection product would be unavailable" requirements.
    async verifyBranchIsUnselectable(branchName: string): Promise<void> {
        await expect(JTDoveObjects.BranchStockDialog.selectBranchButtonFiltered(branchName)(this.page)).toBeDisabled()
    }

    async verifyBranchIsSelectable(branchName: string): Promise<void> {
        await expect(JTDoveObjects.BranchStockDialog.selectBranchButtonFiltered(branchName)(this.page)).toBeEnabled()
    }

    async closeBranchStockDialog(): Promise<void> {
        await JTDoveObjects.BranchStockDialog.closeButton(this.page).click()
        await expect(this.branchStockDialog).toBeHidden({ timeout: 10000 })
    }

    // CONFIRMED live (staging, 2026-08-10): the disabled toggle button is
    // always the currently-active method, not an unavailable one - a
    // courier-locked line has BOTH buttons disabled, so this must also
    // confirm Deliver is enabled to prove collection is genuinely
    // selected (not just that collection is locked out entirely).
    //
    // CONFIRMED live (staging, 2026-08-11): right after a branch
    // selection closes the dialog, the basket briefly recalculates and
    // BOTH buttons can stay disabled for longer than the default 5s
    // assertion timeout before the line settles into its new state -
    // generous timeouts here avoid a false failure mid-recalculation.
    async verifyLineShowsCollectAtBranch(productName: string): Promise<void> {
        await expect(JTDoveObjects.BasketPage.collectAtBranchToggleFiltered(productName)(this.page)).toBeDisabled({ timeout: 20000 })
        await expect(JTDoveObjects.BasketPage.deliverToggleFiltered(productName)(this.page)).toBeEnabled({ timeout: 20000 })
    }

    async verifyLineShowsDeliver(productName: string): Promise<void> {
        await expect(JTDoveObjects.BasketPage.deliverToggleFiltered(productName)(this.page)).toBeDisabled({ timeout: 20000 })
        await expect(JTDoveObjects.BasketPage.collectAtBranchToggleFiltered(productName)(this.page)).toBeEnabled({ timeout: 20000 })
    }

    // CONFIRMED live (staging, 2026-08-11): a courier-only line (e.g.
    // Scruffs Bobble Hat) has BOTH toggle buttons disabled - it can never
    // be switched to Collect at Branch at all.
    async verifyLineIsLockedToCourier(productName: string): Promise<void> {
        await expect(JTDoveObjects.BasketPage.collectAtBranchToggleFiltered(productName)(this.page)).toBeDisabled()
        await expect(JTDoveObjects.BasketPage.deliverToggleFiltered(productName)(this.page)).toBeDisabled()
    }

    async verifyLineShowsDeliveredByCourier(productName: string): Promise<void> {
        await expect(JTDoveObjects.BasketPage.lineByProductName(productName)(this.page)).toContainText('Delivered by Courier')
    }

    // VERIFIED live (staging, 2026-08-11): the full courier note reads
    // "This product will be delivered by courier and so is subject to a
    // delivery charge. The delivery charge will be calculated at
    // checkout." - checked case-insensitively via substrings so copy
    // casing changes don't break this on their own.
    async verifyLineShowsCourierDeliveryChargeMessage(productName: string): Promise<void> {
        const line = JTDoveObjects.BasketPage.lineByProductName(productName)(this.page)
        await expect(line).toContainText(/delivered by courier/i)
        await expect(line).toContainText(/delivery charge will be calculated at checkout/i)
    }

    async verifyLineDoesNotShowCourierMessaging(productName: string): Promise<void> {
        await expect(JTDoveObjects.BasketPage.lineByProductName(productName)(this.page)).not.toContainText('Delivered by Courier')
    }

    async verifyLineShowsBothDeliveryToggleButtons(productName: string): Promise<void> {
        const line = JTDoveObjects.BasketPage.lineByProductName(productName)(this.page)
        await expect(line.getByRole('button', { name: 'Collect at branch' })).toBeVisible()
        await expect(line.getByRole('button', { name: 'Deliver', exact: true })).toBeVisible()
    }

    readonly collectAtBranchBanner = JTDoveObjects.BasketPage.collectAtBranchBanner(this.page);
    readonly changeBranchButton = JTDoveObjects.BasketPage.changeBranchButton(this.page);
    readonly deliveryGroupHeading = JTDoveObjects.BasketPage.deliveryGroupHeading(this.page);

    async verifyCollectAtBranchBannerHidden(): Promise<void> {
        await expect(this.collectAtBranchBanner).toBeHidden()
    }

    // VERIFIED live (staging, 2026-08-11): the basket-wide banner reads
    // "Collect at Branch<name>Change Branch" as one text block (no
    // separate testid per part) - strips both known substrings to leave
    // just the branch name.
    async getSelectedBranchName(): Promise<string> {
        const text = (await this.collectAtBranchBanner.textContent()) ?? ''
        return text.replace('Collect at Branch', '').replace('Change Branch', '').trim()
    }

    async verifySelectedBranchIs(branchName: string): Promise<void> {
        await expect(this.collectAtBranchBanner).toContainText(branchName)
    }

    // VERIFIED live (staging, 2026-08-11) end-to-end through a real
    // branch change: opens the same "Check Stock In Our Branches" dialog
    // as a per-line toggle, but framed as changing the branch already
    // used by every collection line in the basket.
    async openChangeBranchDialog(): Promise<void> {
        await this.changeBranchButton.click()
    }
}
