import { Page } from '@playwright/test'

export const JTDoveObjects = {
    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        // VERIFIED live (staging, 2026-08-10): the category nav is a plain,
        // always-visible horizontal bar - no menu button/drawer to open
        // first, unlike Russells' equivalent.
        navigationBar: (page: Page) => page.getByTestId('navigation-bar'),
        menuLinkFiltered: (category: string) => (page: Page) =>
            page.getByTestId('navigation-bar__items-item').filter({ hasText: category }),
        searchInput: (page: Page) => page.getByTestId('algolia-autocomplete__input'),
    },
    Footer: {
        // VERIFIED live (staging, 2026-08-10): the consent vendor is
        // Cookiebot, not CookieYes (the vendor used on Russells) - no
        // testid (third-party widget, not this storefront's own markup),
        // located by Cookiebot's own stable element id instead.
        cookieBannerAcceptButton: (page: Page) => page.locator('#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll'),
    },

    // VERIFIED live (staging, 2026-08-10): every one of these testids is
    // rendered TWICE (a mobile and a desktop layout variant, toggled by
    // CSS breakpoint) - only one is ever actually visible at the current
    // viewport, confirmed via offsetParent, so every locator below is
    // scoped with .first() at the point of use rather than baked in here,
    // matching the convention already used for basket line locators.
    ProductDetailPage: {
        productName: (page: Page) => page.getByTestId('product-info__name'),
        productSku: (page: Page) => page.getByTestId('product-info__sku'),
        productPrice: (page: Page) => page.getByTestId('product-price__now-price'),
        productPriceTaxMessage: (page: Page) => page.getByTestId('tax-message'),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
        addToBasketButton: (page: Page) => page.getByTestId('product-add-to-basket__button'),
        // No dedicated testid on the count itself - it's a plain span
        // concatenated after "Basket" in the link's own text content
        // (e.g. "Basket1"), parsed by digit-stripping the whole link text.
        basketLinkText: (page: Page) => page.getByTestId('brand-bar__basket-link'),
        accordionTriggers: (page: Page) => page.getByTestId('product-accordion__trigger'),
        // VERIFIED live (staging, 2026-08-10): collection-only, per-length
        // products (e.g. C16 Carcassing) render a length picker
        // ("3.6m"/"4.8m") plus TWO distinct add actions sharing the
        // regular `product-add-to-basket__button` testid for "Delivery"
        // and this separate, uniquely-testid'd button for "Click &
        // Collect" - this is the one that triggers the branch
        // stock-availability popup. Requires a length quantity > 0 first
        // (via quantityPlusButton) or it stays disabled. Scoped inside the
        // `product-add-to-basket` container with .first() - CONFIRMED
        // live: this same `product-card__add-to-basket` testid is ALSO
        // reused by every "related products" card further down the page,
        // and the main one is itself duplicated (mobile/desktop), so an
        // unscoped lookup resolves to 5 elements.
        clickAndCollectAddToBasketButton: (page: Page) =>
            page.getByTestId('product-add-to-basket').getByTestId('product-card__add-to-basket').first(),
        // VERIFIED live (staging, 2026-08-11): opens the "Add to
        // Wishlist" modal (see AddToWishlistModal below) - requires being
        // logged in. No testid (TODO: JTD-325 - text locator, no testid
        // available) - duplicated mobile/desktop like every other PDP
        // action, hence .first().
        addToListButton: (page: Page) => page.getByRole('button', { name: /add to list/i }).first(),
        // VERIFIED live (staging, 2026-08-10): a same-page colour/size
        // variant dropdown (e.g. Scruffs Bobble Hat's "Colour: Black") -
        // pre-selected with a valid default, so selecting an option is
        // only needed when testing variant switching itself.
        variantSelectedValue: (page: Page) => page.getByTestId('product-variant-select__selected-value'),
    },

    // VERIFIED live (staging, 2026-08-10): the "Check Stock In Our
    // Branches" dialog opened from a basket line's "Collect at branch"
    // toggle, or directly from a collection-only product's "Click &
    // Collect" add-to-basket button. Every element in it - the dialog
    // itself, each branch row, each "Select this branch" button - has NO
    // data-testid or other stable attribute (raised with JTDove devs,
    // TODO: JTD-325 add testids to the branch stock dialog), so this is
    // located by role/text as an explicit last resort.
    BranchStockDialog: {
        dialog: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Check Stock In Our Branches' }),
        // VERIFIED live (staging, 2026-08-11): each branch row - name,
        // address, stock figure and "Select this branch" button - is its
        // own direct child of the dialog's scrollable list, uniquely
        // identifiable by its own `.py-3` class (a real class from this
        // storefront's own styling, not a synthetic anchor - re-verified
        // live across multiple sessions). An earlier version of this
        // locator matched ANY ancestor `div` containing the branch name
        // AND a "Select this branch" button, relying on `.last()` to land
        // on the innermost match - that heuristic broke on at least one
        // re-render (CONFIRMED live, 2026-08-11: same dialog, same
        // content, zero elements matched), so it was replaced with this
        // more direct row selector.
        //
        // CONFIRMED live (staging, 2026-08-11): filtering by `hasText`
        // (a substring match) is NOT enough - several branch names are a
        // strict prefix of another branch's full name (e.g. "JT Dove
        // Newburn" is a prefix of "JT Dove Newburn - Plumbing and
        // Heating"; same for Ashington, Birtley, North Shields,
        // Stockton), so `hasText: branchName` matches both rows and
        // throws a strict-mode violation. Filtering by a descendant with
        // that EXACT text instead correctly matches only the row whose
        // own name element equals branchName. TODO: JTD-325 - text
        // locator, no testid available (see above).
        branchRowFiltered: (branchName: string) => (page: Page) =>
            JTDoveObjects.BranchStockDialog.dialog(page)
                .locator('.py-3')
                .filter({ has: page.getByText(branchName, { exact: true }) }),
        // TODO: JTD-325 - text locator, no testid available (see above).
        selectBranchButtonFiltered: (branchName: string) => (page: Page) =>
            JTDoveObjects.BranchStockDialog.branchRowFiltered(branchName)(page).getByRole('button', { name: 'Select this branch' }),
        // TODO: JTD-325 - text locator, no testid available (see above).
        closeButton: (page: Page) => JTDoveObjects.BranchStockDialog.dialog(page).getByRole('button', { name: 'Close' }),
        // CONFIRMED live (staging, 2026-08-11): the dialog itself can
        // render before its branch list has loaded (briefly showing only
        // the heading and Close button) - wait for this before asserting
        // on any specific branch row.
        anyBranchRow: (page: Page) => JTDoveObjects.BranchStockDialog.dialog(page).locator('.py-3'),
    },

    BasketPage: {
        // CONFIRMED live (staging, 2026-08-11): the
        // `basket-go-to-checkout__checkout-button` testid is attached to
        // a permanently-hidden decoy `<a href="/checkout/sign-in">` (a
        // real bug, raised with JTDove devs) - the actual visible,
        // clickable "GO TO CHECKOUT" element is a separate plain
        // `<button>` with no testid at all. getByRole('button', ...)
        // correctly excludes the decoy anchor (role "link", not
        // "button"), so no extra visibility filtering is needed. TODO:
        // JTD-325 - text locator, no testid available (see above).
        checkoutButton: (page: Page) => page.getByRole('button', { name: /go to checkout/i }),
        summaryTotal: (page: Page) => page.getByTestId('basket-summary__total'),
        firstLineRemoveButton: (page: Page) => page.getByTestId('basket-items__available-line-0__remove-button'),
        anyLine: (page: Page) => page.getByTestId('basket-items__available-line-0'),
        quantityMinusButton: (page: Page) => page.getByTestId('quantity-picker__minus-button'),
        quantityPlusButton: (page: Page) => page.getByTestId('quantity-picker__plus-button'),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
        // CONFIRMED live (staging, 2026-08-11): basket lines are NOT one
        // flat, globally-indexed list - the page renders up to TWO
        // separate line-list containers, one per delivery-method group
        // ("Delivery" heading, covering both JT-Dove-delivery and
        // courier-only lines; "Collect at Branch <branch>" heading,
        // covering every currently-collection-selected line), and each
        // container's own lines are indexed from 0 independently. A line
        // moving between Deliver and Collect at Branch physically moves
        // between these containers, so "basket-items__available-line-0"
        // can resolve to a DIFFERENT product depending on which group(s)
        // currently exist - do not target basket lines by index. This
        // locator instead matches ANY line testid (regardless of group)
        // and filters by the product's own visible name, then takes
        // .first() to collapse the mobile/desktop duplicate (see
        // ProductDetailPage above) - robust regardless of which group the
        // product currently sits in.
        lineByProductName: (productName: string) => (page: Page) =>
            page.getByTestId(/^basket-items__available-line-\d+$/).filter({ hasText: productName }).first(),
        // VERIFIED live (staging, 2026-08-10): every collect-eligible or
        // JT-Dove-delivered line renders this "Collect at Branch"/"Deliver"
        // toggle - plain buttons, no testid (TODO: JTD-325 - text locator,
        // no testid available, raised with devs). CONFIRMED live: the
        // DISABLED button is always the currently-ACTIVE method (you
        // can't switch into the state you're already in), not an
        // unavailable one - a courier-only line (e.g. Scruffs Bobble Hat,
        // which also shows a "Delivered by Courier" label) has BOTH
        // buttons disabled, permanently locked to Deliver, so "Collect at
        // Branch is disabled" alone does not prove collection is
        // selected - callers must also check that Deliver is enabled.
        collectAtBranchToggleFiltered: (productName: string) => (page: Page) =>
            JTDoveObjects.BasketPage.lineByProductName(productName)(page).getByRole('button', { name: 'Collect at branch' }),
        deliverToggleFiltered: (productName: string) => (page: Page) =>
            JTDoveObjects.BasketPage.lineByProductName(productName)(page).getByRole('button', { name: 'Deliver', exact: true }),
        // VERIFIED live (staging, 2026-08-11): a single, basket-WIDE
        // banner (not per-line) showing the one branch currently used for
        // every collection line in the basket, plus a "Change Branch"
        // action - only rendered once at least one line is set to
        // Collect at Branch. No testid (TODO: JTD-325 - text locator, no
        // testid available, raised with devs).
        collectAtBranchBanner: (page: Page) => page.locator('h3').filter({ hasText: 'Collect at Branch' }),
        changeBranchButton: (page: Page) => JTDoveObjects.BasketPage.collectAtBranchBanner(page).getByRole('button', { name: 'Change Branch' }),
        // Plain, static "Delivery" heading grouping every line NOT
        // currently set to Collect at Branch - only rendered while at
        // least one such line exists.
        deliveryGroupHeading: (page: Page) => page.locator('h3').filter({ hasText: /^Delivery$/ }),
    },

    ProductListPage: {
        hitsHeading: (page: Page) => page.getByTestId('algolia-hits-heading'),
        hitCount: (page: Page) => page.getByTestId('algolia-hit-count'),
        productCardLink: (page: Page) => page.getByTestId('product-card__link'),
        productCardName: (page: Page) => page.getByTestId('product-card__name'),
    },

    // VERIFIED live (staging, 2026-08-10) end-to-end through a real
    // completed guest order: /checkout/sign-in (Existing customer vs
    // Guest checkout) -> /checkout/click-and-collect (ONLY present when
    // the basket has at least one collection line - depot summary +
    // contact mobile) -> /checkout/delivery (ONLY present when the basket
    // has at least one courier/JT-Dove-delivery line - Loqate address
    // lookup, then a second render for phone/notes) ->
    // /checkout/billing ("same as delivery" checkbox) ->
    // /checkout/review-and-payment ("Proceed to Payment" - no separate
    // terms checkbox, just a disclaimer) -> redirects OFF-SITE to Opayo's
    // hosted payment pages (card selection -> card details -> order
    // review -> "Pay now") -> back to /checkout/thank-you.
    CheckoutPage: {
        guestCheckoutRadio: (page: Page) => page.getByTestId('radio-select_option-Guest checkout'),
        guestEmailInput: (page: Page) => page.getByTestId('guest-checkout-form__email-input'),
        guestSubmitButton: (page: Page) => page.getByTestId('guest-checkout-form__submit-button'),
        // Collection step (/checkout/click-and-collect).
        collectionContinueButton: (page: Page) => page.getByTestId('collection-content-service__continue-button'),
        // No testid on this field (TODO: JTD-325 - text locator, no
        // testid available, raised with devs) - located by its own stable
        // label-derived `id`, which Playwright resolves to unambiguously.
        collectionContactMobileInput: (page: Page) => page.locator('[id="Enter your contact mobile"]'),
        // Delivery step (/checkout/delivery) - address sub-step.
        deliveryAddressFirstName: (page: Page) => page.getByTestId('checkout-address-form__first-name'),
        deliveryAddressLastName: (page: Page) => page.getByTestId('checkout-address-form__last-name'),
        // The Loqate/PCA Predict address lookup - a third-party widget
        // injected outside this storefront's own markup (same category as
        // the Cookiebot banner above), located by its own fixed CSS
        // classes rather than a testid, since those are controlled by the
        // Loqate library itself and won't change with storefront
        // redeploys.
        loqateAddressSearchInput: (page: Page) => page.locator('#checkout-address-form__address-line-1'),
        // CONFIRMED live (staging, 2026-08-12): plain `.first()` (no
        // visibility filter) intermittently resolved to a persistently
        // hidden, unrelated `.pcaitem` that stayed "not visible" across
        // every retry for 45+ seconds - a real UK postcode is enough to
        // trigger it, so it's not the fake-postcode issue. `:visible`
        // skips whatever hidden element was being matched and targets
        // the genuinely rendered result instead.
        loqateFirstResult: (page: Page) => page.locator('.pca .pcaitem:visible').first(),
        deliveryAddressSubmitButton: (page: Page) => page.getByTestId('checkout-address-form__submit-button'),
        // CONFIRMED live (staging, 2026-08-12): once an address has been
        // accepted, the summary view shows a "Change address" control -
        // clicking it reveals the SAME checkout-address-form fields as
        // the initial Loqate flow, but as plain editable text inputs
        // (address-line-1 is the very same #checkout-address-form__
        // address-line-1 element the Loqate widget was attached to,
        // which reverts to a normal input once a selection has been
        // made). Used to overwrite Loqate's often-unreliable selection
        // with the actual intended address directly - see
        // fillGuestDeliveryAddress.
        changeAddressButton: (page: Page) => page.getByTestId('checkout-current-address__edit-address-button'),
        deliveryAddressCity: (page: Page) => page.getByTestId('checkout-address-form__city'),
        deliveryAddressCounty: (page: Page) => page.getByTestId('checkout-address-form__county'),
        deliveryAddressPostcode: (page: Page) => page.getByTestId('checkout-address-form__postcode'),
        // Delivery step - phone/notes sub-step (reached after submitting
        // the address above).
        deliveryContactMobileInput: (page: Page) => page.locator('[id="Enter your contact mobile"]'),
        deliveryNotesInput: (page: Page) => page.getByTestId('delivery-content__form-delivery-notes'),
        deliveryServiceRadio: (page: Page) => page.getByTestId('radio-select_options').locator('[data-testid^="radio-select_option-"]').first(),
        deliveryContinueButton: (page: Page) => page.getByTestId('delivery-content__form-continue-button'),
        // Billing step (/checkout/billing).
        billingSameAsDeliveryCheckbox: (page: Page) => page.getByTestId('checkout-address-form__same-as-delivery-address'),
        billingContinueButton: (page: Page) => page.getByTestId('checkout-billing-content__continue-button'),
        // Review step (/checkout/review-and-payment).
        reviewProceedToPaymentButton: (page: Page) => page.getByTestId('review-content__continue-to-payment-account'),
        // Checkout summary sidebar, present on every step - VERIFIED live
        // (staging, 2026-08-10): the shipping cost line only renders once
        // a courier service has been chosen at the delivery step.
        summaryShippingCost: (page: Page) => page.getByTestId('checkout-summary__shipping-cost'),
    },

    // Opayo (Elavon sandbox) hosted payment pages - a genuinely different
    // domain (sandbox.opayo.eu.elavon.com), so these are unavoidably
    // located by role/label since it's a third-party page this storefront
    // doesn't control at all, not this codebase's own markup.
    OpayoPaymentPage: {
        visaCardOption: (page: Page) => page.getByRole('button', { name: 'Pay using your Visa card' }),
        cardholderNameInput: (page: Page) => page.getByRole('textbox', { name: /cardholder's name/ }),
        // Anchored at the start - the expiry month/year fields' own
        // accessible names ALSO contain "digits exactly as they appear on
        // the front" (CONFIRMED live, 2026-08-11: an unanchored version
        // of this regex matched all three fields).
        cardNumberInput: (page: Page) => page.getByRole('textbox', { name: /^Enter the digits exactly as they appear on the front/ }),
        expiryMonthInput: (page: Page) => page.getByRole('textbox', { name: /expiration month/ }),
        expiryYearInput: (page: Page) => page.getByRole('textbox', { name: /expiration year/ }),
        cvcInput: (page: Page) => page.getByRole('textbox', { name: /security code/ }),
        confirmCardDetailsButton: (page: Page) => page.getByRole('button', { name: 'Confirm card details' }),
        payNowButton: (page: Page) => page.getByRole('button', { name: /^Pay .* now$/ }),
    },

    CheckoutSuccessPage: {
        orderReference: (page: Page) => page.getByTestId('orders-details__reference'),
        orderConfirmationEmail: (page: Page) => page.getByTestId('orders-details__email'),
        orderDeliveryNote: (page: Page) => page.getByTestId('orders-details__order-delivery-note'),
        orderLines: (page: Page) => page.getByTestId('order-product-card'),
        orderLinesContainer: (page: Page) => page.getByTestId('orders-details__order-lines'),
        paymentDetails: (page: Page) => page.getByTestId('orders-details__order-payment-details'),
    },

    // VERIFIED live (staging, 2026-08-11): /branches. The "Branch Finder"
    // widget (search box + results) sits above a separate, always-present
    // "All Branches" section (A-Z letter filter + full list). CONFIRMED
    // live: the Google Places Autocomplete predictions dropdown never
    // renders (a genuine "Google script not loaded" console error on this
    // storefront), but free-text submission via the search button still
    // works correctly (geocodes the typed text server-side and returns
    // real, distance-sorted results) - not a blocker for this feature.
    BranchFinderPage: {
        branchFinder: (page: Page) => page.getByTestId('branch-finder'),
        // No testid (TODO: JTD-325 - text locator, no testid available,
        // raised with devs) - located by its own stable third-party
        // widget id instead (react-google-places-autocomplete's own).
        searchInput: (page: Page) => page.locator('#react-google-places-autocomplete-input'),
        // The lone plain button in this widget (icon-only, no
        // aria-label/testid - TODO: JTD-325) - scoped to branchFinder so
        // it can't collide with the A-Z filter buttons below.
        searchButton: (page: Page) => JTDoveObjects.BranchFinderPage.branchFinder(page).locator('button'),
        // Each search result is a plain `<a href="/branches/<slug>">` -
        // matched by that stable href pattern rather than by visible
        // text/position.
        searchResultLinks: (page: Page) => JTDoveObjects.BranchFinderPage.branchFinder(page).locator('a[href^="/branches/"]'),
        // "View all branches" - matched by its stable href (a same-page
        // anchor), not by its visible text.
        viewAllBranchesLink: (page: Page) => JTDoveObjects.BranchFinderPage.branchFinder(page).locator('a[href="#all-branches"]'),
        // .first() - CONFIRMED live (staging, 2026-08-11): the same
        // mobile/desktop duplicate pattern documented on ProductDetailPage
        // above applies here too.
        allBranchesSection: (page: Page) => page.getByTestId('all-branches').first(),
        filterButtonByLetter: (letter: string) => (page: Page) => page.getByTestId(`branches_filter-bar_btn--${letter}`),
        filterAllButton: (page: Page) => page.getByTestId('branches_filter-bar_btn--All'),
        branchListItems: (page: Page) => page.getByTestId('branches_section__branch'),
        branchListItemLinks: (page: Page) => JTDoveObjects.BranchFinderPage.allBranchesSection(page).locator('a[href^="/branches/"]'),
    },

    BranchDetailPage: {
        heading: (page: Page) => page.getByTestId('branch__heading'),
    },

    // VERIFIED live (staging, 2026-08-11): /login. On success, navigates
    // to /account. On failure (e.g. a disabled account), re-renders the
    // same page with an "Error" banner instead of navigating.
    LoginPage: {
        emailInput: (page: Page) => page.getByTestId('login-form__email-input'),
        passwordInput: (page: Page) => page.getByTestId('login-form__password-input'),
        submitButton: (page: Page) => page.getByTestId('login-form__submit-button'),
    },

    // VERIFIED live (staging, 2026-08-11): shared across every /account/*
    // page - a welcome message, account number, Sign Out, and 6 nav
    // items each with a stable `data-value` attribute (Dashboard,
    // Profile, Address Book, Invoices, My Lists, Make a Payment) and a
    // real `href` - used instead of visible text.
    AccountMenu: {
        welcome: (page: Page) => page.getByTestId('account-menu__welcome'),
        logoutButton: (page: Page) => page.getByTestId('account-menu__logout'),
        itemByValue: (value: string) => (page: Page) => page.locator(`[data-testid="account-menu__item"][data-value="${value}"]`),
    },

    // VERIFIED live (staging, 2026-08-11): /account dashboard - three
    // account-card sections (Delivery Address, Billing Address, Recent
    // Orders), each with a "View all" link and either address fields or
    // an empty-state message.
    AccountDashboardPage: {
        cards: (page: Page) => page.getByTestId('account-card'),
        cardByTitle: (title: string) => (page: Page) => page.getByTestId('account-card').filter({ has: page.getByTestId('account-card__title').getByText(title, { exact: true }) }),
    },

    // VERIFIED live (staging, 2026-08-11): /account/profile - "My
    // Details" form, pre-filled with the logged-in user's data. "Reset
    // Password" is a plain text link with no testid (TODO: JTD-325).
    AccountProfilePage: {
        emailInput: (page: Page) => page.getByTestId('account-profile__email-input'),
        titleInput: (page: Page) => page.getByTestId('account-profile__title-input'),
        firstNameInput: (page: Page) => page.getByTestId('account-profile__first-name-input'),
        lastNameInput: (page: Page) => page.getByTestId('account-profile__last-name-input'),
        contactNumberInput: (page: Page) => page.getByTestId('account-profile__contact-number-input'),
        saveChangesButton: (page: Page) => page.getByTestId('account-profile__save-changes-button--header'),
        // TODO: JTD-325 - text locator, no testid available (see above).
        // CONFIRMED live (staging, 2026-08-11): a plain <button>, not a
        // link - clicking it toggles an inline "Change Password" form in
        // place (Existing/New/Repeat New Password fields, "Back to User
        // Form" link) rather than navigating to a separate route.
        resetPasswordButton: (page: Page) => page.getByRole('button', { name: 'Reset Password' }),
        changePasswordHeading: (page: Page) => page.getByRole('heading', { name: 'Change Password' }),
    },

    // VERIFIED live (staging, 2026-08-11): /account/address-book - two
    // independent sections (delivery, billing), each with its own
    // "Add new address" action and its own 0-indexed address list -
    // CONFIRMED live: when a section has zero addresses, the add-address
    // form itself renders inline instead of behind a button, so
    // `addAddressButton` is only meaningful once at least one address
    // already exists. Reuses the same `checkout-address-form` component
    // as guest checkout (see CheckoutPage above), but this rendering
    // does NOT carry the `__submit-button` testid - CONFIRMED live: the
    // visible text is "SAVE ADDRESS" (TODO: JTD-325 - text locator, no
    // testid available).
    AddressBookPage: {
        deliveryAddresses: (page: Page) => page.getByTestId('address-book-delivery__addresses'),
        deliveryAddAddressButton: (page: Page) => page.getByTestId('address-book-delivery__add-address-button'),
        deliveryAddressByIndex: (index: number) => (page: Page) => page.getByTestId(`address-book-delivery__address-${index}`),
        billingAddresses: (page: Page) => page.getByTestId('address-book-billing__addresses'),
        billingAddAddressButton: (page: Page) => page.getByTestId('address-book-billing__add-address-button'),
        billingAddressByIndex: (index: number) => (page: Page) => page.getByTestId(`address-book-billing__address-${index}`),
        addressFormFirstName: (page: Page) => page.getByTestId('checkout-address-form__first-name'),
        addressFormLastName: (page: Page) => page.getByTestId('checkout-address-form__last-name'),
        addressFormSaveAsDefaultCheckbox: (page: Page) => page.getByTestId('checkout-address-form__save-as-default'),
        // No testid (TODO: JTD-325) - located by its own stable id
        // instead (this rendering's id, distinct from checkout's
        // `checkout-address-form__address-line-1`).
        addressFormLoqateSearchInput: (page: Page) => page.locator('#address-form-loqate-input'),
        addressFormLoqateFirstResult: (page: Page) => page.locator('.pca .pcaitem:visible').first(),
        // CONFIRMED live (staging, 2026-08-11): editing an EXISTING
        // address renders these plain fields directly (pre-filled),
        // with no Loqate search box at all - the Loqate autocomplete
        // above is only for the "Add new address" flow.
        addressFormAddressLine1: (page: Page) => page.getByTestId('checkout-address-form__address-line-1'),
        addressFormCity: (page: Page) => page.getByTestId('checkout-address-form__city'),
        addressFormCounty: (page: Page) => page.getByTestId('checkout-address-form__county'),
        addressFormPostcode: (page: Page) => page.getByTestId('checkout-address-form__postcode'),
        // TODO: JTD-325 - text locator, no testid available (see above).
        addressFormSaveButton: (page: Page) => page.getByRole('button', { name: 'Save Address' }),
    },

    // VERIFIED live (staging, 2026-08-11): /account/invoices - a real
    // trade account's paginated order/invoice history. Every data cell
    // has a stable testid; the filter controls and pagination buttons do
    // not (TODO: JTD-325 - text locators, no testids available).
    InvoicesPage: {
        rowByIndex: (index: number) => (page: Page) => page.getByTestId(`account-invoices-row-${index}`),
        cellByIndexAndName: (index: number, cellName: string) => (page: Page) => page.getByTestId(`account-orders-row-${index}-cell-${cellName}`),
        documentNumberFilter: (page: Page) => page.getByTestId('account-orders-documentNumber-filter'),
        // No testid (see above) - located by its own stable id.
        dateFilter: (page: Page) => page.locator('#date'),
        statusFilterCombobox: (page: Page) => page.getByRole('combobox').filter({ hasText: 'Status' }),
        statusFilterOption: (status: string) => (page: Page) => page.getByRole('option', { name: status, exact: true }),
        filterResetButton: (page: Page) => page.getByTestId('account-orders-filter-reset'),
        prevPageButton: (page: Page) => page.getByRole('button', { name: /^prev$/i }).first(),
        nextPageButton: (page: Page) => page.getByRole('button', { name: /^next$/i }).first(),
    },

    // VERIFIED live (staging, 2026-08-11): /account/wishlists (list) and
    // VERIFIED live (staging, 2026-08-11): opened from a PDP's "Add to
    // list" button - pre-selects the account's only/most-recent wishlist
    // in the dropdown if one exists.
    AddToWishlistModal: {
        dialog: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Add to Wishlist' }),
        wishlistSelect: (page: Page) => page.getByTestId('add-wishlist__wishlist-select'),
        addButton: (page: Page) => page.getByTestId('add-wishlist__add-to-wishlist-btn'),
        createNewWishlistLink: (page: Page) => JTDoveObjects.AddToWishlistModal.dialog(page).getByText('or create a new wishlist'),
        // CONFIRMED live (staging, 2026-08-12): clicking Add does NOT
        // close the dialog - it swaps to a success confirmation inside
        // the SAME dialog ("Successfully added to wishlist: ...") with
        // Continue Shopping/View Wishlist/Close buttons, which must be
        // dismissed explicitly. No testid on these buttons (TODO:
        // JTD-325) - located by text.
        successMessage: (page: Page) => page.getByText(/successfully added to wishlist/i),
        closeButton: (page: Page) => JTDoveObjects.AddToWishlistModal.dialog(page).getByRole('button', { name: 'Close', exact: true }),
    },

    // /account/wishlists/<id> (details). The list's own row actions have
    // no "Share" column despite the source test case describing one -
    // CONFIRMED live: each row only has an edit-pencil link (opens the
    // details page, where Share/Edit Name/Delete Wishlist actually live)
    // and a Delete action. Almost nothing on the details page carries a
    // testid (TODO: JTD-325 for all of them) - located by role/text.
    WishlistsPage: {
        createNewWishlistButton: (page: Page) => page.getByRole('button', { name: 'Create a new Wishlist' }),
        // The create/edit modal's name input shares this id in both
        // flows (CONFIRMED live) - scope by the currently-open dialog if
        // ever both could be relevant.
        modalNameInput: (page: Page) => page.locator('#modal-quote-name'),
        modalCreateButton: (page: Page) => page.getByRole('dialog').getByRole('button', { name: 'Create Wishlist' }),
        nameFilterInput: (page: Page) => page.getByTestId('account-wishlists-name-filter'),
        filterResetButton: (page: Page) => page.getByTestId('account-wishlists-filter-reset'),
        rowByIndex: (index: number) => (page: Page) => page.getByTestId(`account-wishlists-row-${index}`),
        rowNameCellByIndex: (index: number) => (page: Page) => page.getByTestId(`account-wishlists-row-${index}-cell-name`),
        rowEditLinkByIndex: (index: number) => (page: Page) => page.getByTestId(`account-wishlists-row-${index}-cell-edit`).locator('a'),
        rowDeleteButtonByIndex: (index: number) => (page: Page) => page.getByTestId(`account-wishlists-row-${index}-cell-delete`).getByRole('button').first(),
        // Details page.
        quickAddSearchInput: (page: Page) => page.getByTestId('basket-quick-buy').getByTestId('algolia-autocomplete__input'),
        quickAddHitProducts: (page: Page) => page.getByTestId('basket-quick-buy').getByTestId('algolia-autocomplete-hit-product'),
        // VERIFIED live (staging, 2026-08-11): the wishlist name is a
        // `<p>` two levels up from the Share button (both children of
        // the same flex row) - not a heading element.
        detailsHeading: (page: Page) => page.getByRole('button', { name: 'Share', exact: true }).locator('xpath=../../p'),
        shareButton: (page: Page) => page.getByRole('button', { name: 'Share', exact: true }),
        editNameButton: (page: Page) => page.getByRole('button', { name: 'Edit Name' }),
        deleteWishlistButton: (page: Page) => page.getByRole('button', { name: 'Delete Wishlist' }),
        shareModalDialog: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Share Wishlist' }),
        shareModalEmailInput: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Share Wishlist' }).getByPlaceholder('Enter an email address'),
        shareModalShareButton: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Share Wishlist' }).getByRole('button', { name: 'SHARE' }),
        // CONFIRMED live (staging, 2026-08-12): clicking Share does NOT
        // close this dialog (no success message either, unlike the Add
        // to Wishlist modal) - it just sits there with the email tag
        // still shown, so it has to be dismissed explicitly. Two
        // buttons are both literally named "Close" - the first (a
        // primary-style button) does NOTHING when clicked (confirmed
        // live, twice); only the second (the corner X icon) actually
        // dismisses the dialog, hence .last() rather than .first().
        shareModalCloseButton: (page: Page) => JTDoveObjects.WishlistsPage.shareModalDialog(page).getByRole('button', { name: 'Close' }).last(),
        deleteConfirmDialog: (page: Page) => page.getByRole('dialog').filter({ hasText: 'Are you sure you want to delete this wishlist' }),
        deleteConfirmCancelButton: (page: Page) => JTDoveObjects.WishlistsPage.deleteConfirmDialog(page).getByRole('button', { name: 'Close' }),
        // Test scenarios only ever add one product to a wishlist, so
        // these target the single line directly rather than needing a
        // per-row scope - .first() guards against the mobile/desktop
        // duplicate pattern if it applies here too.
        lineQuantityInput: (page: Page) => page.getByTestId('quantity-picker__input').first(),
        lineQuantityPlusButton: (page: Page) => page.getByTestId('quantity-picker__plus-button').first(),
        lineQuantityMinusButton: (page: Page) => page.getByTestId('quantity-picker__minus-button').first(),
        lineUpdateButton: (page: Page) => page.getByRole('button', { name: 'Update' }).first(),
        lineRemoveButton: (page: Page) => page.getByRole('button', { name: 'Remove' }).first(),
        addItemToBasketButton: (page: Page) => page.getByRole('button', { name: 'Add item to basket' }).first(),
        addWishlistToBasketButton: (page: Page) => page.getByRole('button', { name: 'Add wishlist to basket', exact: false }),
        // VERIFIED live (staging, 2026-08-11): "Wishlist Total" is an
        // `<h3>` with the total price as its very next `<p>` sibling.
        wishlistTotal: (page: Page) => page.getByRole('heading', { name: 'Wishlist Total' }).locator('xpath=following-sibling::p[1]'),
    },

    // VERIFIED live (staging, 2026-08-11): /account/make-a-payment - an
    // online payment section (amount validated against the real
    // outstanding balance - CONFIRMED live: an amount greater than the
    // balance is rejected with a visible message, not silently) and a
    // static BACS details section.
    MakeAPaymentPage: {
        onlineSection: (page: Page) => page.getByTestId('make-a-payment-online'),
        defaultBillingAddress: (page: Page) => JTDoveObjects.MakeAPaymentPage.onlineSection(page).getByTestId('address-book-address'),
        // No testid (TODO: JTD-325) - located by its own stable id.
        amountInput: (page: Page) => page.locator('#currency'),
        makePaymentButton: (page: Page) => JTDoveObjects.MakeAPaymentPage.onlineSection(page).getByRole('button', { name: 'Make a Payment' }),
        balanceErrorMessage: (page: Page) => page.getByText('The amount you are trying to pay is greater than your account balance.'),
    },
}
