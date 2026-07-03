import { Page } from '@playwright/test';

export const KooltechObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        category: (categoryName: string) => (page: Page) => page.locator('h2', { hasText: `${categoryName}` }),
        menuNavBarButton: (page: Page) => page.locator('[href="#"]'),
        viewAllButton: (page: Page) => page.locator('[data-testid^="navigation-drawer-sheet__view-all-link"]').filter({hasText: "View All"})
    },

    LoginPage: {
        // TODO(KOOLTECH): text-based locator, last resort only. Ask Kooltech devs to add a
        // data-testid to the login heading and raise a ticket, then replace this.
        loginHeader: (page: Page) => page.locator('h2', { hasText: 'Sign in to your account' }),
        emailInput: (page: Page) => page.locator('#email'),
        passwordInput: (page: Page) => page.locator('#password'),
        signInButton: (page: Page) => page.getByTestId('login-form').locator('button'),
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId('utility-bar__content--logged-in')
    },

    AccountPage: {
        dashboardMenuButton: (page: Page) => page.locator('[href="/account"][data-testid="account-menu-item"]'),
        addressBookMenuButton: (page: Page) => page.locator('[href="/account/address-book"][data-testid="account-menu-item"]'),
        ordersMenuButton: (page: Page) => page.locator('[href="/account/orders"][data-testid="account-menu-item"]'),
        addDeliveryAddressButton: (page: Page) => page.getByTestId('header__right-link').first()
    },

    ProductListPage: {
        productNameLink: (page: Page) => page.getByTestId('product-card__name'),
        productNameLinkFiltered: (productName: string) => (page: Page) =>
            page.getByTestId('product-card__name').filter({hasText: `${productName}`})
    },

    ProductDetailPage: {
        addToBasketButton: (page: Page) => page.getByTestId('add-to-basket'),
        checkoutPopup: (page: Page) => page.getByTestId('modal__close-button--top'),
        closeAddedToBasketPopupButton: (page: Page) => page.getByTestId('modal__close-button--bottom'),
        basketButton: (page: Page) => page.locator('[data-icon="basket-shopping"]'),
        actualPricePDP: (page: Page) => page.getByTestId('price-to-pay').getByTestId('price__price'),
        itemAmountToAddInput: (page: Page) => page.locator('#quantity'),
        basketCount: (page: Page) => page.locator('xpath=//*[@href="/basket"]/../div')
    },

    BasketPage: {
        secureCheckoutButton: (page: Page) => page.getByTestId('basket__summary__checkout-button')
    },

    CheckoutPage: {
        deliveryAddressDiv: (page: Page) => page.getByTestId('address'),
        deliveryOptionsDiv: (page: Page) =>
            page.locator('[data-testid="checkout__delivery__delivery_types"]>[data-testid="options"]>div'),
        deliveryOptionsSlotsDiv: (page: Page) =>
            page.locator('[data-testid="delivery-options__availiable-slots"]>[data-testid="options"]>div'),
        billingAddressSameAsDeliveryCheckbox: (page: Page) =>
            page.locator(`//*[@data-testid="checkout__billing__address"]/..//label`),
        // TODO(KOOLTECH): text-based locators, last resort only. Ask Kooltech devs to add
        // data-testids to the checkout pay-on-account and proceed buttons and raise a
        // ticket, then replace these.
        payOnAccountButton: (page: Page) => page.locator(`//button/span[contains(text(),'PAY ON ACCOUNT')]`),
        proceedButton: (page: Page) => page.getByText('PROCEED')
    },

    CheckoutSuccessPage: {
        thankYouHeader: (page: Page) => page.getByTestId('basket__header__title'),
        orderDetails: (page: Page) => page.getByTestId('order-details')
    }
};
