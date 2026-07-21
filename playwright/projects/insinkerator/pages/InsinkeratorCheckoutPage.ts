import { expect, Page } from "@playwright/test";
import { CheckoutPage } from "../../../common/abstract-pages/CheckoutPage";
import { InsinkeratorObjects } from "../utils/objects";

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
 * STATUS: verified end-to-end from address selection through billing and
 * into the final /checkout/review-and-payment step, INCLUDING a working
 * delivery method ("Wizzair air transport", confirmed once French
 * shipping methods were configured on staging — see enterDeliveryPhoneNumber
 * below for the UK-phone-format note). Order summary, line items, and
 * shipping cost all render correctly on the review page.
 *
 * CURRENT BLOCKER: on the review page, no "place order"/payment button
 * ever renders — instead an alert reads "Payment provider not valid for
 * this order." This is a data/config gap (no payment provider configured
 * for this country/order on staging), the same category of issue as the
 * shipping gap that was already fixed, NOT a UI bug. Once a payment
 * provider is configured, locate and wire up the actual place-order
 * button (objects.ts has a TODO placeholder) and complete a real order to
 * verify the thank-you page.
 */
export class InsinkeratorCheckoutPage extends CheckoutPage {
  constructor(page: Page) {
    super(page);
  }

  // --- VERIFIED: GUEST sign-in / guest choice step ---
  readonly guestCheckoutRadio =
    InsinkeratorObjects.CheckoutPage.signInRadioGuestCheckout(this.page);
  readonly existingCustomerRadio =
    InsinkeratorObjects.CheckoutPage.signInRadioExistingCustomer(this.page);
  readonly guestEmailInput = InsinkeratorObjects.CheckoutPage.guestEmailInput(
    this.page,
  );
  readonly guestContinueButton =
    InsinkeratorObjects.CheckoutPage.guestContinueButton(this.page);

  // --- VERIFIED: GUEST delivery address FORM step ---
  readonly addressFirstName = InsinkeratorObjects.CheckoutPage.addressFirstName(
    this.page,
  );
  readonly addressLastName = InsinkeratorObjects.CheckoutPage.addressLastName(
    this.page,
  );
  readonly addressLine1 = InsinkeratorObjects.CheckoutPage.addressLine1(
    this.page,
  );
  readonly addressCity = InsinkeratorObjects.CheckoutPage.addressCity(
    this.page,
  );
  readonly addressPostcode = InsinkeratorObjects.CheckoutPage.addressPostcode(
    this.page,
  );
  readonly addressSubmitButton =
    InsinkeratorObjects.CheckoutPage.addressSubmitButton(this.page);

  // --- VERIFIED: LOGGED-IN saved-address selection step ---
  readonly loggedInAddressOptions =
    InsinkeratorObjects.CheckoutPage.loggedInAddressOptions(this.page);
  readonly loggedInContinueButton =
    InsinkeratorObjects.CheckoutPage.loggedInContinueButton(this.page);
  readonly loggedInAddressContinueButton =
    InsinkeratorObjects.CheckoutPage.loggedInAddressContinueButton(this.page);

  // --- VERIFIED: delivery-METHOD step, confirmed working end-to-end ---
  readonly deliveryPhoneInput =
    InsinkeratorObjects.CheckoutPage.deliveryPhoneInput(this.page);
  readonly deliveryMethodRadioGroup =
    InsinkeratorObjects.CheckoutPage.deliveryMethodRadioGroup(this.page);
  readonly deliveryContinueButton =
    InsinkeratorObjects.CheckoutPage.deliveryContinueButton(this.page);

  // --- VERIFIED: billing step ---
  readonly billingSameAsDeliveryCheckbox =
    InsinkeratorObjects.CheckoutPage.billingSameAsDeliveryCheckbox(this.page);
  readonly billingContinueButton =
    InsinkeratorObjects.CheckoutPage.billingContinueButton(this.page);
  readonly billingAddressOptions =
    InsinkeratorObjects.CheckoutPage.billingAddressOptions(this.page);
  readonly billingAddressContinueButton =
    InsinkeratorObjects.CheckoutPage.billingAddressContinueButton(this.page);

  // --- VERIFIED: review-and-payment step reached; payment itself blocked ---
  readonly reviewContent = InsinkeratorObjects.CheckoutPage.reviewContent(
    this.page,
  );
  readonly reviewPaymentProviderErrorAlert =
    InsinkeratorObjects.CheckoutPage.reviewPaymentProviderErrorAlert(this.page);
  readonly placeOrderButton = InsinkeratorObjects.CheckoutPage.placeOrderButton(
    this.page,
  );

