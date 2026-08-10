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
}
