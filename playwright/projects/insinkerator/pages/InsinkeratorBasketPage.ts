import { Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly secureCheckoutButton = InsinkeratorObjects.BasketPage.secureCheckoutButton(this.page);

    async proceedToSecureCheckout(): Promise<void> {
        await this.secureCheckoutButton.focus()
        await this.secureCheckoutButton.click()
    }
}
