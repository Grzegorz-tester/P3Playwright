import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { RussellsObjects } from '../utils/objects'
import { AddressData } from '@utils/fakeData'

export class RussellsAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly myDetailsForm = RussellsObjects.AccountPage.myDetailsForm(this.page);
    readonly resetPasswordToggleButton = RussellsObjects.AccountPage.resetPasswordToggleButton(this.page);
    readonly changePasswordForm = RussellsObjects.AccountPage.changePasswordForm(this.page);
    readonly existingPasswordInput = RussellsObjects.AccountPage.existingPasswordInput(this.page);
    readonly newPasswordInput = RussellsObjects.AccountPage.newPasswordInput(this.page);
    readonly repeatNewPasswordInput = RussellsObjects.AccountPage.repeatNewPasswordInput(this.page);
    readonly changePasswordSaveButton = RussellsObjects.AccountPage.changePasswordSaveButton(this.page);
    readonly changePasswordAlert = RussellsObjects.AccountPage.changePasswordAlert(this.page);

    readonly dashboardMenuButton = RussellsObjects.AccountPage.dashboardMenuButton(this.page);
    readonly profileMenuButton = RussellsObjects.AccountPage.profileMenuButton(this.page);
    readonly addressBookMenuButton = RussellsObjects.AccountPage.addressBookMenuButton(this.page);
    readonly ordersMenuButton = RussellsObjects.AccountPage.ordersMenuButton(this.page);
    readonly wishlistsMenuButton = RussellsObjects.AccountPage.wishlistsMenuButton(this.page);

    readonly ordersPageHeading = RussellsObjects.AccountPage.ordersPageHeading(this.page);
    readonly ordersHeaderRow = RussellsObjects.AccountPage.ordersHeaderRow(this.page);
    readonly ordersReferenceFilterInput = RussellsObjects.AccountPage.ordersReferenceFilterInput(this.page);
    readonly ordersTotalAmountFilterInput = RussellsObjects.AccountPage.ordersTotalAmountFilterInput(this.page);
    readonly ordersFirstRow = RussellsObjects.AccountPage.ordersRow(0)(this.page);
    readonly ordersFirstRowReferenceCell = RussellsObjects.AccountPage.ordersRowReferenceCell(0)(this.page);
    readonly ordersFirstRowAmountCell = RussellsObjects.AccountPage.ordersRowAmountCell(0)(this.page);

    readonly addDeliveryAddressButton = RussellsObjects.AccountPage.addDeliveryAddressButton(this.page);
    readonly deliveryAddressForm = RussellsObjects.AccountPage.deliveryAddressForm(this.page);
    readonly deliveryAddressFirstNameInput = RussellsObjects.AccountPage.deliveryAddressFirstNameInput(this.page);
    readonly deliveryAddressLastNameInput = RussellsObjects.AccountPage.deliveryAddressLastNameInput(this.page);
    readonly deliveryAddressLine1Input = RussellsObjects.AccountPage.deliveryAddressLine1Input(this.page);
    readonly deliveryAddressCityInput = RussellsObjects.AccountPage.deliveryAddressCityInput(this.page);
    readonly deliveryAddressPostcodeInput = RussellsObjects.AccountPage.deliveryAddressPostcodeInput(this.page);
    readonly deliveryAddressSaveButton = RussellsObjects.AccountPage.deliveryAddressSaveButton(this.page);
    readonly addBillingAddressButton = RussellsObjects.AccountPage.addBillingAddressButton(this.page);
    readonly billingAddressForm = RussellsObjects.AccountPage.billingAddressForm(this.page);
    readonly billingAddressFirstNameInput = RussellsObjects.AccountPage.billingAddressFirstNameInput(this.page);
    readonly billingAddressLastNameInput = RussellsObjects.AccountPage.billingAddressLastNameInput(this.page);
    readonly billingAddressLine1Input = RussellsObjects.AccountPage.billingAddressLine1Input(this.page);
    readonly billingAddressCityInput = RussellsObjects.AccountPage.billingAddressCityInput(this.page);
    readonly billingAddressPostcodeInput = RussellsObjects.AccountPage.billingAddressPostcodeInput(this.page);
    readonly billingAddressSaveButton = RussellsObjects.AccountPage.billingAddressSaveButton(this.page);

    readonly wishlistsHeading = RussellsObjects.AccountPage.wishlistsHeading(this.page);
    readonly createWishlistButton = RussellsObjects.AccountPage.createWishlistButton(this.page);
    readonly dialog = RussellsObjects.AccountPage.dialog(this.page);
    readonly createWishlistNameInput = RussellsObjects.AccountPage.createWishlistNameInput(this.page);
    readonly createWishlistSubmitButton = RussellsObjects.AccountPage.createWishlistSubmitButton(this.page);
    readonly createWishlistCancelButton = RussellsObjects.AccountPage.createWishlistCancelButton(this.page);
    readonly confirmDeletionProceedButton = RussellsObjects.AccountPage.confirmDeletionProceedButton(this.page);
    readonly wishlistSearchInput = RussellsObjects.AccountPage.wishlistSearchInput(this.page);
    readonly wishlistNameSortButton = RussellsObjects.AccountPage.wishlistNameSortButton(this.page);
    readonly wishlistRows = RussellsObjects.AccountPage.wishlistRows(this.page);
    readonly wishlistDetails = RussellsObjects.AccountPage.wishlistDetails(this.page);
    readonly wishlistDetailsName = RussellsObjects.AccountPage.wishlistDetailsName(this.page);
    readonly wishlistDetailsEditNameButton = RussellsObjects.AccountPage.wishlistDetailsEditNameButton(this.page);
    readonly wishlistDetailsNameInput = RussellsObjects.AccountPage.wishlistDetailsNameInput(this.page);
    readonly wishlistDetailsSaveNameButton = RussellsObjects.AccountPage.wishlistDetailsSaveNameButton(this.page);
    readonly wishlistDetailsCancelNameButton = RussellsObjects.AccountPage.wishlistDetailsCancelNameButton(this.page);
    readonly wishlistDetailsDeleteButton = RussellsObjects.AccountPage.wishlistDetailsDeleteButton(this.page);
    readonly wishlistNoItemsText = RussellsObjects.AccountPage.wishlistNoItemsText(this.page);
    readonly quickBuySearchInput = RussellsObjects.AccountPage.quickBuySearchInput(this.page);
    readonly quickBuySearchResultLinks = RussellsObjects.AccountPage.quickBuySearchResultLinks(this.page);
    readonly wishlistSummary = RussellsObjects.AccountPage.wishlistSummary(this.page);
    readonly shareWishlistButton = RussellsObjects.AccountPage.shareWishlistButton(this.page);
    readonly shareWishlistEmailInput = RussellsObjects.AccountPage.shareWishlistEmailInput(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 60000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 60000 })
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
    }

    async navigateToAddressBook(): Promise<void> {
        await this.page.goto('/account/address-book', { timeout: 45000 })
        await expect(this.deliveryAddressForm.or(this.addDeliveryAddressButton)).toBeVisible({ timeout: 35000 })
    }

    async navigateToProfilePage(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 45000 })
        await expect(this.myDetailsForm.or(this.changePasswordForm)).toBeVisible({ timeout: 35000 })
    }

    async navigateToOrdersPage(): Promise<void> {
        await this.page.goto('/account/orders', { timeout: 45000 })
        await expect(this.ordersPageHeading).toBeVisible({ timeout: 35000 })
    }

    // VERIFIED live (staging, 2026-07-31, then reverted): the "Reset
    // Password" link on the My Details form swaps the same card over to
    // this Change Password form in place. A successful change shows
    // "Password successfully updated".
    async changePassword(existingPassword: string, newPassword: string): Promise<void> {
        if (await this.myDetailsForm.isVisible()) {
            await this.resetPasswordToggleButton.click()
            await expect(this.changePasswordForm).toBeVisible({ timeout: 15000 })
        }
        await this.existingPasswordInput.fill(existingPassword)
        await this.newPasswordInput.fill(newPassword)
        await this.repeatNewPasswordInput.fill(newPassword)
        await this.changePasswordSaveButton.click()
        await expect(this.changePasswordAlert).toHaveText('Password successfully updated', { timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-07-31): accountTestUser_1 has a
    // permanent fixture delivery + billing address, added deliberately so
    // the checkout flow always has a saved address to select — see
    // RUS-474.
    async validateOrdersPageHasRealOrder(): Promise<void> {
        await expect(this.ordersHeaderRow).toContainText('Order Number')
        await expect(this.ordersHeaderRow).toContainText('Placed On')
        await expect(this.ordersHeaderRow).toContainText('Amount')
        await expect(this.ordersReferenceFilterInput).toBeVisible()
        await expect(this.ordersTotalAmountFilterInput).toBeVisible()
        await expect(this.ordersFirstRow).toBeVisible()
        await expect(this.ordersFirstRowReferenceCell).toHaveText(/^\d+$/)
        await expect(this.ordersFirstRowAmountCell).toHaveText(/£/)
    }

    // Returns the clicked order's reference (e.g. "000154") so the caller
    // can verify the order detail page reached afterwards shows the same
    // order.
    async openMostRecentOrder(): Promise<string> {
        const reference = await this.ordersFirstRowReferenceCell.textContent()
        expect(reference).not.toBe('')
        await this.ordersFirstRow.click()
        await expect(this.page).toHaveURL(/\/account\/orders\/\d+$/, { timeout: 20000 })
        return reference ?? ''
    }

    // VERIFIED live (staging, 2026-08-03): filters live (debounced) down
    // to the exact matching row. Used instead of openMostRecentOrder()
    // when a test needs to open the SPECIFIC order it just placed -
    // "most recent" would be ambiguous (and a real race) if another test
    // run placed an order against this same shared account around the
    // same time.
    async openOrderByReference(reference: string): Promise<void> {
        await this.ordersReferenceFilterInput.fill(reference)
        await expect(this.ordersFirstRowReferenceCell).toHaveText(reference, { timeout: 15000 })
        await this.ordersFirstRow.click()
        await expect(this.page).toHaveURL(/\/account\/orders\/\d+$/, { timeout: 20000 })
    }

    // VERIFIED live (staging, 2026-07-31): the account order-detail page
    // reuses the exact same "orders-details__*" testids as the checkout
    // thank-you page.
    async validateOrderDetailsPage(orderReference: string, accountEmail: string): Promise<void> {
        await expect(RussellsObjects.CheckoutSuccessPage.orderReference(this.page)).toContainText(orderReference)
        await expect(RussellsObjects.CheckoutSuccessPage.orderConfirmationEmail(this.page)).toContainText(accountEmail)
    }

    private async fillDeliveryAddressForm(address: AddressData): Promise<void> {
        await this.deliveryAddressFirstNameInput.fill(address.firstName)
        await this.deliveryAddressLastNameInput.fill(address.lastName)
        await this.deliveryAddressLine1Input.fill(address.addressLine1)
        await this.deliveryAddressCityInput.fill(address.city)
        await this.deliveryAddressPostcodeInput.fill(address.postcode)
        await this.deliveryAddressSaveButton.click()
    }

    // Returns the newly-added address's number — not reliably "1" now that
    // a permanent fixture address exists (see class-level comment).
    async addDeliveryAddress(address: AddressData): Promise<number> {
        await this.navigateToAddressBook()
        const countBefore = await RussellsObjects.AccountPage.deliveryAddressNames(this.page).count()
        // "Add new address" only appears once an address already exists —
        // on an empty book the form is already open.
        if (await this.addDeliveryAddressButton.count() > 0) {
            await this.addDeliveryAddressButton.click()
            await expect(this.deliveryAddressForm).toBeVisible({ timeout: 35000 })
        }
        await this.fillDeliveryAddressForm(address)
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        const newAddressNumber = countBefore + 1
        await expect(RussellsObjects.AccountPage.deliveryAddressName(newAddressNumber)(this.page)).toBeVisible({ timeout: 35000 })
        return newAddressNumber
    }

    async editDeliveryAddress(addressNumber: number, address: AddressData): Promise<void> {
        await RussellsObjects.AccountPage.deliveryAddressEditButton(addressNumber)(this.page).click()
        await expect(this.deliveryAddressForm).toBeVisible({ timeout: 35000 })
        await this.fillDeliveryAddressForm(address)
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        await expect(RussellsObjects.AccountPage.deliveryAddressName(addressNumber)(this.page))
            .toContainText(`${address.firstName} ${address.lastName}`, { timeout: 35000 })
    }

    // VERIFIED live (staging, 2026-07-31): clicking Delete opens a
    // confirm/cancel prompt before the address actually disappears.
    async removeDeliveryAddress(addressNumber: number): Promise<void> {
        await RussellsObjects.AccountPage.deliveryAddressDeleteButton(addressNumber)(this.page).click()
        const confirmButton = RussellsObjects.AccountPage.deliveryAddressDeleteConfirmYesButton(addressNumber)(this.page)
        await expect(confirmButton).toBeVisible({ timeout: 15000 })
        await confirmButton.click()
        await expect(RussellsObjects.AccountPage.deliveryAddressName(addressNumber)(this.page)).toHaveCount(0, { timeout: 35000 })
    }

    private async fillBillingAddressForm(address: AddressData): Promise<void> {
        await this.billingAddressFirstNameInput.fill(address.firstName)
        await this.billingAddressLastNameInput.fill(address.lastName)
        await this.billingAddressLine1Input.fill(address.addressLine1)
        await this.billingAddressCityInput.fill(address.city)
        await this.billingAddressPostcodeInput.fill(address.postcode)
        await this.billingAddressSaveButton.click()
    }

    async addBillingAddress(address: AddressData): Promise<number> {
        await this.navigateToAddressBook()
        const countBefore = await RussellsObjects.AccountPage.billingAddressNames(this.page).count()
        if (await this.addBillingAddressButton.count() > 0) {
            await this.addBillingAddressButton.click()
            await expect(this.billingAddressForm).toBeVisible({ timeout: 35000 })
        }
        await this.fillBillingAddressForm(address)
        await expect(this.addBillingAddressButton).toBeVisible({ timeout: 35000 })
        const newAddressNumber = countBefore + 1
        await expect(RussellsObjects.AccountPage.billingAddressName(newAddressNumber)(this.page)).toBeVisible({ timeout: 35000 })
        return newAddressNumber
    }

    async editBillingAddress(addressNumber: number, address: AddressData): Promise<void> {
        await RussellsObjects.AccountPage.billingAddressEditButton(addressNumber)(this.page).click()
        await expect(this.billingAddressForm).toBeVisible({ timeout: 35000 })
        await this.fillBillingAddressForm(address)
        await expect(this.addBillingAddressButton).toBeVisible({ timeout: 35000 })
        await expect(RussellsObjects.AccountPage.billingAddressName(addressNumber)(this.page))
            .toContainText(`${address.firstName} ${address.lastName}`, { timeout: 35000 })
    }

    async removeBillingAddress(addressNumber: number): Promise<void> {
        await RussellsObjects.AccountPage.billingAddressDeleteButton(addressNumber)(this.page).click()
        const confirmButton = RussellsObjects.AccountPage.billingAddressDeleteConfirmYesButton(addressNumber)(this.page)
        await expect(confirmButton).toBeVisible({ timeout: 15000 })
        await confirmButton.click()
        await expect(RussellsObjects.AccountPage.billingAddressName(addressNumber)(this.page)).toHaveCount(0, { timeout: 35000 })
    }

    // --- Wishlists (admin-only — see wishlistsMenuButton/testUsers.ts notes) ---

    // CONFIRMED live (staging, 2026-08-02): this is a Next.js app -
    // calling this when already on /account/wishlists is a client-side
    // no-op (no full reload/remount), so any in-page state (e.g. a
    // search filter) left over from a previous step survives it. Only
    // reliable as a "reset" when called from a DIFFERENT URL.
    async navigateToWishlistsPage(): Promise<void> {
        await this.page.goto('/account/wishlists', { timeout: 45000 })
        await expect(this.wishlistsHeading).toHaveText('My Wishlists', { timeout: 35000 })
    }

    // CONFIRMED live (staging, 2026-08-02): a real automated run left 3
    // "Playwright QA ..." wishlists behind after earlier test failures
    // (each failed before reaching its own end-of-test delete step),
    // which then broke a LATER run's sort-toggle check by changing the
    // list's row count out from under it. This account's wishlist list is
    // real, shared, persistent backend state — same class of issue as
    // RussellsBasketPage.clearBasket(). Called at the START of both admin
    // tests below so a prior failed run's leftovers can never pollute a
    // later one.
    //
    // INCIDENT (staging, 2026-08-02): an earlier version of this method
    // read the row count immediately after filling the search box,
    // before the app's OWN debounced filtering had actually applied —
    // that race let the loop grab and delete whatever was still showing
    // UNFILTERED, which deleted 5 real pre-existing fixture wishlists
    // (test, test2, test3, test customer, richard_ogle_test_1) instead of
    // only "Playwright QA ..." ones. Fixed with two independent guards
    // below: (1) actively wait for every visible row to actually match
    // the search before trusting the list at all, and (2) a per-row
    // safety check that refuses to delete anything not matching, so a
    // similar race can never again delete the wrong wishlist.
    async cleanupPlaywrightTestWishlists(): Promise<void> {
        await this.navigateToWishlistsPage()
        await this.wishlistSearchInput.fill('Playwright QA')
        await expect(async () => {
            const rowTexts = await this.wishlistRows.allTextContents()
            for (const text of rowTexts) {
                expect(text.includes('Playwright QA') || text.includes('No results found.')).toBe(true)
            }
        }).toPass({ timeout: 10000 })

        // A no-matches search renders a single-cell "No results found."
        // placeholder row (confirmed live, 2026-08-02) — a real wishlist
        // row always has 4 cells (name/created/modified/delete), so that
        // distinguishes an actual row to delete from the empty state.
        while (await this.wishlistRows.filter({ hasNotText: 'No results found.' }).count() > 0) {
            const name = await this.wishlistRows.first().locator('td').first().textContent()
            if (!name || !name.includes('Playwright QA')) {
                throw new Error(`Refusing to delete unexpected wishlist "${name}" during cleanup — the search filter may not be applied.`)
            }
            await RussellsObjects.AccountPage.wishlistRowDeleteButtonFiltered(name)(this.page).click()
            await expect(this.confirmDeletionProceedButton).toBeVisible({ timeout: 15000 })
            await this.confirmDeletionProceedButton.click()
            await expect(RussellsObjects.AccountPage.wishlistRowFiltered(name)(this.page)).toHaveCount(0, { timeout: 20000 })
        }
    }

    // VERIFIED live (staging, 2026-08-02): a genuine 404 (HTTP status and
    // rendered 404 content), not a redirect — for a non-admin account.
    async validateWishlistsPageIs404(): Promise<void> {
        const response = await this.page.goto('/account/wishlists', { timeout: 45000 })
        expect(response?.status()).toBe(404)
        await expect(this.page.getByRole('heading', { name: "We couldn't find the page you're looking for" })).toBeVisible({ timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-08-02): "Create Wishlist" stays
    // disabled until a name is entered.
    async validateCreateWishlistButtonDisabledWhenEmpty(): Promise<void> {
        await this.createWishlistButton.click()
        await expect(this.createWishlistNameInput).toBeVisible({ timeout: 15000 })
        await expect(this.createWishlistSubmitButton).toBeDisabled()
        await this.createWishlistNameInput.fill('Playwright QA Wishlist')
        await expect(this.createWishlistSubmitButton).toBeEnabled()
        await this.createWishlistCancelButton.click()
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
    }

    // Returns the URL reached (/account/wishlists/<id>) so the caller can
    // navigate straight back to it later without re-searching the list.
    async createWishlist(name: string): Promise<string> {
        await this.createWishlistButton.click()
        await expect(this.createWishlistNameInput).toBeVisible({ timeout: 15000 })
        await this.createWishlistNameInput.fill(name)
        await this.createWishlistSubmitButton.click()
        await this.page.waitForURL(/\/account\/wishlists\/\d+$/, { timeout: 20000 })
        await expect(this.wishlistDetailsName).toHaveText(name, { timeout: 20000 })
        return this.page.url()
    }

    // CONFIRMED live (staging, 2026-08-02): wishlistRows.locator('td')
    // matches ALL <td>s across every matched row combined, not "one td
    // per row" — chaining .locator() on a multi-element locator doesn't
    // auto-scope per ancestor. .first() on that combined locator was
    // therefore collapsing to a SINGLE <td> total (whichever came first
    // in DOM order across every row), not the first cell of each row —
    // this went unnoticed for a while since a 1-row search result made a
    // 1-element read look correct by coincidence. td:first-child is a
    // real per-row CSS match (one match per <tr>), giving the actual
    // first-column name for every row in DOM order.
    private async getWishlistNamesInOrder(): Promise<string[]> {
        return this.wishlistRows.locator('td:first-child').allTextContents()
    }

    // VERIFIED live (staging, 2026-08-02): filters live as you type, no
    // Enter/search button needed (debounced).
    async searchWishlistsAndValidateFilteredTo(query: string, expectedNames: string[]): Promise<void> {
        await this.wishlistSearchInput.fill(query)
        await expect(async () => {
            const names = await this.getWishlistNamesInOrder()
            expect(names.sort()).toEqual([...expectedNames].sort())
        }).toPass({ timeout: 10000 })
    }

    // Doesn't assert a specific collation order (space-vs-digit sorting
    // showed non-obvious behaviour during investigation) — only that
    // clicking once changes the order, and clicking again produces the
    // EXACT reverse, which holds regardless of collation.
    async validateNameSortToggles(): Promise<void> {
        const originalOrder = await this.getWishlistNamesInOrder()
        await this.wishlistNameSortButton.click()
        const firstClickOrder = await this.getWishlistNamesInOrder()
        expect(firstClickOrder).not.toEqual(originalOrder)
        await this.wishlistNameSortButton.click()
        const secondClickOrder = await this.getWishlistNamesInOrder()
        expect(secondClickOrder).toEqual([...firstClickOrder].reverse())
    }

    async openWishlistByName(name: string): Promise<void> {
        await RussellsObjects.AccountPage.wishlistRowFiltered(name)(this.page).click()
        await this.page.waitForURL(/\/account\/wishlists\/\d+$/, { timeout: 20000 })
        await expect(this.wishlistDetailsName).toHaveText(name, { timeout: 20000 })
    }

    // VERIFIED live (staging, 2026-08-02): deletable directly from the
    // list, not just from the detail page — same "Confirm Deletion"
    // dialog either way.
    async deleteWishlistFromList(name: string): Promise<void> {
        await RussellsObjects.AccountPage.wishlistRowDeleteButtonFiltered(name)(this.page).click()
        await expect(this.confirmDeletionProceedButton).toBeVisible({ timeout: 15000 })
        await this.confirmDeletionProceedButton.click()
        await expect(RussellsObjects.AccountPage.wishlistRowFiltered(name)(this.page)).toHaveCount(0, { timeout: 20000 })
    }

    async validateWishlistIsEmpty(): Promise<void> {
        await expect(this.wishlistNoItemsText).toBeVisible({ timeout: 15000 })
    }

    // Returns the added product's name so the caller can verify it
    // against the resulting line item.
    async addFirstQuickBuyResult(query: string): Promise<string> {
        await this.quickBuySearchInput.fill(query)
        const firstResult = this.quickBuySearchResultLinks.first()
        await expect(firstResult).toBeVisible({ timeout: 15000 })
        const name = (await firstResult.textContent())?.trim() ?? ''
        expect(name).not.toBe('')
        await firstResult.click()
        await expect(RussellsObjects.AccountPage.wishlistItemsLine(0)(this.page)).toBeVisible({ timeout: 15000 })
        return name
    }

    async getLineTotalPrice(index: number): Promise<string> {
        return (await RussellsObjects.AccountPage.wishlistItemsLineTotalPrice(index)(this.page).textContent()) ?? ''
    }

    async getLineUnitPrice(index: number): Promise<string> {
        return (await RussellsObjects.AccountPage.wishlistItemsLinePrice(index)(this.page).textContent()) ?? ''
    }

    async getWishlistTotal(): Promise<string> {
        return (await this.wishlistSummary.textContent()) ?? ''
    }

    // VERIFIED live (staging, 2026-08-02): quantity starts at 1 with
    // decrement disabled; incrementing recalculates both the line total
    // and the wishlist total.
    async incrementLineQuantity(index: number): Promise<void> {
        await RussellsObjects.AccountPage.wishlistItemsLineQuantityPlusButton(index)(this.page).click()
    }

    async getLineQuantity(index: number): Promise<string> {
        return RussellsObjects.AccountPage.wishlistItemsLineQuantityInput(index)(this.page).inputValue()
    }

    async removeLine(index: number): Promise<void> {
        await RussellsObjects.AccountPage.wishlistItemsLineRemoveButton(index)(this.page).click()
    }

    // VERIFIED live (staging, 2026-08-02): "Edit Name" swaps the display
    // name for an inline input with Save/Cancel — not a modal.
    async editWishlistName(newName: string): Promise<void> {
        await this.wishlistDetailsEditNameButton.click()
        await expect(this.wishlistDetailsNameInput).toBeVisible({ timeout: 15000 })
        await this.wishlistDetailsNameInput.fill(newName)
        await this.wishlistDetailsSaveNameButton.click()
        await expect(this.wishlistDetailsName).toHaveText(newName, { timeout: 15000 })
    }

    async cancelEditWishlistName(newName: string): Promise<void> {
        const originalName = (await this.wishlistDetailsName.textContent()) ?? ''
        await this.wishlistDetailsEditNameButton.click()
        await expect(this.wishlistDetailsNameInput).toBeVisible({ timeout: 15000 })
        await this.wishlistDetailsNameInput.fill(newName)
        await this.wishlistDetailsCancelNameButton.click()
        await expect(this.wishlistDetailsName).toHaveText(originalName, { timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-08-02): redirects back to the list on
    // success — same "Confirm Deletion" dialog as the list's per-row
    // delete.
    async deleteWishlistFromDetailsPage(): Promise<void> {
        await this.wishlistDetailsDeleteButton.click()
        await expect(this.confirmDeletionProceedButton).toBeVisible({ timeout: 15000 })
        await this.confirmDeletionProceedButton.click()
        await expect(this.page).toHaveURL(/\/account\/wishlists$/, { timeout: 20000 })
    }

    // Deliberately does NOT click Proceed - this would send a real email
    // to whatever address is entered, which isn't a risk worth taking
    // just to prove a validation state. Confirms the dialog opens and its
    // Proceed button gates on a valid email, then closes without sending.
    async validateShareWishlistDialogGatesOnEmail(email: string): Promise<void> {
        await this.shareWishlistButton.click()
        await expect(this.shareWishlistEmailInput).toBeVisible({ timeout: 15000 })
        const proceedButton = this.dialog.locator('button').filter({ hasText: 'Proceed' })
        await expect(proceedButton).toBeDisabled()
        await this.shareWishlistEmailInput.fill(email)
        await expect(proceedButton).toBeEnabled()
        await this.dialog.locator('button').filter({ hasText: 'Close' }).first().click()
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
    }
}
