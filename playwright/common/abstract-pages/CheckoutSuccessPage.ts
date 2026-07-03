import { Page } from '@playwright/test';

export abstract class AbstractCheckoutSuccessPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    abstract verifyThankYouPage(username: string): Promise<void>;
}