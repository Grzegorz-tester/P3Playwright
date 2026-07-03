import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { KooltechObjects } from '../utils/objects'

export class KooltechCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    readonly deliveryAddressDiv = KooltechObjects.CheckoutPage.deliveryAddressDiv(this.page);
    readonly deliveryOptionsDiv = KooltechObjects.CheckoutPage.deliveryOptionsDiv(this.page);
    readonly deliveryOptionsSlotsDiv = KooltechObjects.CheckoutPage.deliveryOptionsSlotsDiv(this.page);
    readonly billingAddressSameAsDeliveryCheckbox = KooltechObjects.CheckoutPage.billingAddressSameAsDeliveryCheckbox(this.page);
    readonly payOnAccountButton = KooltechObjects.CheckoutPage.payOnAccountButton(this.page);
    readonly proceedButton = KooltechObjects.CheckoutPage.proceedButton(this.page);

    async chooseDeliveryOption(option: string): Promise<void> {
        if (option == 'Delivery') {
            await this.page.waitForTimeout(1000)
            await this.deliveryOptionsDiv.nth(0).click()
        }
        if (option == 'Click & Collect') {
            await this.page.waitForTimeout(1000)
            await this.deliveryOptionsDiv.nth(1).click()
        }
        await this.page.waitForTimeout(1000)
        await expect(this.proceedButton).toBeEnabled()
        await this.proceedButton.click()
    }

    async chooseDeliveryAddress(addressNumber?: number): Promise<void> {
        await expect(this.deliveryAddressDiv).toBeVisible({ timeout: 15000 })
        await this.deliveryAddressDiv.click()
        await this.page.waitForTimeout(1000)
        await expect(this.proceedButton).toBeEnabled()
        await this.proceedButton.click()
    }

    async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
        await expect(this.deliveryOptionsSlotsDiv.nth(optionNumber - 1)).toBeVisible({ timeout: 10000 })
        await this.deliveryOptionsSlotsDiv.nth(optionNumber - 1).click()
        await this.page.waitForTimeout(1000)
        await expect(this.proceedButton).toBeEnabled()
        await this.proceedButton.click()
    }

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeVisible({timeout: 20000})
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeEnabled()
        await this.page.waitForTimeout(1000)
        await this.billingAddressSameAsDeliveryCheckbox.focus()
        await this.billingAddressSameAsDeliveryCheckbox.click()
        await this.page.waitForTimeout(2000)
        await expect(this.proceedButton).toBeEnabled({timeout: 15000})
        await this.proceedButton.hover()
        await this.proceedButton.focus()
        await this.proceedButton.click()
    }

    async payOnAccount(): Promise<void> {
        await expect(this.payOnAccountButton).toBeVisible({ timeout: 45000 })
        await expect(this.payOnAccountButton).toBeEnabled({ timeout: 20000 })
        await this.page.waitForTimeout(1000)
        await this.payOnAccountButton.hover()
        await this.payOnAccountButton.click({delay: 5000})
        await this.page.waitForTimeout(5000)
    }
}
