import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import { AbstractCheckoutPage } from '../../abstracts/AbstractCheckoutPage';
import { CarbonObjects } from '../utils/objects';

export class CarbonCheckoutPage extends AbstractCheckoutPage {
    readonly page: Page;
    readonly deliveryHeader: Locator;
    readonly deliverySectionProceedButton: Locator;
    readonly deliveryOptionRadioButton: Locator;
    readonly clickAndCollectOptionRadioButton: Locator;
    readonly afterCheckoutLoadingSpinnerIcon: Locator;
    readonly billingAddressSameAsDeliveryCheckbox: Locator;
    readonly payOnAccountButton: Locator;
    readonly continueFromBillingAddressButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.deliveryHeader = CarbonObjects.CheckoutPage.deliveryHeader(page);
        this.deliverySectionProceedButton = CarbonObjects.CheckoutPage.continueFromDeliveryAddressButton(page);
        this.continueFromBillingAddressButton = CarbonObjects.CheckoutPage.continueFromBillingAddressButton(page);
        this.deliveryOptionRadioButton = CarbonObjects.CheckoutPage.deliveryOptionRadioButton(page);
        this.clickAndCollectOptionRadioButton = CarbonObjects.CheckoutPage.clickAndCollectOptionRadioButton(page);
        this.afterCheckoutLoadingSpinnerIcon = CarbonObjects.CheckoutPage.afterCheckoutLoadingSpinnerIcon(page);
        this.billingAddressSameAsDeliveryCheckbox = CarbonObjects.CheckoutPage.billingAddressSameAsDeliveryCheckbox(page);
        this.payOnAccountButton = CarbonObjects.CheckoutPage.payOnAccountButton(page);
    }

    async chooseDeliveryOption(option: string): Promise<void> {
        if (option == 'Delivery') {
            await this.deliveryOptionRadioButton.click();
        }
        if (option == 'Click & Collect') {
            await this.clickAndCollectOptionRadioButton.click();
        }
        await this.deliverySectionProceedButton.click();
    }

    async chooseDeliveryAddress(addressNumber: number): Promise<void> {
        const addressLocator = CarbonObjects.CheckoutPage.deliveryAddress(addressNumber)(this.page);
        await expect(addressLocator).toHaveCount(1, { timeout: 8000 });
        await addressLocator.click();
        await expect(this.deliverySectionProceedButton).toBeEnabled();
        await this.deliverySectionProceedButton.click();
    }

    async chooseDeliveryTimeOptions (optionNumber: string): Promise<void> {
        const optionsLocator = CarbonObjects.CheckoutPage.deliveryOptionsSelectionRadioButtons(optionNumber)(this.page);
        await expect(optionsLocator).toBeEnabled({ timeout: 8000 });
        await optionsLocator.click();
        await expect(this.deliverySectionProceedButton).toBeEnabled();
        await this.deliverySectionProceedButton.click();
    }

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeVisible({timeout: 10000});
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeEnabled();
        await this.billingAddressSameAsDeliveryCheckbox.focus();
        await this.billingAddressSameAsDeliveryCheckbox.click();
        await expect(this.continueFromBillingAddressButton).toBeEnabled();
        await this.continueFromBillingAddressButton.click();
    }

    async payOnAccount(): Promise<void> {
        await this.payOnAccountButton.click({ timeout: 20000 });
        await expect(this.payOnAccountButton).toHaveCount(0, { timeout: 20000 });
    }
}