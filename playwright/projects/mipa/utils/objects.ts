import { Page } from '@playwright/test';

export const MipaObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar__container'),
        menuNavBarButton: (page: Page) => page.getByTestId('navigation-bar__nav-menu-button'),
        navItems: (page: Page) => page.getByTestId('navigation-bar__items'),
        searchInput: (page: Page) => page.getByTestId('algolia-search-bar__input'),
        searchHits: (page: Page) => page.getByTestId('algolia-search-bar__hits')
    },

    LoginPage: {
        loginHeader: (page: Page) => page.getByTestId('login-form__title'),
        emailInput: (page: Page) => page.locator('#email'),
        passwordInput: (page: Page) => page.locator('#password'),
        signInButton: (page: Page) => page.getByTestId('login-form__sign-in-button'),
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId('utility-bar__content--logged-in')
    },

    AccountPage: {
        dashboardMenuButton: (page: Page) => page.locator('[href="/account"][data-testid="account-menu__item"]'),
        addressBookMenuButton: (page: Page) => page.locator('[href="/account/address-book"][data-testid="account-menu__item"]'),
        ordersMenuButton: (page: Page) => page.locator('[href="/account/orders"][data-testid="account-menu__item"]'),
        welcomeMessage: (page: Page) => page.getByTestId('account-menu__welcome')
    },

    ProductListPage: {
        hitsContainer: (page: Page) => page.getByTestId('algolia-search-bar__hits'),
        productLink: (page: Page) => page.getByTestId('algolia-search-bar__hits').locator('a[href^="/products/"]'),
        productLinkFiltered: (productName: string) => (page: Page) =>
            page.getByTestId('algolia-search-bar__hits').locator('a[href^="/products/"]').filter({ hasText: productName })
    },

    ProductDetailPage: {
        title: (page: Page) => page.getByTestId('product-content__title'),
        sku: (page: Page) => page.getByTestId('product-content__sku'),
        priceTitle: (page: Page) => page.getByTestId('product-price__title'),
        variantLozenge: (index: number) => (page: Page) => page.getByTestId(`product-variant-options__lozenge-${index}`),
        addToBasketButton: (page: Page) => page.getByTestId('product-price__add-to-basket'),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input'),
        basketButton: (page: Page) => page.getByTestId('brand-bar__basket-button')
    }
};
