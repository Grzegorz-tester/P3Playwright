import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-08-11): /account/wishlists (list) and
 * /account/wishlists/<id> (details, reached after creating a wishlist or
 * clicking its edit-pencil link from the list). Wishlists are per-user,
 * not shared across every login on the same trade account.
 */
export class JTDoveWishlistsPage {

    readonly page: Page;
    readonly createNewWishlistButton: Locator;
    readonly modalNameInput: Locator;
    readonly modalCreateButton: Locator;
    readonly nameFilterInput: Locator;
    readonly filterResetButton: Locator;
    readonly quickAddSearchInput: Locator;
    readonly quickAddHitProducts: Locator;
    readonly detailsHeading: Locator;
    readonly shareButton: Locator;
    readonly editNameButton: Locator;
    readonly deleteWishlistButton: Locator;
    readonly shareModalEmailInput: Locator;
    readonly shareModalShareButton: Locator;
    readonly shareModalCloseButton: Locator;
    readonly deleteConfirmDialog: Locator;
    readonly deleteConfirmCancelButton: Locator;
    readonly lineQuantityInput: Locator;
    readonly lineQuantityPlusButton: Locator;
    readonly lineQuantityMinusButton: Locator;
    readonly lineUpdateButton: Locator;
    readonly lineRemoveButton: Locator;
    readonly addItemToBasketButton: Locator;
    readonly addWishlistToBasketButton: Locator;
    readonly wishlistTotal: Locator;

    constructor(page: Page) {
        this.page = page;
        this.createNewWishlistButton = JTDoveObjects.WishlistsPage.createNewWishlistButton(this.page);
        this.modalNameInput = JTDoveObjects.WishlistsPage.modalNameInput(this.page);
        this.modalCreateButton = JTDoveObjects.WishlistsPage.modalCreateButton(this.page);
        this.nameFilterInput = JTDoveObjects.WishlistsPage.nameFilterInput(this.page);
        this.filterResetButton = JTDoveObjects.WishlistsPage.filterResetButton(this.page);
        this.quickAddSearchInput = JTDoveObjects.WishlistsPage.quickAddSearchInput(this.page);
        this.quickAddHitProducts = JTDoveObjects.WishlistsPage.quickAddHitProducts(this.page);
        this.detailsHeading = JTDoveObjects.WishlistsPage.detailsHeading(this.page);
        this.shareButton = JTDoveObjects.WishlistsPage.shareButton(this.page);
        this.editNameButton = JTDoveObjects.WishlistsPage.editNameButton(this.page);
        this.deleteWishlistButton = JTDoveObjects.WishlistsPage.deleteWishlistButton(this.page);
        this.shareModalEmailInput = JTDoveObjects.WishlistsPage.shareModalEmailInput(this.page);
        this.shareModalShareButton = JTDoveObjects.WishlistsPage.shareModalShareButton(this.page);
        this.shareModalCloseButton = JTDoveObjects.WishlistsPage.shareModalCloseButton(this.page);
        this.deleteConfirmDialog = JTDoveObjects.WishlistsPage.deleteConfirmDialog(this.page);
        this.deleteConfirmCancelButton = JTDoveObjects.WishlistsPage.deleteConfirmCancelButton(this.page);
        this.lineQuantityInput = JTDoveObjects.WishlistsPage.lineQuantityInput(this.page);
        this.lineQuantityPlusButton = JTDoveObjects.WishlistsPage.lineQuantityPlusButton(this.page);
        this.lineQuantityMinusButton = JTDoveObjects.WishlistsPage.lineQuantityMinusButton(this.page);
        this.lineUpdateButton = JTDoveObjects.WishlistsPage.lineUpdateButton(this.page);
        this.lineRemoveButton = JTDoveObjects.WishlistsPage.lineRemoveButton(this.page);
        this.addItemToBasketButton = JTDoveObjects.WishlistsPage.addItemToBasketButton(this.page);
        this.addWishlistToBasketButton = JTDoveObjects.WishlistsPage.addWishlistToBasketButton(this.page);
        this.wishlistTotal = JTDoveObjects.WishlistsPage.wishlistTotal(this.page);
    }

