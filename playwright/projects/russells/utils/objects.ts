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

    // Subset covering only the change-password flow (Account > Profile > My
    // Details > "Reset Password", which swaps the same card over to a
    // Change Password form) — address book / orders are out of scope for
    // now, see RUS-474.
    AccountPage: {
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
        changePasswordAlert: (page: Page) => page.getByTestId('account-profile__alert')
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
        // duplicate exists — .first() resolves to the real, visible copy.
        productName: (page: Page) => page.getByTestId('product-info__name').first(),
        addToBasketButton: (page: Page) => page.getByTestId('product-add-to-basket__button').first(),
        quantityInput: (page: Page) => page.getByTestId('quantity-picker__input').first(),
        basketLinkText: (page: Page) => page.getByTestId('brand-bar__basket-link')
    }
};
