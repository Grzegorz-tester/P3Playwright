import { Page } from '@playwright/test';

export abstract class CheckoutPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    abstract chooseDeliveryOption(option: string): Promise<void>;

    abstract chooseDeliveryAddress(addressNumber?: number): Promise<void>;

    abstract chooseDeliveryDateAndOptions(optionNumber: number): Promise<void>;

    abstract chooseBillingAddressSameAsDelivery(): Promise<void>;

    abstract payOnAccount(): Promise<void>;
}