    async navigateToWishlistsPage(): Promise<void> {
        await this.page.goto('/account/wishlists', { timeout: 30000 })
    }

    async validateWishlistsPageLoaded(): Promise<void> {
        await expect(this.createNewWishlistButton).toBeVisible({ timeout: 20000 })
    }

    async verifyMenuItemHighlighted(): Promise<void> {
        const item = this.page.locator('[data-testid="account-menu__item"][data-value="My Lists"]').first()
        await expect(item.getByTestId('account-menu-item__active-block')).toBeVisible({ timeout: 10000 })
    }

    // VERIFIED live (staging, 2026-08-11): creating a wishlist redirects
    // straight to its own details page.
    async createWishlist(name: string): Promise<void> {
        await this.createNewWishlistButton.click()
        await expect(this.modalNameInput).toBeVisible({ timeout: 10000 })
        await this.modalNameInput.fill(name)
        await expect(this.modalCreateButton).toBeEnabled({ timeout: 10000 })
        await this.modalCreateButton.click()
        await expect(this.page).toHaveURL(/\/account\/wishlists\/\d+$/, { timeout: 20000 })
    }

    async verifyCreateWishlistBlockedWhenNameEmpty(): Promise<void> {
        await this.createNewWishlistButton.click()
        await expect(this.modalNameInput).toBeVisible({ timeout: 10000 })
        await expect(this.modalCreateButton).toBeDisabled({ timeout: 10000 })
    }

    async searchWishlistsByName(name: string): Promise<void> {
        await this.nameFilterInput.fill(name)
    }

    async getWishlistRowCount(): Promise<number> {
        return this.page.getByTestId(/^account-wishlists-row-\d+$/).count()
    }

