import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { CarbonObjects } from "../utils/objects";

export type DeliveryAddress = {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    postcode: string
}

export class CarbonAccountPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly dashboardButton = CarbonObjects.AccountPage.dashboardButton(this.page);
    readonly profileButton = CarbonObjects.AccountPage.profileButton(this.page);
    readonly addressBookButton = CarbonObjects.AccountPage.addressBookButton(this.page);
    readonly ordersButton = CarbonObjects.AccountPage.ordersButton(this.page);
    readonly wishlistsButton = CarbonObjects.AccountPage.wishlistsButton(this.page);
    readonly createWishlistButton = CarbonObjects.AccountPage.createWishlistButton(this.page);
    readonly emailInput = CarbonObjects.AccountPage.emailInput(this.page);
    readonly firstNameInput = CarbonObjects.AccountPage.firstNameInput(this.page);
    readonly lastNameInput = CarbonObjects.AccountPage.lastNameInput(this.page);
    readonly contactNumberInput = CarbonObjects.AccountPage.contactNumberInput(this.page);
    readonly changePasswordButton = CarbonObjects.AccountPage.changePasswordButton(this.page);
    readonly saveChangesButton = CarbonObjects.AccountPage.saveChangesButton(this.page);
    readonly addDeliveryAddressButton = CarbonObjects.AccountPage.addDeliveryAddressButton(this.page);
    readonly addBillingAddressButton = CarbonObjects.AccountPage.addBillingAddressButton(this.page);
    readonly addressForm = CarbonObjects.AccountPage.addressForm(this.page);
    readonly addressFirstNameInput = CarbonObjects.AccountPage.addressFirstNameInput(this.page);
    readonly addressLastNameInput = CarbonObjects.AccountPage.addressLastNameInput(this.page);
    readonly addressLine1Input = CarbonObjects.AccountPage.addressLine1Input(this.page);
    readonly addressCityInput = CarbonObjects.AccountPage.addressCityInput(this.page);
    readonly addressPostCodeInput = CarbonObjects.AccountPage.addressPostCodeInput(this.page);
    readonly saveAddressButton = CarbonObjects.AccountPage.saveAddressButton(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardButton).toHaveCount(1, { timeout: 35000 })
    }

    async validateAccountPage(): Promise<void> {
        // The account side-menu should expose the key sections.
        await expect(this.dashboardButton).toBeVisible({ timeout: 20000 })
        await expect(this.addressBookButton).toBeVisible()
        await expect(this.ordersButton).toBeVisible()
        await this.page.goto('/account/address-book', { timeout: 45000 })
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        await this.page.goto('/account/orders', { timeout: 45000 })
        await expect(this.page).toHaveURL(/\/account\/orders/, { timeout: 20000 })
    }

    async proceedToViewWishlists(): Promise<void> {
        await expect(this.wishlistsButton).toHaveCount(1, { timeout: 10000 })
        await this.wishlistsButton.click()
        await expect(this.createWishlistButton).toBeVisible({ timeout: 5000 })
    }

    async addDeliveryAddress(address: DeliveryAddress): Promise<void> {
        await this.page.goto('/account/address-book', { timeout: 45000 })
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
        await this.addDeliveryAddressButton.click()
        await expect(this.addressFirstNameInput).toBeVisible({ timeout: 35000 })
        await this.addressFirstNameInput.fill(address.firstName)
        await this.addressLastNameInput.fill(address.lastName)
        await this.addressLine1Input.fill(address.addressLine1)
        await this.addressCityInput.fill(address.city)
        await this.addressPostCodeInput.fill(address.postcode)
        // Country is a required select but defaults to United Kingdom, so a UK
        // address needs nothing further here.
        await this.saveAddressButton.click()
        // On success the delivery form closes and the listing returns. We can't assert
        // the form is hidden via .first() (a second, billing form persists, so .first()
        // would then resolve to it), so wait for the delivery add-address button — hidden
        // while the form is open — to reappear, confirming we're back on the listing.
        await expect(this.addDeliveryAddressButton).toBeVisible({ timeout: 35000 })
    }
}
