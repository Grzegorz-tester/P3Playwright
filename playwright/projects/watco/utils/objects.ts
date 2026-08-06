import { Page } from '@playwright/test'

export const WatcoObjects = {
    // VERIFIED live (staging, 2026-08-05): a standard OneTrust cookie-
    // consent banner appears on every fresh session (no persisted
    // cookies). #onetrust-accept-btn-handler is OneTrust's own product
    // default id (same one already confirmed on Insinkerator, a separate
    // unrelated project — coincidence, not shared code). A single click
    // cleanly hides the banner (#onetrust-banner-sdk), the preference
    // centre (#onetrust-pc-sdk), and its dark-filter overlay — confirmed
    // via live DOM checks before/after, no collision between them.
    CookieBanner: {
        acceptAllButton: (page: Page) => page.locator('#onetrust-accept-btn-handler'),
    },

    // VERIFIED live (staging, 2026-08-05). No data-testid attributes exist
    // on this form — Symfony-generated stable ids used instead.
    LoginPage: {
        emailInput: (page: Page) => page.locator('#login__username'),
        passwordInput: (page: Page) => page.locator('#login__password'),
        // VERIFIED — the login form has a stable name="login" attribute
        // (no id) with exactly ONE submit button inside it, confirmed live
        // — no text matching needed to disambiguate from the page's other
        // submit-typed buttons (OneTrust's cookie/preference-centre
        // controls are also type="submit" but live outside this form).
        submitButton: (page: Page) => page.locator('form[name="login"] button[type="submit"]'),
    },

    // VERIFIED live (staging, 2026-08-05). Real category navigation (unlike
    // the Algolia/Bloomreach search widget below) — top-level category
    // links (Floors, Walls, Roofs, Paint, Repair, Anti Slip & Safety,
    // General Maintenance) live in TWO copies in the DOM (desktop + mobile
    // mega-menu), so every locator here is scoped to the desktop container
    // to avoid strict-mode ambiguity.
    HomePage: {
        searchInput: (page: Page) => page.locator('input[name="query"]').filter({ visible: true }),
        categoryNav: (page: Page) => page.locator('.mega-menu-categories-desktop'),
    },

    // VERIFIED live (staging, 2026-08-05): Watco is search-driven for
    // product discovery (same divergence as Mipa, see CLAUDE.md) — the
    // header search box is an Algolia/Bloomreach autocomplete widget, and
    // Enter navigates to /search?query=<term> with real product cards.
    //
    // CONFIRMED SITE BUG (staging only): every product link rendered by
    // this widget (both the autocomplete dropdown AND the /search results
    // page) points at an absolute https://1-69-0.uk.watco.pub/... URL — an
    // internal Bloomreach content-delivery host that does not resolve
    // publicly (NXDOMAIN) and is unreachable from CI or this repo's dev
    // machines. The product itself loads fine directly on
    // staging-uk.watco.pub. WatcoProductListPage works around this by
    // reading the href and rewriting the hostname before navigating,
    // rather than clicking the link directly.
    ProductListPage: {
        resultLink: (page: Page) => page.locator('a.view-product-btn'),
        resultCard: (page: Page) => page.locator('.card-fresh'),
        resultCardTitle: (page: Page) => page.locator('.card-fresh__title'),
    },

    // VERIFIED live (staging, 2026-08-05). No data-testid/id on the PDP
    // add-to-basket button — .pdp-atb-btn is a purpose-built JS-hook class
    // (confirmed unique on the page), not a styling class. Clicking it
    // adds the item and stays on the PDP (no navigation) — the separate
    // header basket link (#nav-basket) is what the abstract contract's
    // basketButton/proceedToBasketPage() actually navigate with.
    //
    // No PDP-level quantity control was found for this product (the only
    // number input present, #number_of_coats, belongs to a hidden
    // "Coverage Calculator" tool — confirmed via computed style, unrelated
    // to basket quantity). Quantity is adjusted on the basket page itself
    // (basket-line-level, not PDP-level) — see BasketPage below.
    ProductDetailPage: {
        addToBasketButton: (page: Page) => page.locator('.pdp-atb-btn'),
        basketHeaderLink: (page: Page) => page.locator('#nav-basket'),
    },

    // VERIFIED live (staging, 2026-08-05). #nav-basket carries a
    // data-basket-qty attribute reflecting the live basket item count —
    // used for getBasketCount() instead of parsing the "(N items)" text.
    // The basket-page "Checkout now" control is an <input type="submit">
    // with no id/name, but it is the ONLY submit in a form that submits to
    // the basket page's OWN path — action="/basket" on UK/IE, but
    // action="/panier" on FR (VERIFIED live, 2026-08-06: this market
    // localizes the basket page path itself, unlike the always-English
    // /basket/update and /basket/promo/add API-style routes). Matching the
    // current page's own pathname keeps this scoped-not-text without
    // hardcoding a market's route.
    BasketPage: {
        checkoutSubmitButton: (page: Page) => page.locator(`form[action="${new URL(page.url()).pathname}"] input[type="submit"]`),
        basketLineQtyInput: (page: Page) => page.locator('.basket-item-qty'),
        basketUpdateSubmitButton: (page: Page) => page.locator('form[action="/basket/update"] input[type="submit"]'),
    },

    // VERIFIED live (staging, 2026-08-05). This is a single-page accordion
    // checkout (Delivery/Billing/Payment all on one /checkout/* URL, no
    // per-step navigation) built on Symfony forms with no data-testid
    // anywhere. Facts below are grouped by accordion section.
    CheckoutPage: {
        // Landing ("Welcome to checkout"): three collapsible option cards
        // (Sign in / Checkout as guest / Express Checkout), each toggled by
        // a div[role="button"] header and scoped by its underlying radio's
        // value — there's no id/testid on the cards themselves.
        guestOptionToggle: (page: Page) => page.locator('.checkout-welcome__option:has(input[value="guest"]) .js-checkout-option-header'),
        guestEmailInput: (page: Page) => page.locator('#login_email'),
        // Scoped to the guest option's own card so this isn't a text
        // locator — it's the only submit button inside that card.
        guestEmailSubmitButton: (page: Page) => page.locator('.checkout-welcome__option:has(input[value="guest"]) button[type="submit"]'),

        // Delivery. CONFIRMED SITE BUG: the field labelled "Address line 1"
        // on screen is actually id=delivery_address_address_line_2 — every
        // address_line_N id is one position ahead of its own on-screen
        // label (id _line_1 is labelled "Company", _line_2 is labelled
        // "Address line 1", _line_3 is labelled "Address line 2").
        // Confirmed via label[for=] lookups, not a guess.
        deliveryFirstNameInput: (page: Page) => page.locator('#delivery_address_firstname'),
        deliveryLastNameInput: (page: Page) => page.locator('#delivery_address_lastname'),
        deliveryTelephoneInput: (page: Page) => page.locator('#delivery_address_telephone'),
        enterAddressManuallyLink: (page: Page) => page.locator('a.js-enter-address-manually'),
        deliveryAddressLine1Input: (page: Page) => page.locator('#delivery_address_address_line_2'),
        deliveryCityInput: (page: Page) => page.locator('#delivery_address_city'),
        deliveryPostcodeInput: (page: Page) => page.locator('#delivery_address_postcode'),
        deliveryCountrySelect: (page: Page) => page.locator('#delivery_address_country'),
        // No id/semantic class on either the delivery-confirm or the
        // shipping-proceed button — both are the same generic
        // "btn btn-dark btn-block" primary CTA, but only one is ever
        // visible at a time (the other accordion sections are collapsed),
        // so scoping to the visible instance is deterministic in practice.
        accordionPrimaryButton: (page: Page) => page.locator('button.btn.btn-dark.btn-block').filter({ visible: true }),

        // Shipping — plain radios, first option is pre-selected by default.
        firstShippingOption: (page: Page) => page.locator('input[name="shipping_option"]').first(),

        // Payment — the WAT-335 VAT field itself.
        vatNumberInput: (page: Page) => page.locator('#payment_customer_vat_number'),
        // VERIFIED: this group carries a data-unsaved-message attribute and
        // gets a js-vat-apply-group--dirty modifier class while the field
        // has been edited but not (yet) Applied. Attempting to check either
        // T&Cs checkbox or click Pay now while dirty surfaces that message
        // via .js-vat-apply-error (the SAME class/element the invalid-
        // format error below uses) and the checkbox does not end up
        // checked — confirmed live, this is a real guard, not a flake.
        // Scoped to the group that contains #payment_customer_vat_number,
        // not just ".js-vat-apply-group" — PL has a SECOND, near-identical
        // group for its own NIP field (same classes throughout), which
        // would otherwise make these resolve to two elements and throw a
        // strict-mode violation the moment a PL test touches them. The
        // :has() scope is a no-op on every other market (each has only
        // one such group, which trivially contains that input), so this
        // is safe everywhere, not just PL-specific hardening.
        vatFormGroup: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_vat_number)'),
        vatApplyButton: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_vat_number) button.js-vat-apply'),
        vatApplyError: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_vat_number) .js-vat-apply-error'),
        // Absent on UK/IE/FR (confirmed live on each); present on DE with
        // real copy explaining the field's business-customer purpose —
        // same .vat-form-group__comment class either way, market data
        // only differs in whether the element exists at all.
        vatNumberComment: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_vat_number) .vat-form-group__comment'),

        // PL-only: a SECOND, separate field for the domestic Polish tax ID
        // (NIP), alongside the EU VAT number above (NIP-EU, which reuses
        // the same #payment_customer_vat_number id/markup every other
        // market uses for its single VAT field — only NIP-EU affects the
        // VAT rate; NIP alone has no tax effect). VERIFIED live, staging,
        // 2026-08-06.
        nipNumberInput: (page: Page) => page.locator('#payment_customer_nip_number'),
        nipFormGroup: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_nip_number)'),
        nipApplyButton: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_nip_number) button.js-vat-apply'),
        nipApplyError: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_nip_number) .js-vat-apply-error'),
        nipNumberComment: (page: Page) => page.locator('.js-vat-apply-group:has(#payment_customer_nip_number) .vat-form-group__comment'),
        orderReferenceInput: (page: Page) => page.locator('#payment_customer_notes'),
        payByCardMethodRadio: (page: Page) => page.locator('#payment_payment_method_0'),
        payOnAccountMethodRadio: (page: Page) => page.locator('#payment_payment_method_1'),
        // VERIFIED: payment provider is Adyen (payment_method_0 = card/
        // PayPal via Adyen). The T&Cs checkbox is payment-method-
        // conditional — #adyenTCs renders only when the card/Adyen method
        // is selected, #nonAdyenTCs only when Pay on Account is selected.
        // #basket-summary__terms also exists in the DOM but is permanently
        // visibility:hidden on this page — confirmed via computed style,
        // not a flake — do not use it.
        adyenTermsCheckbox: (page: Page) => page.locator('#adyenTCs'),
        payOnAccountTermsCheckbox: (page: Page) => page.locator('#nonAdyenTCs'),
        // CONFIRMED SITE BEHAVIOUR / CORRECTED (staging, 2026-08-06): the
        // visually prominent "Pay now" button (button.btn-checkout) is
        // NOT what actually submits the order — it stays permanently
        // visibility:hidden throughout this flow (confirmed via computed
        // style, tried every payment method/state combination). The real
        // submit control is this generic accordion-style "proceed" input,
        // gated by a Bootstrap d-none class removed once the active
        // payment method's own T&Cs checkbox is checked — same d-none-
        // toggle mechanism DE's Pay-on-Account-visibility uses, just on a
        // different element. This was never caught earlier because no
        // test had ever completed a full order until this was found.
        payNowButton: (page: Page) => page.locator('.payment__button-proceed'),
        // VERIFIED: shown once Pay on Account is selected. Real copy:
        // "For new customers, the minimum value for a Pay on account order
        // is £500.00. If you are an existing customer payment on account
        // is still available, or if this is your first order, please pay
        // by card or call us on 01483 418418."
        payOnAccountMinimumOrderNotice: (page: Page) => page.locator('p', { hasText: 'minimum value for a Pay on account order' }),

        // Order summary panel (right column) — used to assert VAT/total
        // are unchanged after applying a VAT number.
        summaryVatAmount: (page: Page) => page.locator('.basket-summary__row.basket-summary__tax .basket-summary__price'),
        // The row's full text (e.g. "MwSt (20%) 61,18 €") — use this when
        // the rate percentage itself matters; summaryVatAmount above is
        // the price div only, it does not include the "(NN%)" label.
        summaryVatRow: (page: Page) => page.locator('.basket-summary__row.basket-summary__tax'),
        // CONFIRMED SITE BUG (minor, checkout-only): on /checkout this total
        // div carries only class="basket-summary__total" — it's missing the
        // basket-summary__price class every other summary row's price div
        // has (confirmed present on /basket's equivalent row, so this is a
        // checkout-template-specific omission, not a repo-wide pattern).
        summaryOrderTotal: (page: Page) => page.locator('.basket-summary__row--total .basket-summary__total'),

        // Thank-you page (post-order). A DIFFERENT template from the rest
        // of checkout — none of the .basket-summary__* locators above
        // exist here. VERIFIED live (staging, 2026-08-06): each row is
        // "<div class='checkout-thank-you__summary-row'><span>Label</span>
        // <span>Amount</span></div>", with no VAT RATE shown (unlike the
        // checkout page's "VAT (20%)") and no VAT NUMBER shown anywhere
        // on the page. Scoped by ":has(+ ...__summary-total)" — the row
        // immediately before the total row — rather than by the label
        // text, since the label itself is a translated word ("VAT" /
        // "MwSt" / "TVA" / etc.) and this repo's hard rule is to avoid
        // text-based locators when a structural alternative exists.
        thankYouVatRow: (page: Page) => page.locator('.checkout-thank-you__summary-row:has(+ .checkout-thank-you__summary-total)'),
        thankYouVatAmount: (page: Page) => page.locator('.checkout-thank-you__summary-row:has(+ .checkout-thank-you__summary-total) span:last-child'),
    },

    // VERIFIED live (staging, 2026-08-05). /account/profile's VAT field has
    // no live Apply/validation behaviour like checkout's — it's a plain
    // field saved via the page's single "Save details" submit.
    AccountPage: {
        accountOverviewMarker: (page: Page) => page.locator('a[href="/account/profile"]'),
        vatNumberInput: (page: Page) => page.locator('#user_profile_customer_vat_number'),
        // Scoped to the profile form (name="user_profile") — the page also
        // has an unrelated newsletter-signup form with its own submit.
        saveDetailsButton: (page: Page) => page.locator('form[name="user_profile"] button[type="submit"]'),
    },

    // VERIFIED live (staging, 2026-08-05). Unlike checkout's live js-vat-
    // apply behaviour, this VAT field has no client-side Apply/validation —
    // it's validated server-side on full form submit, and an invalid value
    // gets a div.alert.alert-danger appended directly after the field
    // (same message text checkout uses, but no is-invalid class here).
    RegisterPage: {
        emailInput: (page: Page) => page.locator('#user_registration_email'),
        titleSelect: (page: Page) => page.locator('#user_registration_title'),
        firstNameInput: (page: Page) => page.locator('#user_registration_firstname'),
        lastNameInput: (page: Page) => page.locator('#user_registration_lastname'),
        telephoneInput: (page: Page) => page.locator('#user_registration_telephone'),
        vatNumberInput: (page: Page) => page.locator('#user_registration_customer_vat_number'),
        passwordInput: (page: Page) => page.locator('#user_registration_plain_password_first'),
        confirmPasswordInput: (page: Page) => page.locator('#user_registration_plain_password_second'),
        marketingAgreementCheckbox: (page: Page) => page.locator('#user_registration_marketing_agreement'),
        // Scoped to the registration form (identified by the email field
        // it contains) — the page also has an unrelated newsletter-signup
        // form with its own submit button.
        submitButton: (page: Page) => page.locator('form:has(#user_registration_email) button[type="submit"]'),
        vatNumberError: (page: Page) => page.locator('#user_registration_customer_vat_number ~ .alert-danger'),
        // Same .vat-form-group__comment class as checkout — absent on
        // UK/IE/FR, present on DE. Scoped to the group containing the VAT
        // (NIP-EU on PL) input for the same reason as checkout's — PL adds
        // a second NIP field to this form too (registration's wrapper is
        // plain ".form-group", not checkout's ".js-vat-apply-group").
        vatNumberComment: (page: Page) => page.locator('.form-group:has(#user_registration_customer_vat_number) .vat-form-group__comment'),

        // PL-only second field (NIP) — see CheckoutPage comment above.
        nipNumberInput: (page: Page) => page.locator('#user_registration_customer_nip_number'),
        nipNumberError: (page: Page) => page.locator('#user_registration_customer_nip_number ~ .alert-danger'),
    },

    // VERIFIED live (staging, 2026-08-05). Express Checkout is a third
    // option card on the checkout landing page ("Welcome to checkout"),
    // alongside Sign in / Checkout as guest — it is NOT reached via the
    // guest/sign-in delivery+payment flow. Its VAT field reuses the same
    // live js-vat-apply-group validation as regular checkout, but there is
    // no Pay on Account option and no order-summary sidebar on this
    // screen. Google Pay renders as a real clickable button in Chromium;
    // Apple Pay renders as an inert placeholder here since Chromium has no
    // ApplePaySession — actually opening either wallet sheet is out of
    // scope (see test file docblock).
    ExpressCheckout: {
        optionContainer: (page: Page) => page.locator('.checkout-welcome__option:has(input[name="checkout_method"])'),
        optionToggle: (page: Page) => page.locator('.checkout-welcome__option:has(input[name="checkout_method"]) .checkout-welcome__option__header'),
        vatNumberInput: (page: Page) => page.locator('#express_customer_vat_number'),
        // Scoped to the group containing the VAT (NIP-EU on PL) input, not
        // just the express option card as a whole — same reasoning as
        // checkout's vatApplyButton/vatApplyError above: PL has a second,
        // near-identical NIP group in this same card.
        vatApplyButton: (page: Page) => page.locator('.js-vat-apply-group:has(#express_customer_vat_number) button.js-vat-apply'),
        vatApplyError: (page: Page) => page.locator('.js-vat-apply-group:has(#express_customer_vat_number) .js-vat-apply-error'),
        termsCheckbox: (page: Page) => page.locator('#expressTCs'),
        googlePayButton: (page: Page) => page.locator('#gpay-button-online-api-id'),

        // PL-only second field (NIP) — see CheckoutPage comment above.
        nipNumberInput: (page: Page) => page.locator('#express_customer_nip_number'),
        nipApplyButton: (page: Page) => page.locator('.js-vat-apply-group:has(#express_customer_nip_number) button.js-vat-apply'),
        nipApplyError: (page: Page) => page.locator('.js-vat-apply-group:has(#express_customer_nip_number) .js-vat-apply-error'),
    },
}
