import { Page } from '@playwright/test'
import { BasketPage } from '../../../common/abstract-pages/BasketPage'
import { KooltechObjects } from '../utils/objects'

export class KooltechBasketPage extends BasketPage {

    constructor(page: Page) {
        super(page);
    }

    readonly secureCheckoutButton = KooltechObjects.BasketPage.secureCheckoutButton(this.page);

    async proceedToSecureCheckout(): Promise<void> {
        await this.secureCheckoutButton.focus()
        await this.secureCheckoutButton.click()
    }
}
