import { Page } from '@playwright/test';

export const RussellsObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        menuNavBarButton: (page: Page) => page.getByTestId('navigation-drawer-sheet__menu-button'),
        menuLinkFiltered: (category: string) => (page: Page) =>
            page.locator('[data-testid^="navigation-drawer-sheet__link"]').filter({ hasText: category }),
        // VERIFIED live (staging, 2026-07-31): a "hub" category page (e.g.
        // /general-parts-parts) links to its real, filterable sub-category
        // PLPs (/category/<slug>) via a stable href — no testid on these
        // tiles, but href is preferred over text per this project's
        // locator convention.
        subCategoryTileLink: (categorySlug: string) => (page: Page) =>
            page.locator(`a[href="/category/${categorySlug}"]`)
    },

    Footer: {
        newsletterForm: (page: Page) => page.getByTestId('newsletter-form'),
        newsletterTitle: (page: Page) => page.getByTestId('newsletter-form__title'),
        newsletterEmailInput: (page: Page) => page.getByTestId('newsletter-form__input'),
        newsletterSubmitButton: (page: Page) => page.getByTestId('newsletter-form__submit-button'),
        // VERIFIED live (staging, 2026-07-31): native <input type="email" required>,
        // no custom client-side validation UI. A well-formed submission shows
        // "Success — Thank you for subscribing to our newsletter." through this
        // same alert testid.
        newsletterAlert: (page: Page) => page.getByTestId('newsletter-form__alert'),
        sitemapLink: (page: Page) => page.getByTestId('stripped-footer__sitemap-link'),
        // NOT VERIFIED: the cookie-consent banner never actually triggered
        // during exploration (staging, 2026-07-31), matching the known
        // intermittent behaviour of this storefront's banner. Assumed same
        // OneTrust vendor/id as Insinkerator (another Velstar-built P3
        // storefront) since no real banner was observed to confirm against.
        // Safe either way — clickSitemapLink() only waits up to 5s and
        // no-ops if this never matches.
        cookieBannerAcceptButton: (page: Page) => page.locator('#onetrust-accept-btn-handler')
    },

    // VERIFIED live (staging, 2026-07-31) — /sitemap has 8 real tab
    // categories: products, categories, content, articles, article
    // categories, locations, article images, product images (more than
    // Insinkerator's 5 — content is per-storefront, not shared). Tab links
    // have stable hrefs (/sitemap/<slug>); per-category item links have
    // entirely dynamic hrefs with no testid/id of their own.
    SitemapPage: {
        wrapper: (page: Page) => page.getByTestId('sitemaps'),
        heading: (page: Page) => page.locator('[data-testid="sitemaps"] h1'),
        // categorySlug matches the tab's href exactly, e.g. 'products',
        // 'article_categories', 'product_images'.
        categoryTabLink: (categorySlug: string) => (page: Page) =>
            page.locator(`[data-testid="sitemaps"] a[href="/sitemap/${categorySlug}"]`),
        categoryItemLinks: (page: Page) => page.locator('[data-testid="sitemaps"] a:not([href^="/sitemap/"]):visible')
    },

    LoginPage: {
        loginHeader: (page: Page) => page.locator('[data-testid="login-form"] h1'),
        emailInput: (page: Page) => page.getByTestId('login-form__email-input'),
        passwordInput: (page: Page) => page.getByTestId('login-form__password-input'),
        signInButton: (page: Page) => page.getByTestId('login-form__submit-button'),
        // VERIFIED live (staging, 2026-07-31): a wrong password for a real
        // account shows "ErrorInvalid credentials." here, staying on /login.
        alertMessage: (page: Page) => page.getByTestId('login-form__alert'),
        forgotPasswordLink: (page: Page) => page.getByTestId('login-form__forgot-password-link'),
        // VERIFIED — unlike Insinkerator, there is no persistent header/
        // utility-bar login indicator on this storefront (brand-bar__account-link
        // always reads "MyAccount" regardless of session state). The
        // logged-in signal instead lives on the /account dashboard sidebar,
        // only present once /account resolves without redirecting to /login.
        welcomeMessage: (page: Page) => page.getByTestId('account-menu__welcome'),
        signOutLink: (page: Page) => page.getByTestId('account-menu__logout')
    },

    // VERIFIED live (staging, 2026-07-31), reached via LoginPage.forgotPasswordLink.
    ResetPasswordPage: {
        emailInput: (page: Page) => page.getByTestId('reset-password-form__email-input'),
        submitButton: (page: Page) => page.getByTestId('reset-password-form__submit-button'),
        successMessage: (page: Page) => page.getByTestId('reset-password-form__success')
    },

    AccountPage: {
        // VERIFIED live (staging, 2026-07-31): all four sidebar links share
        // the same testid ("account-menu__item") and carry their own href
        // directly, matching Insinkerator's convention exactly.
        dashboardMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account"]'),
        profileMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/profile"]'),
        addressBookMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/address-book"]'),
        ordersMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/orders"]'),

        myDetailsForm: (page: Page) => page.getByTestId('account__my-details-form'),
        // TODO: RUS-474 — no data-testid on this button (confirmed live,
        // 2026-07-31); last-resort text locator, scoped to the stable
        // my-details-form container.
        resetPasswordToggleButton: (page: Page) =>
            page.locator('[data-testid="account__my-details-form"] button').filter({ hasText: 'Reset Password' }),
        changePasswordForm: (page: Page) => page.getByTestId('account__change-password-form'),
        existingPasswordInput: (page: Page) => page.getByTestId('account-profile__existing-password-input'),
        newPasswordInput: (page: Page) => page.getByTestId('account-profile__new-password-input'),
        repeatNewPasswordInput: (page: Page) => page.getByTestId('account-profile__repeat-new-password-input'),
        // TODO: RUS-474 — no data-testid (confirmed live, 2026-07-31); the
        // change-password form renders two "Save Changes" buttons (header +
        // footer variant, same layout as the my-details form) — .first() is
        // enough since either submits the same form.
        changePasswordSaveButton: (page: Page) =>
            page.locator('[data-testid="account__change-password-form"] button').filter({ hasText: 'Save Changes' }).first(),
        // VERIFIED live (staging, 2026-07-31): a real change (then reverted)
        // showed "Password successfully updated" through this testid.
        changePasswordAlert: (page: Page) => page.getByTestId('account-profile__alert'),

        // VERIFIED live (staging, 2026-07-31) on /account/orders — matches
        // Insinkerator's convention almost exactly.
        ordersPageHeading: (page: Page) => page.getByTestId('account-orders__title'),
        ordersContent: (page: Page) => page.getByTestId('account-orders__content'),
        ordersHeaderRow: (page: Page) => page.getByTestId('account-orders-header-row'),
        ordersReferenceFilterInput: (page: Page) => page.getByTestId('account-orders-reference-filter'),
        ordersTotalAmountFilterInput: (page: Page) => page.getByTestId('account-orders-total-amount-filter'),
        ordersFilterResetButton: (page: Page) => page.getByTestId('account-orders-filter-reset'),
        ordersRow: (index: number) => (page: Page) => page.getByTestId(`account-orders-row-${index}`),
        ordersRowReferenceCell: (index: number) => (page: Page) => page.getByTestId(`account-orders-row-${index}-cell-reference`),
        ordersRowAmountCell: (index: number) => (page: Page) => page.getByTestId(`account-orders-row-${index}-cell-totalIncTaxAfterDiscount`),

        // VERIFIED live (staging, 2026-07-31) on /account/address-book — a
        // fixture delivery + billing address now exists permanently on
        // accountTestUser_1 (added deliberately so the checkout flow always
        // has a saved address to select), so "Add new address" is always
        // present rather than the blank form. Rows are numbered
        // POSITIONALLY (address-1, address-2, ...), not by a persistent id.
        addDeliveryAddressButton: (page: Page) => page.getByTestId('address-book-delivery__add-address-button'),
        deliveryAddressNames: (page: Page) => page.locator('[data-testid^="address-book-delivery__address-"][data-testid$="__name"]'),
        // CONFIRMED live: delivery and billing forms share the exact same
        // "checkout-address-form" testid with no distinguishing wrapper —
        // delivery always renders first in DOM order (confirmed by adding
        // both), same accepted DOM-order convention used elsewhere in this
        // project (e.g. ProductListPage.productCardLink).
        deliveryAddressForm: (page: Page) => page.locator('[data-testid="checkout-address-form"]').first(),
        deliveryAddressFirstNameInput: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__first-name'),
        deliveryAddressLastNameInput: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__last-name'),
        deliveryAddressLine1Input: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__address-line-1'),
        deliveryAddressCityInput: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__city'),
        deliveryAddressPostcodeInput: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).getByTestId('checkout-address-form__postcode'),
        // TODO: RUS-474 — no data-testid on the "Save Address" submit
        // button (confirmed live, 2026-07-31); type="submit" is the one
        // stable, non-text attribute distinguishing it from the adjacent
        // country-picker button within the same form (same precedent
        // Insinkerator uses for the identical gap).
        deliveryAddressSaveButton: (page: Page) => RussellsObjects.AccountPage.deliveryAddressForm(page).locator('button[type="submit"]'),
        deliveryAddressName: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__name`),
        deliveryAddressEditButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__edit-address-button`),
        deliveryAddressDeleteButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__delete-address-button`),
        // VERIFIED live (staging, 2026-07-31): clicking Delete opens a
        // confirm/cancel prompt, itself scoped with the same
        // per-address-number testid prefix.
        deliveryAddressDeleteConfirmYesButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${addressNumber}__delete-address-yes-button`),

        addBillingAddressButton: (page: Page) => page.getByTestId('address-book-billing__add-address-button'),
        billingAddressNames: (page: Page) => page.locator('[data-testid^="address-book-billing__address-"][data-testid$="__name"]'),
        // Delivery confirmed to always render first — billing is .last(),
        // safe even when only one form is open (then both .first()/.last()
        // resolve to the same single form).
        billingAddressForm: (page: Page) => page.locator('[data-testid="checkout-address-form"]').last(),
        billingAddressFirstNameInput: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).getByTestId('checkout-address-form__first-name'),
        billingAddressLastNameInput: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).getByTestId('checkout-address-form__last-name'),
        billingAddressLine1Input: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).getByTestId('checkout-address-form__address-line-1'),
        billingAddressCityInput: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).getByTestId('checkout-address-form__city'),
        billingAddressPostcodeInput: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).getByTestId('checkout-address-form__postcode'),
        billingAddressSaveButton: (page: Page) => RussellsObjects.AccountPage.billingAddressForm(page).locator('button[type="submit"]'),
        billingAddressName: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${addressNumber}__name`),
        billingAddressEditButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${addressNumber}__edit-address-button`),
        billingAddressDeleteButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${addressNumber}__delete-address-button`),
        billingAddressDeleteConfirmYesButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${addressNumber}__delete-address-yes-button`)
    },

    // VERIFIED live (staging, 2026-07-31).
    BasketPage: {
        // CONFIRMED SITE BUG (staging, 2026-07-31): a "Continue shopping"
        // link elsewhere in basket-summary reuses this SAME testid
        // ("basket-summary__checkout-button"). href isn't a safe
        // disambiguator either — it points to /checkout/sign-in for a
        // guest but straight to /checkout/delivery-method once logged in.
        // TODO: RUS-474 — last-resort text filter, forced by the testid
        // collision bug above (both candidates otherwise carry the exact
        // same testid and a login-state-dependent href).
        checkoutButton: (page: Page) => page.getByTestId('basket-summary__checkout-button').filter({ hasText: 'Checkout' }),
        lineName: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__name`),
        lineSku: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__sku`),
        // VERIFIED live (staging, 2026-08-01): read this immediately before
        // checking out, not from the PDP — prices on this staging
        // environment have been observed to change mid-session (likely a
        // live backend sync job), so a price captured on the PDP can
        // already be stale by the time the order confirms. Reading it here
        // instead, seconds before payment, narrows that window.
        linePrice: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__price-price`),
        lineTotalPrice: (lineIndex: number) => (page: Page) => page.getByTestId(`basket-items__available-line-${lineIndex}__total-price`),
        // VERIFIED live (staging, 2026-08-01): the basket is tied to the
        // account server-side, not the browser session — leftover items
        // from an earlier interrupted session/manual exploration on this
        // SAME shared test account silently persist into the next test's
        // basket. Lines re-index positionally after each removal, so
        // repeatedly removing "line-0" clears the whole basket regardless
        // of how many lines existed.
        firstLineRemoveButton: (page: Page) => page.getByTestId('basket-items__available-line-0__remove-button'),
        anyLine: (page: Page) => page.getByTestId('basket-items__available-line-0'),
        summaryTotal: (page: Page) => page.getByTestId('basket-summary__total'),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
        quantityMinusButton: (page: Page) => page.getByTestId('quantity-picker__minus-button'),
        quantityPlusButton: (page: Page) => page.getByTestId('quantity-picker__plus-button'),
        // VERIFIED live: "Add a promotional code?" toggles to reveal an
        // input, and the SAME testid is reused for the toggle AND the
        // "Apply" submit button once expanded — same convention Insinkerator
        // uses for the identical widget.
        promoCodeToggleButton: (page: Page) => page.getByTestId('add-promotion-form__button'),
        promoCodeInput: (page: Page) => page.getByTestId('add-promotion-form__input'),
        // No testid on the error message itself — scoped to the stable
        // add-promotion-form container, asserted via toContainText rather
        // than used as a locate-and-click target.
        promoCodeForm: (page: Page) => page.getByTestId('add-promotion-form')
    },

    // VERIFIED live (staging, 2026-07-31) end-to-end through a real
    // completed order (Global Payments hosted fields).
    CheckoutPage: {
        // VERIFIED live: reaching /checkout/sign-in while already logged in
        // (depends on which basket entry point was used) shows a "You're
        // signed in as <email> — Continue" confirmation instead of the
        // guest/existing-customer choice — same convention as Insinkerator.
        loggedInSignInContinueButton: (page: Page) => page.getByTestId('checkout-sign-in-content__continue'),
        // VERIFIED live (staging, 2026-08-01) — GUEST flow only, matches
        // Insinkerator's convention.
        guestCheckoutRadio: (page: Page) => page.getByTestId('radio-select_option-Guest checkout'),
        guestEmailInput: (page: Page) => page.getByTestId('guest-checkout-form__email-input'),
        guestSubmitButton: (page: Page) => page.getByTestId('guest-checkout-form__submit-button'),
        // VERIFIED live (staging, 2026-08-01) — GUEST delivery step: a
        // plain, blank checkout-address-form (same shared component used by
        // account/address-book) with NO autocomplete — unlike Insinkerator,
        // there's no Loqate-style address lookup here, just first
        // name/last name/address line 1/city/postcode.
        guestAddressFirstName: (page: Page) => page.getByTestId('checkout-address-form__first-name'),
        guestAddressLastName: (page: Page) => page.getByTestId('checkout-address-form__last-name'),
        guestAddressLine1: (page: Page) => page.getByTestId('checkout-address-form__address-line-1'),
        guestAddressCity: (page: Page) => page.getByTestId('checkout-address-form__city'),
        guestAddressPostcode: (page: Page) => page.getByTestId('checkout-address-form__postcode'),
        guestAddressSubmitButton: (page: Page) => page.getByTestId('checkout-address-form__submit-button'),
        loggedInAddressOptions: (page: Page) => page.locator('[data-testid="checkout-select-address__addresses"] [data-testid^="radio-select_option"]'),
        loggedInAddressContinueButton: (page: Page) => page.getByTestId('checkout-select-address__continue-button'),
        deliveryMethodRadioGroup: (page: Page) => page.locator('[data-testid^="radio-select_option-"]'),
        deliveryMethodContinueButton: (page: Page) => page.getByTestId('delivery-methods__continue-button'),
        deliveryPhoneInput: (page: Page) => page.getByTestId('delivery-content__form-telephone'),
        deliveryContinueButton: (page: Page) => page.getByTestId('delivery-content__form-continue-button'),
        // VERIFIED live: on the billing step, this checkbox is present for
        // BOTH guest and logged-in checkout on this storefront (unlike
        // Insinkerator, where logged-in shows a separate address-selection
        // radio UI instead) — ticking it collapses the form to a read-only
        // confirmation.
        billingSameAsDeliveryCheckbox: (page: Page) => page.getByTestId('checkout-address-form__same-as-delivery-address'),
        billingContinueButton: (page: Page) => page.getByTestId('checkout-billing-content__continue-button'),
        // VERIFIED live (staging, 2026-08-01) — Click & Collect's
        // /checkout/click-and-collect step renders TWICE, same pattern as
        // /checkout/delivery: first a depot-selection list (the depot
        // chosen on the PDP's Collection picker is pre-selected and
        // labelled "Your Selected Depot"), then phone + continue.
        collectionDepotOptions: (page: Page) => page.locator('[data-testid="collection-content-location__radio-select"] [data-testid^="radio-select_option"]'),
        collectionDepotContinueButton: (page: Page) => page.getByTestId('collection-content-location__continue-button'),
        collectionPhoneInput: (page: Page) => page.getByTestId('collection-content__form-telephone'),
        collectionServiceContinueButton: (page: Page) => page.getByTestId('collection-content-service__continue-button'),
        reviewContent: (page: Page) => page.getByTestId('checkout-review-content'),
        // VERIFIED live (staging, 2026-08-01) — only present for Delivery
        // orders (Click & Collect has no shipping cost, this testid is
        // simply absent).
        reviewShippingCost: (page: Page) => page.getByTestId('checkout-summary__shipping-cost'),
        reviewTermsAndConditionsCheckbox: (page: Page) => page.getByTestId('review-content__terms-and-conditions'),
        reviewContinueToPaymentButton: (page: Page) => page.getByTestId('review-content__continue-to-payment-account'),
        payWithCardButton: (page: Page) => page.getByTestId('payment-method-selector__pay-with-card'),
        // VERIFIED live — Global Payments hosted-field iframes, each with a
        // stable `name` attribute (more reliable than the id, which embeds
        // a per-session random token) — preferred over the class-based
        // parent-container selector per this project's locator convention.
        globalPaymentsCardNumberFrame: (page: Page) => page.frameLocator('iframe[name="card-number"]'),
        globalPaymentsCardExpirationFrame: (page: Page) => page.frameLocator('iframe[name="card-expiration"]'),
        globalPaymentsCardCvvFrame: (page: Page) => page.frameLocator('iframe[name="card-cvv"]'),
        globalPaymentsCardHolderNameFrame: (page: Page) => page.frameLocator('iframe[name="card-holder-name"]'),
        globalPaymentsSubmitFrame: (page: Page) => page.frameLocator('iframe[name="submit"]')
    },

    // VERIFIED live (staging, 2026-07-31) through a real completed order.
    // The account order-detail page reuses the exact same
    // "orders-details__*" testids as the checkout thank-you page.
    CheckoutSuccessPage: {
        orderReference: (page: Page) => page.getByTestId('orders-details__reference'),
        orderConfirmationEmail: (page: Page) => page.getByTestId('orders-details__email'),
        // VERIFIED live (staging, 2026-08-01) — one order-product-card per
        // basket line, in the same order they were added.
        orderLines: (page: Page) => page.getByTestId('order-product-card'),
        orderLineName: (lineIndex: number) => (page: Page) => RussellsObjects.CheckoutSuccessPage.orderLines(page).nth(lineIndex).getByTestId('order-product-card__name'),
        orderLineSku: (lineIndex: number) => (page: Page) => RussellsObjects.CheckoutSuccessPage.orderLines(page).nth(lineIndex).getByTestId('order-product-card__sku'),
        orderLineQuantity: (lineIndex: number) => (page: Page) => RussellsObjects.CheckoutSuccessPage.orderLines(page).nth(lineIndex).getByTestId('order-product-card__quantity-quantity'),
        orderLinePrice: (lineIndex: number) => (page: Page) => RussellsObjects.CheckoutSuccessPage.orderLines(page).nth(lineIndex).getByTestId('order-product-card__price-price'),
        orderLineTotalPrice: (lineIndex: number) => (page: Page) => RussellsObjects.CheckoutSuccessPage.orderLines(page).nth(lineIndex).getByTestId('order-product-card__total-price-price'),
        // CONFIRMED SITE BUG (staging, 2026-08-01): this testid is reused on
        // BOTH the section's wrapping <div> (containing the "Delivery
        // Method" heading plus the value) AND the inner <p> holding just
        // the value ("DPD" / "Click & Collect") — a real testid collision.
        // Scoping to the <p> tag specifically resolves to the value alone.
        deliveryMethod: (page: Page) => page.locator('p[data-testid="orders-details__order-delivery-method"]'),
        // VERIFIED live: reads "Delivery Address..." or
        // "Collection From..." followed by name/address lines/phone, all
        // inside this one element — asserted via toContainText for each
        // expected fragment rather than an exact match.
        deliveryAddress: (page: Page) => page.getByTestId('orders-details__order-delivery-address'),
        orderSummarySubtotal: (page: Page) => page.getByTestId('orders-details__order-summary__subtotal'),
        // VERIFIED live: absent entirely for Click & Collect orders (no
        // shipping cost) — only present for Delivery orders.
        orderSummaryShippingTotal: (page: Page) => page.getByTestId('orders-details__order-summary__shipping-total'),
        orderSummaryTotal: (page: Page) => page.getByTestId('orders-details__order-summary__total'),
        orderPaymentDetails: (page: Page) => page.getByTestId('orders-details__order-payment-details')
    },

    // VERIFIED live (staging, 2026-07-31) on /category/general-parts-pto-driveline-components.
    // Same Algolia-backed convention on both category leaf pages and
    // /search — no separate SearchResultsPage locator group needed.
    ProductListPage: {
        hitsHeading: (page: Page) => page.getByTestId('algolia-hits-heading'),
        hitCount: (page: Page) => page.getByTestId('algolia-hit-count'),
        productCardName: (page: Page) => page.getByTestId('product-card__name'),
        productCardNameFiltered: (productName: string) => (page: Page) =>
            page.getByTestId('product-card__name').filter({ hasText: productName }),
        // CONFIRMED live (staging, 2026-07-31): each product-card renders
        // TWO separate "product-card__link" anchors (one wrapping the
        // image, one wrapping the name) — both real and visible, same
        // href. Scoping to the one containing the image picks exactly one
        // per card.
        productCardLink: (page: Page) => page.locator('[data-testid="product-card__link"]:has([data-testid="product-card__image"])'),
        productCardPrice: (page: Page) => page.getByTestId('product-card__now-price'),
        filterAndSortOpenButton: (page: Page) => page.getByTestId('algolia-facet-drawer__open-button'),
        // VERIFIED — facet checkboxes are numbered PER refinement group
        // (checkbox-0, checkbox-1, ... restarting at 0 for each group), same
        // convention as Insinkerator. A hidden mobile/desktop duplicate of
        // the whole drawer also exists — :visible resolves to the real copy.
        facetCheckboxes: (page: Page) => page.locator('[data-testid^="algolia-refinement-list__checkbox-"]:visible'),
        // VERIFIED — sort radiogroup order confirmed live: Relevance, Price
        // Low to High, Price High to Low (by DOM order / value attribute,
        // not visible label text).
        sortByOptions: (page: Page) => page.getByTestId('algolia-sort-by').locator('visible=true').getByRole('radio'),
        loadMoreButton: (page: Page) => page.getByTestId('algolia-infinite-pagination__load-more'),
        currentItemsCount: (page: Page) => page.getByTestId('algolia-infinite-pagination__current-items'),
        totalItemsCount: (page: Page) => page.getByTestId('algolia-infinite-pagination__total-items')
    },

    // VERIFIED live (staging, 2026-07-31) on a simple (non-bundle) product
    // PDP. Accordion/FAQ/comparison-table/configurator locators are
    // deliberately not included yet — out of scope until a configurable
    // Russells product is confirmed, see RUS-474.
    ProductDetailPage: {
        // CONFIRMED live (staging, 2026-07-31): a hidden mobile/desktop
        // duplicate exists on every one of these — :visible/.first()
        // resolves to the real, visible copy.
        productName: (page: Page) => page.getByTestId('product-info__name').first(),
        productSku: (page: Page) => page.locator('[data-testid="product-info__sku"]:visible'),
        productPrice: (page: Page) => page.locator('[data-testid="product-price__now-price"]:visible'),
        addToBasketButton: (page: Page) => page.getByTestId('product-add-to-basket__button').first(),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input').first(),
        basketLinkText: (page: Page) => page.getByTestId('brand-bar__basket-link'),
        // VERIFIED live (staging, 2026-07-31): the number of accordion
        // sections is content-dependent per product (e.g. some products
        // have no "Product Description" section, and whether any section
        // starts expanded also varies) — the single-open toggle behaviour
        // itself (opening one collapses whichever other was open) is the
        // stable, product-independent thing to assert.
        accordionTriggers: (page: Page) => page.locator('[data-testid="product-accordion__trigger"]:visible'),
        thumbnailNextButton: (page: Page) => page.locator('[data-testid="product-media__thumbnail-next-button"]:visible'),
        thumbnailPrevButton: (page: Page) => page.locator('[data-testid="product-media__thumbnail-previous-button"]:visible'),

        // VERIFIED live (staging, 2026-07-31): the "Collection" depot-picker
        // feature. NONE of it carries a data-testid anywhere — every locator
        // below is a last-resort text/role anchor. TODO: RUS-474.
        // Reads "Set your local depot" before a depot is chosen, "Change"
        // once one is — same aria-haspopup="dialog" button either way, and
        // a hidden mobile/desktop duplicate exists (same pattern as
        // elsewhere on this site) — .first() resolves to the visible copy.
        collectionChangeButton: (page: Page) =>
            page.locator('[aria-haspopup="dialog"]').filter({ hasText: /Set your local depot|Change/ }).first(),
        // VERIFIED — the slide-in panel opened by collectionChangeButton.
        // Scoped by role + its own stable heading text (not the dynamic
        // radix dialog id, which changes per page load) — distinguishes it
        // from the two unrelated image-zoom modals also present on this page.
        collectionDialog: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Collection Information' }),
        // Stable id, unlike everything else in this dialog.
        depotSearchInput: (page: Page) => RussellsObjects.ProductDetailPage.collectionDialog(page).locator('#branch-input'),
        // The only <button> in the dialog before any results render.
        depotSearchButton: (page: Page) => RussellsObjects.ProductDetailPage.collectionDialog(page).locator('button').first(),
        depotResultCards: (page: Page) => RussellsObjects.ProductDetailPage.collectionDialog(page).getByRole('button', { name: 'Select Depot' }),
        collectionDialogCloseButton: (page: Page) => RussellsObjects.ProductDetailPage.collectionDialog(page).getByRole('button', { name: 'Close' })
    },

    // VERIFIED live (staging, 2026-08-02) — the standalone /depot-finder
    // store locator (distinct from the PDP's Collection picker above,
    // which is a different component with its own separate search).
    DepotFinderPage: {
        heading: (page: Page) => page.locator('[data-testid="branch-finder"] h1'),
        // TODO: RUS-474 — no data-testid/id on this input, only a
        // placeholder (confirmed live, 2026-08-02).
        searchInput: (page: Page) => page.getByPlaceholder('Search by postcode, town or city'),
        // TODO: RUS-474 — no testid on either button; a "clear" (X) button
        // only appears once text is entered, so the SEARCH button is
        // always the LAST button in the container, never the first —
        // confirmed live (staging, 2026-08-02) after an earlier attempt
        // that used .first() accidentally clicked the clear button instead.
        searchButton: (page: Page) => page.getByTestId('branch-finder').locator('button').last(),
        // VERIFIED live: searching recenters/zooms the map to the
        // location, confirmed via this link's own coordinates changing —
        // the "All Depots" list below always shows all depots
        // alphabetically regardless of search (not filtered/re-sorted by
        // distance — a genuinely different behaviour from the PDP's
        // Collection picker, not a bug).
        openInGoogleMapsLink: (page: Page) => page.locator('a[href*="maps.google.com/maps?ll="]'),
        allDepotsHeading: (page: Page) => page.getByTestId('all-branches').locator('h2'),
        depotLinks: (page: Page) => page.getByTestId('branches_section__branch'),
        depotLinkFiltered: (depotName: string) => (page: Page) => page.getByTestId('branches_section__branch').filter({ hasText: depotName }),

        // VERIFIED live (staging, 2026-08-02) on /depot-finder/boroughbridge
        // — an individual depot's detail page.
        branchHeading: (page: Page) => page.getByTestId('branch__heading'),
        branchAddress: (page: Page) => page.getByTestId('branch__address'),
        branchTelephone: (page: Page) => page.getByTestId('branch__telephone'),
        branchEmail: (page: Page) => page.getByTestId('branch__email'),
        branchOpeningHours: (day: string) => (page: Page) => page.getByTestId(`branch__opening-hours--${day}`),
        // A <p>, not a link — no href, navigates via an onclick handler.
        branchBackToSearch: (page: Page) => page.getByTestId('branch__back-to-search'),
        branchGetDirectionsLink: (page: Page) => page.getByTestId('branch__get-directions')
    }
};
