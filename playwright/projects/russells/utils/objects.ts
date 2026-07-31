import { Page } from '@playwright/test';

export const RussellsObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar'),
        menuNavBarButton: (page: Page) => page.getByTestId('navigation-drawer-sheet__menu-button'),
        menuLinkFiltered: (category: string) => (page: Page) =>
            page.locator('[data-testid^="navigation-drawer-sheet__link"]').filter({ hasText: category })
    }
};
