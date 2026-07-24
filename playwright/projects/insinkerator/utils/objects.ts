import { Page } from '@playwright/test';

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
            page.getByRole('button', { name: `Select ${countryName}`, exact: true }),
        // VERIFIED — the blocking backdrop; useful to assert it's gone after
        // selecting a country, or to detect it's present before interacting
        // with anything else on a fresh page load.
        blockingOverlay: (page: Page) => page.getByTestId('overlay'),

        // VERIFIED — a SEPARATE picker in the utility bar for changing
        // country later in a session (distinct from the mandatory modal
        // above, though it reuses the same "Choose your country" panel
        // content). No data-testid, id, or stable href on this control — ask
        // devs for one and raise a ticket; anchoring to the stable
        // utility-bar parent is the least-bad option today.
        utilityBarOpenButton: (page: Page) => page.locator('[data-testid="utility-bar"] button').first(),
        countryOption: (countryName: string) => (page: Page) =>
            page.getByRole('button', { name: `Select ${countryName}`, exact: true })
    },

    // VERIFIED — the "Follow Us" newsletter sign-up form in the site FOOTER,
    // present on every page (confirmed on home, account, and address-book).
    // Grouped separately from HomePage for that reason, same rationale as
    // CountrySelector above.
    Footer: {
        newsletterForm: (page: Page) => page.getByTestId('newsletter-form'),
        newsletterTitle: (page: Page) => page.getByTestId('newsletter-form__title'),
        newsletterEmailInput: (page: Page) => page.getByTestId('newsletter-form__input'),
        newsletterSubmitButton: (page: Page) => page.getByTestId('newsletter-form__submit-button'),
        newsletterPrivacyPolicyLink: (page: Page) => page.getByTestId('newsletter-form__privacy-policy-link'),
        // VERIFIED — the email input has NO custom client-side validation UI;
        // it's a native <input type="email" required>, so invalid/empty
        // submissions are blocked entirely by the browser's own validity
        // state (element.validity / validationMessage), not a rendered
        // error message in the DOM. Assert against that instead of a locator.
        //
        // IMPORTANT — CONFIRMED LIVE, reproduced twice with two different
        // well-formed emails: submitting a genuinely VALID email currently
        // always surfaces this alert instead of a success confirmation —
        // "Form Field with uniqueString email-1 could not be found." This
        // is a backend/CRM form-field-mapping misconfiguration on staging
        // (same category of gap as CheckoutPage.reviewPaymentProviderErrorAlert
        // — a real, current site bug, not test flakiness). No success-state
        // testid has been observed and none is documented here as a result.
        // TODO(INSINKERATOR): once the backend field mapping is fixed,
        // capture the real success-state locator and tighten the "submit a
        // valid email" test assertion to check for success instead of this
        // alert.
        newsletterAlert: (page: Page) => page.getByTestId('newsletter-form__alert')
    },

    HomePage: {
        // VERIFIED
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        // VERIFIED — categories are numbered drawer links, not named per-category
        // testids. Filtering by visible text is unavoidable here since the
        // testid itself (link-0, link-1, ...) carries no semantic meaning and
        // the order isn't guaranteed stable long-term.
        category: (categoryName: string) => (page: Page) =>
            page.locator('[data-testid^="navigation-drawer-sheet__link-"]').filter({ hasText: categoryName }),
        // VERIFIED
        menuNavBarButton: (page: Page) => page.getByTestId('brand-bar__menu-button')
        // CONFIRMED ABSENT: no "view all" link exists on this project's
        // drawer (unlike Kooltech) — category links navigate straight to
        // the PLP. viewAllButton removed accordingly.
        //
        // KNOWN SITE BUG (confirmed via elementFromPoint on a real run):
        // the drawer's own animated backdrop overlay (class "fixed
        // inset-0 z-50 bg-black/80") shares the exact same z-index (50)
        // as the sticky <header> containing the category links, so a CSS
        // stacking tie resolved by DOM order lets the backdrop paint on
        // top and intercept clicks meant for the links underneath. This
        // affects real mouse clicks, not just automation — worth raising
        // as a UI ticket. InsinkeratorHomePage.chooseMenuCategory() works
        // around it with a forced click.
    },

    // VERIFIED — the search DRAWER opened by clicking brand-bar__search-button
    // in the header, present on every page. It's an Algolia-backed
    // autocomplete panel: empty state shows "Your recent searches" (or "No
    // recent searches") plus an always-visible "Recommended Products" grid;
    // typing renders live, as-you-type hits (or a no-results message);
    // pressing Enter submits to a full results page at /search?q=<term>.
    SearchDrawer: {
        openButton: (page: Page) => page.getByTestId('brand-bar__search-button'),
        // VERIFIED — the drawer's own [role="dialog"] wrapper has NO
        // data-testid, and the SAME role is shared with the unrelated
        // cookie-consent banner dialog elsewhere on the page. Scoping by
        // `has:` the always-present algolia-autocomplete testid (a stable
        // attribute filter, not text) reliably resolves to the search
        // drawer specifically, regardless of which dialog mounted first.
        drawer: (page: Page) => page.locator('[role="dialog"]').filter({ has: page.getByTestId('algolia-autocomplete') }),
        searchInput: (page: Page) => page.getByTestId('algolia-autocomplete__input'),
        recommendedProducts: (page: Page) => page.getByTestId('navigation-drawer-sheet__recommended-products'),
        hitProductNames: (page: Page) => page.getByTestId('algolia-autocomplete-hit-product__name'),
        noResultsMessage: (page: Page) => page.getByTestId('algolia-autocomplete-hits__no-results'),
        // No testid on this button anywhere in the drawer (last-resort
        // accessible-name locator, same precedent as
        // WhereToBuy.modalCloseButton). NOT a site bug: a plain
        // Playwright .click() consistently fails to close the drawer, but
        // that's a Playwright-vs-component timing quirk, not broken UI —
        // confirmed live that this button needs a real mousedown-PAUSE-
        // mouseup gesture (~150ms hold) to register, which
        // InsinkeratorHomePage.closeSearchDrawer() does via raw
        // page.mouse events rather than .click(). Escape does NOT work as
        // an alternative.
        closeButton: (page: Page) => InsinkeratorObjects.SearchDrawer.drawer(page).getByRole('button', { name: 'Close' })
        // CONFIRMED SITE BUG: the "clear search" button's data-testid has a
        // literal leading space in the markup (" algolia-autocomplete__clear-button"),
        // so page.getByTestId('algolia-autocomplete__clear-button') would
        // NOT match it. Not needed for the flows covered here — omitted
        // rather than shipping a broken locator. Worth a UI ticket.
    },

    LoginPage: {
        // VERIFIED — no dedicated heading testid; anchored structurally to the
        // stable login-form testid instead of matching on visible text.
        loginHeader: (page: Page) => page.locator('[data-testid="login-form"] h1'),
        // VERIFIED
        emailInput: (page: Page) => page.getByTestId('login-form__email-input'),
        passwordInput: (page: Page) => page.getByTestId('login-form__password-input'),
        signInButton: (page: Page) => page.getByTestId('login-form__submit-button'),
        // VERIFIED — successful login (grzegorz.hajduk@velstar.co.uk /
        // Testing123!) confirmed this renders "Hi <FirstName>. You're signed
        // in." in the utility bar, redirecting to /account.
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId('utility-bar__user-name'),
        // VERIFIED — confirmed live (staging, 2026-07-22): a wrong password
        // shows this alert with text "ErrorInvalid credentials." (an
        // "Error" heading immediately followed by the message, no space —
        // same rendering pattern as the newsletter form's alert elsewhere
        // in this file), staying on /login rather than redirecting.
        // Empty-field submission is instead blocked by native HTML5
        // validity (required attribute), same pattern as the newsletter/
        // reset-password forms — no rendered error message for that case.
        alertMessage: (page: Page) => page.getByTestId('login-form__alert'),
        forgotPasswordLink: (page: Page) => page.getByTestId('login-form__forgot-password-link'),
        // VERIFIED — present in the utility bar on every page once logged
        // in (confirmed on /account, /account/profile and others), same
        // chrome that renders welcomeUserTopbarDiv above.
        signOutLink: (page: Page) => page.getByTestId('utility-bar__sign-out-link')
    },

    // VERIFIED — confirmed on /reset-password (staging, 2026-07-22),
    // reached via LoginPage.forgotPasswordLink. A standalone email-only
    // form; submitting shows a static success message (not tied to
    // whether the email actually belongs to a real account - confirmed
    // only with a real, valid test account email, not cross-checked
    // against a nonexistent one).
    ResetPasswordPage: {
        emailInput: (page: Page) => page.getByTestId('reset-password-form__email-input'),
        submitButton: (page: Page) => page.getByTestId('reset-password-form__submit-button'),
        successMessage: (page: Page) => page.getByTestId('reset-password-form__success')
    },

    // VERIFIED — confirmed on /account and /account/address-book after a
    // successful login. Address-book behaviour re-verified live on
    // 2026-07-21 by actually adding, editing and deleting a delivery
    // address against the accountTestUser_1 account (which started with
    // ZERO saved addresses).
    AccountPage: {
        // NOTE: all four sidebar links share the SAME testid
        // ("account-menu__item") and each carries its own href DIRECTLY on
        // that same element (it's an <a>, not a wrapper around one) — so
        // they're only distinguishable by href, not by testid. A compound
        // attribute selector (testid + href on one element) is required
        // here: `.filter({ has: page.locator('[href=...]') })` looks for a
        // DESCENDANT matching the href, which this markup doesn't have,
        // and silently matches zero elements — confirmed live (this was a
        // real, previously-uncaught bug: matched 0 elements every time).
        dashboardMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account"]'),
        profileMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/profile"]'),
        addressBookMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/address-book"]'),
        ordersMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/orders"]'),

        // VERIFIED — /account/profile's "My Details" form. Its own
        // "Reset Password" link toggles the SAME card over to a separate
        // "Change Password" form (existing/new/repeat fields) in place —
        // not a navigation, confirmed live. Neither button carries a
        // data-testid or id; last-resort text anchors scoped to the
        // my-details-form container (same precedent as
        // BasketPage.promoCodeError elsewhere in this file).
        myDetailsForm: (page: Page) => page.getByTestId('account__my-details-form'),
        resetPasswordButton: (page: Page) => InsinkeratorObjects.AccountPage.myDetailsForm(page).getByText('Reset Password'),

        // VERIFIED — the Change Password form. Existing/New/Repeat inputs
        // have real testids. "Save Changes" and "Back to User Form" don't —
        // same last-resort precedent as resetPasswordButton above. Save
        // Changes renders TWICE (a hidden mobile/desktop duplicate, same
        // pattern as ProductDetailPage.addToBasketButton elsewhere in this
        // file) — `:visible` + `.first()` required. The result alert
        // (success OR error) shares ONE testid for both outcomes,
        // distinguished only by its message text — confirmed live: a wrong
        // Existing Password shows "Unable to update password" (NOT a
        // proper validation message — the Save Changes button itself does
        // not validate the existing password client-side, only that all
        // three fields are non-empty), and a correct one shows "Password
        // successfully updated".
        changePasswordForm: (page: Page) => page.getByTestId('account__change-password-form'),
        existingPasswordInput: (page: Page) => page.getByTestId('account-profile__existing-password-input'),
        newPasswordInput: (page: Page) => page.getByTestId('account-profile__new-password-input'),
        repeatNewPasswordInput: (page: Page) => page.getByTestId('account-profile__repeat-new-password-input'),
        changePasswordSaveButton: (page: Page) => InsinkeratorObjects.AccountPage.changePasswordForm(page).getByRole('button', { name: 'Save Changes' }).locator(':visible').first(),
        backToUserFormButton: (page: Page) => InsinkeratorObjects.AccountPage.changePasswordForm(page).getByText('Back to User Form'),
        changePasswordAlert: (page: Page) => page.getByTestId('account-profile__alert'),

        // VERIFIED — /account/orders. accountTestUser_1 genuinely has ZERO
        // real orders on staging (no payment provider is configured, so no
        // automated test can complete a real purchase — same gap documented
        // on logged-in-purchase-journey.test.ts), so only the EMPTY state
        // is testable today: the column headers, the filter controls, and
        // the "No results." row. The row has no testid of its own —
        // last-resort text anchor scoped to the orders content container
        // (same precedent as BasketPage.promoCodeError elsewhere in this
        // file).
        ordersPageHeading: (page: Page) => page.getByTestId('account-orders__title'),
        ordersContent: (page: Page) => page.getByTestId('account-orders__content'),
        ordersHeaderRow: (page: Page) => page.getByTestId('account-orders-header-row'),
        ordersReferenceFilterInput: (page: Page) => page.getByTestId('account-orders-reference-filter'),
        ordersDateRangePicker: (page: Page) => page.getByTestId('account-orders-date-range-picker'),
        ordersTotalAmountFilterInput: (page: Page) => page.getByTestId('account-orders-total-amount-filter'),
        ordersFilterResetButton: (page: Page) => page.getByTestId('account-orders-filter-reset'),
        ordersNoResultsRow: (page: Page) => InsinkeratorObjects.AccountPage.ordersContent(page).getByText('No results.'),

        // VERIFIED — on /account/address-book, but ONLY renders once at least
        // one delivery address already exists (it's the "Add new address"
        // button above the list). On an empty address book this is ABSENT
        // entirely — the add-address form (see deliveryAddressForm below)
        // shows directly instead. Confirmed both states live.
        addDeliveryAddressButton: (page: Page) => page.getByTestId('address-book-delivery__add-address-button'),

        // VERIFIED — the delivery-address FORM. Its fields carry
        // "checkout-address-form__*" testids (shared markup with the
        // checkout flow's address form) even though this renders on
        // /account/address-book. IMPORTANT: whenever the billing-address
        // card is also present (add OR edit), it renders the EXACT SAME
        // "checkout-address-form" testid a second time, with no
        // distinguishing wrapper testid/id/href on either card (confirmed by
        // walking the DOM ancestry live — both forms sit inside an
        // identically-testid'd "account-card"). The delivery card is
        // CONFIRMED to always render first in DOM order (checked across an
        // empty book, an add flow, and an edit flow) — .first() is the same
        // accepted DOM-order convention used for ProductDetailPage's
        // addToBasketButton elsewhere in this file, not a text/structural
        // locator.
        deliveryAddressForm: (page: Page) => page.locator('[data-testid="checkout-address-form"]').first(),
        deliveryAddressFirstNameInput: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__first-name'),
        deliveryAddressLastNameInput: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__last-name'),
        deliveryAddressLine1Input: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__address-line-1'),
        deliveryAddressCityInput: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__city'),
        deliveryAddressPostcodeInput: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__postcode'),
        // VERIFIED — neither the "Save Address" submit button nor the
        // adjacent country-picker button carries a data-testid. type="submit"
        // is the one stable, non-text attribute that distinguishes it from
        // the country button within the same form.
        deliveryAddressSaveButton: (page: Page) => InsinkeratorObjects.AccountPage.deliveryAddressForm(page).locator('button[type="submit"]'),

        // VERIFIED — the saved delivery-address list and its per-row
        // controls. Rows are numbered POSITIONALLY (address-1, address-2,
        // ...) by current list position, NOT a persistent backend id —
        // confirmed by deleting the sole saved address and re-adding one,
        // which came back as address-1 again. Safe to address by number
        // within a single test as long as the test accounts for its own
        // adds/removes.
        deliveryAddressesList: (page: Page) => page.getByTestId('address-book-delivery__addresses'),
        deliveryAddressName: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__name`),
        deliveryAddressEditButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__edit-address-button`),
        deliveryAddressDeleteButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__delete-address-button`),
        // VERIFIED — clicking Delete opens a confirm/cancel prompt, itself
        // scoped with the SAME per-address-number testid prefix (not a
        // shared/generic modal testid).
        deliveryAddressDeleteConfirmYesButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__delete-address-yes-button`),
        deliveryAddressDeleteConfirmNoButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__delete-address-no-button`)
    },

    // VERIFIED — the full results page reached by submitting the header
    // search (pressing Enter in SearchDrawer.searchInput), e.g.
    // /search?q=sink. Product cards here share the same product-card__*
    // testids as the category PLP (see ProductListPage below).
    SearchResultsPage: {
        hitsHeading: (page: Page) => page.getByTestId('algolia-hits-heading'),
        hitCount: (page: Page) => page.getByTestId('algolia-hit-count'),
        productNameLink: (page: Page) => page.getByTestId('product-card__name')
    },

    ProductListPage: {
        // VERIFIED — same convention as Kooltech, confirmed on the Algolia-backed
        // /category/shop listing. On THAT category, product-card__name is
        // itself clickable (an onClick-driven card, confirmed working via
        // clickOnFirstItemToProceedToPDP() below). CONFIRMED DIFFERENT on
        // /category/accessories: there, product-card__name renders as a
        // plain, non-interactive <h5> — clicking it does nothing. Use
        // productCardLink (the actual <a href="/products/...">, wrapping
        // the product image) for navigation on that category instead — see
        // clickFirstResult() in InsinkeratorProductListPage.ts.
        productNameLink: (page: Page) => page.getByTestId('product-card__name'),
        productNameLinkFiltered: (productName: string) => (page: Page) =>
            page.getByTestId('product-card__name').filter({ hasText: `${productName}` }),

        // VERIFIED — confirmed on /category/accessories (staging,
        // 2026-07-22). The category heading/result count and each card's
        // real anchor and price.
        hitsHeading: (page: Page) => page.getByTestId('algolia-hits-heading'),
        hitCount: (page: Page) => page.getByTestId('algolia-hit-count'),
        productCardLink: (page: Page) => page.getByTestId('product-card__link'),
        productCardPrice: (page: Page) => page.getByTestId('product-card__now-price'),

        // VERIFIED — "Filter & Sort" opens a dialog containing a sort
        // radiogroup and one-or-more facet checkbox lists (e.g. "Product
        // Category", "Colour" on Accessories — the exact set of groups is
        // category-dependent).
        filterAndSortOpenButton: (page: Page) => page.getByTestId('algolia-facet-drawer__open-button'),

        // VERIFIED — facet checkboxes are numbered PER refinement group
        // (checkbox-0, checkbox-1, ... restarting at 0 for each group), NOT
        // globally unique. A hidden mobile/desktop duplicate of the WHOLE
        // facet drawer also exists in the DOM at all times (same pattern as
        // ProductDetailPage.addToBasketButton elsewhere in this file) —
        // :visible resolves to the real, interactable copy. Each checkbox's
        // own sibling <label> carries its live result count in text (e.g.
        // "Air Switch (26)") — read via a plain DOM evaluate() in
        // applyFirstFacetFilterAndValidate(), not a locator, since getting
        // from the checkbox to that sibling has no non-structural selector
        // (no shared testid/id/href) and CLAUDE.md rules out structural
        // XPath as a LOCATOR strategy — evaluate() is just reading data,
        // not a selector engine, so it's the appropriate escape hatch here.
        facetCheckboxes: (page: Page) => page.locator('[data-testid^="algolia-refinement-list__checkbox-"]:visible'),

        // VERIFIED — the sort radiogroup ALSO has a hidden mobile/desktop
        // duplicate. Individual options carry no testid; selected by DOM
        // ORDER (Relevance, Price Low-to-High, Price High-to-Low — that
        // order confirmed via each option's `value` attribute) rather than
        // visible label text (a copy-edit risk) or the `value` attribute
        // itself, which embeds the environment's Algolia index name (e.g.
        // "staging_insinkerator_eu_product_price_asc") and would break
        // against any future non-staging environment.
        sortByOptions: (page: Page) => page.getByTestId('algolia-sort-by').locator('visible=true').getByRole('radio'),

        loadMoreButton: (page: Page) => page.getByTestId('algolia-infinite-pagination__load-more'),
        currentItemsCount: (page: Page) => page.getByTestId('algolia-infinite-pagination__current-items'),
        totalItemsCount: (page: Page) => page.getByTestId('algolia-infinite-pagination__total-items')
    },

    // VERIFIED — the /our-accessories informational landing page's own
    // "Shop" call-to-action (-> /category/accessories). Distinct from the
    // header's "Shop" NAV LINK, which goes to /category/shop instead —
    // same href/text pair, different page, easy to confuse.
    AccessoriesLandingPage: {
        // No testid on this button, and its href ("/category/accessories")
        // is ALSO used by an unrelated footer link and a nav-drawer
        // sub-link elsewhere on the same page — text is needed to
        // disambiguate the specific CTA among all matches for that href.
        // Same last-resort precedent as HomePage.category above.
        shopButton: (page: Page) => page.locator('a[href="/category/accessories"]').filter({ hasText: 'Shop' })
    },

    ProductDetailPage: {
        // VERIFIED — the product title. Same hidden mobile/desktop
        // duplicate pattern as addToBasketButton below (count of 2
        // confirmed live) — :visible + first() resolves to the real one.
        productName: (page: Page) => page.locator('[data-testid="product-info__name"]:visible').first(),
        // VERIFIED — same hidden mobile/desktop duplicate pattern as
        // productName above.
        productSku: (page: Page) => page.locator('[data-testid="product-info__sku"]:visible').first(),

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
        // IMPORTANT — CORRECTION: .first() alone is NOT reliable here.
        // A real run (logged in) had the visible button at index 0; a
        // later run (logged out, different product) had it at index 1,
        // with a hidden (0x0, likely a responsive mobile-only duplicate)
        // button actually coming FIRST in DOM order. Filtering by real
        // visibility with the :visible pseudo-class, THEN taking .first()
        // of what's actually visible, is what correctly and consistently
        // resolves to the main product (confirmed: the genuinely visible
        // main-product button sits near the top of the page; a visible
        // upsell item's button, if any, renders much further down and
        // would still be excluded by taking only the first visible one).
        addToBasketButton: (page: Page) => page.locator('[data-testid="product-add-to-basket__button"]:visible').first(),
        // The "added to basket" confirmation is a full panel, not a small popup
        // — testids below reflect its actual structure.
        checkoutPopup: (page: Page) => page.getByTestId('product-added-to-basket__added-to-basket-heading'),
        closeAddedToBasketPopupButton: (page: Page) => page.getByTestId('product-added-to-basket__continue-button'),
        goToBasketButton: (page: Page) => page.getByTestId('product-added-to-basket__basket-button'),
        basketButton: (page: Page) => page.getByTestId('brand-bar__basket-link'),
        // Same .first()-is-unreliable correction as addToBasketButton above.
        actualPricePDP: (page: Page) => page.locator('[data-testid="product-price__now-price"]:visible').first(),
        // TODO(INSINKERATOR): no quantity-input testid was found on the PDP —
        // this project may not support choosing a quantity before adding to
        // basket (single-unit add only). Confirm before relying on this.
        itemAmountToAddInput: (page: Page) => page.getByTestId('TODO-quantity-input'),
        // VERIFIED — the count badge is an unlabelled <span> inside the basket
        // link; anchored structurally to the stable parent testid.
        basketCount: (page: Page) => page.locator('[data-testid="brand-bar__basket-link"] span')
    },

    // VERIFIED — confirmed on /products/standard-460 (staging, 2026-07-22),
    // a configurable-bundle PDP template: 1+ groups ("1. Select your
    // flange type", "2. Select your sink stopper", "3. Select a
    // decorative air switch" on this product) each offering selectable
    // accessory variants with their own price delta, live-updating a
    // bundle "Total" distinct from the base product-price__now-price.
    // NOT every PDP has this — the simpler /category/accessories-style PDP
    // template has no configurator at all.
    ProductConfigurator: {
        // VERIFIED — each option's testid sits on a small radio-dot SVG
        // wrapper NESTED inside an unlabelled <button> (confirmed via
        // outerHTML) — clicking the testid element directly still works,
        // the click bubbles to the parent button normally. A hidden
        // mobile/desktop duplicate of the WHOLE configurator also exists
        // (same recurring pattern as ProductDetailPage.addToBasketButton)
        // — :visible resolves to the real, interactable copy. No stable
        // per-group container exists (no testid/id on the "1. Select
        // your..." headings), so this is one flat, DOM-ordered list
        // spanning all groups — each option's own name/price is read from
        // its parent button's text via evaluate() (data reading, not a
        // locator — see the facetCheckboxes note on ProductListPage above
        // for why evaluate() is the right escape hatch here, not XPath).
        options: (page: Page) => page.locator('[data-testid^="radio-select_option-"]:visible'),
        // VERIFIED — the live bundle Total. No testid on either the
        // "Total" label or its amount; last-resort text anchor (same
        // precedent as WhereToBuy.modalHeading above), scoped to the
        // visible copy of the duplicated pair.
        totalPriceLabel: (page: Page) => page.getByText('Total', { exact: true }).locator('visible=true').first()
    },

    // VERIFIED — confirmed on /products/standard-460 (staging,
    // 2026-07-22). Single-open accordion covering Overview / Features /
    // Specifications / Downloads. Unlike most other components on this
    // project, these triggers are NOT duplicated for mobile/desktop
    // (confirmed: raw count matches :visible count, both 4).
    ProductAccordion: {
        trigger: (page: Page) => page.getByTestId('product-accordion__trigger'),
        content: (page: Page) => page.getByTestId('product-accordion__content'),
        // VERIFIED — a SEPARATE FAQs accordion further down the same PDP,
        // same single-open behaviour, same no-duplication confirmation
        // (11 triggers, all visible).
        faqTrigger: (page: Page) => page.getByTestId('product-accordion-faqs__trigger'),
        faqContent: (page: Page) => page.getByTestId('product-accordion-faqs__content')
    },

    // VERIFIED — confirmed on /products/standard-460. A horizontally
    // scrolling feature carousel (MultiGrind Technology / SoundSeal
    // Technology / Easy Installation on this product) with prev/next
    // buttons.
    // IMPORTANT: no testid, id, href, or aria-label exists on either
    // button — bare icon SVGs with zero accessible name, distinguished
    // only by position relative to the "Product Features" heading. No
    // other anchor exists; last resort, same precedent as
    // WhereToBuy.modalHeading / AccessoriesLandingPage.shopButton
    // elsewhere in this file.
    // CORRECTED: earlier flagged as "unreliable beyond the initial
    // state", but that was wrong — the carousel's own scrollable
    // container is genuinely NOT overflowing at wide viewports (all 3
    // features fit at once), which is why BOTH buttons correctly show
    // disabled there — confirmed exactly reproducible at 1920x1080 and at
    // 2560x1440 (this project's actual `Chrome` test config), where
    // scrollWidth === clientWidth. At narrower viewports where real
    // overflow exists (confirmed at 1280x720, this project's `chromium`
    // config: scrollWidth 1470 vs clientWidth 1012), the carousel IS
    // functional: clicking "next" scrolls to the end and correctly
    // flips which button is disabled. The interaction needs an ~800ms
    // settle wait after the page loads before it registers reliably in
    // automation (same category of settle-wait need as elsewhere in this
    // project) — without it, clicks were observed to silently no-op.
    ProductFeaturesCarousel: {
        heading: (page: Page) => page.getByRole('heading', { name: 'Product Features' }),
        prevButton: (page: Page) => page.getByRole('heading', { name: 'Product Features' }).locator('..').getByRole('button').first(),
        nextButton: (page: Page) => page.getByRole('heading', { name: 'Product Features' }).locator('..').getByRole('button').last()
    },

    // VERIFIED — confirmed on /products/standard-460. Compares this
    // product against related models, one "View Product" link per
    // column.
    ProductComparisonTable: {
        // VERIFIED — each link has a real, stable href (/products/<slug>)
        // — no testid needed, href is already a top-tier stable anchor
        // per this project's locator preference order.
        viewProductLinks: (page: Page) => page.getByRole('table').locator('a[href^="/products/"]')
    },

    // VERIFIED — confirmed on /products/standard-460.
    ProductImageZoom: {
        // VERIFIED — accessible name includes the actual image filename
        // (e.g. "Expand image: 80367H-ISE.jpg"), which varies per
        // product/image — matched via regex prefix, not an exact string.
        // No mobile/desktop duplicate here (confirmed count of 1).
        // CONFIRMED SITE BUG: a sticky header (z-20, backdrop-blur)
        // intercepts pointer events at this button's position — a real
        // run needed force:true to click through it, the same class of
        // z-index bug already documented on HomePage.chooseMenuCategory
        // elsewhere in this project.
        expandButton: (page: Page) => page.getByRole('button', { name: /^Expand image/ }),
        // VERIFIED — the react-medium-image-zoom modal content. A hidden
        // mobile/desktop duplicate DOES exist here (same pattern as
        // ProductDetailPage.addToBasketButton) — filter by real
        // visibility.
        // CONFIRMED UNRELIABLE TO CLOSE: neither Escape, clicking the
        // zoomed image itself, clicking outside it at real coordinates,
        // nor the (non-visible, screen-reader-only) "Minimize image"
        // button reliably dismissed this modal across repeated attempts.
        // Only OPENING is tested here — see InsinkeratorPDPage.openImageZoom().
        modalContent: (page: Page) => page.locator('[data-rmiz-modal-content]')
    },

    // VERIFIED (partially) — PDP behaviour on a NON-ecommerce country (e.g.
    // Poland). Confirmed: none of the ProductDetailPage locators above
    // (price, add-to-basket, etc.) render at all; this "Where to buy"
    // button is what shows instead.
    WhereToBuy: {
        // VERIFIED — same hidden-duplicate pattern as addToBasketButton:
        // a 0x0 duplicate exists alongside the real, visible button.
        // :visible + first() resolves to the real one.
        openButton: (page: Page) => page.locator('[data-testid="product-stockists__open"]:visible').first(),
        // TODO(INSINKERATOR): NOT RELIABLY VERIFIED. Earlier in this
        // project's exploration, clicking this button DID open a modal
        // containing "Where to buy" / "Distributors in your country:"
        // text with dummy contact details ("test test, test, test,
        // test", a phone number, email, website, and a "Close" button) —
        // but on repeated attempts later in the same session (same
        // product, same country, both logged in and out), the modal
        // reliably failed to open at all, with no console error and no
        // network request fired. This may be genuine intermittent
        // flakiness (consistent with other flaky behaviour observed on
        // this staging environment throughout this project), or may
        // depend on some state/condition not yet identified (e.g.
        // geolocation permission, a specific product having distributor
        // data configured for the currently selected country while
        // others don't). The modal itself has NO data-testids on any
        // internal element — confirmed during the one successful open —
        // so these are last-resort text-based locators, unverified
        // against a reliably-reproducible open.
        modalHeading: (page: Page) => page.getByText('Where to buy', { exact: true }),
        modalDistributorsLabel: (page: Page) => page.getByText('Distributors in your country'),
        modalCloseButton: (page: Page) => page.getByRole('button', { name: 'Close' })
    },

    BasketPage: {
        // FIXED — a real automated run showed this button as 0x0/hidden
        // (parent div "basket-go-to-checkout" has display:none at desktop
        // viewport width). That testid turns out to be a MOBILE-only
        // duplicate of the checkout button; it happened to still respond
        // to a raw JS .click() during manual exploration (which ignores
        // visibility entirely), masking the issue. The real, visible
        // desktop button has a completely different testid:
        // "basket-summary__checkout-button" (confirmed 410x50px,
        // genuinely visible). Use that one.
        secureCheckoutButton: (page: Page) => page.getByTestId('basket-summary__checkout-button'),

        // VERIFIED — confirmed live (staging, 2026-07-22) adding a
        // configured bundle (Standard 460 + selected extras) to the
        // basket. IMPORTANT: name/sku/price testids are numbered PER LINE
        // (line-0, line-1, ...) but are REUSED, not unique, WITHIN a
        // line — the main product AND every one of its "Selected Extras"
        // all share the exact same `__name`/`__sku`/`__price` testids
        // (confirmed: 4 total matches for 1 main product + 3 configurator
        // extras). Scope to lineExtraOptions(n) first to read only the
        // extras; the main product is always .first() among the
        // unscoped/line-level matches since it renders before the extras
        // block in DOM.
        lineName: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__name`),
        lineSku: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__sku`),
        lineTotalPrice: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__total-price`),
        lineExtraOptions: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__extra-options`),
        lineRemoveButton: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__remove-button`),
        summaryTotal: (page: Page) => page.getByTestId('basket-summary__total'),

        // VERIFIED — confirmed live (staging, 2026-07-22): incrementing
        // correctly recalculates basket-summary__total (e.g. 35,50 € ->
        // 71,00 € going qty 1 -> 2), and the minus button correctly
        // disables at quantity 1 (confirmed: clicking it while disabled
        // times out rather than silently doing nothing).
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
        quantityMinusButton: (page: Page) => page.getByTestId('quantity-picker__minus-button'),
        quantityPlusButton: (page: Page) => page.getByTestId('quantity-picker__plus-button'),

        // VERIFIED — confirmed live: "Add a promotional code?" is a toggle
        // that reveals an input; the SAME testid is reused for both the
        // initial toggle button and the "Apply" submit button once
        // expanded (confirmed: clicking it a second time submits rather
        // than re-toggling). An invalid code shows an inline error with no
        // testid of its own — last-resort text anchor scoped to the promo
        // form container (same precedent as WhereToBuy.modalHeading
        // elsewhere in this file), and the input gets an error-state
        // border (border-brand-danger class) confirmed but not asserted
        // on here since the text message is the more meaningful signal.
        promoCodeToggleButton: (page: Page) => page.getByTestId('add-promotion-form__button'),
        promoCodeInput: (page: Page) => page.getByTestId('add-promotion-form__input'),
        promoCodeError: (page: Page) => page.getByTestId('add-promotion-form').getByText('This is not a valid promo code.')
    },

    CheckoutPage: {
        // VERIFIED — GUEST flow only. A logged-in user skips this step
        // entirely and lands straight on /checkout/delivery (see
        // loggedIn* locators below instead).
        signInRadioExistingCustomer: (page: Page) => page.getByTestId('radio-select_option-Existing customer'),
        signInRadioGuestCheckout: (page: Page) => page.getByTestId('radio-select_option-Guest checkout'),
        guestEmailInput: (page: Page) => page.getByTestId('guest-checkout-form__email-input'),
        guestContinueButton: (page: Page) => page.getByTestId('guest-checkout-form__submit-button'),

        // VERIFIED — a SEPARATE, previously undocumented state of the
        // same /checkout/sign-in step: when already logged in, instead of
        // the guest/existing-customer radio choice above, this page shows
        // a "You're signed in as <name> — Continue / Sign out"
        // confirmation instead. Confirmed clicking Continue proceeds to
        // /checkout/delivery. Not always hit in every session — depends
        // on which basket "go to checkout" entry point is used (see
        // BasketPage note below on the two different checkout buttons on
        // this project).
        loggedInContinueButton: (page: Page) => page.getByTestId('checkout-sign-in-content__continue'),

        // VERIFIED — GUEST delivery step: a fresh address FORM to fill in.
        // Address Line 1 is confirmed as a genuine TWO-LEVEL autocomplete:
        // typing a search term (pressSequentially — see fillGuestAddressForm
        // in InsinkeratorCheckoutPage.ts for why fill() won't trigger it)
        // shows a first list of STREET-level suggestions (e.g. "Rua Augusta
        // 1100 Lisboa - 283 Addresses"); clicking one that has multiple
        // addresses expands to a SECOND list of specific numbered addresses
        // on that street; clicking one of those auto-populates City, County
        // and Postcode and enables "Use this address". Confirmed live
        // (staging, 2026-07-24) end-to-end through a real submitted order.
        addressForm: (page: Page) => page.getByTestId('checkout-address-form'),
        addressFirstName: (page: Page) => page.getByTestId('checkout-address-form__first-name'),
        addressLastName: (page: Page) => page.getByTestId('checkout-address-form__last-name'),
        addressLine1: (page: Page) => page.getByTestId('checkout-address-form__address-line-1'),
        addressLine2: (page: Page) => page.getByTestId('checkout-address-form__address-line-2'),
        addressCity: (page: Page) => page.getByTestId('checkout-address-form__city'),
        addressCounty: (page: Page) => page.getByTestId('checkout-address-form__county'),
        addressPostcode: (page: Page) => page.getByTestId('checkout-address-form__postcode'),
        addressCountry: (page: Page) => page.getByTestId('checkout-address-form__country'),
        addressSubmitButton: (page: Page) => page.getByTestId('checkout-address-form__submit-button'),
        // VERIFIED — the autocomplete result list described above. No
        // data-testid on the listbox or its options — last-resort ARIA
        // role locators (same precedent as elsewhere in this file), matched
        // by POSITION (.first()) rather than by text, since option text is
        // entirely dynamic (varies with whatever search term was typed and
        // real address-lookup data). The listbox's accessible name
        // ("address list") comes from its own aria-label, not visible text.
        addressAutocompleteListbox: (page: Page) => page.getByRole('listbox', { name: 'address list' }),
        addressAutocompleteOptions: (page: Page) => page.getByRole('option'),

        // VERIFIED — LOGGED-IN delivery step: select from SAVED addresses
        // instead of filling a form. This is the shape the abstract
        // CheckoutPage.chooseDeliveryAddress(addressNumber?) was actually
        // written for — use these for a logged-in test account, and the
        // guest* form fields above for a guest one.
        loggedInAddressOptions: (page: Page) => page.locator('[data-testid="checkout-select-address__addresses"] [data-testid^="radio-select_option"]'),
        loggedInAddNewAddressButton: (page: Page) => page.getByTestId('checkout-select-address__add-new-address-button'),
        loggedInAddressContinueButton: (page: Page) => page.getByTestId('checkout-select-address__continue-button'),

        // VERIFIED — the delivery-METHOD step, reached after confirming an
        // address (logged-in flow). Requires a phone number before delivery
        // methods can be selected.
        // NOTE: per team knowledge, only UK-format phone numbers currently
        // validate/work here (e.g. "07911123456") — this is a known,
        // temporary limitation, not a bug to chase. Use a UK-format number
        // in tests regardless of the delivery country until this changes.
        deliveryPhoneInput: (page: Page) => page.getByTestId('delivery-content__form-telephone'),
        // VERIFIED WORKING — once French shipping methods were configured
        // on staging, this populated with a real option ("Wizzair air
        // transport", €10.00) and the flow progressed correctly through to
        // billing and review.
        deliveryMethodRadioGroup: (page: Page) => page.getByTestId('delivery-content__radio-select'),
        deliveryNotesInput: (page: Page) => page.getByTestId('delivery-content__form-delivery-notes'),
        deliveryContinueButton: (page: Page) => page.getByTestId('delivery-content__form-continue-button'),

        // VERIFIED — billing step (/checkout/billing). CONFIRMED to differ
        // by auth state (corrects an earlier wrong assumption that the
        // checkbox only appeared on a returning session):
        //   - GUEST (confirmed live end-to-end, staging, 2026-07-24): shows
        //     a "Same as delivery address" CHECKBOX. Ticking it renders a
        //     read-only confirmation of the delivery address plus a
        //     Continue button — see confirmGuestBillingSameAsDelivery() in
        //     InsinkeratorCheckoutPage.ts.
        //   - LOGGED-IN (confirmed working in logged-in-purchase-journey.
        //     test.ts): shows the SAME checkout-select-address
        //     radio-selection UI as the delivery step instead, no checkbox
        //     — see chooseBillingAddressSameAsDelivery().
        billingSameAsDeliveryCheckbox: (page: Page) => page.getByTestId('checkout-address-form__same-as-delivery-address'),
        billingContinueButton: (page: Page) => page.getByTestId('checkout-billing-content__continue-button'),
        // VERIFIED — the logged-in flow's controls: same structure as the
        // delivery step's address selection.
        billingAddressOptions: (page: Page) => page.locator('[data-testid="checkout-select-address__addresses"] [data-testid^="radio-select_option"]'),
        billingAddressContinueButton: (page: Page) => page.getByTestId('checkout-select-address__continue-button'),

        // VERIFIED — reached /checkout/review-and-payment. Order summary,
        // line items, and shipping cost all render correctly.
        reviewContent: (page: Page) => page.getByTestId('review-content'),
        reviewCurrentAddress: (page: Page) => page.getByTestId('review-current-address'),
        // CORRECTED (staging, 2026-07-24): a payment provider is now
        // configured — this alert ("Payment provider not valid for this
        // order") and placeOrderButton below are OBSOLETE, kept only as a
        // historical record of the earlier blocker. Real payment now goes
        // through the CyberSource Unified Checkout widget below instead.
        reviewPaymentProviderErrorAlert: (page: Page) => page.getByTestId('review-content__alert'),
        placeOrderButton: (page: Page) => page.getByTestId('TODO-place-order-button'),

        // VERIFIED — CyberSource Unified Checkout (staging, 2026-07-24),
        // confirmed end-to-end with a real submitted order using the
        // standard CyberSource test card (4111 1111 1111 1111). Three
        // CyberSource iframes are involved, none with a data-testid, but
        // each has a STABLE id (confirmed identical across two independent
        // sessions) — these ids are the most reliable anchor available:
        //   #__buttonlist - hosts the initial "Checkout With Card" trigger
        //   #__mce        - the actual secure card-entry + confirm overlay;
        //                   BOTH step 1 ("Pay by Card") and step 2
        //                   ("Confirm") render inside this SAME iframe
        // Card Number and Security Code have no testid either but DO have
        // stable ids (#card-number, #card-security-code). Expiry Month/Year
        // and both buttons DO have real testids once inside the #__mce
        // frame.
        checkoutWithCardButton: (page: Page) => page.locator('#__buttonlist').contentFrame().getByTestId('ctp-mini-btn'),
        cyberSourceCardNumberInput: (page: Page) => page.locator('#__mce').contentFrame().locator('#card-number'),
        cyberSourceExpiryMonthSelect: (page: Page) => page.locator('#__mce').contentFrame().getByTestId('expiry-month'),
        cyberSourceExpiryYearSelect: (page: Page) => page.locator('#__mce').contentFrame().getByTestId('expiry-year'),
        cyberSourceSecurityCodeInput: (page: Page) => page.locator('#__mce').contentFrame().locator('#card-security-code'),
        cyberSourceCardContinueButton: (page: Page) => page.locator('#__mce').contentFrame().getByTestId('btn'),
        cyberSourceConfirmAndContinueButton: (page: Page) => page.locator('#__mce').contentFrame().getByTestId('step-review-continue-btn'),

        // Kept for interface compatibility with the abstract CheckoutPage
        // contract's chooseDeliveryOption/chooseDeliveryDateAndOptions
        // method shapes. UNVERIFIED against a real multi-option delivery
        // method list (only ever saw a single "Wizzair air transport"
        // option — never confirmed a Click & Collect equivalent exists on
        // this project).
        deliveryOptionsDiv: (page: Page) => page.getByTestId('TODO-delivery-options'),
        deliveryOptionsSlotsDiv: (page: Page) => page.getByTestId('TODO-delivery-options-slots'),
        payOnAccountButton: (page: Page) => page.getByTestId('TODO-pay-on-account-button'),
        proceedButton: (page: Page) => page.getByTestId('TODO-proceed-button')
    },

    // VERIFIED — confirmed live (staging, 2026-07-24) via TWO independent
    // real completed orders in clean automated runs, each showing a
    // correctly rendered confirmation (order number, receipt email,
    // delivery address, delivery method, order lines). An earlier manual
    // exploration session saw this page return an HTTP 500 "Oops!
    // Something Went Wrong" error twice in a row — that did NOT reproduce
    // across the 2 clean automated runs immediately afterward (each with a
    // real, different order), strongly suggesting it was a manual-session
    // artifact (same category as other false alarms documented elsewhere
    // in this project, e.g. the /account redirect false alarm) rather than
    // a real, permanent bug. errorHeading is kept in case it resurfaces.
    CheckoutSuccessPage: {
        thankYouContent: (page: Page) => page.getByTestId('checkout-thank-you-content'),
        thankYouHeader: (page: Page) => page.locator('[data-testid="checkout-thank-you-content"] h1'),
        orderReference: (page: Page) => page.getByTestId('orders-details__reference'),
        orderConfirmationEmail: (page: Page) => page.getByTestId('orders-details__email'),
        orderDeliveryAddress: (page: Page) => page.getByTestId('checkout-current-address__address'),
        // NOTE: this testid is on BOTH the section's outer DIV and the
        // inner value <P> — .last() reaches the actual value ("Wizzair air
        // transport"), same duplicate-testid pattern already documented on
        // BasketPage.lineName elsewhere in this file.
        orderDeliveryMethod: (page: Page) => page.getByTestId('orders-details__order-delivery-method').last(),
        orderLinesList: (page: Page) => page.getByTestId('orders-details__order-lines-list'),
        errorHeading: (page: Page) => page.getByRole('heading', { name: 'Oops! Something Went Wrong' })
    }
};
