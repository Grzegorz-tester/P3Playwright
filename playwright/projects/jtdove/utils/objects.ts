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
    },

    BasketPage: {
        checkoutButton: (page: Page) => page.getByTestId('basket-go-to-checkout__checkout-button'),
        summaryTotal: (page: Page) => page.getByTestId('basket-summary__total'),
        firstLineRemoveButton: (page: Page) => page.getByTestId('basket-items__available-line-0__remove-button'),
        anyLine: (page: Page) => page.getByTestId('basket-items__available-line-0'),
        quantityMinusButton: (page: Page) => page.getByTestId('quantity-picker__minus-button'),
        quantityPlusButton: (page: Page) => page.getByTestId('quantity-picker__plus-button'),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
    },

    ProductListPage: {
        hitsHeading: (page: Page) => page.getByTestId('algolia-hits-heading'),
        hitCount: (page: Page) => page.getByTestId('algolia-hit-count'),
        productCardLink: (page: Page) => page.getByTestId('product-card__link'),
        productCardName: (page: Page) => page.getByTestId('product-card__name'),
    },
}
