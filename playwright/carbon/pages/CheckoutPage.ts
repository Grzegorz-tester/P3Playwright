import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'

export class CheckoutPage {
    readonly page: Page
    readonly deliveryHeader: Locator
    readonly deliverySectionProceedButton: Locator
    readonly deliveryOptionRadioButton: Locator
    readonly clickAndCollectOptionRadioButton: Locator
    readonly afterCheckoutLoadingSpinnerIcon: Locator
    readonly billingAddressSameAsDeliveryCheckbox: Locator
    readonly continueToPaymentButton: Locator

    constructor(page: Page) {
        this.page = page
        this.deliveryHeader = page.locator('p', { hasText: 'Delivery' })
        this.deliverySectionProceedButton = page.getByTestId(
            'proceed-to-next',
        )
        this.deliveryOptionRadioButton = page.locator(
            '[data-testid="radio-select_option-Delivery"] > svg',
        )
        this.clickAndCollectOptionRadioButton = page.locator(
            '[data-testid="radio-select_option-Click & Collect"] > svg',
        )
        this.afterCheckoutLoadingSpinnerIcon = page.locator('[data-testid="loading-spinner"]')
        this.billingAddressSameAsDeliveryCheckbox = page.locator('[data-testid="checkout__checkout-content"] > div > div > label[data-testid="checkbox"]')
        this.continueToPaymentButton = page.getByTestId('proceed-to-payment')
    }

    deliveryAddress: Locator
    deliveryOptionsSelectionRadioButtons: string

    async chooseDeliveryOption(option: string): Promise<void> {
        if (option == 'Delivery') {
            await this.deliveryOptionRadioButton.click()
        }
        if (option == 'Click & Collect') {
            await this.clickAndCollectOptionRadioButton.click()
        }
        await this.deliverySectionProceedButton.click()
    }

    async chooseDeliveryAddress(addressNumber: number): Promise<void> {
        let addressNumberToString = (addressNumber-1).toString()
        this.deliveryAddress = this.page.locator(`[data-testid="checkout__delivery-details-address__address-${addressNumberToString}"] > div > svg`)
        await expect(this.deliveryAddress).toHaveCount(1, { timeout: 8000 })
        await this.deliveryAddress.click()
        await expect(this.deliverySectionProceedButton).toBeEnabled()
        await this.deliverySectionProceedButton.click()
    }

    async chooseDeliveryDateAndOptions (optionNumber: string): Promise<void> {
        this.deliveryOptionsSelectionRadioButtons = `[data-testid="radio-select_options"] > div:nth-child(${optionNumber})`
        await expect(this.page.locator(this.deliveryOptionsSelectionRadioButtons)).toBeEnabled({ timeout: 8000 })
        await this.page.locator(this.deliveryOptionsSelectionRadioButtons).click()
        await expect(this.deliverySectionProceedButton).toBeEnabled()
        await this.deliverySectionProceedButton.click()
    }
    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeVisible({timeout: 10000})
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
