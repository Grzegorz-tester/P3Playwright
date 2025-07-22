import { expect, Locator, Page } from '@playwright/test';
import { AbstractHomePage } from '../../abstracts/AbstractHomePage';
import { CarbonObjects } from '../utils/objects';
import {Product} from "../utils/products/products";
import playwrightConfig from "../../playwright.config";

export class CarbonHomePage extends AbstractHomePage {
    readonly page: Page;
    readonly menuNavBar: Locator;
    readonly menuNavBarButton: Locator;
    readonly viewAllButton: Locator;
    readonly productsMenuItemButton: Locator;
    readonly brandBar: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.menuNavBar = CarbonObjects.HomePage.menuNavBar(page);
        this.menuNavBarButton = CarbonObjects.HomePage.menuNavBarButton(page);
        this.viewAllButton = CarbonObjects.HomePage.viewAllButton(page);
        this.productsMenuItemButton = CarbonObjects.HomePage.productsMenuItemButton(page)
        this.brandBar = CarbonObjects.HomePage.brandBar(page);
    }

    async chooseMenuCategory(product: Product): Promise<void> {
        const categoryLocator = CarbonObjects.HomePage.category(product.category)(this.page); // Get locator dynamically
        await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 });
        await this.menuNavBarButton.focus();
        await this.menuNavBarButton.click();
        await this.page.waitForLoadState('networkidle');
        await expect(this.productsMenuItemButton).toBeVisible({ timeout: 35000 });
        await this.productsMenuItemButton.focus();
        await this.page.waitForTimeout(1000);
        await this.productsMenuItemButton.click();
        await expect(categoryLocator).toBeVisible();
        await categoryLocator.click();
        console.log("Category opened successfully.")
    }

    async chooseAllProductsFromMenu(): Promise<void> {
        await expect(this.menuNavBarButton).toBeVisible({ timeout: 30000 });
        await this.menuNavBarButton.focus();
        await this.menuNavBarButton.click();
        await expect(this.productsMenuItemButton).toBeVisible({ timeout: 30000 });
        await this.productsMenuItemButton.focus();
        await this.productsMenuItemButton.click();
        if (await this.viewAllButton.isVisible({ timeout: 5000 })) {
            await this.viewAllButton.click();
        }
    }

    async validateHomePage(): Promise<void> {
        await expect(this.page).toHaveURL(new RegExp(`^${playwrightConfig.use.baseURL}/?$`));
    }
}