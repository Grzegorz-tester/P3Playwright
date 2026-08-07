import { Page } from '@playwright/test';
import { WarrantyRegistrationData } from '@utils/fakeData';

export abstract class ProductRegistrationPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // localePath matches the site's own locale segment, e.g. 'en-gb', 'de'.
    async navigateToProductRegistrationPage(localePath: string): Promise<void> {
        await this.page.goto(`/${localePath}/product-registration`, { timeout: 45000 });
        await this.page.waitForLoadState('networkidle');
    }

    abstract fillRegistrationForm(data: WarrantyRegistrationData): Promise<void>;

    abstract submitRegistrationForm(): Promise<void>;

    abstract isSubmitDisabled(): Promise<boolean>;

    abstract getSuccessMessage(): Promise<string>;
}
