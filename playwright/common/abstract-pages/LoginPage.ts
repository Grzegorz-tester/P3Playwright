import { Page } from '@playwright/test';

export abstract class LoginPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    abstract navigateToLoginPage(): Promise<void>;

    abstract loginToApplication(email: string, password: string): Promise<void>;
}
