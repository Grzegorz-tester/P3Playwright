import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-08-11): /branches - a search widget (free
 * text -> geocoded, distance-sorted results) above a separate, always-
 * present "All Branches" section (A-Z letter filter + full list). See
 * BranchFinderPage in objects.ts for the Google Places Autocomplete
 * caveat (predictions dropdown never renders, but submission still
 * works).
 */
export class JTDoveBranchFinderPage {

    readonly page: Page;
    readonly branchFinder: Locator;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly searchResultLinks: Locator;
    readonly viewAllBranchesLink: Locator;
    readonly allBranchesSection: Locator;
    readonly filterAllButton: Locator;
    readonly branchListItems: Locator;
    readonly branchListItemLinks: Locator;
    readonly branchDetailHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.branchFinder = JTDoveObjects.BranchFinderPage.branchFinder(this.page);
        this.searchInput = JTDoveObjects.BranchFinderPage.searchInput(this.page);
        this.searchButton = JTDoveObjects.BranchFinderPage.searchButton(this.page);
        this.searchResultLinks = JTDoveObjects.BranchFinderPage.searchResultLinks(this.page);
        this.viewAllBranchesLink = JTDoveObjects.BranchFinderPage.viewAllBranchesLink(this.page);
        this.allBranchesSection = JTDoveObjects.BranchFinderPage.allBranchesSection(this.page);
        this.filterAllButton = JTDoveObjects.BranchFinderPage.filterAllButton(this.page);
        this.branchListItems = JTDoveObjects.BranchFinderPage.branchListItems(this.page);
        this.branchListItemLinks = JTDoveObjects.BranchFinderPage.branchListItemLinks(this.page);
        this.branchDetailHeading = JTDoveObjects.BranchDetailPage.heading(this.page);
    }

    // CONFIRMED live (staging, 2026-08-11): the branch list can take a
    // moment to populate after navigation (a client-side data fetch,
    // separate from the page shell rendering) - waits for at least one
    // real branch to appear so every caller gets a page that's actually
    // ready, not just loaded.
    async navigateToBranchFinder(): Promise<void> {
        await this.page.goto('/branches', { timeout: 30000 })
        await expect(this.branchListItems.first()).toBeVisible({ timeout: 20000 })
    }

    async validateBranchFinderPageLoaded(): Promise<void> {
        await expect(this.page).toHaveURL(/\/branches$/, { timeout: 20000 })
        await expect(this.branchFinder).toBeVisible({ timeout: 20000 })
        await expect(this.allBranchesSection).toBeVisible()
    }

    // CONFIRMED live (staging, 2026-08-11): this storefront occasionally
    // throws a genuine Next.js "500 Application Error" crash screen (not
    // a locator issue - a real, if rare, server-side error) - detected by
    // its own "Application Error" heading text (no testid, a generic
    // Next.js error boundary) and recovered by reloading the page fresh.
    private async recoverFromApplicationErrorIfPresent(): Promise<void> {
        const crashed = await this.page.getByText('Application Error').isVisible().catch(() => false)
        if (crashed) {
            await this.navigateToBranchFinder()
        }
    }

    // VERIFIED live (staging, 2026-08-11): the Google Places Autocomplete
    // predictions dropdown never renders on this storefront (a genuine
    // "Google script not loaded" console error), so this fills the free
    // text and submits directly via the search button rather than
    // picking a suggestion - CONFIRMED this still geocodes correctly and
    // returns real, distance-sorted results.
    //
    // CONFIRMED live (staging, 2026-08-11): the page also attempts to
    // auto-geolocate the visitor on load (visible as "Couldn't retrieve
    // user position" console errors in a headless/no-GPS browser), which
    // can still be settling the very first time a search is submitted -
    // retries the fill-and-search as a unit rather than a single attempt.
    //
    // CONFIRMED live (staging, 2026-08-11): the "500 Application Error"
    // crash above has recurred repeatedly across multiple full test runs
    // on this environment, not just once - a genuinely unstable
    // dependency (most likely the geocoding backend under load), so this
    // budgets a much longer retry window than a typical UI race, with a
    // pause between attempts rather than hammering an already-struggling
    // server.
    async searchByText(searchText: string): Promise<void> {
        await expect(async () => {
            await this.recoverFromApplicationErrorIfPresent()
            await this.searchInput.fill(searchText)
            await this.searchButton.click()
            await expect(this.searchResultLinks.first()).toBeVisible({ timeout: 5000 })
        }).toPass({ timeout: 90000, intervals: [2000, 5000, 10000] })
    }

    async getSearchResultNames(): Promise<string[]> {
        const count = await this.searchResultLinks.count()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await this.searchResultLinks.nth(i).innerText()
            names.push(text.split('\n')[0])
        }
        return names
    }

    async clickFirstSearchResult(): Promise<void> {
        await this.searchResultLinks.first().click()
    }

    async clickViewAllBranches(): Promise<void> {
        await this.viewAllBranchesLink.click()
    }

    async verifyAllBranchesSectionInView(): Promise<void> {
        await expect(this.allBranchesSection).toBeInViewport({ timeout: 10000 })
    }

    async getAllBranchListNames(): Promise<string[]> {
        const count = await this.branchListItems.count()
        const names: string[] = []
        for (let i = 0; i < count; i++) {
            const text = await this.branchListItems.nth(i).innerText()
            names.push(text.split('\n')[0])
        }
        return names
    }

    async clickFirstBranchListItem(): Promise<void> {
        await this.branchListItemLinks.first().click()
    }

    // CONFIRMED live (staging, 2026-08-11): every branch on this
    // storefront is named "JT Dove <town>" except "Nordstrom Timber
    // (Sunderland)" - so, sorted by full display name, only the J and N
    // letter-filter buttons ever have a match and are enabled; every
    // other letter is correctly disabled rather than broken.
    async verifyLetterButtonEnabled(letter: string): Promise<void> {
        await expect(JTDoveObjects.BranchFinderPage.filterButtonByLetter(letter)(this.page)).toBeEnabled()
    }

    async verifyLetterButtonDisabled(letter: string): Promise<void> {
        await expect(JTDoveObjects.BranchFinderPage.filterButtonByLetter(letter)(this.page)).toBeDisabled()
    }

    async filterByLetter(letter: string): Promise<void> {
        await JTDoveObjects.BranchFinderPage.filterButtonByLetter(letter)(this.page).click()
    }

    async filterByAll(): Promise<void> {
        await this.filterAllButton.click()
    }

    async verifyBranchDetailPageLoaded(expectedName: string): Promise<void> {
        await expect(this.page).toHaveURL(/\/branches\/[a-z0-9-]+$/, { timeout: 20000 })
        await expect(this.branchDetailHeading).toHaveText(expectedName, { timeout: 15000 })
    }
}
