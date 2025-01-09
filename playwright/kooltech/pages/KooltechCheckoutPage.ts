import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import {CheckoutPage} from "../../carbon/pages/CheckoutPage";

export class KooltechCheckoutPage extends CheckoutPage{
    readonly page: Page
    readonly deliveryAddressDiv: Locator
    readonly deliveryOptionsDiv: Locator
    readonly deliveryOptionsSlotsDiv: Locator
    readonly billingAddressSameAsDeliveryCheckbox: Locator
    readonly payOnAccountButton: Locator


    constructor(page: Page) {
        super(page);
        this.page = page;
        this.deliveryAddressDiv = page.getByTestId('address');
        this.deliveryOptionsDiv = page.locator('[data-testid="checkout__delivery__delivery_types"]>[data-testid="options"]>div');
        this.deliveryOptionsSlotsDiv = page.locator('[data-testid="delivery-options__availiable-slots"]>[data-testid="options"]>div');
        this.billingAddressSameAsDeliveryCheckbox = page.locator(`//*[@data-testid="checkout__billing__address"]/..//label`);
        this.payOnAccountButton = page.locator(`//button/span[contains(text(),'PAY ON ACCOUNT')]`);
    }

    async chooseDeliveryAddress(): Promise<void> {
        await expect(this.deliveryAddressDiv).toBeVisible({ timeout: 15000 })
        await this.deliveryAddressDiv.click()
        await this.page.waitForTimeout(1000)
        await expect(this.page.getByText('PROCEED')).toBeEnabled()
        await this.page.getByText('PROCEED').click()
    }

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
        await expect(this.page.getByText('PROCEED')).toBeEnabled()
        await this.page.getByText('PROCEED').click()
    }

    async chooseDeliveryTimeOptions(optionNumber: number): Promise<void> {
        await expect(this.deliveryOptionsSlotsDiv.nth(optionNumber-1)).toBeVisible({ timeout: 10000 })
        await this.deliveryOptionsSlotsDiv.nth(optionNumber-1).click()
        await this.page.waitForTimeout(1000)
        await expect(this.page.getByText('PROCEED')).toBeEnabled()
        await this.page.getByText('PROCEED').click()
    }

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeVisible({timeout: 20000})
        await expect(this.billingAddressSameAsDeliveryCheckbox).toBeEnabled()
        await this.page.waitForTimeout(1000)
        await this.billingAddressSameAsDeliveryCheckbox.focus()
        await this.billingAddressSameAsDeliveryCheckbox.click()
        await this.page.waitForTimeout(2000)
        await expect(this.page.getByText('PROCEED')).toBeEnabled({timeout: 15000})
        await this.page.getByText('PROCEED').hover()
        await this.page.getByText('PROCEED').focus()
        await this.page.getByText('PROCEED').click()
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
