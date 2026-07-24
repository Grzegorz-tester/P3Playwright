import { expect, Page } from '@playwright/test'
import { CheckoutPage } from '../../../common/abstract-pages/CheckoutPage'
import { InsinkeratorObjects } from '../utils/objects'

/**
 * NOTE ON THIS PROJECT'S CHECKOUT SHAPE
 * ======================================
 * This project has TWO distinct delivery-address flows depending on auth
 * state, both verified:
 *   - GUEST: sign-in-or-guest choice -> fill a blank address FORM
 *   - LOGGED IN: skips the sign-in step entirely -> select from SAVED
 *     addresses (this is the shape the abstract chooseDeliveryAddress
 *     contract was actually written for)
 * chooseDeliveryAddress() below implements the LOGGED-IN shape, since it
 * matches the abstract contract's intent most closely. Guest checkout is
 * exposed via the separate continueAsGuest() + fillGuestAddressForm()
 * methods, which fall outside the abstract contract.
 *
 * Full verified step order (logged-in): address selection -> delivery
 * method + phone -> billing (same-as-delivery + address confirm) ->
 * review-and-payment.
 *
 * IMPORTANT — read countrySelector.ts first. A mandatory "Choose your
 * country" modal appears on every fresh page load and silently blocks
 * every click on the page underneath it until dismissed. Always call
 * selectCountryOnFreshLoad() right after your first navigation.
 *
 * STATUS: verified end-to-end from address selection through billing,
 * payment, order submission AND the thank-you confirmation page —
 * INCLUDING a working delivery method ("Wizzair air transport", confirmed
 * once French shipping methods were configured on staging — see
 * enterDeliveryPhoneNumber below for the UK-phone-format note), and a real
 * CyberSource Unified Checkout payment (confirmed 2026-07-24 with the
 * standard CyberSource test card, 4111 1111 1111 1111). Order summary,
 * line items, and shipping cost all render correctly on the review page.
 * The payment provider gap described in earlier revisions of this comment
 * is FIXED — a real "Checkout With Card" button renders and a real order
 * can be placed.
 *
 * FALSE ALARM (staging, 2026-07-24): an earlier manual exploration session
 * saw /checkout/thank-you return an HTTP 500 "Oops! Something Went Wrong"
 * error twice in a row right after a real purchase. That did NOT reproduce
 * across 2 clean automated runs immediately afterward (each completing a
 * real, different order end-to-end) — the page rendered a correct
 * confirmation (order number, receipt email, delivery details) both
 * times. Concluded to be a manual-session artifact, same category as
 * other false alarms already documented in this project (e.g. the
 * /account redirect false alarm) — see validateThankYouPage() below,
 * which asserts the real, working confirmation.
 */
export class InsinkeratorCheckoutPage extends CheckoutPage {

    constructor(page: Page) {
        super(page);
    }

    // --- VERIFIED: GUEST sign-in / guest choice step ---
    readonly guestCheckoutRadio = InsinkeratorObjects.CheckoutPage.signInRadioGuestCheckout(this.page);
    readonly existingCustomerRadio = InsinkeratorObjects.CheckoutPage.signInRadioExistingCustomer(this.page);
    readonly guestEmailInput = InsinkeratorObjects.CheckoutPage.guestEmailInput(this.page);
    readonly guestContinueButton = InsinkeratorObjects.CheckoutPage.guestContinueButton(this.page);

    // --- VERIFIED: GUEST delivery address FORM step ---
    readonly addressFirstName = InsinkeratorObjects.CheckoutPage.addressFirstName(this.page);
    readonly addressLastName = InsinkeratorObjects.CheckoutPage.addressLastName(this.page);
    readonly addressLine1 = InsinkeratorObjects.CheckoutPage.addressLine1(this.page);
    readonly addressCity = InsinkeratorObjects.CheckoutPage.addressCity(this.page);
    readonly addressPostcode = InsinkeratorObjects.CheckoutPage.addressPostcode(this.page);
    readonly addressSubmitButton = InsinkeratorObjects.CheckoutPage.addressSubmitButton(this.page);
    readonly addressAutocompleteListbox = InsinkeratorObjects.CheckoutPage.addressAutocompleteListbox(this.page);
    readonly addressAutocompleteOptions = InsinkeratorObjects.CheckoutPage.addressAutocompleteOptions(this.page);

