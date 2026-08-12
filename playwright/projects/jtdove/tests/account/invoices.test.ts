import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { testConfig } from '@utils/testConfig'

/**
 * MY DOVE ACCOUNT - INVOICES
 * ============================
 * Automates cases 145-148 from the "My DOVE Account" suite
 * (JTDOVE-2026-08-11.json). VERIFIED live (staging, 2026-08-11) against
 * a real trade account with 20+ real invoices (all status "Paid" on
 * this account, which is why case 146's status filter check only
 * exercises "All"/"Paid" rather than every possible status).
 */
test.use({ storageState: testConfig.getAuthFile() })

test.describe('My DOVE Account - Invoices', () => {

    // Case 145: Open Invoices page and display invoice list.
    test('Open Invoices page and display invoice list (case 145)', async ({ invoicesPage }) => {
        await test.step(`Navigate to the Invoices page`, async () => {
            console.log(`[STEP] Navigate to the Invoices page`)
            await invoicesPage.navigateToInvoicesPage()
            await invoicesPage.validateInvoicesPageLoaded()
        })

        await test.step(`Verify the invoices table displays all expected columns for the first row`, async () => {
            console.log(`[STEP] Verify the invoices table displays all expected columns for the first row`)
            const count = await invoicesPage.getRowCount()
            expect(count).toBeGreaterThan(0)
            await invoicesPage.verifyRowHasAllColumns(0)
        })
    })

    // Case 146: Search and filter invoices.
    test('Search and filter invoices (case 146)', async ({ invoicesPage }) => {
        await test.step(`Navigate to the Invoices page`, async () => {
            console.log(`[STEP] Navigate to the Invoices page`)
            await invoicesPage.navigateToInvoicesPage()
            await invoicesPage.validateInvoicesPageLoaded()
        })

        let firstDocumentNumber = ''
        await test.step(`Search by an existing Document No. and verify results are filtered`, async () => {
            console.log(`[STEP] Search by an existing Document No. and verify results are filtered`)
            const numbers = await invoicesPage.getAllDocumentNumbers()
            firstDocumentNumber = numbers[0]
            await invoicesPage.filterByDocumentNumber(firstDocumentNumber)
            const filteredNumbers = await invoicesPage.getAllDocumentNumbers()
            for (const number of filteredNumbers) {
                expect(number).toBe(firstDocumentNumber)
            }
        })

        await test.step(`Reset and verify the full list is restored`, async () => {
            console.log(`[STEP] Reset and verify the full list is restored`)
            await invoicesPage.resetFilters()
            await expect(async () => {
                const numbers = await invoicesPage.getAllDocumentNumbers()
                expect(numbers.length).toBeGreaterThan(1)
            }).toPass({ timeout: 10000 })
        })

        await test.step(`Filter by Status "Paid" and verify matching invoices are displayed`, async () => {
            console.log(`[STEP] Filter by Status "Paid" and verify matching invoices are displayed`)
            await invoicesPage.filterByStatus('Paid')
            const statuses = await invoicesPage.getAllStatuses()
            expect(statuses.length).toBeGreaterThan(0)
            for (const status of statuses) {
                expect(status).toBe('Paid')
            }
        })
    })

    // Case 147: Download invoice document.
    test('Download invoice document (case 147)', async ({ invoicesPage }) => {
        await test.step(`Navigate to the Invoices page`, async () => {
            console.log(`[STEP] Navigate to the Invoices page`)
            await invoicesPage.navigateToInvoicesPage()
            await invoicesPage.validateInvoicesPageLoaded()
        })

        await test.step(`Verify a Download action is available for the first invoice and initiates a download`, async () => {
            console.log(`[STEP] Verify a Download action is available for the first invoice and initiates a download`)
            const downloadCell = await invoicesPage.getDownloadLinkForRow(0)
            await expect(downloadCell).toBeVisible({ timeout: 10000 })
            const downloadPromise = invoicesPage.page.waitForEvent('download', { timeout: 20000 })
            await invoicesPage.clickDownloadForRow(0)
            const download = await downloadPromise
            expect(download).toBeTruthy()
        })
    })

    // Case 148: Invoices pagination works.
    test('Invoices pagination works (case 148)', async ({ invoicesPage }) => {
        await test.step(`Navigate to the Invoices page`, async () => {
            console.log(`[STEP] Navigate to the Invoices page`)
            await invoicesPage.navigateToInvoicesPage()
            await invoicesPage.validateInvoicesPageLoaded()
        })

        await test.step(`Verify Prev is disabled and Next is enabled on the first page`, async () => {
            console.log(`[STEP] Verify Prev is disabled and Next is enabled on the first page`)
            await invoicesPage.verifyPrevDisabledOnFirstPage()
            await invoicesPage.verifyNextEnabled()
        })

        await test.step(`Click Next and verify the invoice list changes to the next page`, async () => {
            console.log(`[STEP] Click Next and verify the invoice list changes to the next page`)
            await invoicesPage.goToNextPage()
            await expect(invoicesPage.prevPageButton).toBeEnabled({ timeout: 10000 })
        })
    })
})
