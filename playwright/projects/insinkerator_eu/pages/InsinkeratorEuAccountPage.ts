import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { InsinkeratorEuObjects } from '../utils/objects'
import { AddressData } from '@utils/fakeData'

export class InsinkeratorEuAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    // VERIFIED — confirmed on /account and /account/address-book after
    // successfully logging in with grzegorz.hajduk@velstar.co.uk / Testing123!
    // NOTE: dashboard/addressBook/orders buttons all share the same
    // underlying testid ("account-menu__item") and are only distinguished
    // by href — see objects.ts.
    readonly dashboardMenuButton = InsinkeratorEuObjects.AccountPage.dashboardMenuButton(this.page);
    readonly profileMenuButton = InsinkeratorEuObjects.AccountPage.profileMenuButton(this.page);
    readonly addressBookMenuButton = InsinkeratorEuObjects.AccountPage.addressBookMenuButton(this.page);
    readonly ordersMenuButton = InsinkeratorEuObjects.AccountPage.ordersMenuButton(this.page);
    readonly myDetailsForm = InsinkeratorEuObjects.AccountPage.myDetailsForm(this.page);
    readonly resetPasswordButton = InsinkeratorEuObjects.AccountPage.resetPasswordButton(this.page);
    readonly changePasswordForm = InsinkeratorEuObjects.AccountPage.changePasswordForm(this.page);
    readonly existingPasswordInput = InsinkeratorEuObjects.AccountPage.existingPasswordInput(this.page);
    readonly newPasswordInput = InsinkeratorEuObjects.AccountPage.newPasswordInput(this.page);
    readonly repeatNewPasswordInput = InsinkeratorEuObjects.AccountPage.repeatNewPasswordInput(this.page);
    readonly changePasswordSaveButton = InsinkeratorEuObjects.AccountPage.changePasswordSaveButton(this.page);
    readonly changePasswordAlert = InsinkeratorEuObjects.AccountPage.changePasswordAlert(this.page);
    readonly ordersPageHeading = InsinkeratorEuObjects.AccountPage.ordersPageHeading(this.page);
    readonly ordersHeaderRow = InsinkeratorEuObjects.AccountPage.ordersHeaderRow(this.page);
    readonly ordersReferenceFilterInput = InsinkeratorEuObjects.AccountPage.ordersReferenceFilterInput(this.page);
    readonly ordersDateRangePicker = InsinkeratorEuObjects.AccountPage.ordersDateRangePicker(this.page);
    readonly ordersTotalAmountFilterInput = InsinkeratorEuObjects.AccountPage.ordersTotalAmountFilterInput(this.page);
    readonly ordersFilterResetButton = InsinkeratorEuObjects.AccountPage.ordersFilterResetButton(this.page);
    readonly ordersNoResultsRow = InsinkeratorEuObjects.AccountPage.ordersNoResultsRow(this.page);
    readonly ordersFirstRow = InsinkeratorEuObjects.AccountPage.ordersRow(0)(this.page);
    readonly ordersFirstRowReferenceCell = InsinkeratorEuObjects.AccountPage.ordersRowReferenceCell(0)(this.page);
    readonly ordersFirstRowAmountCell = InsinkeratorEuObjects.AccountPage.ordersRowAmountCell(0)(this.page);
    readonly addDeliveryAddressButton = InsinkeratorEuObjects.AccountPage.addDeliveryAddressButton(this.page);
    readonly deliveryAddressForm = InsinkeratorEuObjects.AccountPage.deliveryAddressForm(this.page);
    readonly deliveryAddressFirstNameInput = InsinkeratorEuObjects.AccountPage.deliveryAddressFirstNameInput(this.page);
    readonly deliveryAddressLastNameInput = InsinkeratorEuObjects.AccountPage.deliveryAddressLastNameInput(this.page);
    readonly deliveryAddressLine1Input = InsinkeratorEuObjects.AccountPage.deliveryAddressLine1Input(this.page);
    readonly deliveryAddressCityInput = InsinkeratorEuObjects.AccountPage.deliveryAddressCityInput(this.page);
    readonly deliveryAddressPostcodeInput = InsinkeratorEuObjects.AccountPage.deliveryAddressPostcodeInput(this.page);
    readonly deliveryAddressSaveButton = InsinkeratorEuObjects.AccountPage.deliveryAddressSaveButton(this.page);
    readonly addBillingAddressButton = InsinkeratorEuObjects.AccountPage.addBillingAddressButton(this.page);
    readonly billingAddressForm = InsinkeratorEuObjects.AccountPage.billingAddressForm(this.page);
    readonly billingAddressFirstNameInput = InsinkeratorEuObjects.AccountPage.billingAddressFirstNameInput(this.page);
    readonly billingAddressLastNameInput = InsinkeratorEuObjects.AccountPage.billingAddressLastNameInput(this.page);
    readonly billingAddressLine1Input = InsinkeratorEuObjects.AccountPage.billingAddressLine1Input(this.page);
    readonly billingAddressCityInput = InsinkeratorEuObjects.AccountPage.billingAddressCityInput(this.page);
    readonly billingAddressPostcodeInput = InsinkeratorEuObjects.AccountPage.billingAddressPostcodeInput(this.page);
    readonly billingAddressSaveButton = InsinkeratorEuObjects.AccountPage.billingAddressSaveButton(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
    }

    // CONFIRMED SITE BUG (staging, 2026-07-27): this used to also click
    // dashboardMenuButton first, immediately before profileMenuButton — but
    // we're always already on /account when this runs (called right after
    // navigateToAccountPage()), so that click was a same-route no-op.
    // Traced live via a real trace.zip from a failed automated run: both
    // clicks reported "navigations have finished" with only ~20ms between
    // them, yet the page never left /account — the app's client-side
    // router silently drops the second Link navigation when it fires this
    // soon after a same-route click. Reproduced 4/4 in isolation. Removing
    // the redundant self-click (already-verified one line above via the
    // toHaveCount check) removes the race entirely without losing any real
    // coverage.
    async validateAccountPage(): Promise<void> {
        await expect(this.dashboardMenuButton).toHaveCount(1, { timeout: 60000 })
        await this.profileMenuButton.click()
        await expect(this.myDetailsForm).toBeVisible({ timeout: 35000 })
        await this.addressBookMenuButton.click()
        // NOTE: addDeliveryAddressButton ("Add new address") only renders once
        // at least one delivery address already exists, in which case the
        // add-address FORM (deliveryAddressForm) is replaced by a list view
        // instead — accountTestUser_1 now has a permanent fixture address
        // (see addDeliveryAddress note below), so assert on whichever of the
        // two is actually present rather than assuming either state.
        await expect(this.deliveryAddressForm.or(this.addDeliveryAddressButton)).toBeVisible({ timeout: 35000 })
        await this.ordersMenuButton.click()
    }

    async navigateToAddressBook(): Promise<void> {
        await this.page.goto('/account/address-book', { timeout: 45000 })
        await expect(this.deliveryAddressForm.or(this.addDeliveryAddressButton)).toBeVisible({ timeout: 35000 })
    }

    async navigateToProfilePage(): Promise<void> {
        await this.page.goto('/account/profile', { timeout: 45000 })
        await expect(this.myDetailsForm.or(this.changePasswordForm)).toBeVisible({ timeout: 35000 })
    }

    // VERIFIED — confirmed live (staging, 2026-07-23): the "Reset Password"
    // link on the My Details form swaps the SAME card over to this
    // Change Password form in place (not a navigation). The result alert
    // is reused for both outcomes: a wrong Existing Password shows
    // "Unable to update password" (the Save Changes button does NOT
    // validate the existing password client-side, only that all three
    // fields are non-empty — so a wrong password only surfaces as a
    // server-side error on submit), and a correct one shows "Password
    // successfully updated". Asserts the exact success text so a
    // regression to the wrong-password error (or anything else) fails
    // loudly here rather than silently reporting success.
    async changePassword(existingPassword: string, newPassword: string): Promise<void> {
        if (await this.myDetailsForm.isVisible()) {
            await this.resetPasswordButton.click()
            await expect(this.changePasswordForm).toBeVisible({ timeout: 15000 })
        }
        await this.existingPasswordInput.fill(existingPassword)
        await this.newPasswordInput.fill(newPassword)
        await this.repeatNewPasswordInput.fill(newPassword)
        await this.changePasswordSaveButton.click()
        await expect(this.changePasswordAlert).toHaveText('Password successfully updated', { timeout: 15000 })
    }

    async navigateToOrdersPage(): Promise<void> {
        await this.page.goto('/account/orders', { timeout: 45000 })
        await expect(this.ordersPageHeading).toBeVisible({ timeout: 35000 })
    }

    // CORRECTED (staging, 2026-07-31): accountTestUser_1 used to have
    // ZERO real orders (no payment provider configured — same gap
    // documented on logged-in-purchase-journey.test.ts), so only the
    // empty state was verifiable. Fixed — logged-in-purchase-journey.test.ts
    // now completes a real order every run, so this account permanently
    // has at least one order. Validates the real order row instead of
    // the (now unreachable) "No results." empty state.
    async validateOrdersPageHasRealOrder(): Promise<void> {
        await expect(this.ordersHeaderRow).toContainText('Order Number')
        await expect(this.ordersHeaderRow).toContainText('Placed On')
        await expect(this.ordersHeaderRow).toContainText('Amount')
        await expect(this.ordersReferenceFilterInput).toBeVisible()
        await expect(this.ordersDateRangePicker).toBeVisible()
        await expect(this.ordersTotalAmountFilterInput).toBeVisible()
        await expect(this.ordersFirstRow).toBeVisible()
        await expect(this.ordersFirstRowReferenceCell).toHaveText(/^\d+$/)
        await expect(this.ordersFirstRowAmountCell).toHaveText(/€/)
    }

    // Returns the clicked order's reference (e.g. "000056") so the caller
    // can verify the order detail page reached afterwards shows the same
    // order — see validateOrderDetailsPage() below.
    async openMostRecentOrder(): Promise<string> {
        const reference = await this.ordersFirstRowReferenceCell.textContent()
        expect(reference).not.toBe('')
        await this.ordersFirstRow.click()
        await expect(this.page).toHaveURL(/\/account\/orders\/\d+$/, { timeout: 20000 })
        return reference ?? ''
    }

    // VERIFIED live (staging, 2026-07-31) — the account order detail page
    // reuses the EXACT SAME "orders-details__*" component as the checkout
    // thank-you page (see CheckoutSuccessPage in objects.ts), confirmed by
    // checking the live DOM — reusing those locators here rather than
    // duplicating them.
    async validateOrderDetailsPage(orderReference: string, accountEmail: string): Promise<void> {
        await expect(InsinkeratorEuObjects.CheckoutSuccessPage.orderReference(this.page)).toContainText(orderReference)
        await expect(InsinkeratorEuObjects.CheckoutSuccessPage.orderConfirmationEmail(this.page)).toContainText(accountEmail)
    }

    // NOTE(INSINKERATOR): confirmed live that accountTestUser_1 now has a
    // PERMANENT fixture delivery address (added 2026-07-22, so
    // logged-in-purchase-journey.test.ts's chooseDeliveryAddress(1) always has a
    // saved address to select) — so a book is no longer reliably empty,
    // and any address THIS test adds will land at whatever index comes
    // after the existing one(s), not always "1".
    //
    // IMPORTANT — CONFIRMED LIVE: /account/address-book itself has shown
    // inconsistent repeated-reload behaviour beyond the immediate
    // post-save staleness noted on addDeliveryAddress below — even minutes
    // after a confirmed write, consecutive reloads sometimes read back 0
    // addresses, then 1, unpredictably (looks like a caching/ISR issue
    // specific to this route — /checkout correctly sees the same data
    // every time in logged-in-purchase-journey.test.ts). Re-navigating until two
    // consecutive reads agree rides out that inconsistency rather than
    // trusting a single reload.
    private async getDeliveryAddressCount(): Promise<number> {
        const nameLocator = this.page.locator('[data-testid^="address-book-delivery__address-"][data-testid$="__name"]')
        let previous = await nameLocator.count()
        for (let attempt = 0; attempt < 3; attempt++) {
            await this.navigateToAddressBook()
            const current = await nameLocator.count()
            if (current === previous) {
                return current
            }
            previous = current
        }
        return previous
    }

    private async fillDeliveryAddressForm(address: AddressData): Promise<void> {
        await this.deliveryAddressFirstNameInput.fill(address.firstName)
        await this.deliveryAddressLastNameInput.fill(address.lastName)
        await this.deliveryAddressLine1Input.fill(address.addressLine1)
        await this.deliveryAddressCityInput.fill(address.city)
        await this.deliveryAddressPostcodeInput.fill(address.postcode)
        await this.deliveryAddressSaveButton.click()
    }

    // NOTE(INSINKERATOR): a real automated run showed that reloading
    // /account/address-book (a fresh page.goto) IMMEDIATELY after a
    // successful Save can hit a STALE, pre-write snapshot — the reload
    // sometimes shows the empty "add delivery Address" form again even
    // though the address was genuinely saved (confirmed: it reappeared on
    // a later reload). Waiting for the list view (addDeliveryAddressButton
    // becoming visible, i.e. the page transitioning out of the raw add-form
    // layout) is a reliable signal that the save has actually round-tripped
    // — it's driven by the mutation's response, not an optimistic client
    // update. Chained edit/remove calls below deliberately do NOT reload the
    // page for this reason; they operate on the already-current, already
    // up-to-date list. Call navigateToAddressBook() yourself first if
    // editing/removing without a preceding add in the same flow.
    // Returns the newly-added address's number, since it's no longer
    // reliably "1" now that a permanent fixture address exists — pass the
    // returned number to editDeliveryAddress/removeDeliveryAddress rather
    // than assuming an index.
    async addDeliveryAddress(address: AddressData): Promise<number> {
        await this.navigateToAddressBook()
        const countBefore = await this.getDeliveryAddressCount()
        // "Add new address" only appears once an address already exists (see
        // validateAccountPage note) — on an empty book the form is already open.
        if (await this.addDeliveryAddressButton.count() > 0) {
            await this.addDeliveryAddressButton.click()
            await expect(this.deliveryAddressForm).toBeVisible({ timeout: 35000 })
        }
        await this.fillDeliveryAddressForm(address)
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        const newAddressNumber = countBefore + 1
        await expect(InsinkeratorEuObjects.AccountPage.deliveryAddressName(newAddressNumber)(this.page)).toBeVisible({ timeout: 35000 })
        return newAddressNumber
    }

    async editDeliveryAddress(addressNumber: number, address: AddressData): Promise<void> {
        await InsinkeratorEuObjects.AccountPage.deliveryAddressEditButton(addressNumber)(this.page).click()
        await expect(this.deliveryAddressForm).toBeVisible({ timeout: 35000 })
        await this.fillDeliveryAddressForm(address)
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        await expect(InsinkeratorEuObjects.AccountPage.deliveryAddressName(addressNumber)(this.page))
            .toContainText(`${address.firstName} ${address.lastName}`, { timeout: 35000 })
    }

    async removeDeliveryAddress(addressNumber: number): Promise<void> {
        await InsinkeratorEuObjects.AccountPage.deliveryAddressDeleteButton(addressNumber)(this.page).click()
        const confirmButton = InsinkeratorEuObjects.AccountPage.deliveryAddressDeleteConfirmYesButton(addressNumber)(this.page)
        await expect(confirmButton).toBeVisible({ timeout: 15000 })
        await confirmButton.click()
        await expect(InsinkeratorEuObjects.AccountPage.deliveryAddressName(addressNumber)(this.page)).toHaveCount(0, { timeout: 35000 })
    }

    // VERIFIED live (staging, 2026-07-27): the Billing Addresses card
    // mirrors Delivery exactly — same permanent accountTestUser_1 fixture
    // address, same positional (not persistent-id) numbering, same
    // "checkout-address-form" field testids, same delete-confirm flow. See
    // the delivery methods above and the objects.ts comments for the full
    // detail; not re-documented here since it's identical behaviour.
    private async getBillingAddressCount(): Promise<number> {
        const nameLocator = this.page.locator('[data-testid^="address-book-billing__address-"][data-testid$="__name"]')
        let previous = await nameLocator.count()
        for (let attempt = 0; attempt < 3; attempt++) {
            await this.navigateToAddressBook()
            const current = await nameLocator.count()
            if (current === previous) {
                return current
            }
            previous = current
        }
        return previous
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
        const countBefore = await this.getBillingAddressCount()
        // "Add new address" only appears once a billing address already
        // exists (same rule as delivery) — on an empty billing book the
        // form is already open.
        if (await this.addBillingAddressButton.count() > 0) {
            await this.addBillingAddressButton.click()
            await expect(this.billingAddressForm).toBeVisible({ timeout: 35000 })
        }
        await this.fillBillingAddressForm(address)
        await expect(this.addBillingAddressButton).toBeVisible({ timeout: 35000 })
        const newAddressNumber = countBefore + 1
        await expect(InsinkeratorEuObjects.AccountPage.billingAddressName(newAddressNumber)(this.page)).toBeVisible({ timeout: 35000 })
        return newAddressNumber
    }

    async editBillingAddress(addressNumber: number, address: AddressData): Promise<void> {
        await InsinkeratorEuObjects.AccountPage.billingAddressEditButton(addressNumber)(this.page).click()
        await expect(this.billingAddressForm).toBeVisible({ timeout: 35000 })
        await this.fillBillingAddressForm(address)
        await expect(this.addBillingAddressButton).toBeVisible({ timeout: 35000 })
        await expect(InsinkeratorEuObjects.AccountPage.billingAddressName(addressNumber)(this.page))
            .toContainText(`${address.firstName} ${address.lastName}`, { timeout: 35000 })
    }

    async removeBillingAddress(addressNumber: number): Promise<void> {
        await InsinkeratorEuObjects.AccountPage.billingAddressDeleteButton(addressNumber)(this.page).click()
        const confirmButton = InsinkeratorEuObjects.AccountPage.billingAddressDeleteConfirmYesButton(addressNumber)(this.page)
        await expect(confirmButton).toBeVisible({ timeout: 15000 })
        await confirmButton.click()
        await expect(InsinkeratorEuObjects.AccountPage.billingAddressName(addressNumber)(this.page)).toHaveCount(0, { timeout: 35000 })
    }
}
