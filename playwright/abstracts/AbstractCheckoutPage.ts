import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'

export abstract class AbstractCheckoutPage {
    readonly page: Page;
    public abstract deliveryHeader: Locator;
    public abstract deliverySectionProceedButton: Locator;
    public abstract deliveryOptionRadioButton: Locator;
    public abstract clickAndCollectOptionRadioButton: Locator;
    public abstract afterCheckoutLoadingSpinnerIcon: Locator;
    public abstract billingAddressSameAsDeliveryCheckbox: Locator;

    // These are now abstract methods to be implemented with specific logic/locators by child classes
    // including any dynamic locator logic.
    public abstract chooseDeliveryAddress(...args: any[]): Promise<void>;
    public abstract chooseDeliveryTimeOptions(...args: any[]): Promise<void>;
    public abstract chooseDeliveryOption(option: string): Promise<void>;
    public abstract chooseBillingAddressSameAsDelivery(): Promise<void>;
    public abstract payOnAccount(): Promise<void>;

    protected constructor(page: Page) {
        this.page = page;
    }
}