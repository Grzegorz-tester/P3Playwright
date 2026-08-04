import test from '../../utils/Pages'
import { expect } from '@playwright/test'
import { products } from '../../utils/products/products'

/**
 * VAT TOGGLE
 * ==========
 * Covers: the header's global "Incl./Excl. VAT" switch (present on every
 * page - home, PDP, PLP, search) and that flipping it is actually
 * reflected in the prices shown on the PDP, a category PLP, and the
 * header's live search-results dropdown.
 *
 * VERIFIED live (staging, 2026-08-02): the switch's own visible label
 * always reads "Incl. VAT" regardless of which state is currently active
 * - it names what the toggle does, not the current state - so state is
 * only observable via the underlying checkbox (switch__checkbox) or, on
 * the PDP, a "tax-message" label next to the price itself. The
 * preference persists across navigation (cookie/localStorage), and VAT
 * is 20% (a £9.20 Excl. VAT PDP price became £11.04 Incl. VAT; a £171.92
 * PLP price became £206.30) - each test below tolerates rounding rather
 * than assuming an exact ratio.
 */
const VAT_RATE = 1.2
const ROUNDING_TOLERANCE = 0.02

test.describe('VAT Toggle', () => {
    test('PDP price and VAT label reflect the header VAT toggle', async ({
        page,
        homePage,
        productDetailPage,
    }) => {
        await test.step(`Navigate to a PDP`, async () => {
            console.log(`[STEP] Navigate to a PDP`)
            await page.goto(products.ROLLER_FOR_CNH.link)
            await productDetailPage.validatePDPLoaded()
        })

        let exclVat: { price: number, vatLabel: string }

        await test.step(`Set VAT display to Excl. VAT and capture the price`, async () => {
            console.log(`[STEP] Set VAT display to Excl. VAT and capture the price`)
            await homePage.setVatIncluded(false)
            exclVat = await productDetailPage.getPriceValueAndVatLabel()
            expect(exclVat.vatLabel).toBe('Excl. VAT')
        })

        await test.step(`Toggle VAT display to Incl. VAT and validate the price updates`, async () => {
            console.log(`[STEP] Toggle VAT display to Incl. VAT and validate the price updates`)
            await homePage.setVatIncluded(true)
            const inclVat = await productDetailPage.getPriceValueAndVatLabel()
            expect(inclVat.vatLabel).toBe('Incl. VAT')
            expect(inclVat.price).toBeGreaterThan(exclVat.price)
            expect(Math.abs(inclVat.price - exclVat.price * VAT_RATE)).toBeLessThan(ROUNDING_TOLERANCE)
        })
    })

    test('PLP price reflects the header VAT toggle', async ({
        page,
        homePage,
        productListPage,
    }) => {
        await test.step(`Navigate to a category PLP`, async () => {
            console.log(`[STEP] Navigate to a category PLP`)
            await page.goto('/category/general-parts-pto-driveline-components')
            await productListPage.validatePLPLoaded()
        })

        let exclVatPrice: number

        await test.step(`Set VAT display to Excl. VAT and capture the first card's price`, async () => {
            console.log(`[STEP] Set VAT display to Excl. VAT and capture the first card's price`)
            await homePage.setVatIncluded(false)
            exclVatPrice = await productListPage.getFirstCardPriceValue()
        })

        await test.step(`Toggle VAT display to Incl. VAT and validate the price updates`, async () => {
            console.log(`[STEP] Toggle VAT display to Incl. VAT and validate the price updates`)
            await homePage.setVatIncluded(true)
            await expect(async () => {
                const inclVatPrice = await productListPage.getFirstCardPriceValue()
                expect(Math.abs(inclVatPrice - exclVatPrice * VAT_RATE)).toBeLessThan(ROUNDING_TOLERANCE)
            }).toPass({ timeout: 15000 })
        })
    })

    test('Search results dropdown price reflects the header VAT toggle', async ({
        homePage,
    }) => {
        const query = 'bearing'

        await test.step(`Navigate to Home Page`, async () => {
            console.log(`[STEP] Navigate to Home Page`)
            await homePage.navigateToHomePage()
        })

        let exclVatPrice: number

        await test.step(`Set VAT display to Excl. VAT and search`, async () => {
            console.log(`[STEP] Set VAT display to Excl. VAT and search`)
            await homePage.setVatIncluded(false)
            await homePage.searchInline(query)
            await homePage.validateSearchResultsMatch(query)
            exclVatPrice = await homePage.getFirstSearchHitPriceValue()
        })

        await test.step(`Re-navigate Home (closing the dropdown), toggle VAT display to Incl. VAT and search again`, async () => {
            // The open results dropdown overlays the header and intercepts
            // clicks meant for the VAT switch underneath it (confirmed
            // live) - a fresh navigation closes it before toggling, rather
            // than fighting the overlay.
            console.log(`[STEP] Re-navigate Home (closing the dropdown), toggle VAT display to Incl. VAT and search again`)
            await homePage.navigateToHomePage()
            await homePage.setVatIncluded(true)
            await homePage.searchInline(query)
            await homePage.validateSearchResultsMatch(query)
        })

        await test.step(`Validate the dropdown price updated`, async () => {
            console.log(`[STEP] Validate the dropdown price updated`)
            const inclVatPrice = await homePage.getFirstSearchHitPriceValue()
            expect(Math.abs(inclVatPrice - exclVatPrice * VAT_RATE)).toBeLessThan(ROUNDING_TOLERANCE)
        })
    })
})