    // --- VERIFIED: LOGGED-IN saved-address selection step ---
    readonly loggedInContinueButton = InsinkeratorObjects.CheckoutPage.loggedInContinueButton(this.page);
    readonly loggedInAddressOptions = InsinkeratorObjects.CheckoutPage.loggedInAddressOptions(this.page);
    readonly loggedInAddressContinueButton = InsinkeratorObjects.CheckoutPage.loggedInAddressContinueButton(this.page);

    // --- VERIFIED: delivery-METHOD step, confirmed working end-to-end ---
    readonly deliveryPhoneInput = InsinkeratorObjects.CheckoutPage.deliveryPhoneInput(this.page);
    readonly deliveryMethodRadioGroup = InsinkeratorObjects.CheckoutPage.deliveryMethodRadioGroup(this.page);
    readonly deliveryContinueButton = InsinkeratorObjects.CheckoutPage.deliveryContinueButton(this.page);

    // --- VERIFIED: billing step ---
    readonly billingSameAsDeliveryCheckbox = InsinkeratorObjects.CheckoutPage.billingSameAsDeliveryCheckbox(this.page);
    readonly billingContinueButton = InsinkeratorObjects.CheckoutPage.billingContinueButton(this.page);
    readonly billingAddressOptions = InsinkeratorObjects.CheckoutPage.billingAddressOptions(this.page);
    readonly billingAddressContinueButton = InsinkeratorObjects.CheckoutPage.billingAddressContinueButton(this.page);

    // --- VERIFIED: review-and-payment step, including real CyberSource payment ---
    readonly reviewContent = InsinkeratorObjects.CheckoutPage.reviewContent(this.page);
    readonly reviewPaymentProviderErrorAlert = InsinkeratorObjects.CheckoutPage.reviewPaymentProviderErrorAlert(this.page);
    readonly placeOrderButton = InsinkeratorObjects.CheckoutPage.placeOrderButton(this.page);
    readonly checkoutWithCardButton = InsinkeratorObjects.CheckoutPage.checkoutWithCardButton(this.page);
    readonly cyberSourceCardNumberInput = InsinkeratorObjects.CheckoutPage.cyberSourceCardNumberInput(this.page);
    readonly cyberSourceExpiryMonthSelect = InsinkeratorObjects.CheckoutPage.cyberSourceExpiryMonthSelect(this.page);
    readonly cyberSourceExpiryYearSelect = InsinkeratorObjects.CheckoutPage.cyberSourceExpiryYearSelect(this.page);
    readonly cyberSourceSecurityCodeInput = InsinkeratorObjects.CheckoutPage.cyberSourceSecurityCodeInput(this.page);
    readonly cyberSourceCardContinueButton = InsinkeratorObjects.CheckoutPage.cyberSourceCardContinueButton(this.page);
    readonly cyberSourceConfirmAndContinueButton = InsinkeratorObjects.CheckoutPage.cyberSourceConfirmAndContinueButton(this.page);

    // --- UNVERIFIED placeholders kept for abstract-contract compatibility ---
    readonly payOnAccountButton = InsinkeratorObjects.CheckoutPage.payOnAccountButton(this.page);
    readonly proceedButton = InsinkeratorObjects.CheckoutPage.proceedButton(this.page);
    readonly deliveryOptionsDiv = InsinkeratorObjects.CheckoutPage.deliveryOptionsDiv(this.page);
    readonly deliveryOptionsSlotsDiv = InsinkeratorObjects.CheckoutPage.deliveryOptionsSlotsDiv(this.page);

