import { Page } from '@playwright/test';

export abstract class ResetPasswordPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    abstract requestPasswordReset(email: string): Promise<void>;
}
