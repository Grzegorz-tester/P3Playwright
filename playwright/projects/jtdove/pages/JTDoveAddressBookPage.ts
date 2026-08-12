import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

export type AddressFormDetails = { firstName: string, lastName: string, addressSearchText: string, saveAsDefault?: boolean }
export type AddressFormFields = { firstName: string, lastName: string, addressLine1: string, city: string, postcode: string, county?: string, saveAsDefault?: boolean }

/**
 * VERIFIED live (staging, 2026-08-11): /account/address-book - two
 * independent sections (Delivery Addresses, Billing Addresses), each
 * with its own "Add new address" action (or, with zero existing
 * addresses, the form renders inline instead) and its own address list.
 */
export class JTDoveAddressBookPage {

    readonly page: Page;
    readonly deliveryAddresses: Locator;
    readonly deliveryAddAddressButton: Locator;
    readonly billingAddresses: Locator;
    readonly billingAddAddressButton: Locator;
    readonly addressFormFirstName: Locator;
    readonly addressFormLastName: Locator;
    readonly addressFormSaveAsDefaultCheckbox: Locator;
    readonly addressFormLoqateSearchInput: Locator;
    readonly addressFormLoqateFirstResult: Locator;
    readonly addressFormAddressLine1: Locator;
    readonly addressFormCity: Locator;
    readonly addressFormCounty: Locator;
    readonly addressFormPostcode: Locator;
    readonly addressFormSaveButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.deliveryAddresses = JTDoveObjects.AddressBookPage.deliveryAddresses(this.page);
        this.deliveryAddAddressButton = JTDoveObjects.AddressBookPage.deliveryAddAddressButton(this.page);
        this.billingAddresses = JTDoveObjects.AddressBookPage.billingAddresses(this.page);
        this.billingAddAddressButton = JTDoveObjects.AddressBookPage.billingAddAddressButton(this.page);
        this.addressFormFirstName = JTDoveObjects.AddressBookPage.addressFormFirstName(this.page);
        this.addressFormLastName = JTDoveObjects.AddressBookPage.addressFormLastName(this.page);
        this.addressFormSaveAsDefaultCheckbox = JTDoveObjects.AddressBookPage.addressFormSaveAsDefaultCheckbox(this.page);
        this.addressFormLoqateSearchInput = JTDoveObjects.AddressBookPage.addressFormLoqateSearchInput(this.page);
        this.addressFormLoqateFirstResult = JTDoveObjects.AddressBookPage.addressFormLoqateFirstResult(this.page);
        this.addressFormAddressLine1 = JTDoveObjects.AddressBookPage.addressFormAddressLine1(this.page);
        this.addressFormCity = JTDoveObjects.AddressBookPage.addressFormCity(this.page);
        this.addressFormCounty = JTDoveObjects.AddressBookPage.addressFormCounty(this.page);
        this.addressFormPostcode = JTDoveObjects.AddressBookPage.addressFormPostcode(this.page);
        this.addressFormSaveButton = JTDoveObjects.AddressBookPage.addressFormSaveButton(this.page);
    }

    async navigateToAddressBookPage(): Promise<void> {
        await this.page.goto('/account/address-book', { timeout: 30000 })
    }

    async validateAddressBookPageLoaded(): Promise<void> {
        await expect(this.page.getByTestId('account')).toContainText('Address Book', { timeout: 20000 })
    }

    async getDeliveryAddressCount(): Promise<number> {
        return this.deliveryAddresses.locator('[data-testid$="__address"]').count()
    }

    async getBillingAddressCount(): Promise<number> {
        return this.billingAddresses.locator('[data-testid$="__address"]').count()
    }

    async verifyDeliveryAddressHasDefaultMarker(index: number): Promise<void> {
        await expect(JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page).getByTestId(`address-book-delivery__address-${index}__is-default-address`)).toBeVisible({ timeout: 10000 })
    }

    async verifyDeliveryAddressHasEditAndDeleteActions(index: number): Promise<void> {
        const address = JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page)
        await expect(address.getByTestId(`address-book-delivery__address-${index}__edit-address-button`)).toBeVisible()
        await expect(address.getByTestId(`address-book-delivery__address-${index}__delete-address-button`)).toBeVisible()
    }

    async verifyBillingAddressHasDefaultMarker(index: number): Promise<void> {
        await expect(JTDoveObjects.AddressBookPage.billingAddressByIndex(index)(this.page).getByTestId(`address-book-billing__address-${index}__is-default-address`)).toBeVisible({ timeout: 10000 })
    }

    async verifyBillingAddressHasEditAndDeleteActions(index: number): Promise<void> {
        const address = JTDoveObjects.AddressBookPage.billingAddressByIndex(index)(this.page)
        await expect(address.getByTestId(`address-book-billing__address-${index}__edit-address-button`)).toBeVisible()
        await expect(address.getByTestId(`address-book-billing__address-${index}__delete-address-button`)).toBeVisible()
    }

    // VERIFIED live (staging, 2026-08-11): with zero addresses already in
    // the section, the form renders inline (no add button to click
    // first) - callers should check this via getDeliveryAddressCount()
    // beforehand rather than always clicking deliveryAddAddressButton.
    //
    // CONFIRMED live (staging, 2026-08-11): waiting for the form to
    // close (firstName input detaches) after Save is a fast, reliable
    // completion signal - reading the address list/count immediately
    // after the click, with no wait at all, can race a re-render and
    // briefly see a stale/empty list.
    // CONFIRMED live (staging, 2026-08-12): a real UK postcode resolves
    // to a "container" result (e.g. "NE15 8SF ... - 3 Addresses") that
    // needs a SECOND click on its own follow-up list to reach an actual
    // address - clicking once just drills in. Retrying the click (a
    // fresh query each time) naturally lands on whatever's genuinely
    // first in the CURRENT list, so it clicks through the container on
    // the first retry and a real address on the next - the same pattern
    // already used in the checkout address form.
    //
    // CONFIRMED live (staging, 2026-08-12), on the checkout page's own
    // copy of this same flow: Loqate re-queries on every keystroke, and
    // a response for an earlier PARTIAL string can occasionally render
    // AFTER the response for the complete search text (a debounce/
    // network ordering race) - seen there as the exact same search text
    // resolving to a real address on one run and to an unrelated result
    // on the next. The OUTER retry re-types the search from scratch to
    // recover from that; the INNER retry is the ordinary container
    // click-through above.
    async fillAndSaveDeliveryAddress(details: AddressFormDetails): Promise<void> {
        await expect(this.addressFormFirstName).toBeVisible({ timeout: 20000 })
        await this.addressFormFirstName.fill(details.firstName)
        await this.addressFormLastName.fill(details.lastName)
        await expect(async () => {
            await this.addressFormLoqateSearchInput.fill('')
            await this.addressFormLoqateSearchInput.pressSequentially(details.addressSearchText, { delay: 50 })
            await expect(this.addressFormLoqateFirstResult).toBeVisible({ timeout: 15000 })
            await expect(async () => {
                await this.addressFormLoqateFirstResult.click({ timeout: 5000 })
                await expect(this.addressFormSaveButton).toBeEnabled({ timeout: 3000 })
            }).toPass({ timeout: 15000 })
        }).toPass({ timeout: 30000 })
        if (details.saveAsDefault) {
            await this.addressFormSaveAsDefaultCheckbox.click()
        }
        await this.addressFormSaveButton.click()
        await expect(this.addressFormFirstName).toBeHidden({ timeout: 15000 })
    }

    // CONFIRMED live (staging, 2026-08-11): editing an EXISTING address
    // shows plain, pre-filled address fields directly - no Loqate search
    // box is rendered in this mode (that's ADD-only, see
    // fillAndSaveDeliveryAddress above).
    async updateDeliveryAddressFields(details: AddressFormFields): Promise<void> {
        await expect(this.addressFormFirstName).toBeVisible({ timeout: 20000 })
        await this.addressFormFirstName.fill(details.firstName)
        await this.addressFormLastName.fill(details.lastName)
        await this.addressFormAddressLine1.fill(details.addressLine1)
        await this.addressFormCity.fill(details.city)
        await this.addressFormPostcode.fill(details.postcode)
        if (details.county !== undefined) {
            await this.addressFormCounty.fill(details.county)
        }
        if (details.saveAsDefault) {
            await this.addressFormSaveAsDefaultCheckbox.click()
        }
        await expect(this.addressFormSaveButton).toBeEnabled({ timeout: 10000 })
        await this.addressFormSaveButton.click()
        await expect(this.addressFormFirstName).toBeHidden({ timeout: 15000 })
    }

    async clickDeleteDeliveryAddress(index: number): Promise<void> {
        await JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page).getByTestId(`address-book-delivery__address-${index}__delete-address-button`).click()
    }

    // CONFIRMED live (staging, 2026-08-11): the dialog heading reads
    // "Confirm Deletion" - the singular /delete/i regex does NOT match
    // "Deletion" (no literal "delete" substring), and its buttons are
    // "No"/"Yes", not anything containing "delete".
    async confirmDeleteAddressDialog(): Promise<void> {
        const confirmDialog = this.page.getByRole('dialog').filter({ hasText: /confirm deletion/i })
        await expect(confirmDialog).toBeVisible({ timeout: 10000 })
        await confirmDialog.getByRole('button', { name: 'Yes', exact: true }).click()
    }

    async getDeliveryAddressName(index: number): Promise<string> {
        return (await JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page).getByTestId(`address-book-delivery__address-${index}__name`).textContent()) ?? ''
    }

    async getDeliveryAddressLine1(index: number): Promise<string> {
        return (await JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page).getByTestId(`address-book-delivery__address-${index}__line-1`).textContent()) ?? ''
    }

    async getDeliveryAddressCity(index: number): Promise<string> {
        return (await JTDoveObjects.AddressBookPage.deliveryAddressByIndex(index)(this.page).getByTestId(`address-book-delivery__address-${index}__city`).textContent()) ?? ''
    }
}
