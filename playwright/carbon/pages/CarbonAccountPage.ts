import { expect, Locator, Page } from '@playwright/test';
import { AbstractAccountPage } from '../../abstracts/AbstractAccountPage';
import { CarbonObjects } from '../utils/objects';
import {Address} from "../utils/addresses/addresses";

export class CarbonAccountPage extends AbstractAccountPage {
    readonly page: Page;
    readonly dashboardButton: Locator;
    readonly profileButton: Locator;
    readonly addressBookButton: Locator;
    readonly ordersButton: Locator;
    readonly wishlistsButton: Locator;
    readonly createWishlistButton: Locator;
    readonly emailInput: Locator;
    readonly firstNameInput: Locator;
    readonly lastNameInput: Locator;
    readonly contactNumberInput: Locator;
    readonly changePasswordButton: Locator;
    readonly saveChangesButton: Locator;
    readonly addDeliveryAddressButton: Locator;
    readonly addBillingAddressButton: Locator;
    readonly addressFirstNameInput: Locator;
    readonly addressLastNameInput: Locator;
    readonly addressLine1Input: Locator;
    readonly addressCityInput: Locator;
    readonly addressPostCodeInput: Locator;
    readonly firstAddressAddressLine1: Locator;
    readonly deleteFirstAddressButton: Locator;
    readonly confirmDeleteFirstAddressButton: Locator;
    readonly submitButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.dashboardButton = CarbonObjects.AccountPage.dashboardButton(page);
        this.profileButton = CarbonObjects.AccountPage.profileButton(page);
        this.addressBookButton = CarbonObjects.AccountPage.addressBookButton(page);
        this.ordersButton = CarbonObjects.AccountPage.ordersButton(page);
        this.wishlistsButton = CarbonObjects.AccountPage.wishlistsButton(page);
        this.createWishlistButton = CarbonObjects.AccountPage.createWishlistButton(page);
        this.emailInput = CarbonObjects.AccountPage.emailInput(page);
        this.firstNameInput = CarbonObjects.AccountPage.firstNameInput(page);
        this.lastNameInput = CarbonObjects.AccountPage.lastNameInput(page);
        this.contactNumberInput = CarbonObjects.AccountPage.contactNumberInput(page);
        this.changePasswordButton = CarbonObjects.AccountPage.changePasswordButton(page);
        this.saveChangesButton = CarbonObjects.AccountPage.saveChangesButton(page);
        this.addDeliveryAddressButton = CarbonObjects.AccountPage.addDeliveryAddressButton(page);
        this.addBillingAddressButton = CarbonObjects.AccountPage.addBillingAddressButton(page);
        this.addressFirstNameInput = CarbonObjects.AccountPage.addressFirstNameInput(page);
        this.addressLastNameInput = CarbonObjects.AccountPage.addressLastNameInput(page);
        this.addressLine1Input = CarbonObjects.AccountPage.addressLine1Input(page);
        this.addressCityInput = CarbonObjects.AccountPage.addressCityInput(page);
        this.addressPostCodeInput = CarbonObjects.AccountPage.addressPostCodeInput(page);
        this.submitButton = CarbonObjects.AccountPage.submitButton(page);
        this.firstAddressAddressLine1 = CarbonObjects.AccountPage.firstAddressAddressLine1(page);
        this.deleteFirstAddressButton = CarbonObjects.AccountPage.deleteFirstAddressButton(page);
        this.confirmDeleteFirstAddressButton = CarbonObjects.AccountPage.confirmDeleteFirstAddressButton(page)

    }

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardButton).toHaveCount(1, { timeout: 35000 });
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.dashboardButton).toHaveCount(1, { timeout: 20000 });
        await this.dashboardButton.click();
        await this.ordersButton.click();
        await this.addressBookButton.click();
        if(await this.addDeliveryAddressButton.isVisible({timeout: 10000}) == false) {
            await expect(this.addressFirstNameInput.first()).toBeVisible();
        }
    }

    async addDeliveryAddress(address: Address): Promise<void> {
        await expect(this.addressBookButton).toHaveCount(1, { timeout: 35000 })
        await this.addressBookButton.click()
        if (await this.addDeliveryAddressButton.isVisible({timeout: 8000}) == true) {
            await this.addDeliveryAddressButton.click()
        }
        await expect(this.addressFirstNameInput.first()).toHaveCount(1, { timeout: 35000 })
        await expect(this.addressLastNameInput.first()).toHaveCount(1, { timeout: 35000 })
        await this.addressFirstNameInput.first().fill(address.firstName)
        await this.addressLastNameInput.first().fill(address.lastName)
        await this.addressLine1Input.first().fill(address.addressLine_1)
        await this.addressCityInput.first().fill(address.city)
        await this.addressPostCodeInput.first().fill(address.postcode)
        await expect(this.submitButton.first()).toBeEnabled()
        await this.submitButton.first().click()
        await expect(this.page).toHaveURL('/account/address-book')
        await expect(this.firstAddressAddressLine1).toContainText(address.addressLine_1, {timeout: 20000})
    }

    async deleteDeliveryAddress(address: Address): Promise<void> {
        await expect(this.firstAddressAddressLine1).toContainText(address.addressLine_1, {timeout: 20000})
        await expect(this.deleteFirstAddressButton).toBeEnabled()
        await this.deleteFirstAddressButton.click()
        await expect(this.confirmDeleteFirstAddressButton).toBeVisible()
        console.log("The address delete confirmation popup: ")
        await this.confirmDeleteFirstAddressButton.click()
        console.log("Deleting confirmed.")
        await expect(this.addressFirstNameInput.first()).toHaveCount(1, { timeout: 35000 })
        await expect(this.firstAddressAddressLine1).toBeHidden()
    }
}