import { expect, Locator, Page } from '@playwright/test';

export abstract class AbstractAccountPage {
    readonly page: Page;
    public abstract dashboardButton: Locator;
    public abstract profileButton: Locator;
    public abstract addressBookButton: Locator;
    public abstract ordersButton: Locator;
    public abstract wishlistsButton: Locator;
    public abstract createWishlistButton: Locator;
    public abstract emailInput: Locator;
    public abstract firstNameInput: Locator;
    public abstract lastNameInput: Locator;
    public abstract contactNumberInput: Locator;
    public abstract changePasswordButton: Locator;
    public abstract saveChangesButton: Locator;
    public abstract addDeliveryAddressButton: Locator;
    public abstract addBillingAddressButton: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async navigateToAccountPage(): Promise<void> {
        await this.page.goto('/account', { timeout: 40000 });
        await this.page.waitForLoadState('networkidle');
    }

    abstract waitForLoginToBeCompleted(): Promise<void>;
    abstract validateAccountPage(): Promise<void>;
    abstract addDeliveryAddress(...args: any[]): Promise<void>;
    abstract deleteDeliveryAddress(...args: any[]): Promise<void>;
}