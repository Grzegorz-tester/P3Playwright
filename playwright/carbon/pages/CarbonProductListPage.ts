import type { Page } from '@playwright/test'
import { expect, Locator } from '@playwright/test'
import { AbstractProductListPage } from '../../abstracts/AbstractProductListPage';
import { CarbonObjects } from '../utils/objects';

export class CarbonProductListPage extends AbstractProductListPage {
    readonly page: Page;
    readonly firstProductBlock: Locator;
    readonly addFirstProductToBasketButton: Locator;
    readonly successfulGoToCheckoutButton: Locator;
    readonly productNameLink: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.firstProductBlock = CarbonObjects.ProductListPage.firstProductBlock(page);
        this.addFirstProductToBasketButton = CarbonObjects.ProductListPage.addFirstProductToBasketButton(page);
        this.successfulGoToCheckoutButton = CarbonObjects.ProductListPage.successfulGoToCheckoutButton(page);
        this.productNameLink = CarbonObjects.ProductListPage.productNameLink(page);
    }
}