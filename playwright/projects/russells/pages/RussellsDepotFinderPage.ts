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

    // CONFIRMED SITE BUG (staging, 2026-08-02, confirmed with the user -
    // this is NOT the PDP's separate Collection picker, which does show a
    // results list): searching /depot-finder never shows any dropdown/list
    // of matching results. Verified three independent ways during
    // investigation: no Google Places "pac-container"/"pac-item" ever
    // appears, no listbox/option role appears, and network inspection
    // shows the search only fires a GetViewportInfo geocode call that
    // recenters the map (see searchAndValidateMapRecenters above) - there
    // is no results-list endpoint or DOM update at all. This method
    // documents today's actual (broken) behaviour so the suite doesn't
    // silently start "passing" a feature that doesn't exist; flag to devs
    // under RUS-474 for a fix, at which point this test should be
    // rewritten to assert the dropdown DOES appear.
    async validateNoResultsDropdownAppears(location: string): Promise<void> {
        await this.searchInput.fill(location)
        await this.searchButton.click()
        await this.page.waitForTimeout(3000) // no network/DOM signal to await - see comment above
        const resultsDropdownCandidates = await this.page.locator(
            '.pac-container, [role="listbox"], [role="option"]'
        ).count()
        expect(resultsDropdownCandidates).toBe(0)
    }

    // VERIFIED live (staging, 2026-08-02): the map renders one pin marker
    // per depot. These markers are real DOM <button> elements (siblings of
    // the map's tile <iframe>, not inside it - likely an
    // @vis.gl/react-google-maps AdvancedMarker), but carry NO testid, id,
    // class or aria-label of their own (confirmed live) - there is no
    // stable attribute-based selector available. Counting by their known
    // rendered size (~30x40px, consistent across all of them) via
    // evaluate() is used here purely to READ/COUNT rendered markers, the
    // same way evaluate() is used elsewhere in this codebase to read data
    // out of markup that has no stable selector - NOT as a click target or
    // a replacement for a Playwright locator. TODO: RUS-474 - ask devs to
    // add a stable identifier (e.g. a testid or aria-label with the depot
    // name) to these marker buttons so this can become a real locator.
    async validateMapPinsRendered(expectedCount: number): Promise<void> {
        await expect(async () => {
            const pinCount = await this.page.evaluate(() => {
                return Array.from(document.querySelectorAll('button')).filter((button) => {
                    const rect = button.getBoundingClientRect()
                    return Math.abs(rect.width - 30) < 2 && Math.abs(rect.height - 40) < 2
                }).length
            })
            expect(pinCount).toBe(expectedCount)
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
