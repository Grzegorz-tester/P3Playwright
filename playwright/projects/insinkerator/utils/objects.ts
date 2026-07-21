import { Page } from "@playwright/test";

// Locators below were gathered by inspecting the live DOM at
// https://staging.insinkerator-eu.work/ on 2026-07-20. Each entry is marked
// VERIFIED (confirmed present and exercised in the browser) or TODO (not
// yet reachable — see CONFIG_CHANGES_NEEDED.txt for what's still open).
//
// IMPORTANT — country-gated ecommerce: this storefront shows a full
// add-to-basket/checkout flow only for ecommerce-enabled countries (e.g.
// Portugal). Non-ecommerce countries (e.g. Poland) show a "Where to buy"
// distributor-lookup panel instead, with none of the basket/checkout
// locators below present at all. Any test suite for this project needs to
// set the country explicitly first — see CountrySelector below.
//
// IMPORTANT — mandatory country modal on fresh page load: a "Choose your
// country" modal (with a matching full-page dark backdrop, data-testid
// "overlay") appears on every FRESH page load until a country is selected.
// This was the root cause of a lot of confusion early in this project's
// exploration — it silently intercepts clicks on whatever's underneath
// (login, checkout submits, etc.) without any visible error, making forms
// look like they're "resetting." ALWAYS dismiss it (by selecting a
// country) before interacting with anything else on a freshly loaded
// page. See countrySelector.ts, which should be called at the start of
// every spec for this reason alone, even if the test doesn't care which
// country it ends up on.

