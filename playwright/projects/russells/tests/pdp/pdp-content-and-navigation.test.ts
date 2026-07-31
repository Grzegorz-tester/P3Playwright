import test from '../../utils/Pages'

/**
 * PDP CONTENT AND NAVIGATION
 * ===========================
 * Covers: product info (name/SKU/price) loads, the accordion's single-open
 * behaviour, and the image thumbnail carousel's Previous/Next navigation —
 * confirmed present on a simple (non-bundle) product PDP.
 *
 * VERIFIED live (staging, 2026-07-31) on /products/roller-for-cnh-nh-92087109:
 * - Accordion sections are content-dependent per product (this one has
 *   just Specifications and Delivery Information, neither expanded by
 *   default — a DIFFERENT product checked earlier had 3 sections with the
 *   first expanded) - the single-open toggle itself is the stable thing
 *   asserted, not any specific starting state.
 * - Previous is disabled until Next is clicked once, then both are
 *   enabled.
 *
 * No FAQ accordion, feature carousel, comparison table, image zoom, or
 * configurator was found on any product checked so far (several
 * categories sampled) - those Insinkerator PDP features don't have a
 * confirmed equivalent on this storefront yet, see RUS-474.
 */
test.describe('PDP Content and Navigation', () => {
    test('User can view product info, toggle the accordion, and browse thumbnails', async ({
        page,
        productDetailPage,
    }) => {
        await test.step(`Navigate to a product PDP`, async () => {
            console.log(`[STEP] Navigate to a product PDP`)
            await page.goto('/products/roller-for-cnh-nh-92087109')
            await productDetailPage.validatePDPLoaded()
        })

        await test.step(`Validate the accordion's single-open behaviour`, async () => {
            console.log(`[STEP] Validate the accordion's single-open behaviour`)
            await productDetailPage.validateAccordionSingleOpenBehaviour()
        })

        await test.step(`Validate the thumbnail carousel navigation`, async () => {
            console.log(`[STEP] Validate the thumbnail carousel navigation`)
            await productDetailPage.validateThumbnailCarouselNavigation()
        })
    })
})
