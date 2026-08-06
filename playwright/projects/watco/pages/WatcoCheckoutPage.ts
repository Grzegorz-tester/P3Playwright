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

    // PL-only second field (NIP) — see the checkout NIP fields above.
    readonly expressNipNumberInput = WatcoObjects.ExpressCheckout.nipNumberInput(this.page);
    readonly expressNipApplyButton = WatcoObjects.ExpressCheckout.nipApplyButton(this.page);
    readonly expressNipApplyError = WatcoObjects.ExpressCheckout.nipApplyError(this.page);

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
    readonly vatNumberComment = WatcoObjects.CheckoutPage.vatNumberComment(this.page);
    readonly vatFormGroup = WatcoObjects.CheckoutPage.vatFormGroup(this.page);

    // PL-only second field (NIP, the domestic tax ID) — see objects.ts
    // CheckoutPage comment. Not used by any other market.
    readonly nipNumberInput = WatcoObjects.CheckoutPage.nipNumberInput(this.page);
    readonly nipApplyButton = WatcoObjects.CheckoutPage.nipApplyButton(this.page);
    readonly nipApplyError = WatcoObjects.CheckoutPage.nipApplyError(this.page);
    readonly nipNumberComment = WatcoObjects.CheckoutPage.nipNumberComment(this.page);
    readonly nipFormGroup = WatcoObjects.CheckoutPage.nipFormGroup(this.page);
    readonly payByCardMethodRadio = WatcoObjects.CheckoutPage.payByCardMethodRadio(this.page);
    readonly payOnAccountMethodRadio = WatcoObjects.CheckoutPage.payOnAccountMethodRadio(this.page);
    readonly adyenTermsCheckbox = WatcoObjects.CheckoutPage.adyenTermsCheckbox(this.page);
    readonly payOnAccountTermsCheckbox = WatcoObjects.CheckoutPage.payOnAccountTermsCheckbox(this.page);
    readonly payNowButton = WatcoObjects.CheckoutPage.payNowButton(this.page);
    readonly payOnAccountMinimumOrderNotice = WatcoObjects.CheckoutPage.payOnAccountMinimumOrderNotice(this.page);

    readonly summaryVatAmount = WatcoObjects.CheckoutPage.summaryVatAmount(this.page);
    readonly summaryVatRow = WatcoObjects.CheckoutPage.summaryVatRow(this.page);
    readonly summaryOrderTotal = WatcoObjects.CheckoutPage.summaryOrderTotal(this.page);

    // checkoutBasePath defaults to the UK/IE English route — FR passes
    // its own route (e.g. "/valider-la-commande"); the "/delivery"
    // sub-path suffix itself stays English on every market checked so far.
    async startGuestCheckout(email: string, checkoutBasePath: string = '/checkout'): Promise<void> {
        await expect(this.guestOptionToggle).toBeVisible({ timeout: 30000 })
        await this.guestOptionToggle.click()
        await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 })
        await this.guestEmailInput.fill(email)
        await this.guestEmailSubmitButton.click()
        await expect(this.page).toHaveURL(new RegExp(`${checkoutBasePath}/delivery$`), { timeout: 30000 })
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

    // PL-only second field (NIP) in Express Checkout.
    async applyExpressNipNumber(nip: string): Promise<void> {
        await this.expressNipNumberInput.fill(nip)
        await expect(this.expressNipApplyButton).toBeEnabled({ timeout: 10000 })
        await this.expressNipApplyButton.click()
    }

    async getExpressNipApplyErrorMessage(): Promise<string> {
        await expect(this.expressNipApplyError).toBeVisible({ timeout: 10000 })
        return (await this.expressNipApplyError.textContent())?.trim() ?? ''
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

    // PL-only: NIP is a second, separate field alongside NIP-EU (the
    // vatNumberInput/applyVatNumber pair above) — it has no effect on the
    // VAT rate, it just records the domestic tax ID.
    async applyNipNumber(nip: string): Promise<void> {
        await this.nipNumberInput.fill(nip)
        await expect(this.nipApplyButton).toBeEnabled({ timeout: 10000 })
        await this.nipApplyButton.click()
    }

    async getNipApplyErrorMessage(): Promise<string> {
        await expect(this.nipApplyError).toBeVisible({ timeout: 20000 })
        return (await this.nipApplyError.textContent())?.trim() ?? ''
    }

    async isNipFieldDirty(): Promise<boolean> {
        return await this.nipFormGroup.evaluate(el => el.classList.contains('js-vat-apply-group--dirty'))
    }

    // CONFIRMED SITE BEHAVIOUR: checkboxes that only render once a payment
    // method is selected (#adyenTCs / #nonAdyenTCs) are occasionally not
    // yet wired to their click handler the instant they become visible —
    // same class of lazy-binding quirk as enterAddressManuallyLink above.
    // CONFIRMED live (staging, 2026-08-06) that force-checking the input
    // directly (this method's original approach) can report toBeChecked()
    // as satisfied while the payment__button-proceed's d-none class never
    // actually gets removed — i.e. the checkbox's OWN state looks fine,
    // but whatever listener reveals the submit button didn't fire. A real
    // click on the checkbox's <label> proved to be what that listener
    // actually needs, and even that occasionally needs a second attempt —
    // seen live going from unchecked to checked only on retry. Poll for
    // BOTH the checkbox state and the actual effect (label click, not a
    // forced input state) up to 3 times rather than trusting Playwright's
    // own toBeChecked() alone to mean "the page reacted correctly".
    private async checkWithRetry(checkbox: ReturnType<Page['locator']>): Promise<void> {
        const checkboxId = await checkbox.getAttribute('id')
        const label = this.page.locator(`label[for="${checkboxId}"]`)
        for (let attempt = 0; attempt < 3; attempt++) {
            if (await checkbox.isChecked().catch(() => false)) return
            await label.click({ force: true }).catch(() => checkbox.check({ force: true }))
            await checkbox.isChecked().catch(() => false)
            await this.page.waitForTimeout(500)
        }
        await expect(checkbox).toBeChecked()
    }

    // Completes the order — payNowButton starts with a Bootstrap d-none
    // class, only removed once the T&Cs checkbox is checked (see
    // objects.ts comment). CONFIRMED live: the checkbox itself can report
    // checked=true while the d-none removal listener still hasn't fired —
    // checkWithRetry succeeding is NOT sufficient proof the button will
    // appear. Re-click the label (up to 3 times) if the button doesn't
    // show up within a short window, rather than trusting a single wait.
    async payOnAccount(): Promise<void> {
        await this.payOnAccountMethodRadio.check({ force: true })
        await expect(this.payOnAccountTermsCheckbox).toBeVisible({ timeout: 15000 })
        await this.checkWithRetry(this.payOnAccountTermsCheckbox)

        const label = this.page.locator('label[for="nonAdyenTCs"]')
        for (let attempt = 0; attempt < 3; attempt++) {
            if (await this.payNowButton.isVisible().catch(() => false)) break
            await label.click({ force: true }).catch(() => {})
            await this.page.waitForTimeout(1000)
        }
        await expect(this.payNowButton).toBeVisible({ timeout: 10000 })
        await this.payNowButton.click()
    }

    async payByCardAndAcceptTerms(): Promise<void> {
        await this.payByCardMethodRadio.check({ force: true })
        await expect(this.adyenTermsCheckbox).toBeVisible({ timeout: 15000 })
        await this.checkWithRetry(this.adyenTermsCheckbox)
    }
}
