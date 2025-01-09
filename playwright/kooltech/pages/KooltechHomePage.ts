import {Locator, Page} from '@playwright/test'
import { HomePage } from '../../carbon/pages/HomePage'

export class KooltechHomePage extends HomePage{
    readonly page: Page
    readonly menuNavBarButton: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.menuNavBarButton = page.locator('[href="#"]');

    }
}