import {expect, Locator, Page} from '@playwright/test'
import { HomePage } from '../../carbon/pages/HomePage'
import {AbstractHomePage} from "../../abstracts/AbstractHomePage";

export class IndespensionHomePage extends AbstractHomePage{
    readonly page: Page
    readonly brandBar: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.brandBar = page.getByTestId('brand-bar')
    }

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }

    async chooseMenuCategory() {}
}