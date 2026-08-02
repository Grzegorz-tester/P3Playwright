import { expect, Page } from '@playwright/test'
import { RussellsObjects } from '../utils/objects'

/**
 * The standalone /depot-finder store locator — distinct from the PDP's
 * "Collection" depot picker (see RussellsPDPage), which is a separate
 * component with its own search. Doesn't extend a shared abstract page:
 * this store-locator feature isn't part of the cross-project HomePage/
 * AccountPage/etc. contracts.
 */
export class RussellsDepotFinderPage {

    readonly page: Page;
    readonly heading: ReturnType<typeof RussellsObjects.DepotFinderPage.heading>;
    readonly searchInput: ReturnType<typeof RussellsObjects.DepotFinderPage.searchInput>;
    readonly searchButton: ReturnType<typeof RussellsObjects.DepotFinderPage.searchButton>;
    readonly openInGoogleMapsLink: ReturnType<typeof RussellsObjects.DepotFinderPage.openInGoogleMapsLink>;
    readonly allDepotsHeading: ReturnType<typeof RussellsObjects.DepotFinderPage.allDepotsHeading>;
    readonly depotLinks: ReturnType<typeof RussellsObjects.DepotFinderPage.depotLinks>;
    readonly branchHeading: ReturnType<typeof RussellsObjects.DepotFinderPage.branchHeading>;
    readonly branchAddress: ReturnType<typeof RussellsObjects.DepotFinderPage.branchAddress>;
    readonly branchTelephone: ReturnType<typeof RussellsObjects.DepotFinderPage.branchTelephone>;
    readonly branchEmail: ReturnType<typeof RussellsObjects.DepotFinderPage.branchEmail>;
    readonly branchBackToSearch: ReturnType<typeof RussellsObjects.DepotFinderPage.branchBackToSearch>;
    readonly branchGetDirectionsLink: ReturnType<typeof RussellsObjects.DepotFinderPage.branchGetDirectionsLink>;

    constructor(page: Page) {
        this.page = page;
        this.heading = RussellsObjects.DepotFinderPage.heading(this.page);
        this.searchInput = RussellsObjects.DepotFinderPage.searchInput(this.page);
        this.searchButton = RussellsObjects.DepotFinderPage.searchButton(this.page);
        this.openInGoogleMapsLink = RussellsObjects.DepotFinderPage.openInGoogleMapsLink(this.page);
        this.allDepotsHeading = RussellsObjects.DepotFinderPage.allDepotsHeading(this.page);
        this.depotLinks = RussellsObjects.DepotFinderPage.depotLinks(this.page);
        this.branchHeading = RussellsObjects.DepotFinderPage.branchHeading(this.page);
        this.branchAddress = RussellsObjects.DepotFinderPage.branchAddress(this.page);
        this.branchTelephone = RussellsObjects.DepotFinderPage.branchTelephone(this.page);
        this.branchEmail = RussellsObjects.DepotFinderPage.branchEmail(this.page);
        this.branchBackToSearch = RussellsObjects.DepotFinderPage.branchBackToSearch(this.page);
        this.branchGetDirectionsLink = RussellsObjects.DepotFinderPage.branchGetDirectionsLink(this.page);
    }

    async navigateToDepotFinder(): Promise<void> {
        await this.page.goto('/depot-finder', { timeout: 45000 })
        await expect(this.heading).toBeVisible({ timeout: 30000 })
    }

    async validateAllDepotsListed(): Promise<void> {
        await expect(this.allDepotsHeading).toHaveText('All Depots')
        await expect(this.depotLinks.first()).toBeVisible({ timeout: 15000 })
        expect(await this.depotLinks.count()).toBeGreaterThan(0)
    }

    // VERIFIED live (staging, 2026-08-02): searching recenters/zooms the
    // map to the location — confirmed via the "Open in Google Maps" link's
    // own coordinates changing. The depot list is unaffected by design
    // (always all depots, alphabetically) — see objects.ts note.
    async searchAndValidateMapRecenters(location: string): Promise<void> {
        const hrefBefore = await this.openInGoogleMapsLink.getAttribute('href')
        await this.searchInput.fill(location)
        await this.searchButton.click()
        await expect(async () => {
            const hrefAfter = await this.openInGoogleMapsLink.getAttribute('href')
            expect(hrefAfter).not.toBe(hrefBefore)
        }).toPass({ timeout: 15000 })
    }

    // Returns the clicked depot's name so the caller can verify the detail
    // page reached afterwards shows the same depot.
    async clickFirstDepot(): Promise<string> {
        const firstDepot = this.depotLinks.first()
        const depotName = (await firstDepot.textContent())?.trim() ?? ''
        expect(depotName).not.toBe('')
        await firstDepot.click()
        await expect(this.page).toHaveURL(/\/depot-finder\/[a-z-]+$/, { timeout: 20000 })
        return depotName
    }

    // VERIFIED live (staging, 2026-08-02): heading, address, telephone,
    // email and opening hours are all populated on a real depot page.
    async validateBranchDetailsPage(expectedName: string): Promise<void> {
        await expect(this.branchHeading).toHaveText(expectedName, { timeout: 20000 })
        await expect(this.branchAddress).not.toBeEmpty()
        await expect(this.branchTelephone).not.toBeEmpty()
        await expect(this.branchEmail).not.toBeEmpty()
        await expect(RussellsObjects.DepotFinderPage.branchOpeningHours('monday')(this.page)).not.toBeEmpty()
        await expect(this.branchGetDirectionsLink).toHaveAttribute('href', /google\.com\/maps\/dir/)
    }

    // VERIFIED live: a <p>, not a link — navigates back to /depot-finder
    // via an onclick handler, not an href.
    async clickBackToSearch(): Promise<void> {
        await this.branchBackToSearch.click()
        await expect(this.page).toHaveURL(/\/depot-finder$/, { timeout: 20000 })
    }
}
