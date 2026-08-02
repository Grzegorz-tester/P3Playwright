import { expect, Page } from '@playwright/test'
import { RussellsObjects } from '../utils/objects'

/**
 * The "Quick Parts Finder" cascading machine type -> brand -> model
 * widget, present on multiple category hub pages (e.g. /agriculture,
 * /groundcare) and submitting to /parts-finder. Doesn't extend a shared
 * abstract page: this widget isn't part of the cross-project
 * HomePage/ProductListPage/etc. contracts, and it isn't tied to one
 * specific page - the same widget instance also reappears on its own
 * results page to let the user refine their selection there.
 */
export class RussellsPartsFinderPage {

    readonly page: Page;
    readonly wrapper: ReturnType<typeof RussellsObjects.PartsFinderWidget.wrapper>;
    readonly machineTypeButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.machineTypeButton>;
    readonly brandButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.brandButton>;
    readonly modelButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.modelButton>;
    readonly searchButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.searchButton>;
    readonly dialog: ReturnType<typeof RussellsObjects.PartsFinderWidget.dialog>;
    readonly dialogSearchInput: ReturnType<typeof RussellsObjects.PartsFinderWidget.dialogSearchInput>;
    readonly dialogOptions: ReturnType<typeof RussellsObjects.PartsFinderWidget.dialogOptions>;
    readonly resultsBanner: ReturnType<typeof RussellsObjects.PartsFinderWidget.resultsBanner>;
    readonly changeVehicleButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.changeVehicleButton>;

    constructor(page: Page) {
        this.page = page;
        this.wrapper = RussellsObjects.PartsFinderWidget.wrapper(this.page);
        this.machineTypeButton = RussellsObjects.PartsFinderWidget.machineTypeButton(this.page);
        this.brandButton = RussellsObjects.PartsFinderWidget.brandButton(this.page);
        this.modelButton = RussellsObjects.PartsFinderWidget.modelButton(this.page);
        this.searchButton = RussellsObjects.PartsFinderWidget.searchButton(this.page);
        this.dialog = RussellsObjects.PartsFinderWidget.dialog(this.page);
        this.dialogSearchInput = RussellsObjects.PartsFinderWidget.dialogSearchInput(this.page);
        this.dialogOptions = RussellsObjects.PartsFinderWidget.dialogOptions(this.page);
        this.resultsBanner = RussellsObjects.PartsFinderWidget.resultsBanner(this.page);
        this.changeVehicleButton = RussellsObjects.PartsFinderWidget.changeVehicleButton(this.page);
    }

    // VERIFIED live (staging, 2026-08-02): only "Select machine type" is
    // enabled until a machine type is chosen - brand, model and Search
    // parts all start disabled.
    async validateInitialState(): Promise<void> {
        await expect(this.machineTypeButton).toBeEnabled({ timeout: 20000 })
        await expect(this.brandButton).toBeDisabled()
        await expect(this.modelButton).toBeDisabled()
        await expect(this.searchButton).toBeDisabled()
    }

    private async selectFromDialog(triggerButton: ReturnType<typeof RussellsObjects.PartsFinderWidget.machineTypeButton>, value: string): Promise<void> {
        await triggerButton.click()
        await expect(this.dialog).toBeVisible({ timeout: 15000 })
        await RussellsObjects.PartsFinderWidget.dialogOptionFiltered(value)(this.page).click()
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
    }

    // VERIFIED live (staging, 2026-08-02): selecting a machine type
    // enables BOTH brand and model at once (not strictly sequential) -
    // Search parts stays disabled until all three are chosen.
    async selectMachineType(value: string): Promise<void> {
        await this.selectFromDialog(this.machineTypeButton, value)
        await expect(this.brandButton).toBeEnabled({ timeout: 15000 })
        await expect(this.modelButton).toBeEnabled({ timeout: 15000 })
        await expect(this.searchButton).toBeDisabled()
    }

