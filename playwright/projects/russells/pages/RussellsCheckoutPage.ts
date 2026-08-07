import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { RussellsObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-07-31) end-to-end through a real completed
 * order (logged-in flow): /checkout/delivery-method (Delivery vs Click &
 * Collect) -> /checkout/delivery (select a saved address, then a SECOND
 * render of the same route for phone + delivery-speed method) ->
 * /checkout/payment-method (choose "Pay with Card" vs PayPal) ->
 * /checkout/billing ("same as delivery" checkbox, present for logged-in
 * checkout on this storefront — unlike Insinkerator, where logged-in shows
 * a separate address-selection UI instead) -> /checkout/review-and-payment
 * (terms checkbox, then "Continue to Payment" reveals the Global Payments
 * hosted-field iframes directly — the card-vs-PayPal choice already
 * happened at the payment-method step, not here) -> /checkout/thank-you.
 *
 * CLICK & COLLECT branch (VERIFIED live, 2026-08-01, real completed order):
 * choosing "Click & Collect" instead of "Delivery" at /checkout/delivery-method
 * leads to /checkout/click-and-collect instead of /checkout/delivery — same
 * two-render shape (depot selection, then phone + continue), then straight
 * to /checkout/payment-method and onward exactly as the Delivery branch. The
 * depot chosen on the PDP's Collection picker (see RussellsPDPage) carries
 * through automatically, pre-selected on this step.
 *
 * GUEST branch (VERIFIED live, 2026-08-01, real completed order): on
 * /checkout/sign-in, "Guest checkout" -> email -> continue leads to the
 * SAME /checkout/delivery-method step as logged-in, but the delivery
 * address step is a plain blank form (fillGuestAddressForm) instead of
 * saved-address selection, and billing always shows the "same as
 * delivery" checkbox (no saved billing address to offer instead).
 */
