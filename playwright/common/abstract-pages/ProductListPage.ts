import { Page } from '@playwright/test';

export abstract class AbstractProductListPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    abstract clickOnFirstItemToProceedToPDP(): Promise<void>;

    abstract clickOnAProductToProceedToPDP(productName: string): Promise<void>;
}
