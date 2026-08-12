import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { JTDoveObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-08-10) end-to-end through a real completed
 * guest order, with a mixed basket (one JT-Dove-delivered line, one
 * courier-only line, one collection-only line):
 *
 * /checkout/sign-in ("Existing customer" vs "Guest checkout") ->
 * /checkout/click-and-collect (ONLY rendered when the basket has at least
 * one collection line - depot summary for every collection line grouped
 * under the branch already chosen on the PDP/basket, plus a contact
 * mobile) -> /checkout/delivery (ONLY rendered when the basket has at
 * least one courier/JT-Dove-delivery line - a Loqate address lookup, then
 * a SECOND render of the same route for phone + delivery notes) ->
 * /checkout/billing ("same as delivery" checkbox) ->
 * /checkout/review-and-payment ("Proceed to Payment" - no separate terms
 * checkbox, just a disclaimer) -> redirects OFF-SITE to Opayo's
 * (sandbox.opayo.eu.elavon.com) hosted payment pages (card brand
 * selection -> card details -> order review -> "Pay now") -> back to
 * /checkout/thank-you.
 *
 * This storefront is guest-only from the basket side tested here (no
 * saved-address selection, no pay-on-account) - the abstract CheckoutPage
 * methods that assume those (chooseDeliveryAddress,
 * chooseDeliveryDateAndOptions, payOnAccount) don't have a real
 * equivalent and are implemented as thin, documented no-ops so the shared
 * contract still resolves; the genuinely distinct steps below
 * (collection depot/mobile, courier address/notes, billing,
 * review-and-pay, the off-site Opayo pages) get their own named methods.
 */
