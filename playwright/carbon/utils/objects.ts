import { Page, Locator } from '@playwright/test';

export const CarbonObjects = {

    HomePage: {
        category:(categoryName: string) => (page: Page) => page.locator('a', { hasText: `${categoryName}` }),
        menuNavBar: (page: Page) => page.getByTestId('navigation-drawer'),
        menuNavBarButton: (page: Page) => page.getByTestId('navigation-drawer-sheet__menu-button'),
        productsMenuItemButton: (page: Page)=> page.locator('[data-testid="navigation-drawer"]>div>a[href="/category/all-products"]').first(),
        viewAllButton: (page: Page) => page.getByTestId('navigation-drawer-sheet__view-all-link-all-products'),
        brandBar: (page: Page) => page.getByTestId('brand-bar')
    },

    LoginPage: {
        loginHeader: (page: Page) => page.locator('h1', { hasText: 'Sign in to your account' }),
        emailInput: (page: Page) => page.getByTestId('login-form__email-input'),
        passwordInput: (page: Page) => page.getByTestId('login-form__password-input'),
        signInButton: (page: Page) => page.getByTestId('login-form__submit-button'),
        signInButtonInProgress: (page: Page) => page.locator('button>span>[data-icon="spinner"]'),
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId("utility-bar__user-name")
    },

    BranchesPage: {
        branch1PinDiv: (page: Page) => page.getByTestId('branch-map-marker__leeds'),
        branch1AddressDiv: (page: Page) => page.getByTestId('branch-map-marker-address__leeds'),
        branch2PinDiv: (page: Page) => page.getByTestId('branch-map-marker__liverpool'),
        branch2AddressDiv: (page: Page) => page.getByTestId('branch-map-marker-link-liverpool'),
    },

    AccountPage: {
        dashboardButton: (page: Page) => page.locator('[data-value="Dashboard"]'),
        profileButton: (page: Page) => page.locator('[data-value="Profile"]'),
        addressBookButton: (page: Page) => page.locator('[data-value="Address Book"]'),
        ordersButton: (page: Page) => page.locator('[data-value="Orders"]'),
        wishlistsButton: (page: Page) => page.locator('[data-value="Wishlists"]'),
        createWishlistButton: (page: Page) => page.locator('[data-testid="wishlists-header"] > p:nth-child(2)'),
        emailInput: (page: Page) => page.locator('[data-testid="my-details__email"]'),
        firstNameInput: (page: Page) => page.locator('[id="firstName"]'),
        lastNameInput: (page: Page) => page.locator('[id="lastName"]'),
        contactNumberInput: (page: Page) => page.locator('[id="telephone"]'),
        changePasswordButton: (page: Page) => page.locator('my-details__reset-password-form-btn'),
        saveChangesButton: (page: Page) => page.locator('[data-testid="save-changes-button"]'),
        addDeliveryAddressButton: (page: Page) => page.getByTestId('address-book-delivery__add-address-button'),
        addBillingAddressButton: (page: Page) => page.getByTestId('address-book-billing__add-address-button'),
        addressFirstNameInput: (page: Page) => page.getByTestId('checkout-address-form__first-name'),
        addressLastNameInput: (page: Page) => page.getByTestId('checkout-address-form__last-name'),
        addressLine1Input: (page: Page) => page.getByTestId('checkout-address-form__address-line-1'),
        addressCityInput: (page: Page) => page.getByTestId('checkout-address-form__city'),
        addressPostCodeInput: (page: Page) => page.getByTestId('checkout-address-form__postcode'),
        submitButton: (page: Page)=> page.locator('div[data-testid="account-card__content"]>form>div:nth-child(10)>[type="submit"]'),
        firstAddressAddressLine1: (page: Page) => page.getByTestId('address-book-delivery__address-1__line-1'),
        deleteFirstAddressButton: (page: Page) => page.getByTestId('address-book-delivery__address-1__delete-address-button'),
        confirmDeleteFirstAddressButton: (page: Page) => page.getByTestId('address-book-delivery__address-1__delete-address-yes-button')
    },

    ProductListPage: {
        firstProductBlock: (page: Page) => page.locator(
            '[data-testid="search__hits__container"]>[data-testid="product-card"]:nth-child(1)>a>p',
        ),
        addFirstProductToBasketButton: (page: Page) => page.locator(
            '[data-testid="product-card"]:nth-child(2)>div>button:nth-child(1)',
        ),
        successfulGoToCheckoutButton: (page: Page) => page.getByTestId('success-popup-checkout'),
        productNameLink: (page: Page) => page.getByTestId('product-card__name')
    },

    ProductDetailPage: {
        addToBasketButton: (page: Page) => page.locator('[data-testid="add-to-basket"]'),
        chechkoutPopup: (page: Page) => page.locator('[data-testid="success-popup-checkout"]'),
        closeAddedToBasketPopupButton: (page: Page) => page.locator(
            '[data-testid="modal__close-button--top"]>[data-icon="xmark"]',
        ),
        basketButton: (page: Page) => page.locator('[data-testid="brand-bar__basket-button"]'),
        actualPricePDP: (page: Page) => page.locator(
            '[data-testid="price-to-pay"]>span>[data-testid="price__price"]',
        ),
        itemAmountToAddInput: (page: Page) => page.locator('#quantity'),
        basketCount: (page: Page) => page.locator('//*[@data-testid="brand-bar__basket-button"]/../div')
    },

    BasketPage: {
        secureCheckoutButton: (page: Page) => page.getByTestId('basket__summary__checkout-button'),
        basketTotalString: (page: Page) => page.getByTestId('basket-summary__total'),
        basketProductsList: (page: Page) => page.locator('[data-testid="basket"]'),
        addPromocodeButton: (page: Page) => page.getByTestId('promotion-code__add'),
        promocodeInput: (page: Page) => page.locator('#code'),
        applyPromoocodeButton: (page: Page) => page.getByTestId('promotion-code__apply'),
        deleteProductButton: (productLink: string) => (page: Page) => page.locator(`//*[@href='${productLink}']/../div/div[3]/div/div/a[@data-testid="basket__quantity-input__delete"]`),
        productBasketTotalString: (productLink: string) => (page: Page) => page.locator(`//*[@href='${productLink}']/../div/div[4]/div/span/span[2][@data-testid="price__price"]`)
    },

    CheckoutPage: {
        deliveryHeader: (page: Page) => page.locator('p', { hasText: 'Delivery' }),
        deliverySectionProceedButton: (page: Page) => page.getByTestId(
            'proceed-to-next',
        ),
        deliveryOptionRadioButton: (page: Page) => page.locator(
            '[data-testid="radio-select_option-Delivery"] > svg',
        ),
        clickAndCollectOptionRadioButton: (page: Page) => page.locator(
            '[data-testid="radio-select_option-Click & Collect"] > svg',
        ),
        afterCheckoutLoadingSpinnerIcon: (page: Page) => page.locator('[data-testid="loading-spinner"]'),
        billingAddressSameAsDeliveryCheckbox: (page: Page) => page.getByTestId('checkout-address-form__same-as-delivery-address'),
        continueFromDeliveryAddressButton: (page: Page) => page.getByTestId('checkout-select-address__continue-button'),
        continueFromBillingAddressButton: (page: Page) => page.getByTestId('checkout-billing-content__continue-button'),
        payOnAccountButton: (page: Page) => page.getByTestId('review-content__continue-to-payment-account'),
        deliveryAddress: (addressNumber: number) => (page: Page) => {
            let addressNumberToString = addressNumber.toString();
            return page.locator(`[data-testid="delivery-content__radio-select"]>div:nth-child(${addressNumberToString})>div>svg`);
        },
        deliveryOptionsSelectionRadioButtons: (optionNumber: string) => (page: Page) => page.locator(`[data-testid="radio-select_options"] > div:nth-child(${optionNumber})`)
    },

    CheckoutSuccessPage: {
        thankYouHeader: (page: Page) => page.locator('[data-testid="checkout-thank-you-content"]>h1'),
        orderDetailsEmailString: (page: Page) => page.getByTestId('orders-details__email')
    }
};