    // VERIFIED live (staging, 2026-08-02): the brand list is genuinely
    // filtered by machine type, not just enabled the same regardless -
    // e.g. TRACTOR offers 39 brands, COMBINE offers 11, and the two sets
    // differ (confirmed via New Holland present in both, MacDon present
    // only for COMBINE).
    // CONFIRMED live (staging, 2026-08-02): the dialog shell becomes
    // visible before its options are actually populated for a machine
    // type queried for the first time (reproducible even running a
    // single test alone, not a parallel-load artifact) - waiting on the
    // dialog's own visibility isn't enough; wait for at least one real
    // option too.
    async getBrandOptionValues(): Promise<string[]> {
        await this.brandButton.click()
        await expect(this.dialog).toBeVisible({ timeout: 15000 })
        await expect(this.dialogOptions.first()).toBeVisible({ timeout: 15000 })
        const values = await this.dialogOptions.evaluateAll((els) => els.map((el) => el.getAttribute('data-value') ?? ''))
        await this.page.keyboard.press('Escape')
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
        return values
    }

    async selectBrand(value: string): Promise<void> {
        await this.selectFromDialog(this.brandButton, value)
    }

    // VERIFIED live (staging, 2026-08-02): typing a substring that
    // matches no model shows the same "No results found." empty state
    // used by other search/filter inputs across this site (Depot Finder,
    // Account Wishlists list). Closes the dialog afterwards without
    // selecting anything, via Escape (confirmed live: doesn't submit or
    // clear the OTHER already-made selections).
    async validateModelSearchShowsNoResults(searchTerm: string): Promise<void> {
        await this.modelButton.click()
        await expect(this.dialog).toBeVisible({ timeout: 15000 })
        await this.dialogSearchInput.fill(searchTerm)
        await expect(this.dialog).toContainText('No results found.', { timeout: 10000 })
        await this.page.keyboard.press('Escape')
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
    }

    // Selecting a model is the step that finally enables Search parts -
    // the model list is searched (VERIFIED live: it's a real live filter,
    // not a static list) since it's the largest list by far (3000+
    // entries for a single brand). CONFIRMED live, 2026-08-02: under
    // 4-way parallel load, Search parts' enabled state visibly lagged
    // behind the model selection by more than 15s (never reproduced
    // running alone or under 1 worker) - a generous timeout rather than
    // the tight one used elsewhere, matching the same contention-under-
    // parallel-load pattern already accepted for login in this project.
    async searchAndSelectModel(searchTerm: string, value: string): Promise<void> {
        await this.modelButton.click()
        await expect(this.dialog).toBeVisible({ timeout: 15000 })
        await this.dialogSearchInput.fill(searchTerm)
        const option = RussellsObjects.PartsFinderWidget.dialogOptionFiltered(value)(this.page)
        await expect(option).toBeVisible({ timeout: 15000 })
        await option.click()
        await expect(this.dialog).toBeHidden({ timeout: 15000 })
        await expect(this.searchButton).toBeEnabled({ timeout: 45000 })
    }

    // VERIFIED live (staging, 2026-08-02): the selection is pure
    // client-side state, NOT reflected in the URL or persisted via
    // cookie - /parts-finder lands on a bare URL with no query string,
    // and navigating there directly (bypassing this widget) shows ALL
    // products unfiltered rather than the previous selection. Tests must
    // always drive the widget itself, never assume a direct
    // /parts-finder visit will be pre-filtered.
    async submitSearch(): Promise<void> {
        await this.searchButton.click()
        await this.page.waitForURL(/\/parts-finder$/, { timeout: 30000 })
    }

    async validateResultsBannerShows(machineType: string, brand: string, model: string): Promise<void> {
        await expect(this.resultsBanner).toContainText('Showing results for', { timeout: 20000 })
        await expect(this.resultsBanner).toContainText(`Machine Type: ${machineType}`)
        await expect(this.resultsBanner).toContainText(`Brand: ${brand}`)
        await expect(this.resultsBanner).toContainText(`Model: ${model}`)
    }

    // CONFIRMED live (staging, 2026-08-02): clicking "Change Vehicle"
    // does NOT reset or reopen anything - the widget's own buttons still
    // show the previous selection unchanged afterwards. The real way to
    // change the vehicle is to click the widget's own machine
    // type/brand/model buttons directly (still present on this results
    // page) and submit again - this method only confirms that much, not
    // that the button itself does something.
    async validateChangeVehicleButtonDoesNotResetSelection(): Promise<void> {
        const before = await this.wrapper.locator('button').allTextContents()
        await this.changeVehicleButton.click()
        const after = await this.wrapper.locator('button').allTextContents()
        expect(after).toEqual(before)
    }
}
