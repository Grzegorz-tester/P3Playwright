import { expect, Locator, Page } from '@playwright/test';

export abstract class AbstractBranchesPage {
    readonly page: Page;
    public abstract branch1PinDiv: Locator;

    protected constructor(page: Page) {
        this.page = page;
    }

    async navigateToBranchesPage(): Promise<void> {
        await this.page.goto('/branches', { timeout: 40000 });
        await this.page.waitForLoadState('networkidle');
        await expect(this.branch1PinDiv).toBeVisible({timeout: 60000 });
    }

    abstract proceedToBranchPage(...args: any[]): Promise<void>;
}
