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
        loqateFirstResult: (page: Page) => page.locator('.pca .pcaitem').first(),
        deliveryAddressSubmitButton: (page: Page) => page.getByTestId('checkout-address-form__submit-button'),
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
}
