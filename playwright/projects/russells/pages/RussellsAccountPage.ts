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
}