  // --- UNVERIFIED placeholders kept for abstract-contract compatibility ---
  readonly payOnAccountButton =
    InsinkeratorObjects.CheckoutPage.payOnAccountButton(this.page);
  readonly proceedButton = InsinkeratorObjects.CheckoutPage.proceedButton(
    this.page,
  );
  readonly deliveryOptionsDiv =
    InsinkeratorObjects.CheckoutPage.deliveryOptionsDiv(this.page);
  readonly deliveryOptionsSlotsDiv =
    InsinkeratorObjects.CheckoutPage.deliveryOptionsSlotsDiv(this.page);

  /** VERIFIED: selects guest checkout and submits the email step. */
  async continueAsGuest(email: string): Promise<void> {
    await this.guestCheckoutRadio.click();
    await expect(this.guestEmailInput).toBeVisible({ timeout: 15000 });
    // NOTE: fill() rather than pressSequentially() — see
    // InsinkeratorLoginPage for why (a real run showed
    // pressSequentially get interrupted mid-type, silently producing
    // invalid input).
    await this.guestEmailInput.fill(email);
    await this.guestContinueButton.click();
  }

  /**
   * GUEST delivery address form. VERIFIED reachable; NOT YET re-verified
   * past submission with a real autocomplete suggestion selected for
   * Address Line 1 (it's a lookup field — free text alone won't
   * validate, per team knowledge).
   */
  async fillGuestAddressForm(details: {
    firstName: string;
    lastName: string;
    addressSearchTerm: string;
    addressSuggestionText: string;
    city: string;
    postcode: string;
  }): Promise<void> {
    await expect(this.addressFirstName).toBeVisible({ timeout: 15000 });
    // NOTE: fill() for plain text fields — see InsinkeratorLoginPage
    // for why (pressSequentially was seen to get interrupted
    // mid-type on a real run, producing invalid input silently).
    await this.addressFirstName.fill(details.firstName);
    await this.addressLastName.fill(details.lastName);
    // Address Line 1 IS still pressSequentially deliberately — it's
    // an autocomplete/lookup field that needs real keystroke-by-
    // keystroke input events to trigger its debounced suggestions
    // dropdown; fill() sets the value in one shot and may not fire
    // the events this field is listening for.
    await this.addressLine1.click();
    await this.addressLine1.pressSequentially(details.addressSearchTerm, {
      delay: 30,
    });
    // TODO(INSINKERATOR): confirm the actual suggestion-list locator —
    // never confirmed this session. Likely a listbox/option role
    // rendered below the input; inspect with devtools before relying on
    // this getByRole guess.
    await this.page
      .getByRole("option", { name: details.addressSuggestionText })
      .click();
    await this.addressCity.fill(details.city);
    await this.addressPostcode.fill(details.postcode);
    await this.addressSubmitButton.click();
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
  async enterDeliveryPhoneNumberAndContinue(
    ukFormatPhoneNumber: string,
  ): Promise<void> {
    // NOTE: fill() rather than pressSequentially() — see
    // InsinkeratorLoginPage for why.
    await this.deliveryPhoneInput.fill(ukFormatPhoneNumber);
    const firstMethod = this.deliveryMethodRadioGroup
      .locator('[data-testid^="radio-select_option"]')
      .first();
    await expect(firstMethod).toBeVisible({ timeout: 15000 });
    await firstMethod.click();
    await expect(this.deliveryContinueButton).toBeEnabled({ timeout: 10000 });
    await this.deliveryContinueButton.click();
  }

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
    await expect(this.reviewContent).toBeVisible({ timeout: 20000 });
  }

  /**
   * UNVERIFIED — placeholder until a payment provider is configured for
   * this country/order and the real place-order button can be located.
   */
  async payOnAccount(): Promise<void> {
    await expect(this.placeOrderButton).toBeVisible({ timeout: 45000 });
    await this.placeOrderButton.click({ delay: 5000 });
  }

  // --- Unverified placeholder methods, kept only for abstract-contract
  // shape compatibility. Never confirmed against a real multi-option
  // delivery method list. ---

  async chooseDeliveryOption(option: string): Promise<void> {
    if (option == "Delivery") {
      await this.deliveryOptionsDiv.nth(0).click();
    }
    if (option == "Click & Collect") {
      await this.deliveryOptionsDiv.nth(1).click();
    }
    await expect(this.deliveryContinueButton).toBeEnabled();
    await this.deliveryContinueButton.click();
  }

  async chooseDeliveryDateAndOptions(optionNumber: number): Promise<void> {
    await expect(
      this.deliveryOptionsSlotsDiv.nth(optionNumber - 1),
    ).toBeVisible({ timeout: 10000 });
    await this.deliveryOptionsSlotsDiv.nth(optionNumber - 1).click();
    await expect(this.proceedButton).toBeEnabled();
    await this.proceedButton.click();
  }
}
