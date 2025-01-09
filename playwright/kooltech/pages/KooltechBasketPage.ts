import {expect, Locator, Page} from '@playwright/test'
import {BasketPage} from "../../carbon/pages/BasketPage";

export class KooltechBasketPage extends BasketPage{
    readonly page: Page

    constructor(page: Page) {
        super(page);
        this.page = page;
    }


}