import { expect, Locator, Page } from '@playwright/test'

export abstract class AbstractCheckoutSuccessPage {
    readonly page: Page;
    public abstract thankYouHeader: Locator;
    public abstract orderDetailsEmailString: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.thankYouHeader).toHaveText("Thank you for your order", {timeout: 80000});
        await expect(this.orderDetailsEmailString).toHaveText(`${username}`);
    }
}