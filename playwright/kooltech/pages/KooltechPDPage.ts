import {expect, Locator, Page} from '@playwright/test'
import {ProductDetailPage} from "../../carbon/pages/ProductDetailPage";

export class KooltechPDPage extends ProductDetailPage{
    readonly page: Page
    readonly basketButton: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.basketButton = page.locator('[data-icon="basket-shopping"]')
    }

}