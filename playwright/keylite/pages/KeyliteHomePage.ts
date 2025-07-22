import {expect, Locator, Page} from '@playwright/test'
import { HomePage } from '../../carbon/pages/HomePage'
import {IndespensionObjects} from "../../indespension/utils/objects";

export class KeyliteHomePage extends HomePage{
    readonly page: Page
    readonly brandBar: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.brandBar = IndespensionObjects.HomePage.brandBar(page);

    }

    async validateHomePage(): Promise<void> {
        await expect(this.brandBar).toBeVisible({ timeout: 45000 })
    }
}