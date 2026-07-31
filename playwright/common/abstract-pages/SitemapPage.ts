import { Page, Response } from '@playwright/test';

export type SitemapCategory = 'products' | 'categories' | 'content' | 'locations' | 'product images';

export abstract class SitemapPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async navigateToSitemapPage(): Promise<void> {
        await this.page.goto('/sitemap', { timeout: 45000 });
    }

    abstract openCategory(category: SitemapCategory): Promise<void>;

    abstract clickFirstCategoryItem(): Promise<Response | null>;
}
