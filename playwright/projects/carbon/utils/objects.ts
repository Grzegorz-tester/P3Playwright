import { Page } from '@playwright/test';

export const CarbonObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        category: (categoryName: string) => (page: Page) => page.locator('h2', { hasText: `${categoryName}` }),
        menuNavBarButton: (page: Page) => page.getByTestId('navigation-drawer-sheet__menu-button'),
        viewAllButton: (page: Page) => page.locator('[data-testid^="navigation-drawer-sheet__view-all-link-2"]').filter({ hasText: "View All" })
    },

    LoginPage: {
        // TODO(CARBON): text-based locator, last resort only. Ask Carbon devs to add a
        // data-testid to the login heading and raise a ticket, then replace this.
        loginHeader: (page: Page) => page.getByRole('heading', { name: 'Sign In To Your Account' }),
        emailInput: (page: Page) => page.getByTestId('login-form__email-input'),
        passwordInput: (page: Page) => page.getByTestId('login-form__password-input'),
        signInButton: (page: Page) => page.getByTestId('login-form__submit-button'),
        signInButtonInProgress: (page: Page) => page.locator('[data-icon="spinner"]'),
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId('utility-bar__user-name')
    },

    BasketPage: {
        secureCheckoutButton: (page: Page) => page.getByTestId('basket__summary__checkout-button'),
        basketTotalString: (page: Page) => page.getByTestId('basket__summary').getByTestId('price__price').last(),
        basketProductsList: (page: Page) => page.getByTestId('basket'),
        addPromocodeButton: (page: Page) => page.getByTestId('promotion-code__add'),
        promocodeInput: (page: Page) => page.locator('#code'),
        applyPromocodeButton: (page: Page) => page.getByTestId('promotion-code__apply'),
        deleteProductButton: (productLink: string) => (page: Page) =>
            page.locator(`//*[@href='${productLink}']/..//a[@data-testid="basket__quantity-input__delete"]`),
        productBasketTotalString: (productLink: string) => (page: Page) =>
            page.locator(`//*[@href='${productLink}']/..//span[@data-testid="price__price"]`).last()
    },

    AccountPage: {
        // Account side-menu items share the data-testid "account-menu__item"; the href
        // is what distinguishes them, so anchor on testid + href (both stable).
        dashboardButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account"]'),
        profileButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/profile"]'),
        addressBookButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/address-book"]'),
        ordersButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/orders"]'),
        wishlistsButton: (page: Page) => page.locator('[data-testid="account-menu__item"][href="/account/wishlists"]'),
        createWishlistButton: (page: Page) => page.getByTestId('wishlists-header'),
        emailInput: (page: Page) => page.getByTestId('my-details__email'),
        firstNameInput: (page: Page) => page.locator('#firstName'),
        lastNameInput: (page: Page) => page.locator('#lastName'),
        contactNumberInput: (page: Page) => page.locator('#telephone'),
        changePasswordButton: (page: Page) => page.getByTestId('my-details__reset-password-form-btn'),
        saveChangesButton: (page: Page) => page.getByTestId('save-changes-button'),
        addDeliveryAddressButton: (page: Page) =>
            page.getByTestId('address-book-delivery__add-address-button'),
        addBillingAddressButton: (page: Page) =>
            page.getByTestId('address-book-billing__add-address-button'),
        // The delivery and billing sections each render a "checkout-address-form" with
        // identical testids/ids, so scope to the first one (delivery, rendered first)
        // to avoid strict-mode violations, and derive its fields from within it.
        addressForm: (page: Page) => page.getByTestId('checkout-address-form').first(),
        addressFirstNameInput: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByTestId('checkout-address-form__first-name'),
        addressLastNameInput: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByTestId('checkout-address-form__last-name'),
        addressLine1Input: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByTestId('checkout-address-form__address-line-1'),
        addressCityInput: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByTestId('checkout-address-form__city'),
        addressPostCodeInput: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByTestId('checkout-address-form__postcode'),
        // TODO(CARBON): the "Save Address" submit button has no data-testid, so it is
        // located by text scoped to the form. Ask Carbon devs to add a data-testid
        // (e.g. checkout-address-form__submit) and raise a ticket, then replace this.
        saveAddressButton: (page: Page) =>
            page.getByTestId('checkout-address-form').first().getByRole('button', { name: 'Save Address' })
    },

    CheckoutPage: {
        // TODO(CARBON): text-based locator, last resort only. Ask Carbon devs to add a
        // data-testid to the delivery section header and raise a ticket, then replace this.
        deliveryHeader: (page: Page) => page.locator('p', { hasText: 'Delivery' }),
        deliverySectionProceedButton: (page: Page) => page.getByTestId('proceed-to-next'),
        deliveryOptionRadioButton: (page: Page) =>
            page.locator('[data-testid="radio-select_option-Delivery"] > svg'),
        clickAndCollectOptionRadioButton: (page: Page) =>
            page.locator('[data-testid="radio-select_option-Click & Collect"] > svg'),
        afterCheckoutLoadingSpinnerIcon: (page: Page) => page.getByTestId('loading-spinner'),
        billingAddressSameAsDeliveryCheckbox: (page: Page) =>
            page.getByTestId('checkout__checkout-content').locator('label[data-testid="checkbox"]').first(),
        continueToPaymentButton: (page: Page) => page.getByTestId('proceed-to-payment'),
        deliveryAddress: (addressNumber: number) => (page: Page) =>
            page.getByTestId(`checkout__delivery-details-address__address-${addressNumber - 1}`),
        deliveryOptionsSelectionRadioButtons: (optionNumber: number) => (page: Page) =>
            page.locator(`[data-testid="radio-select_options"] > div:nth-child(${optionNumber})`)
    },

    CheckoutSuccessPage: {
        thankYouHeader: (page: Page) => page.getByTestId('basket__header__title'),
        orderDetails: (page: Page) => page.getByTestId('order-details')
    },

    ProductDetailPage: {
        addToBasketButton: (page: Page) => page.getByTestId('product-add-to-basket__button'),
        checkoutPopup: (page: Page) => page.getByTestId('success-popup-checkout'),
        closeAddedToBasketPopupButton: (page: Page) => page.getByTestId('modal__close-button--top'),
        basketButton: (page: Page) => page.getByTestId('brand-bar__basket-link'),
        actualPricePDP: (page: Page) =>
            page.getByTestId('price-to-pay').getByTestId('price__price'),
        itemAmountToAddInput: (page: Page) => page.getByTestId('quantity-picker__input').first(),
        basketCount: (page: Page) => page.locator('[data-testid="brand-bar__basket-link"]>span:nth-child(3)'),
        addedToBasketPopupTotal: (page: Page) => page.getByTestId('product-added-to-basket__basket-totals-total')
    },

    ProductListPage: {
        productNameLink: (page: Page) => page.getByTestId('product-card__name'),
        productNameLinkFiltered: (productName: string) => (page: Page) =>
            page.getByTestId('product-card__name').filter({ hasText: `${productName}` })
    },

    // Other shared locators can be added here
    Common: {
        loadingSpinner: (page: Page) => page.getByTestId('loading-spinner'),
        successMessage: (page: Page) => page.getByTestId('success-message')
    }
};