export const InsinkeratorObjects = {
  CountrySelector: {
    // VERIFIED — the mandatory modal shown on fresh page load. Selecting
    // a country here also removes the blocking overlay/backdrop.
    countryModalOption: (countryName: string) => (page: Page) =>
      page.getByRole("button", { name: `Select ${countryName}`, exact: true }),
    // VERIFIED — the blocking backdrop; useful to assert it's gone after
    // selecting a country, or to detect it's present before interacting
    // with anything else on a fresh page load.
    blockingOverlay: (page: Page) => page.getByTestId("overlay"),

    // VERIFIED — a SEPARATE picker in the utility bar for changing
    // country later in a session (distinct from the mandatory modal
    // above, though it reuses the same "Choose your country" panel
    // content). No data-testid, id, or stable href on this control — ask
    // devs for one and raise a ticket; anchoring to the stable
    // utility-bar parent is the least-bad option today.
    utilityBarOpenButton: (page: Page) =>
      page.locator('[data-testid="utility-bar"] button').first(),
    countryOption: (countryName: string) => (page: Page) =>
      page.getByRole("button", { name: `Select ${countryName}`, exact: true }),
  },

  HomePage: {
    // VERIFIED
    brandBar: (page: Page) => page.getByTestId("brand-bar"),
    // VERIFIED — categories are numbered drawer links, not named per-category
    // testids. Filtering by visible text is unavoidable here since the
    // testid itself (link-0, link-1, ...) carries no semantic meaning and
    // the order isn't guaranteed stable long-term.
    category: (categoryName: string) => (page: Page) =>
      page
        .locator('[data-testid^="navigation-drawer-sheet__link-"]')
        .filter({ hasText: categoryName }),
    // VERIFIED
    menuNavBarButton: (page: Page) =>
      page.getByTestId("brand-bar__menu-button"),
    // TODO(INSINKERATOR): no "view all" link was observed on this project's
    // drawer (unlike Kooltech) — categories navigate straight to a PLP.
    // Confirm whether a view-all step exists anywhere before relying on this.
    viewAllButton: (page: Page) => page.getByTestId("TODO-view-all-button"),
  },

  LoginPage: {
    // VERIFIED — no dedicated heading testid; anchored structurally to the
    // stable login-form testid instead of matching on visible text.
    loginHeader: (page: Page) => page.locator('[data-testid="login-form"] h1'),
    // VERIFIED
    emailInput: (page: Page) => page.getByTestId("login-form__email-input"),
    passwordInput: (page: Page) =>
      page.getByTestId("login-form__password-input"),
    signInButton: (page: Page) => page.getByTestId("login-form__submit-button"),
    // VERIFIED — successful login (grzegorz.hajduk@velstar.co.uk /
    // Testing123!) confirmed this renders "Hi <FirstName>. You're signed
    // in." in the utility bar, redirecting to /account.
    welcomeUserTopbarDiv: (page: Page) =>
      page.getByTestId("utility-bar__user-name"),
  },

  // VERIFIED — confirmed on /account and /account/address-book after a
  // successful login.
  AccountPage: {
    // NOTE: all four sidebar links share the SAME testid
    // ("account-menu__item") — they're only distinguishable by href, not
    // by testid. Filtering by href is more stable than filtering by
    // visible link text.
    dashboardMenuButton: (page: Page) =>
      page
        .getByTestId("account-menu__item")
        .filter({ has: page.locator('[href="/account"]') }),
    addressBookMenuButton: (page: Page) =>
      page
        .getByTestId("account-menu__item")
        .filter({ has: page.locator('[href="/account/address-book"]') }),
    ordersMenuButton: (page: Page) =>
      page
        .getByTestId("account-menu__item")
        .filter({ has: page.locator('[href="/account/orders"]') }),
    // VERIFIED — on /account/address-book.
    addDeliveryAddressButton: (page: Page) =>
      page.getByTestId("address-book-delivery__add-address-button"),
  },

  ProductListPage: {
    // VERIFIED — same convention as Kooltech, confirmed on the Algolia-backed
    // /category/shop listing.
    productNameLink: (page: Page) => page.getByTestId("product-card__name"),
    productNameLinkFiltered: (productName: string) => (page: Page) =>
      page
        .getByTestId("product-card__name")
        .filter({ hasText: `${productName}` }),
  },

  ProductDetailPage: {
    // VERIFIED — all confirmed on the PDP once the site's country was set
    // to an ecommerce-enabled country (Portugal). On non-ecommerce
    // countries none of these elements render at all — see the note above.
    //
    // IMPORTANT — MULTIPLE MATCHES ARE EXPECTED. A real automated run
    // hit a strict-mode violation: this project shows related/upsell
    // products alongside the main product on some PDPs (matches the
    // known "basket upsell logic" feature), each with their OWN
    // "Add to basket" button/price sharing the SAME testid as the
    // main product's. .first() targets the main product, which
    // renders first in DOM, before any upsell section. This was
    // present even on the very first PDP inspected this session —
    // just masked by de-duplicating testids with a Set while
    // exploring manually, which hid the repeat count.
    addToBasketButton: (page: Page) =>
      page.getByTestId("product-add-to-basket__button").first(),
    // The "added to basket" confirmation is a full panel, not a small popup
    // — testids below reflect its actual structure.
    checkoutPopup: (page: Page) =>
      page.getByTestId("product-added-to-basket__added-to-basket-heading"),
    closeAddedToBasketPopupButton: (page: Page) =>
      page.getByTestId("product-added-to-basket__continue-button"),
    goToBasketButton: (page: Page) =>
      page.getByTestId("product-added-to-basket__basket-button"),
    basketButton: (page: Page) => page.getByTestId("brand-bar__basket-link"),
    // .first() for the same reason as addToBasketButton above — an
    // upsell/related product's own price can share this testid too.
    actualPricePDP: (page: Page) =>
      page.getByTestId("product-price__now-price").first(),
    // TODO(INSINKERATOR): no quantity-input testid was found on the PDP —
    // this project may not support choosing a quantity before adding to
    // basket (single-unit add only). Confirm before relying on this.
    itemAmountToAddInput: (page: Page) =>
      page.getByTestId("TODO-quantity-input"),
    // VERIFIED — the count badge is an unlabelled <span> inside the basket
    // link; anchored structurally to the stable parent testid.
    basketCount: (page: Page) =>
      page.locator('[data-testid="brand-bar__basket-link"] span'),
  },

  BasketPage: {
    // VERIFIED
    secureCheckoutButton: (page: Page) =>
      page.getByTestId("basket-summary__checkout-button"),
  },

  CheckoutPage: {
    // VERIFIED — GUEST flow only. A logged-in user skips this step
    // entirely and lands straight on /checkout/delivery (see
    // loggedIn* locators below instead).
    signInRadioExistingCustomer: (page: Page) =>
      page.getByTestId("radio-select_option-Existing customer"),
    signInRadioGuestCheckout: (page: Page) =>
      page.getByTestId("radio-select_option-Guest checkout"),
    guestEmailInput: (page: Page) =>
      page.getByTestId("guest-checkout-form__email-input"),
    guestContinueButton: (page: Page) =>
      page.getByTestId("guest-checkout-form__submit-button"),
    loggedInContinueButton: (page: Page) =>
      page.getByTestId("checkout-sign-in-content__continue"),

    // VERIFIED — GUEST delivery step: a fresh address FORM to fill in
    // (confirmed reachable; confirmed Address Line 1 is an
    // autocomplete/lookup field per your note — a suggestion must be
    // selected, free text alone will not validate. Not yet re-verified
    // end-to-end with a selected suggestion — the earlier "reset on
    // submit" symptom seen during initial exploration turned out to be
    // a DIFFERENT, unrelated cause: the mandatory country-modal
    // overlay described at the top of this file, which was blocking
    // every submit click that whole session, including this one.
    // Retest with the overlay dismissed and a real autocomplete
    // suggestion picked.)
    addressForm: (page: Page) => page.getByTestId("checkout-address-form"),
    addressFirstName: (page: Page) =>
      page.getByTestId("checkout-address-form__first-name"),
    addressLastName: (page: Page) =>
      page.getByTestId("checkout-address-form__last-name"),
    addressLine1: (page: Page) =>
      page.getByTestId("checkout-address-form__address-line-1"),
    addressLine2: (page: Page) =>
      page.getByTestId("checkout-address-form__address-line-2"),
    addressCity: (page: Page) =>
      page.getByTestId("checkout-address-form__city"),
    addressCounty: (page: Page) =>
      page.getByTestId("checkout-address-form__county"),
    addressPostcode: (page: Page) =>
      page.getByTestId("checkout-address-form__postcode"),
    addressCountry: (page: Page) =>
      page.getByTestId("checkout-address-form__country"),
    addressSubmitButton: (page: Page) =>
      page.getByTestId("checkout-address-form__submit-button"),

    // VERIFIED — LOGGED-IN delivery step: select from SAVED addresses
    // instead of filling a form. This is the shape the abstract
    // CheckoutPage.chooseDeliveryAddress(addressNumber?) was actually
    // written for — use these for a logged-in test account, and the
    // guest* form fields above for a guest one.
    loggedInAddressOptions: (page: Page) =>
      page.locator(
        '[data-testid="checkout-select-address__addresses"] [data-testid^="radio-select_option"]',
      ),
    loggedInAddNewAddressButton: (page: Page) =>
      page.getByTestId("checkout-select-address__add-new-address-button"),
    loggedInAddressContinueButton: (page: Page) =>
      page.getByTestId("checkout-select-address__continue-button"),

    // VERIFIED — the delivery-METHOD step, reached after confirming an
    // address (logged-in flow). Requires a phone number before delivery
    // methods can be selected.
    // NOTE: per team knowledge, only UK-format phone numbers currently
    // validate/work here (e.g. "07911123456") — this is a known,
    // temporary limitation, not a bug to chase. Use a UK-format number
    // in tests regardless of the delivery country until this changes.
    deliveryPhoneInput: (page: Page) =>
      page.getByTestId("delivery-content__form-telephone"),
    // VERIFIED WORKING — once French shipping methods were configured
    // on staging, this populated with a real option ("Wizzair air
    // transport", €10.00) and the flow progressed correctly through to
    // billing and review.
    deliveryMethodRadioGroup: (page: Page) =>
      page.getByTestId("delivery-content__radio-select"),
    deliveryNotesInput: (page: Page) =>
      page.getByTestId("delivery-content__form-delivery-notes"),
    deliveryContinueButton: (page: Page) =>
      page.getByTestId("delivery-content__form-continue-button"),

// VERIFIED — billing step (/checkout/billing), FRESH flow: shows
        // the exact same checkout-select-address radio-selection UI as
        // the delivery step — no checkbox involved at all. Selecting a
        // radio + clicking continue goes STRAIGHT to
        // /checkout/review-and-payment. This corrects an earlier,
        // wrong assumption (a "same as delivery" checkbox was seen once,
        // but only on a RETURNING session where a billing address had
        // already been set before — not on a fresh one). The checkbox
        // locators below are kept as fallback for that returning-session
        // case, but the main method (chooseBillingAddressSameAsDelivery
        // in InsinkeratorCheckoutPage.ts) uses billingAddressOptions /
        // billingAddressContinueButton directly, matching the fresh flow.
        billingSameAsDeliveryCheckbox: (page: Page) => page.getByTestId('checkout-address-form__same-as-delivery-address'),
        billingContinueButton: (page: Page) => page.getByTestId('checkout-billing-content__continue-button'),
        // VERIFIED — the actual fresh-flow controls: same structure as
        // the delivery step's address selection.
        billingAddressOptions: (page: Page) => page.locator('[data-testid="checkout-select-address__addresses"] [data-testid^="radio-select_option"]'),
        billingAddressContinueButton: (page: Page) => page.getByTestId('checkout-select-address__continue-button'),

    // VERIFIED — reached /checkout/review-and-payment. Order summary,
    // line items, and shipping cost all render correctly.
    reviewContent: (page: Page) => page.getByTestId("review-content"),
    reviewCurrentAddress: (page: Page) =>
      page.getByTestId("review-current-address"),
    // VERIFIED — THE ACTUAL CURRENT BLOCKER (as of this session): no
    // payment button/method ever renders on this page. Instead this
    // alert shows: "Payment provider not valid for this order." This
    // is NOT a UI bug — no payment provider is configured for this
    // country/order combination on staging, the same category of gap
    // as the shipping issue that was just fixed. Whoever configures
    // staging payment providers needs to do the equivalent fix before
    // a "place order"/"pay" button will ever appear here to locate.
    reviewPaymentProviderErrorAlert: (page: Page) =>
      page.getByTestId("review-content__alert"),
    // TODO(INSINKERATOR): NOT YET FOUND — no place-order/pay button
    // exists in the DOM while the above error is showing. Re-inspect
    // once a payment provider is configured for this country.
    placeOrderButton: (page: Page) =>
      page.getByTestId("TODO-place-order-button"),

    // Kept for interface compatibility with the abstract CheckoutPage
    // contract's chooseDeliveryOption/chooseDeliveryDateAndOptions
    // method shapes. UNVERIFIED against a real multi-option delivery
    // method list (only ever saw a single "Wizzair air transport"
    // option — never confirmed a Click & Collect equivalent exists on
    // this project).
    deliveryOptionsDiv: (page: Page) =>
      page.getByTestId("TODO-delivery-options"),
    deliveryOptionsSlotsDiv: (page: Page) =>
      page.getByTestId("TODO-delivery-options-slots"),
    payOnAccountButton: (page: Page) =>
      page.getByTestId("TODO-pay-on-account-button"),
    proceedButton: (page: Page) => page.getByTestId("TODO-proceed-button"),
  },

  // TODO(INSINKERATOR): NOT YET REACHED — blocked behind the "Payment
  // provider not valid for this order" issue above. Once a payment
  // provider is configured and placeOrderButton is located, complete a
  // real order to capture these.
  CheckoutSuccessPage: {
    thankYouHeader: (page: Page) => page.getByTestId("TODO-thank-you-header"),
    orderDetails: (page: Page) => page.getByTestId("TODO-order-details"),
  },
};
