import { expect, Locator, Page } from '@playwright/test'
//import { testConfig } from '../../testConfig'

export class AccountPage {
    readonly page: Page
    readonly dashboardButton: Locator
    readonly profileButton: Locator
    readonly addressBookButton: Locator
    readonly ordersButton: Locator
    readonly wishlistsButton: Locator
    readonly createWishlistButton: Locator
    readonly emailInput: Locator
    readonly firstNameInput: Locator
    readonly lastNameInput: Locator
    readonly contactNumberInput: Locator
    readonly changePasswordButton: Locator
    readonly saveChangesButton: Locator

    readonly addDeliveryAddressButton: Locator
    readonly addBillingAddressButton: Locator

    constructor(page: Page) {
        this.page = page
        this.dashboardButton = page.locator('[data-value="Dashboard"]')
        this.profileButton = page.locator('[data-value="Profile"]')
        this.addressBookButton = page.locator('[data-value="Address Book"]')
        this.ordersButton = page.locator('[data-value="Orders"]')
        this.wishlistsButton = page.locator('[data-value="Wishlists"]')
        this.createWishlistButton = page.locator('[data-testid="wishlists-header"] > p:nth-child(2)')
        this.emailInput = page.locator('[data-testid="my-details__email"]')
        this.firstNameInput = page.locator('[id="firstName"]')
        this.lastNameInput = page.locator('[id="lastName"]')
        this.contactNumberInput = page.locator('[id="telephone"]')
        this.changePasswordButton = page.locator('my-details__reset-password-form-btn')
        this.saveChangesButton = page.locator('[data-testid="save-changes-button"]')
        this.addDeliveryAddressButton = page.locator(
            '[data-testid="address-book__delivery"]>div>[data-testid="address-book__add-address"]',
        )
        this.addBillingAddressButton = page.locator(
            '[data-testid="address-book__billing"]>div>[data-testid="address-book__add-address"]',
        )
    }

    async navigateToAccountPage(): Promise<void> {
        await this.page.goto('/account', { timeout: 40000 })
    }

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.dashboardButton).toHaveCount(1, { timeout: 35000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.dashboardButton).toHaveCount(1, { timeout: 20000 })
        await this.dashboardButton.click()
        await this.addressBookButton.click()
        await expect(this.addDeliveryAddressButton).toHaveCount(1)
        await this.ordersButton.click()
    }

    async proceedToViewWishlists(): Promise<void> {
        await expect(this.wishlistsButton).toHaveCount(1, { timeout: 10000 })
        await this.wishlistsButton.click()
        await expect(this.createWishlistButton).toBeVisible({ timeout: 5000 })

    }
}