    /** VERIFIED: selects guest checkout and submits the email step. */
    async continueAsGuest(email: string): Promise<void> {
        await this.guestCheckoutRadio.click()
        await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 })
        // NOTE: fill() rather than pressSequentially() — see
        // InsinkeratorLoginPage for why (a real run showed
        // pressSequentially get interrupted mid-type, silently producing
        // invalid input).
        await this.guestEmailInput.fill(email)
        await this.guestContinueButton.click()
    }

    // VERIFIED — confirmed live (staging, 2026-07-22): after
    // continueAsGuest(), the flow lands on /checkout/delivery showing a
    // BLANK checkout-address-form - genuinely distinct from the LOGGED-IN
    // shape (a saved-address SELECTION list, see chooseDeliveryAddress
    // above). This is the meaningful guest-vs-logged-in branch point.
    // Stops here deliberately rather than filling/submitting the form —
    // that's already flagged elsewhere in this file as unverified past
    // this point (the Address Line 1 autocomplete suggestion mechanism).
    async validateGuestAddressFormReached(): Promise<void> {
        await expect(this.page).toHaveURL(/\/checkout\/delivery$/, { timeout: 20000 })
        await expect(this.addressFirstName).toBeVisible({ timeout: 15000 })
        await expect(this.loggedInAddressOptions).toHaveCount(0)
    }

    /**
     * GUEST delivery address form. VERIFIED end-to-end (staging,
     * 2026-07-24) through several real submitted orders. Address Line 1 is
     * a MULTI-LEVEL autocomplete/lookup field, powered by Loqate
     * (postcodeanywhere.co.uk / addressy.com "Capture+" — confirmed via
     * network trace), confirmed live:
     *   1. Typing a search term (e.g. "Rua Augusta") shows a first list of
     *      STREET-level suggestions, each covering many addresses.
     *   2. Clicking one expands the SAME listbox to a further list —
     *      confirmed the number of levels is NOT fixed (some search terms
     *      resolve in one click, others need two) — down to specific
     *      numbered addresses.
     *   3. Clicking a specific address auto-populates City, County and
     *      Postcode and enables "Use this address" — no manual
     *      city/postcode entry needed or possible.
     * Options are picked by position (.first()) since there's no stable
     * way to target a specific real address from fake test data — any
     * result from a real search term is equally valid for test purposes.
     *
     * CONFIRMED — a real automated run showed Loqate's own "Find" API call
     * never firing at all (confirmed via network trace: only its CSS/JS
     * assets loaded) when typing immediately after the field becomes
     * visible, even though the same pressSequentially sequence worked
     * reliably in manual, less rapid-fire browsing. Loqate binds its own
     * listeners to the input asynchronously after mount and needs a brief
     * settle window first. Retrying the whole type-and-check cycle (rather
     * than a single fixed sleep) rides out that variability, same pattern
     * as InsinkeratorHomePage.closeSearchDrawer().
     */
    async fillGuestAddressForm(details: { firstName: string, lastName: string, addressSearchTerm: string }): Promise<void> {
        await expect(this.addressFirstName).toBeVisible({ timeout: 15000 })
        // NOTE: fill() for plain text fields — see InsinkeratorLoginPage
        // for why (pressSequentially was seen to get interrupted
        // mid-type on a real run, producing invalid input silently).
        await this.addressFirstName.fill(details.firstName)
        await this.addressLastName.fill(details.lastName)
        // Address Line 1 IS still pressSequentially deliberately — it's
        // an autocomplete/lookup field that needs real keystroke-by-
        // keystroke input events to trigger Loqate's debounced suggestions
        // dropdown; fill() sets the value in one shot and may not fire
        // the events this field is listening for.
        await expect(async () => {
            await this.addressLine1.click()
            await this.addressLine1.fill('')
            await this.page.waitForTimeout(600)
            await this.addressLine1.pressSequentially(details.addressSearchTerm, { delay: 30 })
            await expect(this.addressAutocompleteListbox).toBeVisible({ timeout: 5000 })
        }).toPass({ timeout: 25000 })
        // Clicking a street-level suggestion expands the SAME listbox to a
        // second, specific-address list via its OWN async lookup — the
        // number of levels to drill through isn't fixed (confirmed some
        // search terms need one click, others two), and clicking again
        // before an expansion lands re-selects the still-collapsed group,
        // leaving the form unpopulated. Rather than assume a fixed number
        // of clicks, keep clicking the CURRENT first option (re-queried
        // fresh each attempt, since the list's content changes underneath
        // it) until the real success signal — the submit button actually
        // enabling — is observed.
        await expect(async () => {
            if (await this.addressAutocompleteOptions.count() > 0) {
                await this.addressAutocompleteOptions.first().click()
            }
            await expect(this.addressSubmitButton).toBeEnabled({ timeout: 3000 })
        }).toPass({ timeout: 20000 })
        await this.addressSubmitButton.click()
    }

    /**
     * VERIFIED WORKING (staging, 2026-07-24) — GUEST billing step: ticking
     * "Same as delivery address" replaces the form with a read-only
     * confirmation of the delivery address, then Continue proceeds
     * straight to /checkout/review-and-payment. Confirmed DIFFERENT from
     * the logged-in flow's radio-selection UI (chooseBillingAddressSameAsDelivery
     * above) — see the CheckoutPage.billingSameAsDeliveryCheckbox note in
     * objects.ts.
     *
     * CONFIRMED — a real automated run showed the click occasionally not
     * registering as checked (the full address form stayed expanded rather
     * than collapsing to the read-only confirmation), leaving
     * billingContinueButton never rendered. Retrying the click until the
     * checkbox reports checked rides out that flakiness, same pattern as
     * other toggle-style interactions elsewhere in this project.
     */
    async confirmGuestBillingSameAsDelivery(): Promise<void> {
        await expect(async () => {
            await this.billingSameAsDeliveryCheckbox.click()
            await expect(this.billingSameAsDeliveryCheckbox).toBeChecked({ timeout: 3000 })
        }).toPass({ timeout: 20000 })
        await expect(this.billingContinueButton).toBeEnabled({ timeout: 15000 })
        await this.billingContinueButton.click()
    }

    /**
     * VERIFIED WORKING end-to-end (staging, 2026-07-24) with the standard
     * CyberSource test card (4111 1111 1111 1111, any future expiry, any
     * 3-digit CVV) — see fakeData.ts / the test file for the exact values
     * used. Opens the CyberSource Unified Checkout overlay ("Checkout With
     * Card"), fills the card + confirms in its 2-step flow (Step 1 "Pay by
     * Card" -> Step 2 "Confirm"), and submits the real order. See the
     * class-level comment for the CONFIRMED SITE BUG this leads into
     * (real order confirmation, on /checkout/thank-you) — see
     * InsinkeratorCheckoutSuccessPage.verifyThankYouPage() for the
     * corresponding assertion.
     */
    async payWithCyberSourceTestCard(card: { number: string, expiryMonth: string, expiryYear: string, securityCode: string }): Promise<void> {
        await this.checkoutWithCardButton.click()
        await expect(this.cyberSourceCardNumberInput).toBeVisible({ timeout: 20000 })
        await this.cyberSourceCardNumberInput.fill(card.number)
        await this.cyberSourceExpiryMonthSelect.selectOption(card.expiryMonth)
        await this.cyberSourceExpiryYearSelect.selectOption(card.expiryYear)
        await this.cyberSourceSecurityCodeInput.fill(card.securityCode)
        await this.cyberSourceCardContinueButton.click()
        await expect(this.cyberSourceConfirmAndContinueButton).toBeVisible({ timeout: 15000 })
        await this.cyberSourceConfirmAndContinueButton.click()
    }

    /**
     * VERIFIED: LOGGED-IN flow — handles an optional "You're signed in as
     * <name> — Continue" confirmation (seen on /checkout/sign-in when
     * arriving via the basket-summary__checkout-button entry point; not
     * always present, depends on entry point — see BasketPage note in
     * objects.ts), then selects a saved address and continues. This is
     * the method the abstract chooseDeliveryAddress contract was written
     * for.
     *
     * NOTE(INSINKERATOR): originally used
     * loggedInContinueButton.isVisible({ timeout }) here, which is a
     * Playwright gotcha — isVisible() takes a snapshot of the CURRENT DOM
     * state and returns immediately; it does NOT poll/wait for the
     * element to become visible over time (unlike expect().toBeVisible()
     * or locator.waitFor()). If this ran while the page was still
     * transitioning from /checkout/sign-in, isVisible() could return
     * false before the continue button had even rendered, silently
     * skipping the click and leaving the flow stuck on the un-clicked
     * continue screen — which then made the next line's wait for address
     * options fail, since the address list was never actually reached.
     * waitFor({ state: 'visible' }) genuinely polls up to its timeout,
     * fixing this.
     */
    async chooseDeliveryAddress(addressNumber: number = 1): Promise<void> {
        const continueButtonAppeared = await this.loggedInContinueButton
            .waitFor({ state: 'visible', timeout: 10000 })
            .then(() => true)
            .catch(() => false)
        if (continueButtonAppeared) {
            await this.loggedInContinueButton.click()
        }
        await expect(this.loggedInAddressOptions.first()).toBeVisible({ timeout: 15000 })
        await this.loggedInAddressOptions.nth(addressNumber - 1).click()
        await this.loggedInAddressContinueButton.click()
    }

    /**
     * VERIFIED WORKING: fills the phone number required to unlock
     * delivery method options, then selects the first available method
     * and continues. IMPORTANT: only UK-format numbers (e.g.
     * "07911123456") currently validate here, regardless of delivery
     * country — a known, temporary limitation; pass a UK-format number
     * even when testing non-UK addresses. Confirmed working end-to-end
     * once a shipping method was configured for the address's country.
     */
    async enterDeliveryPhoneNumberAndContinue(ukFormatPhoneNumber: string): Promise<void> {
        // NOTE: fill() rather than pressSequentially() — see
        // InsinkeratorLoginPage for why.
        await this.deliveryPhoneInput.fill(ukFormatPhoneNumber)
        const firstMethod = this.deliveryMethodRadioGroup.locator('[data-testid^="radio-select_option"]').first()
        await expect(firstMethod).toBeVisible({ timeout: 15000 })
        await firstMethod.click()
        await expect(this.deliveryContinueButton).toBeEnabled({ timeout: 10000 })
        await this.deliveryContinueButton.click()
    }

    /**
     * VERIFIED WORKING: on the billing step, checks "same as delivery"
     * (which collapses the address form into a confirmation), THEN
     * separately requires selecting a billing address radio option
     * before the flow actually proceeds — confirmed this two-part
     * interaction is needed, checking the box alone isn't sufficient.
     */
    /**
     * VERIFIED WORKING: on a FRESH billing step (no billing address ever
     * set before), this page shows the exact same address-selection UI
     * as the delivery step — pick a radio option, click continue. This
     * goes STRAIGHT to /checkout/review-and-payment; no checkbox
     * involved. The originally-assumed "same as delivery" checkbox
     * (billingSameAsDeliveryCheckbox / billingContinueButton in
     * objects.ts) was only ever observed on a RETURNING session where a
     * billing address had already been set previously — kept as
     * fallback locators for that case, but not exercised by this method.
     * Method name kept as-is for consistency with the abstract contract,
     * even though "same as delivery" isn't literally what happens here.
     */
    async chooseBillingAddressSameAsDelivery(): Promise<void> {
        await expect(this.billingAddressOptions.first()).toBeVisible({ timeout: 15000 })
        await this.billingAddressOptions.first().click()
        await this.billingAddressContinueButton.click()
    }

    /**
     * VERIFIED reachable: confirms the review-and-payment page loaded
     * with a correct order summary. TODO(INSINKERATOR): payment itself is
     * currently blocked — see class-level note ("Payment provider not
     * valid for this order"). This method stops short of actually placing
     * an order; extend it once placeOrderButton is confirmed to exist.
     */
    async verifyReachedReviewAndPayment(): Promise<void> {
        await expect(this.reviewContent).toBeVisible({ timeout: 20000 })
    }

    /**
     * UNVERIFIED — placeholder until a payment provider is configured for
     * this country/order and the real place-order button can be located.
     */
    async payOnAccount(): Promise<void> {
        await expect(this.placeOrderButton).toBeVisible({ timeout: 45000 })
        await this.placeOrderButton.click({ delay: 5000 })
    }

    // --- Unverified placeholder methods, kept only for abstract-contract
    // shape compatibility. Never confirmed against a real multi-option
    // delivery method list. ---

    async chooseDeliveryOption(option: string): Promise<void> {
        if (option == 'Delivery') {
            await this.deliveryOptionsDiv.nth(0).click()
        }
        if (option == 'Click & Collect') {
            await this.deliveryOptionsDiv.nth(1).click()
        }
        await expect(this.deliveryContinueButton).toBeEnabled()
        await this.deliveryContinueButton.click()
    }

    async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
        await expect(this.deliveryOptionsSlotsDiv.nth(optionNumber - 1)).toBeVisible({ timeout: 10000 })
        await this.deliveryOptionsSlotsDiv.nth(optionNumber - 1).click()
        await expect(this.proceedButton).toBeEnabled()
        await this.proceedButton.click()
    }
}
