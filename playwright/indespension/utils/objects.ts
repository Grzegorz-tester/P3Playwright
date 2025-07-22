import { Page, Locator } from '@playwright/test';

export const IndespensionObjects = {

    HomePage: {
        brandBar: (page: Page) => page.getByTestId('brand-bar')
    },

    LoginPage: {
        loginHeader: (page: Page) => page.locator(''),
        emailInput: (page: Page) => page.getByTestId(''),
        passwordInput: (page: Page) => page.getByTestId(''),
        signInButton: (page: Page) => page.getByTestId(''),
        signInButtonInProgress: (page: Page) => page.locator(''),
        welcomeUserTopbarDiv: (page: Page) => page.getByTestId("")
    }
};