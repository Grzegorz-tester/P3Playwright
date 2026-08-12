import { expect, Locator, Page } from '@playwright/test'
import { JTDoveObjects } from '../utils/objects'

// VERIFIED live (staging, 2026-08-11): /account/invoices - a real trade
// account's paginated order/invoice history (20 rows per page on the
// account used here, with further pages available via Next/Prev).
export class JTDoveInvoicesPage {

    readonly page: Page;
    readonly documentNumberFilter: Locator;
    readonly dateFilter: Locator;
    readonly statusFilterCombobox: Locator;
    readonly filterResetButton: Locator;
    readonly prevPageButton: Locator;
    readonly nextPageButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.documentNumberFilter = JTDoveObjects.InvoicesPage.documentNumberFilter(this.page);
        this.dateFilter = JTDoveObjects.InvoicesPage.dateFilter(this.page);
        this.statusFilterCombobox = JTDoveObjects.InvoicesPage.statusFilterCombobox(this.page);
        this.filterResetButton = JTDoveObjects.InvoicesPage.filterResetButton(this.page);
        this.prevPageButton = JTDoveObjects.InvoicesPage.prevPageButton(this.page);
        this.nextPageButton = JTDoveObjects.InvoicesPage.nextPageButton(this.page);
    }

    async navigateToInvoicesPage(): Promise<void> {
        await this.page.goto('/account/invoices', { timeout: 30000 })
    }

    async validateInvoicesPageLoaded(): Promise<void> {
        await expect(JTDoveObjects.InvoicesPage.rowByIndex(0)(this.page)).toBeVisible({ timeout: 20000 })
    }

    async getRowCount(): Promise<number> {
        return this.page.getByTestId(/^account-invoices-row-\d+$/).count()
    }

    async verifyRowHasAllColumns(index: number): Promise<void> {
        for (const cell of ['custReference', 'documentNumber', 'documentDate', 'dueDate', 'status', 'value', 'download']) {
            await expect(JTDoveObjects.InvoicesPage.cellByIndexAndName(index, cell)(this.page)).toBeVisible({ timeout: 10000 })
        }
    }

    // CONFIRMED live (staging, 2026-08-11): the filter is debounced -
    // right after fill(), the list can still briefly show the FULL
    // unfiltered set (count > 0 trivially, even before narrowing takes
    // effect), so a caller reading rows immediately after a weaker
    // "count > 0" wait can catch that stale window. Waiting for every
    // visible row to actually match is what's really needed.
    async filterByDocumentNumber(documentNumber: string): Promise<void> {
        await this.documentNumberFilter.fill(documentNumber)
        await expect(async () => {
            const numbers = await this.getAllDocumentNumbers()
            expect(numbers.length).toBeGreaterThan(0)
            for (const number of numbers) {
                expect(number).toBe(documentNumber)
            }
        }).toPass({ timeout: 10000 })
    }

    async getAllDocumentNumbers(): Promise<string[]> {
        const count = await this.getRowCount()
        const numbers: string[] = []
        for (let i = 0; i < count; i++) {
            numbers.push((await JTDoveObjects.InvoicesPage.cellByIndexAndName(i, 'documentNumber')(this.page).textContent()) ?? '')
        }
        return numbers
    }

    async filterByStatus(status: 'All' | 'Paid'): Promise<void> {
        await this.statusFilterCombobox.click()
        await JTDoveObjects.InvoicesPage.statusFilterOption(status)(this.page).click()
    }

    async getAllStatuses(): Promise<string[]> {
        const count = await this.getRowCount()
        const statuses: string[] = []
        for (let i = 0; i < count; i++) {
            statuses.push((await JTDoveObjects.InvoicesPage.cellByIndexAndName(i, 'status')(this.page).textContent()) ?? '')
        }
        return statuses
    }

    async resetFilters(): Promise<void> {
        await this.filterResetButton.click()
    }

    async verifyPrevDisabledOnFirstPage(): Promise<void> {
        await expect(this.prevPageButton).toBeDisabled({ timeout: 10000 })
    }

    async verifyNextEnabled(): Promise<void> {
        await expect(this.nextPageButton).toBeEnabled({ timeout: 10000 })
    }

    async goToNextPage(): Promise<void> {
        const firstDocNumberBefore = await JTDoveObjects.InvoicesPage.cellByIndexAndName(0, 'documentNumber')(this.page).textContent()
        await this.nextPageButton.click()
        await expect(async () => {
            const firstDocNumberAfter = await JTDoveObjects.InvoicesPage.cellByIndexAndName(0, 'documentNumber')(this.page).textContent()
            expect(firstDocNumberAfter).not.toBe(firstDocNumberBefore)
        }).toPass({ timeout: 10000 })
    }

    async getDownloadLinkForRow(index: number): Promise<Locator> {
        return JTDoveObjects.InvoicesPage.cellByIndexAndName(index, 'download')(this.page)
    }

    // CONFIRMED live (staging, 2026-08-11): the download control is a
    // plain clickable <div> wrapping an icon (the <svg> itself carries
    // role="img", not "button") - there is no button/link element to
    // find via getByRole, so this clicks the div directly.
    async clickDownloadForRow(index: number): Promise<void> {
        await JTDoveObjects.InvoicesPage.cellByIndexAndName(index, 'download')(this.page).locator('div').click()
    }
}