export class JTDoveCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    readonly guestCheckoutRadio = JTDoveObjects.CheckoutPage.guestCheckoutRadio(this.page);
    readonly guestEmailInput = JTDoveObjects.CheckoutPage.guestEmailInput(this.page);
    readonly guestSubmitButton = JTDoveObjects.CheckoutPage.guestSubmitButton(this.page);

    async continueAsGuest(email: string): Promise<void> {
        await this.guestCheckoutRadio.click()
        await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 })
        await this.guestEmailInput.fill(email)
        await expect(this.guestSubmitButton).toBeEnabled({ timeout: 10000 })
        await this.guestSubmitButton.click()
    }

    // Not applicable to this storefront's guest-only flow tested here -
    // JTDove branches automatically to /checkout/click-and-collect and/or
    // /checkout/delivery based on basket contents rather than an upfront
    // delivery-method choice. Kept to satisfy the shared abstract
    // contract.
    async chooseDeliveryOption(_option: string): Promise<void> {
        return
    }

    async chooseDeliveryAddress(_addressNumber?: number): Promise<void> {
        return
    }

    async chooseDeliveryDateAndOptions(_optionNumber: number): Promise<void> {
        return
    }

    readonly billingSameAsDeliveryCheckbox = JTDoveObjects.CheckoutPage.billingSameAsDeliveryCheckbox(this.page);
    readonly billingContinueButton = JTDoveObjects.CheckoutPage.billingContinueButton(this.page);

    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await this.billingSameAsDeliveryCheckbox.click()
        await expect(this.billingContinueButton).toBeEnabled({ timeout: 10000 })
        await this.billingContinueButton.click()
    }

    // Not applicable - this storefront's checkout tested here is
    // guest-only, with no logged-in "pay on account" path. Kept to
    // satisfy the shared abstract contract.
    async payOnAccount(): Promise<void> {
        return
    }

    readonly collectionContinueButton = JTDoveObjects.CheckoutPage.collectionContinueButton(this.page);
    readonly collectionContactMobileInput = JTDoveObjects.CheckoutPage.collectionContactMobileInput(this.page);

    // VERIFIED live (staging, 2026-08-10): every collection line already
    // carries the branch chosen earlier in the basket - this step only
    // asks for a contact mobile before continuing.
    //
    // CONFIRMED live (staging, 2026-08-11): this page can still be
    // finishing hydration right as it loads (same class of issue as the
    // PDP length steppers - see JTDovePDPage) - a fill() landing in that
    // window can be silently dropped by a subsequent re-render, leaving
    // Continue disabled despite the field looking filled. Retries the
    // fill once if Continue hasn't enabled shortly after.
    async completeCollectionStep(mobileNumber: string): Promise<void> {
        await expect(this.collectionContactMobileInput).toBeVisible({ timeout: 20000 })
        await this.collectionContactMobileInput.fill(mobileNumber)
        const filledSuccessfully = await expect(this.collectionContinueButton)
            .toBeEnabled({ timeout: 5000 })
            .then(() => true)
            .catch(() => false)
        if (!filledSuccessfully) {
            await this.collectionContactMobileInput.fill(mobileNumber)
        }
        await expect(this.collectionContinueButton).toBeEnabled({ timeout: 10000 })
        await this.collectionContinueButton.click()
    }

    readonly deliveryAddressFirstName = JTDoveObjects.CheckoutPage.deliveryAddressFirstName(this.page);
    readonly deliveryAddressLastName = JTDoveObjects.CheckoutPage.deliveryAddressLastName(this.page);
    readonly loqateAddressSearchInput = JTDoveObjects.CheckoutPage.loqateAddressSearchInput(this.page);
    readonly loqateFirstResult = JTDoveObjects.CheckoutPage.loqateFirstResult(this.page);
    readonly deliveryAddressSubmitButton = JTDoveObjects.CheckoutPage.deliveryAddressSubmitButton(this.page);
    readonly deliveryContactMobileInput = JTDoveObjects.CheckoutPage.deliveryContactMobileInput(this.page);
    readonly deliveryNotesInput = JTDoveObjects.CheckoutPage.deliveryNotesInput(this.page);
    readonly deliveryServiceRadio = JTDoveObjects.CheckoutPage.deliveryServiceRadio(this.page);
    readonly deliveryContinueButton = JTDoveObjects.CheckoutPage.deliveryContinueButton(this.page);

    // VERIFIED live (staging, 2026-08-10): fills the guest delivery
    // address via Loqate's real UK address lookup (postcode/street text
    // in, pick the first live suggestion, which resolves into a full
    // editable address) - not a plain blank form like Russells. The
    // resolved address's exact street/city/postcode is whatever Loqate
    // returns for the search text, so callers should only assert against
    // the name they pass in, not the resulting address content.
    //
    // CONFIRMED live (staging, 2026-08-11): Loqate's live dropdown
    // re-renders on its own debounce as it re-queries per keystroke,
    // which has caused two distinct failures under automation: the
    // "first result" going stale/detaching right as it's clicked, and a
    // "container" result (e.g. a business park or building with multiple
    // units) needing a SECOND click on its own follow-up list to reach an
    // actual address. Both are transient/live-data-dependent, not fixed
    // by any single wait duration, so the whole click-and-check sequence
    // is retried as a unit until the form is genuinely filled.
    async fillGuestDeliveryAddress(details: { firstName: string, lastName: string, addressSearchText: string }): Promise<void> {
        await expect(this.deliveryAddressFirstName).toBeVisible({ timeout: 20000 })
        await this.deliveryAddressFirstName.fill(details.firstName)
        await this.deliveryAddressLastName.fill(details.lastName)
        await this.loqateAddressSearchInput.pressSequentially(details.addressSearchText, { delay: 50 })
        await expect(this.loqateFirstResult).toBeVisible({ timeout: 15000 })
        await expect(async () => {
            await this.loqateFirstResult.click({ timeout: 5000 })
            await expect(this.deliveryAddressSubmitButton).toBeEnabled({ timeout: 3000 })
        }).toPass({ timeout: 30000 })
        await this.deliveryAddressSubmitButton.click()
    }

    // VERIFIED live (staging, 2026-08-10): the second render of
    // /checkout/delivery, reached only after fillGuestDeliveryAddress -
    // courier service, contact mobile and delivery notes. This is where
    // an order note (e.g. "Velstar test") must be entered - there is no
    // separate/general order-notes field later in the flow.
    async completeDeliveryDetails(mobileNumber: string, deliveryNotes: string): Promise<void> {
        await expect(this.deliveryContactMobileInput).toBeVisible({ timeout: 20000 })
        await this.deliveryServiceRadio.click()
        await this.deliveryContactMobileInput.fill(mobileNumber)
        await this.deliveryNotesInput.fill(deliveryNotes)
        await expect(this.deliveryContinueButton).toBeEnabled({ timeout: 10000 })
        await this.deliveryContinueButton.click()
    }

    readonly reviewProceedToPaymentButton = JTDoveObjects.CheckoutPage.reviewProceedToPaymentButton(this.page);

    // VERIFIED live (staging, 2026-08-10): this redirects off-site to
    // Opayo - callers should follow with the OpayoPaymentPage methods
    // below rather than expecting to stay on staging.jtdove.pub.
    async proceedToPayment(): Promise<void> {
        await this.reviewProceedToPaymentButton.click()
    }

    readonly summaryShippingCost = JTDoveObjects.CheckoutPage.summaryShippingCost(this.page);

    async verifyCourierShippingCostCalculated(): Promise<void> {
        await expect(this.summaryShippingCost).toBeVisible({ timeout: 15000 })
        await expect(this.summaryShippingCost).toContainText('£')
    }

    readonly opayoVisaCardOption = JTDoveObjects.OpayoPaymentPage.visaCardOption(this.page);
    readonly opayoCardholderNameInput = JTDoveObjects.OpayoPaymentPage.cardholderNameInput(this.page);
    readonly opayoCardNumberInput = JTDoveObjects.OpayoPaymentPage.cardNumberInput(this.page);
    readonly opayoExpiryMonthInput = JTDoveObjects.OpayoPaymentPage.expiryMonthInput(this.page);
    readonly opayoExpiryYearInput = JTDoveObjects.OpayoPaymentPage.expiryYearInput(this.page);
    readonly opayoCvcInput = JTDoveObjects.OpayoPaymentPage.cvcInput(this.page);
    readonly opayoConfirmCardDetailsButton = JTDoveObjects.OpayoPaymentPage.confirmCardDetailsButton(this.page);
    readonly opayoPayNowButton = JTDoveObjects.OpayoPaymentPage.payNowButton(this.page);

    // VERIFIED live (staging, 2026-08-10) with Opayo's own published
    // sandbox test Visa number (4929000000006). The cardholder name field
    // only exists on the NEXT page (card details) reached after this
    // click - it arrives PRE-FILLED there from the billing name already
    // entered earlier in checkout (see getOpayoCardholderName).
    async selectOpayoVisaCard(): Promise<void> {
        await expect(this.opayoVisaCardOption).toBeVisible({ timeout: 30000 })
        await this.opayoVisaCardOption.click()
        await expect(this.opayoCardNumberInput).toBeVisible({ timeout: 15000 })
    }

    async getOpayoCardholderName(): Promise<string> {
        return this.opayoCardholderNameInput.inputValue()
    }

    async payWithOpayoTestCard(cardNumber: string, expiryMonth: string, expiryYear: string, cvc: string): Promise<void> {
        await this.opayoCardNumberInput.fill(cardNumber)
        await this.opayoExpiryMonthInput.fill(expiryMonth)
        await this.opayoExpiryYearInput.fill(expiryYear)
        await this.opayoCvcInput.fill(cvc)
        await this.opayoConfirmCardDetailsButton.click()
        await expect(this.opayoPayNowButton).toBeVisible({ timeout: 15000 })
        await this.opayoPayNowButton.click()
    }
}
