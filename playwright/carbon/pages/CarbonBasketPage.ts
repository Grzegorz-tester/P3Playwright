import {expect, Page} from '@playwright/test'
import { Locator } from '@playwright/test'
import { AbstractBasketPage } from '../../abstracts/AbstractBasketPage';
import { CarbonObjects } from '../utils/objects';
import {Product, products} from '../utils/products/products';

export class CarbonBasketPage extends AbstractBasketPage {
    readonly page: Page;
    readonly secureCheckoutButton: Locator;
    readonly basketTotalString: Locator;
    readonly basketProductsList: Locator;
    readonly addPromocodeButton: Locator;
    readonly promocodeInput: Locator;
    readonly applyPromoocodeButton: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.secureCheckoutButton = CarbonObjects.BasketPage.secureCheckoutButton(page);
        this.basketTotalString = CarbonObjects.BasketPage.basketTotalString(page);
        this.basketProductsList = CarbonObjects.BasketPage.basketProductsList(page);
        this.addPromocodeButton = CarbonObjects.BasketPage.addPromocodeButton(page);
        this.promocodeInput = CarbonObjects.BasketPage.promocodeInput(page);
        this.applyPromoocodeButton = CarbonObjects.BasketPage.applyPromoocodeButton(page);
    }

    // Concrete implementation for abstract dynamic locators
    deleteProductButton(productLink: string): Locator {
        return CarbonObjects.BasketPage.deleteProductButton(productLink)(this.page);
    }

    updateProductButton(productLink: string): Locator {
        // Provide a placeholder or implementation if needed
        return this.page.locator(''); // Placeholder
    }

    productBasketTotalString(productLink: string): Locator {
        return CarbonObjects.BasketPage.productBasketTotalString(productLink)(this.page);
    }

    // Override deleteProductFromBasket to use the product map for link and price
    async deleteProductFromBasket(product: Product) {
        await expect(this.basketTotalString).toBeVisible({timeout: 8000});
        this.basketTotal = +await this.basketTotalString.textContent(); // "+" turns string into number; Basket total
        let productTotalAmount: number = +await this.productBasketTotalString(product.link).textContent() // Total for a product
        await expect(this.deleteProductButton(product.link)).toBeVisible({timeout: 5000});
        await this.deleteProductButton(product.link).focus({timeout: 5000});
        await this.page.waitForTimeout(1000);
        await this.deleteProductButton(product.link).click();
        await this.page.waitForTimeout(1000);
        console.log(`Initial Basket Total: ${this.basketTotal}, Product Total to Delete: ${productTotalAmount}`);
        let expectedBasketTotalAmountAfterProductDeleted = this.basketTotal - productTotalAmount;
        let expectedBasketTotalAfterProductDeleted = expectedBasketTotalAmountAfterProductDeleted.toString();
        await expect(this.basketTotalString).toHaveText(expectedBasketTotalAfterProductDeleted);
    }
}