    async getWishlistNames(): Promise<string[]> {
        const count = await this.getWishlistRowCount()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            names.push((await JTDoveObjects.WishlistsPage.rowNameCellByIndex(i)(this.page).textContent()) ?? '')
        }
        return names
    }

    async resetSearch(): Promise<void> {
        await this.filterResetButton.click()
    }

    async openWishlistByIndex(index: number): Promise<void> {
        await JTDoveObjects.WishlistsPage.rowEditLinkByIndex(index)(this.page).click()
    }

    // VERIFIED live (staging, 2026-08-11): confirming this opens a
    // confirmation dialog rather than deleting immediately.
    async clickDeleteWishlistByIndex(index: number): Promise<void> {
        await JTDoveObjects.WishlistsPage.rowDeleteButtonByIndex(index)(this.page).click()
    }

    // CONFIRMED live (staging, 2026-08-12): this dialog actually has
    // THREE buttons, and the wording differs by entry point - from the
    // list page: "Cancel", "Delete", "Close" (X icon); from the details
    // page: "Close", "Delete Wishlist", "Close" (X icon). Targeting the
    // last button (as this used to) hits the X icon in both cases,
    // which just dismisses the dialog WITHOUT deleting anything - the
    // destructive action is whichever button's name starts with
    // "Delete", which is unique in either wording.
    async confirmDeleteInDialog(): Promise<void> {
        const dialog = this.page.getByRole('dialog').filter({ hasText: 'Delete Wishlist' })
        await expect(dialog).toBeVisible({ timeout: 10000 })
        await dialog.getByRole('button', { name: /^delete/i }).click()
    }

    async cancelDeleteInDialog(): Promise<void> {
        const dialog = this.page.getByRole('dialog').filter({ hasText: 'Delete Wishlist' })
        await dialog.getByRole('button', { name: 'Close' }).click()
    }

    async getDetailsHeadingText(): Promise<string> {
        return (await this.detailsHeading.textContent()) ?? ''
    }

    // VERIFIED live (staging, 2026-08-11): a Quick Add search result is
    // just a plain link to the product's PDP - it does NOT add the
    // product to the wishlist directly. Adding to a wishlist is done from
    // the PDP's own "Add to list" button (see JTDovePDPage.addToWishlist).
    async quickAddSearchAndOpenFirstResult(searchText: string): Promise<void> {
        await this.quickAddSearchInput.fill(searchText)
        await expect(this.quickAddHitProducts.first()).toBeVisible({ timeout: 10000 })
        await this.quickAddHitProducts.first().click()
    }

    async openShareModal(): Promise<void> {
        await this.shareButton.click()
        await expect(this.shareModalEmailInput).toBeVisible({ timeout: 10000 })
    }

    // CONFIRMED live (staging, 2026-08-12): clicking Share does NOT
    // close the dialog on its own - it has to be dismissed explicitly.
    async shareWithEmail(email: string): Promise<void> {
        await this.shareModalEmailInput.fill(email)
        await this.page.keyboard.press('Enter')
        await expect(this.shareModalShareButton).toBeEnabled({ timeout: 10000 })
        await this.shareModalShareButton.click()
        // No visible confirmation signal to await (no success message,
        // unlike Add to Wishlist) - a short pragmatic pause avoids
        // closing before the share request has actually gone out.
        await this.page.waitForTimeout(1000)
        await this.shareModalCloseButton.click()
        await expect(this.shareModalEmailInput).toBeHidden({ timeout: 10000 })
    }

    // CONFIRMED live (staging, 2026-08-12): the Share button is NOT
    // disabled for an empty email (this is a react-tags chip input with
    // no "required" wiring on the button) - clicking it with no tag
    // added is a safe no-op though: no request fires and the dialog
    // stays open, which is what this actually checks.
    async verifyShareBlockedWithEmptyEmail(): Promise<void> {
        await this.shareModalShareButton.click()
        await expect(this.shareModalEmailInput).toBeVisible({ timeout: 5000 })
    }

    // CONFIRMED SITE BUG (JTD-325, staging, 2026-08-12): this Share
    // modal performs NO email format validation anywhere - typing
    // "not-a-valid-email", pressing Enter to add it as a tag, and
    // clicking Share sends a real POST to /account/wishlists/<id> that
    // returns 200, with no error shown to the user. Written against the
    // expected/correct behaviour (an invalid format should be rejected
    // before or during submission) on purpose.
    //
    // DEPRIORITISED (2026-08-13): per explicit instruction this is low
    // priority and unlikely to be fixed soon, so its caller in case 164
    // (wishlists.test.ts) is commented out rather than left permanently
    // red. Method kept as-is so it's a one-line re-enable once the fix
    // is scheduled.
    async verifyInvalidEmailRejected(invalidEmail: string): Promise<void> {
        await this.shareModalEmailInput.fill(invalidEmail)
        await this.page.keyboard.press('Enter')
        await expect(this.shareModalShareButton).toBeDisabled({ timeout: 10000 })
    }

    async openEditNameModal(): Promise<void> {
        await this.editNameButton.click()
    }

    async renameWishlist(newName: string): Promise<void> {
        const dialog = this.page.getByRole('dialog').filter({ hasText: 'Edit Wishlist' })
        const input = dialog.locator('[id="Wishlist Name"]')
        await expect(input).toBeVisible({ timeout: 10000 })
        await input.fill(newName)
        await dialog.getByRole('button', { name: 'Save Changes' }).click()
    }

    async verifyLineItemVisible(productName: string): Promise<void> {
        await expect(this.page.getByText(productName)).toBeVisible({ timeout: 15000 })
    }

    async incrementLineQuantityAndUpdate(): Promise<void> {
        await this.lineQuantityPlusButton.click()
        await this.lineUpdateButton.click()
    }

    async decrementLineQuantityAndUpdate(): Promise<void> {
        await this.lineQuantityMinusButton.click()
        await this.lineUpdateButton.click()
    }

    async getLineQuantity(): Promise<string> {
        return this.lineQuantityInput.inputValue()
    }

    async removeLineItem(): Promise<void> {
        await this.lineRemoveButton.click()
    }

    async getWishlistTotalText(): Promise<string> {
        return (await this.wishlistTotal.textContent()) ?? ''
    }

    async addWishlistToBasket(): Promise<void> {
        await this.addWishlistToBasketButton.click()
    }
}
