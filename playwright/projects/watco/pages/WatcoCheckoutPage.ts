import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { WatcoObjects } from '../utils/objects'

export type GuestDeliveryAddress = {
    firstName: string
    lastName: string
    telephone: string
    addressLine1: string
    city: string
    postcode: string
    country: string
}

const DEFAULT_UK_GUEST_ADDRESS: GuestDeliveryAddress = {
    firstName: 'Grzegorz',
    lastName: 'Test',
    telephone: '07700900000',
    addressLine1: '1 Test Street',
    city: 'London',
    postcode: 'SW1A 1AA',
    country: 'United Kingdom',
}

// Watco is a single-page accordion checkout (Delivery/Billing/Payment all
// live on one /checkout/* URL, no per-step navigation) — see objects.ts
// CheckoutPage comment for the full set of VERIFIED facts this is built on.
//
// The abstract CheckoutPage contract was written for storefronts with a
// saved-address book and a separate delivery-method / delivery-date-and-
// slot split (see KooltechCheckoutPage). Watco has neither: guest delivery
// is a single manual-entry form (no addresses to pick between), and
// shipping is ONE radio group, not a method+slot split. Per CLAUDE.md's
// Mipa-divergence precedent, method names are kept identical but mapped to
// what Watco actually has:
//   - chooseDeliveryAddress: fills the manual address form (addressNumber
//     is meaningless for a guest with no saved addresses, so it's ignored
//     — same choice Kooltech's own implementation already makes).
//   - chooseDeliveryOption: selects a shipping radio by its label text,
//     then proceeds to Payment.
//   - chooseDeliveryDateAndOptions: selects a shipping radio by index
//     instead of name, then proceeds — Watco has no separate date/slot UI,
//     so this and chooseDeliveryOption both resolve to the same radio
//     group; a test calls whichever selection style fits.
//   - chooseBillingAddressSameAsDelivery: Watco defaults billing to "same
//     as delivery" (checked) on the SAME accordion step as shipping, not
//     a separate step — this just asserts/ensures that default rather
//     than proceeding a second time.
//   - payOnAccount: Watco splits "select Pay on Account" from "place the
//     order" into several fields (method radio, conditional T&Cs
//     checkbox, Pay now button) where Kooltech has one button — this
//     method completes all of them, matching Kooltech's own
//     order-completing intent for payOnAccount().
export class WatcoCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    readonly guestOptionToggle = WatcoObjects.CheckoutPage.guestOptionToggle(this.page);
    readonly guestEmailInput = WatcoObjects.CheckoutPage.guestEmailInput(this.page);
    readonly guestEmailSubmitButton = WatcoObjects.CheckoutPage.guestEmailSubmitButton(this.page);

    readonly expressOptionContainer = WatcoObjects.ExpressCheckout.optionContainer(this.page);
    readonly expressOptionToggle = WatcoObjects.ExpressCheckout.optionToggle(this.page);
    readonly expressVatNumberInput = WatcoObjects.ExpressCheckout.vatNumberInput(this.page);
    readonly expressVatApplyButton = WatcoObjects.ExpressCheckout.vatApplyButton(this.page);
    readonly expressVatApplyError = WatcoObjects.ExpressCheckout.vatApplyError(this.page);
    readonly expressTermsCheckbox = WatcoObjects.ExpressCheckout.termsCheckbox(this.page);
    readonly expressGooglePayButton = WatcoObjects.ExpressCheckout.googlePayButton(this.page);

    readonly deliveryFirstNameInput = WatcoObjects.CheckoutPage.deliveryFirstNameInput(this.page);
    readonly deliveryLastNameInput = WatcoObjects.CheckoutPage.deliveryLastNameInput(this.page);
    readonly deliveryTelephoneInput = WatcoObjects.CheckoutPage.deliveryTelephoneInput(this.page);
    readonly enterAddressManuallyLink = WatcoObjects.CheckoutPage.enterAddressManuallyLink(this.page);
    readonly deliveryAddressLine1Input = WatcoObjects.CheckoutPage.deliveryAddressLine1Input(this.page);
    readonly deliveryCityInput = WatcoObjects.CheckoutPage.deliveryCityInput(this.page);
    readonly deliveryPostcodeInput = WatcoObjects.CheckoutPage.deliveryPostcodeInput(this.page);
    readonly deliveryCountrySelect = WatcoObjects.CheckoutPage.deliveryCountrySelect(this.page);
    readonly accordionPrimaryButton = WatcoObjects.CheckoutPage.accordionPrimaryButton(this.page);

    readonly firstShippingOption = WatcoObjects.CheckoutPage.firstShippingOption(this.page);

    readonly vatNumberInput = WatcoObjects.CheckoutPage.vatNumberInput(this.page);
    readonly vatApplyButton = WatcoObjects.CheckoutPage.vatApplyButton(this.page);
    readonly vatApplyError = WatcoObjects.CheckoutPage.vatApplyError(this.page);
    readonly vatFormGroup = WatcoObjects.CheckoutPage.vatFormGroup(this.page);
    readonly payByCardMethodRadio = WatcoObjects.CheckoutPage.payByCardMethodRadio(this.page);
    readonly payOnAccountMethodRadio = WatcoObjects.CheckoutPage.payOnAccountMethodRadio(this.page);
    readonly adyenTermsCheckbox = WatcoObjects.CheckoutPage.adyenTermsCheckbox(this.page);
    readonly payOnAccountTermsCheckbox = WatcoObjects.CheckoutPage.payOnAccountTermsCheckbox(this.page);
    readonly payNowButton = WatcoObjects.CheckoutPage.payNowButton(this.page);
    readonly payOnAccountMinimumOrderNotice = WatcoObjects.CheckoutPage.payOnAccountMinimumOrderNotice(this.page);

    readonly summaryVatAmount = WatcoObjects.CheckoutPage.summaryVatAmount(this.page);
    readonly summaryOrderTotal = WatcoObjects.CheckoutPage.summaryOrderTotal(this.page);

    async startGuestCheckout(email: string): Promise<void> {
        await expect(this.guestOptionToggle).toBeVisible({ timeout: 30000 })
        await this.guestOptionToggle.click()
        await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 })
        await this.guestEmailInput.fill(email)
        await this.guestEmailSubmitButton.click()
        await expect(this.page).toHaveURL(/\/checkout\/delivery$/, { timeout: 30000 })
    }

    async openExpressCheckout(): Promise<void> {
        await expect(this.expressOptionToggle).toBeVisible({ timeout: 30000 })
        await this.expressOptionToggle.click()
        await expect(this.expressVatNumberInput).toBeVisible({ timeout: 15000 })
    }

    async applyExpressVatNumber(vatNumber: string): Promise<void> {
        await this.expressVatNumberInput.fill(vatNumber)
        await expect(this.expressVatApplyButton).toBeEnabled({ timeout: 10000 })
        await this.expressVatApplyButton.click()
    }

    async getExpressVatApplyErrorMessage(): Promise<string> {
        await expect(this.expressVatApplyError).toBeVisible({ timeout: 10000 })
        return (await this.expressVatApplyError.textContent())?.trim() ?? ''
    }

    // VERIFIED live (staging, 2026-08-05): a logged-in account with a saved
    // address is shown a "checkout_address" radio list here instead of the
    // guest's blank manual-entry form — the first order any account places
    // is written to its address book, so this branch is what every
    // SUBSEQUENT logged-in checkout hits (addressNumber, as with Kooltech's
    // own implementation, is not needed to pick between them — there's
    // only ever one address in this test account, selected by default).
    // `addressOverride` lets a non-UK market (e.g. IE) supply its own
    // address/country while UK tests keep calling this with no args at
    // all — added as an extra optional param rather than replacing
    // addressNumber, so the abstract signature stays intact.
    async chooseDeliveryAddress(_addressNumber?: number, addressOverride?: Partial<GuestDeliveryAddress>): Promise<void> {
        const savedAddressRadio = this.page.locator('input[name="checkout_address"]')
        const hasSavedAddress = await savedAddressRadio.first().isVisible({ timeout: 5000 }).catch(() => false)
        if (hasSavedAddress) {
            await this.accordionPrimaryButton.click()
            await expect(this.firstShippingOption).toBeVisible({ timeout: 15000 })
            return
        }

        const address: GuestDeliveryAddress = { ...DEFAULT_UK_GUEST_ADDRESS, ...addressOverride }
        await expect(this.deliveryFirstNameInput).toBeVisible({ timeout: 30000 })
        await this.deliveryFirstNameInput.fill(address.firstName)
        await this.deliveryLastNameInput.fill(address.lastName)
        await this.deliveryTelephoneInput.fill(address.telephone)
        // CONFIRMED SITE BEHAVIOUR: immediately after the delivery step
        // renders, this link's click handler is occasionally not bound yet
        // — the first click does nothing. A second click reliably reveals
        // the manual fields, so retry once rather than guessing a fixed
        // settle delay.
        await this.enterAddressManuallyLink.click()
        const manualFieldsAppeared = await this.deliveryAddressLine1Input
            .waitFor({ state: 'visible', timeout: 5000 })
            .then(() => true)
            .catch(() => false)
        if (!manualFieldsAppeared) {
            await this.enterAddressManuallyLink.click()
            await expect(this.deliveryAddressLine1Input).toBeVisible({ timeout: 15000 })
        }
        await this.deliveryAddressLine1Input.fill(address.addressLine1)
        await this.deliveryCityInput.fill(address.city)
        await this.deliveryPostcodeInput.fill(address.postcode)
        await this.deliveryCountrySelect.selectOption({ label: address.country })
        await this.accordionPrimaryButton.click()
        await expect(this.firstShippingOption).toBeVisible({ timeout: 15000 })
    }

    async chooseDeliveryOption(option: string): Promise<void> {
        const matchingLabel = this.page.locator('label').filter({ hasText: option })
        const labelFor = await matchingLabel.first().getAttribute('for')
        if (labelFor) {
            await this.page.locator(`#${labelFor}`).check({ force: true })
        }
        await this.accordionPrimaryButton.click()
        await expect(this.vatNumberInput).toBeVisible({ timeout: 15000 })
    }

    async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
        const shippingRadio = this.page.locator('input[name="shipping_option"]').nth(optionNumber - 1)
        await shippingRadio.check({ force: true })
        await this.accordionPrimaryButton.click()
        await expect(this.vatNumberInput).toBeVisible({ timeout: 15000 })
    }

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        const billingAddressSame = this.page.locator('#billing_address_same')
        await expect(billingAddressSame).toBeChecked()
    }

    async applyVatNumber(vatNumber: string): Promise<void> {
        await this.vatNumberInput.fill(vatNumber)
        await expect(this.vatApplyButton).toBeEnabled({ timeout: 10000 })
        await this.vatApplyButton.click()
    }

    async getVatApplyErrorMessage(): Promise<string> {
        await expect(this.vatApplyError).toBeVisible({ timeout: 20000 })
        return (await this.vatApplyError.textContent())?.trim() ?? ''
    }

    async isVatFieldDirty(): Promise<boolean> {
        return await this.vatFormGroup.evaluate(el => el.classList.contains('js-vat-apply-group--dirty'))
    }

    // CONFIRMED SITE BEHAVIOUR: checkboxes that only render once a payment
    // method is selected (#adyenTCs / #nonAdyenTCs) are occasionally not
    // yet wired to their click handler the instant they become visible —
    // same class of lazy-binding quirk as enterAddressManuallyLink above.
    // Verify the check actually landed and retry once rather than trusting
    // the first click.
    private async checkWithRetry(checkbox: ReturnType<Page['locator']>): Promise<void> {
        try {
            await checkbox.check({ force: true, timeout: 5000 })
        } catch {
            await checkbox.check({ force: true })
        }
        await expect(checkbox).toBeChecked()
    }

    async payOnAccount(): Promise<void> {
        await this.payOnAccountMethodRadio.check({ force: true })
        await expect(this.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await this.checkWithRetry(this.payOnAccountTermsCheckbox)
        await this.payNowButton.click()
    }

    async payByCardAndAcceptTerms(): Promise<void> {
        await this.payByCardMethodRadio.check({ force: true })
        await expect(this.adyenTermsCheckbox).toBeVisible({ timeout: 15000 })
        await this.checkWithRetry(this.adyenTermsCheckbox)
    }
}
