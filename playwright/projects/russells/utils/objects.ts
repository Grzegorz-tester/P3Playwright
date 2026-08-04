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
            page.locator(`a[href="/category/${categorySlug}"]`),
        // VERIFIED live (staging, 2026-08-02): a global header toggle
        // (present on every page type - home, PDP, PLP, search) switching
        // all displayed prices between Incl./Excl. VAT. The visible label
        // always reads "Incl. VAT" regardless of the CURRENT state - it
        // names what the toggle does, not which state is active - so the
        // underlying checkbox's checked property (true = Incl. VAT
        // currently shown) is the only reliable state signal. The
        // preference persists across navigation (cookie/localStorage), so
        // tests must explicitly set the state they need rather than
        // assume one.
        vatToggleSwitch: (page: Page) => page.getByTestId('switch'),
        vatToggleCheckbox: (page: Page) => page.getByTestId('switch__checkbox')
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
        // VERIFIED live (2026-08-04): the vendor is CookieYes, not OneTrust
        // - the previous #onetrust-accept-btn-handler guess (ported from
        // Insinkerator's convention) never matched anything, which is why
        // it "never triggered" in earlier exploration on staging. CookieYes
        // only actually renders on the PRODUCTION domain: staging's console
        // logs a CookieYes "website URL has changed" error and the banner
        // never appears there at all, confirmed live. No testid
        // (third-party widget) - .cky-btn-accept is CookieYes' own stable
        // class.
        cookieBannerAcceptButton: (page: Page) => page.locator('.cky-btn-accept')
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
        // VERIFIED live (staging, 2026-08-02): only rendered for admin
        // accounts — accountTestUser_1 doesn't see this link at all, and
        // /account/wishlists genuinely 404s for that user even while
        // logged in (see testUsers.ts note on accountAdminUser).
        wishlistsMenuButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/wishlists"]'),

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
        billingAddressDeleteConfirmYesButton: (addressNumber: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${addressNumber}__delete-address-yes-button`),

        // /account/wishlists (admin-only — see wishlistsMenuButton note
        // above). VERIFIED live (staging, 2026-08-02). The list page is
        // notably testid-sparse (only the generic account-card wrapper),
        // unlike the detail page below which is fully covered — TODO:
        // RUS-474, ask devs for testids on the list's search input, sort
        // headers, rows and per-row delete button.
        wishlistsHeading: (page: Page) => page.getByTestId('account-card__title'),
        // TODO: RUS-474 — no testid/id on this button, scoped to the
        // account card heading (confirmed live, 2026-08-02 — it sits
        // alongside the "My Wishlists" title, NOT inside
        // account-card__content, which holds only the search/table).
        createWishlistButton: (page: Page) => page.getByTestId('account-card__heading').locator('button').filter({ hasText: 'Create a new wishlist' }),
        // The Create/Edit-name/Share/Delete-confirm dialogs are all the
        // same underlying Radix dialog primitive — only one is ever open
        // at a time. VERIFIED live (2026-08-04): on production, CookieYes'
        // own preference-center modal (id="ckyPreferenceCenter") is ALSO
        // role="dialog" and permanently present in the DOM (whether open or
        // not) — excluded by id, a stable third-party identifier, rather
        // than left as a strict-mode violation waiting to happen.
        dialog: (page: Page) => page.locator('[role="dialog"]:not(#ckyPreferenceCenter)'),
        // TODO: RUS-474 — no testid; a real, unusual-looking but STABLE id
        // (confirmed unchanged across reloads, same convention accepted
        // for the Quick Enquiry Form's fields).
        createWishlistNameInput: (page: Page) => page.locator('[id="Wishlist Name"]'),
        createWishlistSubmitButton: (page: Page) => RussellsObjects.AccountPage.dialog(page).locator('button').filter({ hasText: 'Create Wishlist' }),
        createWishlistCancelButton: (page: Page) => RussellsObjects.AccountPage.dialog(page).locator('button').filter({ hasText: 'Cancel' }),
        confirmDeletionProceedButton: (page: Page) => RussellsObjects.AccountPage.dialog(page).locator('button').filter({ hasText: 'Proceed' }),
        // TODO: RUS-474 — no id/testid on this input either, only a
        // placeholder — confirmed live it filters the list LIVE
        // (debounced, no Enter/search-button needed).
        wishlistSearchInput: (page: Page) => page.locator('input[placeholder="Wishlist Name"]'),
        wishlistNameSortButton: (page: Page) => page.locator('table thead button').filter({ hasText: 'Wishlist Name' }),
        wishlistRows: (page: Page) => page.locator('table tbody tr'),
        wishlistRowFiltered: (name: string) => (page: Page) => page.locator('table tbody tr').filter({ hasText: name }),
        // The row itself has no href (navigates via onclick, like the
        // Depot Finder's "back to search") — the per-row Delete button is
        // the sole button in the row's last cell.
        wishlistRowDeleteButtonFiltered: (name: string) => (page: Page) =>
            RussellsObjects.AccountPage.wishlistRowFiltered(name)(page).locator('td').last().locator('button'),

        // VERIFIED live (staging, 2026-08-02) on /account/wishlists/<id> —
        // a genuinely well-covered detail page, unlike the list above.
        wishlistDetails: (page: Page) => page.getByTestId('wishlist-details'),
        wishlistDetailsName: (page: Page) => page.getByTestId('wishlist-details__name'),
        wishlistDetailsEditNameButton: (page: Page) => page.getByTestId('wishlist-details__edit-name'),
        wishlistDetailsNameInput: (page: Page) => page.getByTestId('wishlist-details__name-input'),
        wishlistDetailsSaveNameButton: (page: Page) => page.getByTestId('wishlist-details__save-name'),
        wishlistDetailsCancelNameButton: (page: Page) => page.getByTestId('wishlist-details__cancel-name'),
        // TODO: RUS-474 — no testid; scoped to the details card, which
        // only ever has this one "Delete" button (Edit Name is a
        // separate, differently-labelled button).
        wishlistDetailsDeleteButton: (page: Page) => RussellsObjects.AccountPage.wishlistDetails(page).locator('button').filter({ hasText: 'Delete' }),
        wishlistItemsLine: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}`),
        wishlistItemsLineName: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}__name`),
        wishlistItemsLineSku: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}__sku`),
        wishlistItemsLinePrice: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}__price-price`),
        wishlistItemsLineTotalPrice: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}__total-price`),
        // CONFIRMED live (staging, 2026-08-02): the quantity picker's OWN
        // testids ("quantity-picker__*") are reused identically on every
        // line — a real testid collision, same pattern as elsewhere in
        // this project. Resolved via the per-line
        // "...__price-quantity-picker" wrapper, which IS correctly
        // indexed, rather than a positional .nth()/.first().
        wishlistItemsLineQuantityInput: (index: number) => (page: Page) =>
            page.getByTestId(`wishlist-items__line-${index}__price-quantity-picker`).getByTestId('quantity-picker__input'),
        wishlistItemsLineQuantityPlusButton: (index: number) => (page: Page) =>
            page.getByTestId(`wishlist-items__line-${index}__price-quantity-picker`).getByTestId('quantity-picker__plus-button'),
        wishlistItemsLineQuantityMinusButton: (index: number) => (page: Page) =>
            page.getByTestId(`wishlist-items__line-${index}__price-quantity-picker`).getByTestId('quantity-picker__minus-button'),
        wishlistItemsLineRemoveButton: (index: number) => (page: Page) => page.getByTestId(`wishlist-items__line-${index}__remove-button`),
        wishlistNoItemsText: (page: Page) => RussellsObjects.AccountPage.wishlistDetails(page).getByText('No items added'),
        // The Quick Buy panel is a separate Algolia autocomplete instance
        // from the header's own search — VERIFIED live this account
        // section's header has no search bar at all (a stripped-down
        // logo-only header), so this testid is never ambiguous here.
        quickBuySearchInput: (page: Page) => page.getByTestId('algolia-autocomplete__input'),
        // TODO: RUS-474 — no testid on these result links; href is the
        // stable signal (matches the header search's own hit pattern).
        quickBuySearchResultLinks: (page: Page) => page.getByTestId('wishlist-details__quick-buy').locator('a[href^="/products/"]'),
        wishlistSummary: (page: Page) => page.getByTestId('wishlist-summary'),
        // TODO: RUS-474 — no testid on this button, scoped to the summary
        // card (its only button).
        shareWishlistButton: (page: Page) => RussellsObjects.AccountPage.wishlistSummary(page).locator('button').filter({ hasText: 'Share Wishlist' }),
        // Same dialog primitive/Proceed button as confirmDeletionProceedButton above.
        shareWishlistEmailInput: (page: Page) => RussellsObjects.AccountPage.dialog(page).locator('input[type="email"]')
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
        promoCodeForm: (page: Page) => page.getByTestId('add-promotion-form'),
        // VERIFIED live (staging, 2026-08-03) with the real PROMO50 test
        // code: a valid code reveals a "Discount" line in the Order
        // Summary (basket-summary__discount) and a "promotion applied"
        // confirmation inside basket-summary__promotions, alongside the
        // applied-code badge already covered by promoCodeForm.
        discountLine: (page: Page) => page.getByTestId('basket-summary__discount'),
        promotionsContainer: (page: Page) => page.getByTestId('basket-summary__promotions')
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
        // VERIFIED live (staging, 2026-08-03): once a delivery address is
        // saved, its summary card shows this button, which re-opens the
        // SAME checkout-address-form pre-filled with the current values
        // (genuinely editable, not a blank re-entry) — no testid on the
        // button itself; TODO: RUS-474.
        deliveryChangeAddressButton: (page: Page) => page.getByRole('button', { name: 'Change address' }),
        // The Review & Pay page shows one of these per address (delivery,
        // billing), each with its own "Edit" link back to that step —
        // filtered by the Edit link's href rather than by text/index,
        // since the sidebar also has an unrelated "Change" link sharing
        // the same href. VERIFIED live: the address text itself is
        // genuinely truncated to "<name> ... <postcode>" in the DOM (not
        // a CSS ellipsis), so only those two fragments are ever safe to
        // assert against here — see CheckoutPage note for the rest of the
        // address.
        reviewCurrentAddressFiltered: (href: string) => (page: Page) =>
            page.getByTestId('review-current-address').filter({ has: page.locator(`a[href="${href}"]`) }),
        reviewEditAddressLinkFiltered: (href: string) => (page: Page) =>
            RussellsObjects.CheckoutPage.reviewCurrentAddressFiltered(href)(page).locator('a'),
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
        globalPaymentsSubmitFrame: (page: Page) => page.frameLocator('iframe[name="submit"]'),
        // VERIFIED live (staging, 2026-08-03): the paypal-checkout-buttons
        // container actually holds THREE iframes — the real interactive
        // one (name starting "__zoid__paypal_buttons__"), a hidden
        // "__zoid_prerender_frame__paypal_buttons_..." prerender copy, and
        // a "__detect_close_..." helper frame — so a bare `iframe` locator
        // is ambiguous. Matched on the real one's name prefix instead of a
        // testid (third-party SDK markup, not this storefront's own). The
        // button itself has no testid either, located by role/name same as
        // the Global Payments hosted fields above.
        paypalButtonFrame: (page: Page) => page.frameLocator('[data-testid="paypal-checkout-buttons"] iframe[name^="__zoid__paypal_buttons__"]'),
        // No testid on the alert itself — a role="alert" div shown on a
        // failed payment (e.g. a declined card), with the card form left
        // filled in below it so the customer can retry.
        paymentErrorAlert: (page: Page) => page.getByTestId('checkout__payment-alert')
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
        // VERIFIED live (staging, 2026-08-02): a nested span inside
        // productPrice reading "Incl. VAT"/"Excl. VAT" — reflects the
        // header's VAT toggle (RussellsObjects.HomePage.vatToggleSwitch).
        productPriceTaxMessage: (page: Page) => page.locator('[data-testid="product-price__now-price"]:visible [data-testid="tax-message"]'),
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
        // VERIFIED live (staging, 2026-08-02): searching DOES show a
        // results dropdown — sorted by distance, each a link to
        // /depot-finder/<slug> — it's just not a .pac-container/listbox
        // (an earlier check looked only for those and wrongly concluded
        // there was no dropdown at all; corrected after the user caught
        // it). No testid on the list, its container or its items, so it's
        // scoped via the branch-finder container (the same one the search
        // input lives in) plus the /depot-finder/ href pattern, which the
        // "All Depots" list below (outside this container) never matches.
        // TODO: RUS-474 — ask devs for a testid on this results list.
        searchResultLinks: (page: Page) => page.getByTestId('branch-finder').locator('a[href^="/depot-finder/"]'),
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
    },

    // /quick-enquiry-form — a CMS-driven contact form (Name, Email,
    // Telephone and Message required; Machine Brand/Model/Serial and
    // Images optional). No data-testid anywhere on the form or its
    // fields, but each field DOES carry a stable id tied to the CMS form
    // schema (e.g. "/form-fields/27") — VERIFIED unchanged across a page
    // reload (staging, 2026-08-02) — preferred over placeholder/text per
    // this project's locator convention despite the unusual-looking
    // value. TODO: RUS-474 — ask devs for real data-testids here.
    QuickEnquiryFormPage: {
        nameInput: (page: Page) => page.locator('[id="/form-fields/27"]'),
        emailInput: (page: Page) => page.locator('[id="/form-fields/7"]'),
        phoneInput: (page: Page) => page.locator('[id="/form-fields/28"]'),
        machineBrandInput: (page: Page) => page.locator('[id="/form-fields/21"]'),
        machineModelInput: (page: Page) => page.locator('[id="/form-fields/22"]'),
        machineSerialInput: (page: Page) => page.locator('[id="/form-fields/23"]'),
        messageInput: (page: Page) => page.locator('[id="/form-fields/29"]'),
        // No testid/id on the submit button itself, and this page has
        // OTHER unrelated submit buttons (header search, footer
        // newsletter) — scoped via the Message field's own ancestor
        // <form> instead of matching on the button's text.
        submitButton: (page: Page) => page.locator('[id="/form-fields/29"]').locator('xpath=ancestor::form').locator('button[type="submit"]')
    },

    // "Quick Parts Finder" — a cascading machine type -> brand -> model
    // selector present on multiple category hub pages (VERIFIED live,
    // 2026-08-02, on both /agriculture and /groundcare - same component,
    // same testids, different option sets per page). Submitting takes
    // the user to /parts-finder, a results page that reuses the exact
    // same Algolia PLP testids as a category PLP (see
    // RussellsObjects.ProductListPage - no separate result-card
    // locators needed here).
    PartsFinderWidget: {
        wrapper: (page: Page) => page.getByTestId('search-by-model'),
        machineTypeButton: (page: Page) => page.getByTestId('search-by-model__machine-type').locator('button'),
        brandButton: (page: Page) => page.getByTestId('search-by-model__brand').locator('button'),
        modelButton: (page: Page) => page.getByTestId('search-by-model__model').locator('button'),
        // TODO: RUS-474 — no testid on the Search parts button itself;
        // scoped to the widget wrapper, which always renders exactly
        // these 4 buttons in this fixed order (confirmed live,
        // 2026-08-02) — the last one is always Search parts.
        searchButton: (page: Page) => RussellsObjects.PartsFinderWidget.wrapper(page).locator('button').last(),
        // Each machine-type/brand/model button opens the same Radix
        // dialog + cmdk combobox primitive (no testid of its own) - a
        // "Search..." input for filtering, and options carrying a stable
        // data-value attribute (e.g. data-value="TRACTOR") - preferred
        // over matching on the option's visible text. VERIFIED live
        // (2026-08-04): on production, CookieYes' own preference-center
        // modal (id="ckyPreferenceCenter") is ALSO role="dialog" and
        // permanently present in the DOM (whether open or not) - excluded
        // by id, a stable third-party identifier, rather than left as a
        // strict-mode violation waiting to happen.
        dialog: (page: Page) => page.locator('[role="dialog"]:not(#ckyPreferenceCenter)'),
        dialogSearchInput: (page: Page) => RussellsObjects.PartsFinderWidget.dialog(page).locator('input'),
        dialogOptions: (page: Page) => RussellsObjects.PartsFinderWidget.dialog(page).locator('[role="option"]'),
        dialogOptionFiltered: (value: string) => (page: Page) => page.locator(`[data-value="${value}"]`),

        // /parts-finder — VERIFIED live, 2026-08-02: this banner and
        // "Change Vehicle" are the only things unique to this page beyond
        // the shared PLP testids. A plain [role="alert"] ALSO matches
        // Next.js's own hidden route-announcer element
        // (#__next-route-announcer__, present on every page in this app
        // - confirmed live, the same element investigated during the
        // Depot Finder work) - scoping to the real "algolia-list-page-
        // with-drawer" testid wrapper excludes it.
        resultsBanner: (page: Page) => page.getByTestId('algolia-list-page-with-drawer').getByRole('alert'),
        changeVehicleButton: (page: Page) => RussellsObjects.PartsFinderWidget.resultsBanner(page).locator('button')
    }
};
