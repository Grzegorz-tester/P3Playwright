import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * PDP CONTENT & NAVIGATION (Standard 460, Portugal)
 * ==================================================
 * Covers: the Overview/Features/Specifications/Downloads accordion and
 * the separate FAQs accordion (both single-open behaviour), the
 * Comparison Table's "View Product" links (navigate to the correct
 * sibling PDP), the Product Features carousel, and the image zoom
 * lightbox opening.
 *
 * VERIFIED live (staging, 2026-07-22) on /products/standard-460, a
 * configurable-bundle PDP already covered for its configurator/basket
 * behaviour by product-configurator.test.ts. This spec covers the rest
 * of that same PDP's content and navigation surface.
 *
 * CORRECTED: the Product Features carousel was earlier (wrongly) flagged
 * as unreliable. It isn't - whether "next" should be enabled depends on
 * whether the carousel's content actually overflows at the CURRENT
 * viewport. At wide viewports (this project's own `Chrome` test config
 * included, 2560x1440) all 3 features fit with no overflow, and BOTH
 * buttons being disabled is the correct state. At narrower viewports
 * where real overflow exists (this project's `chromium` config, 1280x720)
 * the carousel is genuinely functional. See
 * InsinkeratorPDPage.validateFeaturesCarouselNavigation(), which checks
 * the real scroll state and asserts whichever behaviour is actually
 * correct for it.
 *
 * CORRECTED (staging, 2026-07-31): the image zoom lightbox opens
 * reliably (still working around a real sticky-header z-index bug with
 * force:true). Closing it was previously confirmed unreliable via any
 * method - retested live and its own "Minimize image" button now closes
 * it reliably with a genuine (non-forced) click. Both opening and closing
 * are now tested - see InsinkeratorPDPage.openImageZoom() /
 * closeImageZoom().
 */
test.describe('PDP Content & Navigation (Portugal)', () => {
    test.beforeEach(async ({ page, homePage }) => {
        await test.step(`Navigate to Home Page, dismiss the country modal, then go to the Standard 460 PDP`, async () => {
            console.log(`[STEP] Navigate to Home Page, dismiss the country modal, then go to the Standard 460 PDP`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
            await page.goto('/products/standard-460')
        })
    })

    test('Overview/Features/Specifications/Downloads accordion allows only one section open at a time', async ({
        productDetailPage,
    }) => {
        await test.step(`Validate single-open accordion behaviour`, async () => {
            console.log(`[STEP] Validate single-open accordion behaviour`)
            await productDetailPage.validateAccordionSingleOpenBehaviour()
        })
    })

    test('FAQ accordion allows only one question open at a time', async ({
        productDetailPage,
    }) => {
        await test.step(`Validate single-open FAQ accordion behaviour`, async () => {
            console.log(`[STEP] Validate single-open FAQ accordion behaviour`)
            await productDetailPage.validateFaqAccordionSingleOpenBehaviour()
        })
    })

    test('Comparison table "View Product" link navigates to the correct PDP', async ({
        page,
        productDetailPage,
    }) => {
        let target: { href: string, name: string }

        await test.step(`Pick a different product from the comparison table`, async () => {
            console.log(`[STEP] Pick a different product from the comparison table`)
            const currentHref = new URL(page.url()).pathname
            const others = await productDetailPage.getOtherComparisonTableProducts(currentHref)
            target = others[0]
        })

        await test.step(`Click "View Product" and verify the correct PDP loads`, async () => {
            console.log(`[STEP] Click "View Product" and verify the correct PDP loads`)
            await productDetailPage.clickComparisonTableViewProduct(target.href)
            await productDetailPage.validateProductNameMatches(target.name)
        })
    })

    test('Product Features carousel navigation behaves correctly for the current viewport', async ({
        productDetailPage,
    }) => {
        await test.step(`Validate carousel navigation matches the current overflow state`, async () => {
            console.log(`[STEP] Validate carousel navigation matches the current overflow state`)
            await productDetailPage.validateFeaturesCarouselNavigation()
        })
    })

    test('Expand image opens and closes the zoom lightbox', async ({
        productDetailPage,
    }) => {
        await test.step(`Open the image zoom lightbox`, async () => {
            console.log(`[STEP] Open the image zoom lightbox`)
            await productDetailPage.openImageZoom()
        })

        await test.step(`Close the image zoom lightbox`, async () => {
            console.log(`[STEP] Close the image zoom lightbox`)
            await productDetailPage.closeImageZoom()
        })
    })
})
