import { Page } from '@playwright/test';

export const KeyliteObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        menuNavBarButton: (page: Page) => page.getByTestId('brand-bar__menu-button-desktop'),
        menuTierLinkFiltered: (category: string) => (page: Page) =>
            page.locator('[data-testid^="navigation-drawer-sheet__current-tier-link"]').filter({ hasText: category })
    }
};
