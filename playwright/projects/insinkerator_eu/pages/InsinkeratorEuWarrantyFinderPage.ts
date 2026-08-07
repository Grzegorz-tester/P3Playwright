import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { WarrantyFinderPage } from '../../../common/abstract-pages/WarrantyFinderPage'
import { InsinkeratorEuObjects } from '../utils/objects'

export class InsinkeratorEuWarrantyFinderPage extends WarrantyFinderPage {

    readonly form = InsinkeratorEuObjects.WarrantyFinderPage.form(this.page)
    readonly lastNameInput = InsinkeratorEuObjects.WarrantyFinderPage.lastNameInput(this.page)
    readonly serialNumberInput = InsinkeratorEuObjects.WarrantyFinderPage.serialNumberInput(this.page)
    readonly submitButton = InsinkeratorEuObjects.WarrantyFinderPage.submitButton(this.page)
    readonly notFoundAlert = InsinkeratorEuObjects.WarrantyFinderPage.notFoundAlert(this.page)
    readonly getInTouchLink = InsinkeratorEuObjects.WarrantyFinderPage.getInTouchLink(this.page)
    readonly successResult = InsinkeratorEuObjects.WarrantyFinderPage.successResult(this.page)

    constructor(page: Page) {
        super(page)
    }

    async validateFormDisplays(): Promise<void> {
        await expect(this.lastNameInput).toBeVisible()
        await expect(this.serialNumberInput).toBeVisible()
        await expect(this.submitButton).toBeVisible()
        await expect(this.submitButton).toBeDisabled()
    }

    async lookupWarranty(lastName: string, serialNumber: string): Promise<void> {
        await this.lastNameInput.fill(lastName)
        await this.serialNumberInput.fill(serialNumber)
        await expect(this.submitButton).toBeEnabled()
        await this.submitButton.click()
    }

    async getNotFoundMessage(): Promise<string> {
        return (await this.notFoundAlert.textContent()) ?? ''
    }

    async getSuccessMessage(): Promise<string> {
        return (await this.successResult.textContent()) ?? ''
    }

    async validateNotFoundMessageWithContactCta(): Promise<void> {
        await expect(this.notFoundAlert).toContainText('unable to locate your information')
        await expect(this.getInTouchLink).toBeVisible()
    }

    async validateSuccessMessage(productName: string, serialNumber: string): Promise<void> {
        await expect(this.successResult).toContainText('Registered on')
        await expect(this.successResult).toContainText(productName)
        await expect(this.successResult).toContainText(serialNumber)
    }
}
