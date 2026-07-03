import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { CarbonObjects } from '../utils/objects'

export class CarbonCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    readonly deliveryHeader = CarbonObjects.CheckoutPage.deliveryHeader(this.page);
    readonly deliverySectionProceedButton = CarbonObjects.CheckoutPage.deliverySectionProceedButton(this.page);
    readonly deliveryOptionRadioButton = CarbonObjects.CheckoutPage.deliveryOptionRadioButton(this.page);
    readonly clickAndCollectOptionRadioButton = CarbonObjects.CheckoutPage.clickAndCollectOptionRadioButton(this.page);
    readonly afterCheckoutLoadingSpinnerIcon = CarbonObjects.CheckoutPage.afterCheckoutLoadingSpinnerIcon(this.page);
    readonly billingAddressSameAsDeliveryCheckbox = CarbonObjects.CheckoutPage.billingAddressSameAsDeliveryCheckbox(this.page);
    readonly continueToPaymentButton = CarbonObjects.CheckoutPage.continueToPaymentButton(this.page);

    async chooseDeliveryOption(option: string): Promise<void> {
        if (option == 'Delivery') {
            await this.deliveryOptionRadioButton.click()
        }
        if (option == 'Click & Collect') {
            await this.clickAndCollectOptionRadioButton.click()
        }
        await this.deliverySectionProceedButton.click()
    }

    async chooseDeliveryAddress(addressNumber: number = 1): Promise<void> {
        const deliveryAddress = CarbonObjects.CheckoutPage.deliveryAddress(addressNumber)(this.page)
        await expect(deliveryAddress).toHaveCount(1, { timeout: 8000 })
        await deliveryAddress.click()
        await expect(this.deliverySectionProceedButton).toBeEnabled()
        await this.deliverySectionProceedButton.click()
    }

    async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
        const deliveryOption = CarbonObjects.CheckoutPage.deliveryOptionsSelectionRadioButtons(optionNumber)(this.page)
        await expect(deliveryOption).toBeEnabled({ timeout: 8000 })
        await deliveryOption.click()
        await expect(this.deliverySectionProceedButton).toBeEnabled()
        await this.deliverySectionProceedButton.click()
    }

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeVisible({ timeout: 10000 })
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeEnabled()
        await this.billingAddressSameAsDeliveryCheckbox.focus()
        await this.billingAddressSameAsDeliveryCheckbox.click()
        await expect(this.deliverySectionProceedButton).toBeEnabled()
        await this.deliverySectionProceedButton.click()
    }

    async payOnAccount(): Promise<void> {
        await this.continueToPaymentButton.click({ timeout: 20000 })
        await expect(this.continueToPaymentButton).toHaveCount(0, { timeout: 20000 })
    }
}
