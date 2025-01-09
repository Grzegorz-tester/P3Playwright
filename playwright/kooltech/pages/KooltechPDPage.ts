import {expect, Locator, Page} from '@playwright/test'
import {ProductDetailPage} from "../../carbon/pages/ProductDetailPage";

export class KooltechPDPage extends ProductDetailPage{
    readonly page: Page
    readonly basketButton: Locator
    readonly basketCount: Locator
    readonly closeAddedToBasketPopupButton: Locator
    readonly chechkoutPopup: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.basketButton = page.locator('[data-icon="basket-shopping"]');
        this.basketCount = page.locator(`xpath=//*[@href="/basket"]/../div`);
        this.chechkoutPopup = page.getByTestId('modal__close-button--top')
        this.closeAddedToBasketPopupButton = page.getByTestId(`modal__close-button--bottom`);
    }

}