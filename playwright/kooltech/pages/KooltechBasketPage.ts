import {expect, Locator, Page} from '@playwright/test'
import {BasketPage} from "../../carbon/pages/BasketPage";

export class KooltechBasketPage extends BasketPage{
    readonly page: Page
    readonly dashboardMenuButton: Locator
    readonly addressBookMenuButton: Locator
    readonly addDeliveryAddressButton: Locator

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.dashboardMenuButton = page.locator('[href="/account"][data-testid="account-menu-item"]')
        this.addressBookMenuButton = page.locator('[href="/account/address-book"][data-testid="account-menu-item"]')
        this.addDeliveryAddressButton = page.getByTestId('header__right-link').first()
    }


}