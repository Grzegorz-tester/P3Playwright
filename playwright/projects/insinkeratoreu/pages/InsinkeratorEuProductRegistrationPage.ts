import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { ProductRegistrationPage } from '../../../common/abstract-pages/ProductRegistrationPage'
import { WarrantyRegistrationData } from '@utils/fakeData'
import { InsinkeratorEuObjects } from '../utils/objects'

export class InsinkeratorEuProductRegistrationPage extends ProductRegistrationPage {

    readonly form = InsinkeratorEuObjects.ProductRegistrationPage.form(this.page)
    readonly firstNameInput = InsinkeratorEuObjects.ProductRegistrationPage.firstNameInput(this.page)
    readonly lastNameInput = InsinkeratorEuObjects.ProductRegistrationPage.lastNameInput(this.page)
    readonly emailInput = InsinkeratorEuObjects.ProductRegistrationPage.emailInput(this.page)
    readonly placeOfPurchaseInput = InsinkeratorEuObjects.ProductRegistrationPage.placeOfPurchaseInput(this.page)
    readonly serialNumberInput = InsinkeratorEuObjects.ProductRegistrationPage.serialNumberInput(this.page)
    readonly dateOfPurchaseButton = InsinkeratorEuObjects.ProductRegistrationPage.dateOfPurchaseButton(this.page)
    readonly productModelCombobox = InsinkeratorEuObjects.ProductRegistrationPage.productModelCombobox(this.page)
    readonly installedByCombobox = InsinkeratorEuObjects.ProductRegistrationPage.installedByCombobox(this.page)
    readonly installedByNativeSelect = InsinkeratorEuObjects.ProductRegistrationPage.installedByNativeSelect(this.page)
    readonly submitButton = InsinkeratorEuObjects.ProductRegistrationPage.submitButton(this.page)
    readonly successIcon = InsinkeratorEuObjects.ProductRegistrationPage.successIcon(this.page)
    readonly successHeading = InsinkeratorEuObjects.ProductRegistrationPage.successHeading(this.page)

    constructor(page: Page) {
        super(page)
    }

    async validateFormDisplays(): Promise<void> {
        await expect(this.firstNameInput).toBeVisible()
        await expect(this.lastNameInput).toBeVisible()
        await expect(this.emailInput).toBeVisible()
        await expect(this.placeOfPurchaseInput).toBeVisible()
        await expect(this.serialNumberInput).toBeVisible()
        await expect(this.submitButton).toBeVisible()
    }

    // VERIFIED — this label's asterisk is what CORRECTED the previously
    // reported UI/backend mismatch (see objects.ts note on
    // ProductRegistrationPage). Kept as its own assertion so a regression
    // back to "not marked required" fails clearly rather than being masked
    // by the isSubmitDisabled() check below.
    async validatePlaceOfPurchaseMarkedRequired(): Promise<void> {
        const label = this.form.locator('label[for="placeOfPurchase"]')
        await expect(label).toContainText('*')
    }

    // Picks today's date and a fixed model/installer — this project's
    // registration form doesn't need those to vary per test, only the
    // identity fields (lastName/serialNumber) that the warranty finder
    // later looks up.
    async fillRegistrationForm(data: WarrantyRegistrationData): Promise<void> {
        await this.firstNameInput.fill(data.firstName)
        await this.lastNameInput.fill(data.lastName)
        await this.emailInput.fill(data.email)
        await this.placeOfPurchaseInput.fill(data.placeOfPurchase)
        await this.serialNumberInput.fill(data.serialNumber)

        await this.dateOfPurchaseButton.click()
        const today = new Date().getDate()
        await InsinkeratorEuObjects.ProductRegistrationPage.calendarDay(today)(this.page).click()

        await this.productModelCombobox.click()
        await InsinkeratorEuObjects.ProductRegistrationPage.productModelOption('Standard 460')(this.page).click()

        // Look up the translated label for the locale-invariant "DIY"
        // value before opening the dropdown — see installedByNativeSelect
        // in objects.ts for why the visible option can't be matched by a
        // fixed English string across locales.
        const installedByLabel = await this.installedByNativeSelect.locator('option[value="DIY"]').textContent()
        await this.installedByCombobox.click()
        await InsinkeratorEuObjects.ProductRegistrationPage.installedByOption(installedByLabel ?? 'DIY')(this.page).click()
    }

    async isSubmitDisabled(): Promise<boolean> {
        return this.submitButton.isDisabled()
    }

    async validateSubmitDisabled(): Promise<void> {
        await expect(this.submitButton).toBeDisabled()
    }

    async submitRegistrationForm(): Promise<void> {
        await expect(this.submitButton).toBeEnabled()
        await this.submitButton.click()
    }

    async getSuccessMessage(): Promise<string> {
        return (await this.successHeading.textContent()) ?? ''
    }

    // Locale-agnostic — matches on the success icon rather than the
    // (translated) heading text, so this passes the same way on en-gb,
    // de, or any other locale.
    async validateSubmissionSucceeded(): Promise<void> {
        await expect(this.successIcon).toBeVisible()
    }
}
