import type {Page} from '@playwright/test'
import {Locator} from '@playwright/test'
import { AbstractProductDetailPage } from '../../abstracts/AbstractProductDetailPage';
import { CarbonObjects } from '../utils/objects';

export class CarbonProductDetailPage extends AbstractProductDetailPage {
    readonly page: Page;
    readonly addToBasketButton: Locator;
    readonly chechkoutPopup: Locator;
    readonly closeAddedToBasketPopupButton: Locator;
    readonly basketButton: Locator;
    readonly actualPricePDP: Locator;
    readonly itemAmountToAddInput: Locator;
    readonly basketCount: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.addToBasketButton = CarbonObjects.ProductDetailPage.addToBasketButton(page);
        this.chechkoutPopup = CarbonObjects.ProductDetailPage.chechkoutPopup(page);
        this.closeAddedToBasketPopupButton = CarbonObjects.ProductDetailPage.closeAddedToBasketPopupButton(page);
        this.basketButton = CarbonObjects.ProductDetailPage.basketButton(page);
        this.actualPricePDP = CarbonObjects.ProductDetailPage.actualPricePDP(page);
        this.itemAmountToAddInput = CarbonObjects.ProductDetailPage.itemAmountToAddInput(page);
        this.basketCount = CarbonObjects.ProductDetailPage.basketCount(page);
    }
}