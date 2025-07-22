import { expect, Locator, Page } from '@playwright/test'
import { AbstractCheckoutSuccessPage } from '../../abstracts/AbstractCheckoutSuccessPage';
import { CarbonObjects } from '../utils/objects';

export class CarbonCheckoutSuccessPage extends AbstractCheckoutSuccessPage {
    readonly page: Page;
    readonly thankYouHeader: Locator;
    readonly orderDetailsEmailString: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.thankYouHeader = CarbonObjects.CheckoutSuccessPage.thankYouHeader(page);
        this.orderDetailsEmailString = CarbonObjects.CheckoutSuccessPage.orderDetailsEmailString(page);
    }
}