export class RussellsCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    readonly loggedInSignInContinueButton = RussellsObjects.CheckoutPage.loggedInSignInContinueButton(this.page);
    readonly guestCheckoutRadio = RussellsObjects.CheckoutPage.guestCheckoutRadio(this.page);
    readonly guestEmailInput = RussellsObjects.CheckoutPage.guestEmailInput(this.page);
    readonly guestSubmitButton = RussellsObjects.CheckoutPage.guestSubmitButton(this.page);
    readonly guestAddressFirstName = RussellsObjects.CheckoutPage.guestAddressFirstName(this.page);
    readonly guestAddressLastName = RussellsObjects.CheckoutPage.guestAddressLastName(this.page);
    readonly guestAddressLine1 = RussellsObjects.CheckoutPage.guestAddressLine1(this.page);
    readonly guestAddressCity = RussellsObjects.CheckoutPage.guestAddressCity(this.page);
    readonly guestAddressPostcode = RussellsObjects.CheckoutPage.guestAddressPostcode(this.page);
    readonly guestAddressSubmitButton = RussellsObjects.CheckoutPage.guestAddressSubmitButton(this.page);
    readonly loggedInAddressOptions = RussellsObjects.CheckoutPage.loggedInAddressOptions(this.page);
    readonly loggedInAddressContinueButton = RussellsObjects.CheckoutPage.loggedInAddressContinueButton(this.page);
    readonly deliveryMethodRadioGroup = RussellsObjects.CheckoutPage.deliveryMethodRadioGroup(this.page);
    readonly deliveryMethodContinueButton = RussellsObjects.CheckoutPage.deliveryMethodContinueButton(this.page);
    readonly deliveryPhoneInput = RussellsObjects.CheckoutPage.deliveryPhoneInput(this.page);
    readonly deliveryContinueButton = RussellsObjects.CheckoutPage.deliveryContinueButton(this.page);
    readonly collectionDepotOptions = RussellsObjects.CheckoutPage.collectionDepotOptions(this.page);
    readonly collectionDepotContinueButton = RussellsObjects.CheckoutPage.collectionDepotContinueButton(this.page);
    readonly collectionPhoneInput = RussellsObjects.CheckoutPage.collectionPhoneInput(this.page);
    readonly collectionServiceContinueButton = RussellsObjects.CheckoutPage.collectionServiceContinueButton(this.page);
    readonly billingSameAsDeliveryCheckbox = RussellsObjects.CheckoutPage.billingSameAsDeliveryCheckbox(this.page);
    readonly billingContinueButton = RussellsObjects.CheckoutPage.billingContinueButton(this.page);
    readonly reviewContent = RussellsObjects.CheckoutPage.reviewContent(this.page);
    readonly reviewShippingCost = RussellsObjects.CheckoutPage.reviewShippingCost(this.page);
    readonly reviewTermsAndConditionsCheckbox = RussellsObjects.CheckoutPage.reviewTermsAndConditionsCheckbox(this.page);
    readonly reviewContinueToPaymentButton = RussellsObjects.CheckoutPage.reviewContinueToPaymentButton(this.page);
    readonly payWithCardButton = RussellsObjects.CheckoutPage.payWithCardButton(this.page);
    readonly deliveryChangeAddressButton = RussellsObjects.CheckoutPage.deliveryChangeAddressButton(this.page);
    readonly paymentErrorAlert = RussellsObjects.CheckoutPage.paymentErrorAlert(this.page);

    // VERIFIED live: /checkout/sign-in shows a "You're signed in — Continue"
    // confirmation when reached while already logged in (not always present
    // — depends on the basket entry point used) — dismiss it first if
    // actually present, never assume presence.
    async chooseDeliveryOption(option: string): Promise<void> {
        const continueButtonAppeared = await this.loggedInSignInContinueButton
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true)
            .catch(() => false)
        if (continueButtonAppeared) {
            await this.loggedInSignInContinueButton.click()
        }
        const optionButton = this.page.getByTestId(`radio-select_option-${option}`)
        await expect(optionButton).toBeVisible({ timeout: 20000 })
        await optionButton.click()
        await expect(this.deliveryMethodContinueButton).toBeEnabled({ timeout: 10000 })
        await this.deliveryMethodContinueButton.click()
    }

    // VERIFIED live (staging, 2026-08-01) end-to-end through a real
    // completed guest order: selects "Guest checkout" on /checkout/sign-in,
    // fills the email step, and continues to /checkout/delivery-method.
    async continueAsGuest(email: string): Promise<void> {
        await this.guestCheckoutRadio.click()
        await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 })
        await this.guestEmailInput.fill(email)
        await this.guestSubmitButton.click()
    }

    // VERIFIED live (staging, 2026-08-01): GUEST delivery address — a
    // plain, blank form (no autocomplete, unlike Insinkerator's Loqate
    // lookup) reached instead of chooseDeliveryAddress()'s saved-address
    // selection, since a guest has no saved addresses.
    async fillGuestAddressForm(details: { firstName: string, lastName: string, addressLine1: string, city: string, postcode: string }): Promise<void> {
        await expect(this.guestAddressFirstName).toBeVisible({ timeout: 15000 })
        await this.guestAddressFirstName.fill(details.firstName)
        await this.guestAddressLastName.fill(details.lastName)
        await this.guestAddressLine1.fill(details.addressLine1)
        await this.guestAddressCity.fill(details.city)
        await this.guestAddressPostcode.fill(details.postcode)
        await this.guestAddressSubmitButton.click()
    }

    // VERIFIED live (staging, 2026-08-03): re-opens the SAME
    // checkout-address-form, genuinely pre-filled with the currently
    // saved address (not a blank re-entry) — editing a field and
    // resubmitting updates the summary card correctly. CONFIRMED live:
    // saving blanks the phone number and delivery-method selection
    // below it (a fresh sub-step), so the caller must re-enter those
    // afterwards, same as after the first-time address submission.
    async changeDeliveryAddress(details: { firstName: string, lastName: string, addressLine1: string, city: string, postcode: string }): Promise<void> {
        await this.deliveryChangeAddressButton.click()
        await expect(this.guestAddressFirstName).toBeVisible({ timeout: 15000 })
        await this.guestAddressFirstName.fill(details.firstName)
        await this.guestAddressLastName.fill(details.lastName)
        await this.guestAddressLine1.fill(details.addressLine1)
        await this.guestAddressCity.fill(details.city)
        await this.guestAddressPostcode.fill(details.postcode)
        await this.guestAddressSubmitButton.click()
    }

    // Truncated to "<name> ... <postcode>" in the DOM itself (confirmed
    // live - not a CSS ellipsis), so this is only ever safe to assert
    // the name and postcode against, not the full address.
    async getReviewAddressSummary(href: '/checkout/delivery' | '/checkout/billing'): Promise<string> {
        return (await RussellsObjects.CheckoutPage.reviewCurrentAddressFiltered(href)(this.page).textContent()) ?? ''
    }

    async clickReviewEditAddress(href: '/checkout/delivery' | '/checkout/billing'): Promise<void> {
        await RussellsObjects.CheckoutPage.reviewEditAddressLinkFiltered(href)(this.page).click()
        await expect(this.page).toHaveURL(new RegExp(`\\${href}$`), { timeout: 20000 })
    }

    // VERIFIED live (staging, 2026-08-03): re-opens the SAME
    // checkout-address-form, genuinely pre-filled with the currently
    // saved BILLING address, and submitting lands back on
    // /checkout/review-and-payment with the summary correctly updated.
    async editBillingAddressFromReview(details: { firstName: string, lastName: string, addressLine1: string, city: string, postcode: string }): Promise<void> {
        await this.clickReviewEditAddress('/checkout/billing')
        await this.guestAddressFirstName.fill(details.firstName)
        await this.guestAddressLastName.fill(details.lastName)
        await this.guestAddressLine1.fill(details.addressLine1)
        await this.guestAddressCity.fill(details.city)
        await this.guestAddressPostcode.fill(details.postcode)
        await this.guestAddressSubmitButton.click()
        await expect(this.page).toHaveURL(/\/checkout\/review-and-payment$/, { timeout: 20000 })
    }

    // CONFIRMED SITE BUG candidate (RUS-474, staging, 2026-08-03): this
    // asserts the EXPECTED/correct behaviour - that clicking "Edit" next
    // to Delivery on the Review & Pay page re-opens the address form
    // PRE-FILLED with the previously entered delivery address, matching
    // how the equivalent Billing "Edit" link on this exact same page
    // already behaves (confirmed correct, see editBillingAddressFromReview).
    // Confirmed live TWICE (via direct input-value reads, not just a
    // visual snapshot) that the Delivery form instead comes back
    // completely BLANK, losing the address - a real, reproducible
    // asymmetry, not a fluke. Written against the correct behaviour on
    // purpose so this shows up as a red test until fixed, rather than
    // quietly asserting the data-loss as "working as intended".
    async validateReviewEditDeliveryAddressIsPreFilled(expected: { firstName: string, addressLine1: string, city: string, postcode: string }): Promise<void> {
        await this.clickReviewEditAddress('/checkout/delivery')
        await expect(this.guestAddressFirstName).toHaveValue(expected.firstName, { timeout: 15000 })
        await expect(this.guestAddressLine1).toHaveValue(expected.addressLine1)
        await expect(this.guestAddressCity).toHaveValue(expected.city)
        await expect(this.guestAddressPostcode).toHaveValue(expected.postcode)
    }

    // VERIFIED live: selects the addressNumber-th saved address (1-based)
    // and continues.
    async chooseDeliveryAddress(addressNumber: number = 1): Promise<void> {
        await expect(this.loggedInAddressOptions.first()).toBeVisible({ timeout: 15000 })
        await this.loggedInAddressOptions.nth(addressNumber - 1).click()
        await this.loggedInAddressContinueButton.click()
    }

    // VERIFIED WORKING: fills the phone number required to unlock delivery
    // speed options, selects the first available one, and continues.
    async enterDeliveryPhoneNumberAndContinue(phoneNumber: string): Promise<void> {
        await expect(this.deliveryPhoneInput).toBeVisible({ timeout: 15000 })
        await this.deliveryPhoneInput.fill(phoneNumber)
        const firstMethod = this.deliveryMethodRadioGroup.first()
        await expect(firstMethod).toBeVisible({ timeout: 15000 })
        await firstMethod.click()
        await expect(this.deliveryContinueButton).toBeEnabled({ timeout: 10000 })
        await this.deliveryContinueButton.click()
    }

    // Kept for interface compatibility with the abstract CheckoutPage
    // contract's shape — the real, verified delivery-speed-selection flow
    // is enterDeliveryPhoneNumberAndContinue() above, which needs a phone
    // number the abstract signature doesn't carry.
    async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
        const option = this.deliveryMethodRadioGroup.nth(optionNumber - 1)
        await expect(option).toBeVisible({ timeout: 15000 })
        await option.click()
        await expect(this.deliveryContinueButton).toBeEnabled({ timeout: 10000 })
        await this.deliveryContinueButton.click()
    }

    // VERIFIED live (staging, 2026-08-01) end-to-end through a real
    // completed order: /checkout/click-and-collect renders TWICE, same
    // pattern as /checkout/delivery. First a depot-selection list — the
    // depot chosen on the PDP's Collection picker is pre-selected and
    // labelled "Your Selected Depot" — confirm it (or pick a different one)
    // and continue.
    async confirmCollectionDepotAndContinue(): Promise<void> {
        await expect(this.collectionDepotOptions.first()).toBeVisible({ timeout: 15000 })
        await this.collectionDepotOptions.first().click()
        await expect(this.collectionDepotContinueButton).toBeEnabled({ timeout: 10000 })
        await this.collectionDepotContinueButton.click()
    }

    // VERIFIED live: the second /checkout/click-and-collect render — phone
    // number, then continue straight to /checkout/payment-method (no
    // separate delivery-speed choice, unlike the Delivery flow).
    async enterCollectionPhoneNumberAndContinue(phoneNumber: string): Promise<void> {
        await expect(this.collectionPhoneInput).toBeVisible({ timeout: 15000 })
        await this.collectionPhoneInput.fill(phoneNumber)
        await expect(this.collectionServiceContinueButton).toBeEnabled({ timeout: 10000 })
        await this.collectionServiceContinueButton.click()
    }

    // VERIFIED live: reached at /checkout/payment-method right after
    // delivery — a separate step from the review page, choosing between
    // "Pay with Card" (Global Payments) and PayPal. Leads to
    // /checkout/billing.
    async choosePaymentMethodCard(): Promise<void> {
        await expect(this.payWithCardButton).toBeVisible({ timeout: 20000 })
        await this.payWithCardButton.click()
    }

    // CONFIRMED live (staging, 2026-08-03): this integration points at
    // PayPal's PRODUCTION environment even on staging (the resulting
    // popup URL carries env=production) — clicking through and logging
    // in would place a real PayPal transaction, not a sandbox one. So
    // this deliberately verifies only that the button opens a popup
    // which lands on paypal.com, and stops there rather than
    // authenticating/completing a real payment.
    //
    // CONFIRMED live (staging, 2026-08-07): the PayPal SDK button
    // intermittently doesn't open its popup on the first click - a
    // genuine timing issue in the third-party SDK's own initialization,
    // same class of flakiness already documented for Global Payments in
    // payWithGlobalPaymentsTestCard below. Retried as a whole (fresh
    // waitForEvent each attempt, since a stale promise can't be reused)
    // rather than a one-shot click.
    async clickPayPalAndVerifyRedirectsToPayPal(): Promise<void> {
        await expect(async () => {
            const popupPromise = this.page.context().waitForEvent('page', { timeout: 15000 })
            await RussellsObjects.CheckoutPage.paypalButtonFrame(this.page).getByRole('link', { name: 'PayPal', exact: true }).click()
            const popup = await popupPromise
            await popup.waitForLoadState('domcontentloaded')
            await expect(popup).toHaveURL(/paypal\.com/, { timeout: 20000 })
            await popup.close()
        }).toPass({ timeout: 60000 })
    }

    // CORRECTED (staging, 2026-07-31): this storefront's billing step shape
    // depends on whether a billing address already exists on the account —
    // a fresh account with none saved shows a blank checkout-address-form
    // with a "same as delivery" checkbox (billingSameAsDeliveryCheckbox);
    // once a billing address exists (accountTestUser_1's permanent fixture
    // does), it instead shows the EXACT SAME checkout-select-address
    // radio-selection UI as the delivery step — same "checkout-select-
    // address__addresses"/"__continue-button" testids, confirmed live.
    // Handles both, since both are genuinely reachable depending on
    // account state.
    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        const savedAddressStepShown = await this.loggedInAddressOptions.first()
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true)
            .catch(() => false)
        if (savedAddressStepShown) {
            await this.loggedInAddressOptions.first().click()
            await this.loggedInAddressContinueButton.click()
            return
        }
        await expect(this.billingSameAsDeliveryCheckbox).toBeVisible({ timeout: 15000 })
        await this.billingSameAsDeliveryCheckbox.click()
        await expect(this.billingContinueButton).toBeEnabled({ timeout: 15000 })
        await this.billingContinueButton.click()
    }

    async verifyReachedReviewAndPayment(): Promise<void> {
        await expect(this.reviewContent).toBeVisible({ timeout: 20000 })
    }

    // Reads the shipping cost shown on the review page (e.g. "£10.00") so
    // the caller can verify the thank-you page's order summary matches it
    // exactly — absent entirely for Click & Collect orders.
    async getReviewShippingCost(): Promise<string> {
        return (await this.reviewShippingCost.textContent()) ?? ''
    }

    // VERIFIED live (staging, 2026-08-01): the review page shows
    // "Collection from <depot address>" for a Click & Collect order — the
    // depot's ADDRESS, not its name (e.g. "North Point Business Park..."
    // rather than "Eggborough"), so this checks for the stable "Collection
    // from" phrase rather than the caller-supplied depot name.
    async verifyReviewShowsCollectionDepot(): Promise<void> {
        await expect(this.reviewContent).toContainText('Collection from')
    }

    // VERIFIED WORKING end-to-end (staging, 2026-07-31) with a real
    // completed order — Global Payments hosted fields (card number,
    // expiration, CVV, cardholder name), each in its own iframe. The
    // card-vs-PayPal choice already happened at the payment-method step
    // (see choosePaymentMethodCard above) — "Continue to Payment" here
    // reveals the hosted fields directly, no further button needed.
    //
    // CONFIRMED live (staging, 2026-07-31): a real automated run showed the
    // hosted-field iframes never mounting at all after this click (some
    // other payment-confirmation UI rendered instead), while a manual
    // retry of the exact same click immediately after rendered them
    // correctly within ~3s — a genuine intermittent timing issue in the
    // third-party SDK's own initialization, not a locator problem.
    // Re-clicking Continue if the card-number iframe hasn't appeared
    // shortly after rides out that flakiness.
    async payWithGlobalPaymentsTestCard(card: { number: string, expiry: string, securityCode: string, cardHolderName: string }): Promise<void> {
        await this.reviewTermsAndConditionsCheckbox.click()
        await expect(async () => {
            await this.reviewContinueToPaymentButton.click()
            await expect(RussellsObjects.CheckoutPage.globalPaymentsCardNumberFrame(this.page).getByRole('textbox', { name: 'Card Number' })).toBeVisible({ timeout: 15000 })
        }).toPass({ timeout: 45000 })
        await RussellsObjects.CheckoutPage.globalPaymentsCardNumberFrame(this.page).getByRole('textbox', { name: 'Card Number' }).fill(card.number)
        await RussellsObjects.CheckoutPage.globalPaymentsCardExpirationFrame(this.page).getByRole('textbox', { name: 'Card Expiration' }).fill(card.expiry)
        await RussellsObjects.CheckoutPage.globalPaymentsCardCvvFrame(this.page).getByRole('textbox', { name: 'Card CVV' }).fill(card.securityCode)
        await RussellsObjects.CheckoutPage.globalPaymentsCardHolderNameFrame(this.page).getByRole('textbox', { name: 'Card Holder Name' }).fill(card.cardHolderName)
        await RussellsObjects.CheckoutPage.globalPaymentsSubmitFrame(this.page).getByRole('button', { name: 'Submit' }).click()
        await expect(this.page).toHaveURL(/\/checkout\/thank-you$/, { timeout: 45000 })
    }

    // CONFIRMED live (staging, 2026-08-03) using Global Payments' own
    // decline test card (4000120000001154, any future expiry, any
    // 3-digit CVV): fails gracefully with a "Payment Error" alert
    // ("Sorry, there was an error when processing your payment. Please
    // try again or use another payment method.") rather than completing
    // the order — the page stays on /checkout/review-and-payment with
    // the card form still filled in, so the customer can retry
    // immediately instead of losing their basket.
    async payWithDecliningGlobalPaymentsTestCard(card: { number: string, expiry: string, securityCode: string, cardHolderName: string }): Promise<void> {
        await this.reviewTermsAndConditionsCheckbox.click()
        await expect(async () => {
            await this.reviewContinueToPaymentButton.click()
            await expect(RussellsObjects.CheckoutPage.globalPaymentsCardNumberFrame(this.page).getByRole('textbox', { name: 'Card Number' })).toBeVisible({ timeout: 15000 })
        }).toPass({ timeout: 45000 })
        await RussellsObjects.CheckoutPage.globalPaymentsCardNumberFrame(this.page).getByRole('textbox', { name: 'Card Number' }).fill(card.number)
        await RussellsObjects.CheckoutPage.globalPaymentsCardExpirationFrame(this.page).getByRole('textbox', { name: 'Card Expiration' }).fill(card.expiry)
        await RussellsObjects.CheckoutPage.globalPaymentsCardCvvFrame(this.page).getByRole('textbox', { name: 'Card CVV' }).fill(card.securityCode)
        await RussellsObjects.CheckoutPage.globalPaymentsCardHolderNameFrame(this.page).getByRole('textbox', { name: 'Card Holder Name' }).fill(card.cardHolderName)
        await RussellsObjects.CheckoutPage.globalPaymentsSubmitFrame(this.page).getByRole('button', { name: 'Submit' }).click()
        await expect(this.paymentErrorAlert).toContainText('Sorry, there was an error when processing your payment.', { timeout: 30000 })
        await expect(this.page).toHaveURL(/\/checkout\/review-and-payment$/)
    }

    // UNVERIFIED placeholder — kept only for abstract-contract shape
    // compatibility. Real payment on this storefront goes through Global
    // Payments (payWithGlobalPaymentsTestCard above) or PayPal, not
    // pay-on-account.
    async payOnAccount(): Promise<void> {
        await this.reviewContinueToPaymentButton.click()
    }
}
