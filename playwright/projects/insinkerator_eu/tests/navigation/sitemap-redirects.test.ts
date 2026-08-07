import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * SITEMAP REDIRECTS (Portugal)
 * ==============================
 * Covers: the footer's "Sitemap" link redirects to /sitemap, and each of
 * the 5 real sitemap categories redirects correctly when clicking its
 * first item. VERIFIED live (staging, 2026-07-24) - the actual categories
 * are products, categories, content, locations and product images, not a
 * generic "articles"/"products" assumption.
 *
 * CONFIRMED SITE BUG: "locations" currently has exactly ONE entry ("test")
 * whose page renders a "not found" state (HTTP 200, not a real 404 - it
 * fetches its own data client-side and shows a not-found UI once that
 * comes back empty) - stale/dummy CMS data, not a bug in the redirect
 * mechanism itself. Asserted here as today's actual behaviour, matching
 * this project's established convention for documented site bugs (e.g.
 * InsinkeratorProductListPage's sort-by-price method). Worth flagging to
 * content editors to remove the stale entry.
 *
 * "product images" items link directly to raw CDN image files
 * (assets.insinkerator-eu.work), not HTML pages - checked via the
 * navigation response's status code rather than page content, since
 * there's no page/heading to inspect there.
 */
test.describe('Sitemap Redirects (Portugal)', () => {
    test('User can navigate to the sitemap page from the footer', async ({
        page,
        homePage,
        sitemapPage,
    }) => {
        await test.step(`Navigate to Home Page and dismiss the country modal`, async () => {
            console.log(`[STEP] Navigate to Home Page and dismiss the country modal`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`Click the footer Sitemap link`, async () => {
            console.log(`[STEP] Click the footer Sitemap link`)
            await homePage.clickSitemapLink()
        })

        await test.step(`Verify the sitemap page is reached`, async () => {
            console.log(`[STEP] Verify the sitemap page is reached`)
            await sitemapPage.validateSitemapPageReached()
        })
    })

    test(`Each sitemap category's first item redirects correctly`, async ({
        page,
        sitemapPage,
    }) => {
        await test.step(`Navigate to the sitemap page`, async () => {
            console.log(`[STEP] Navigate to the sitemap page`)
            await sitemapPage.navigateToSitemapPage()
            await selectCountryOnFreshLoad(page, 'Portugal')
        })

        await test.step(`"products" category's first item redirects to a real page`, async () => {
            console.log(`[STEP] "products" category's first item redirects to a real page`)
            await sitemapPage.openCategory('products')
            await sitemapPage.clickFirstCategoryItemAndValidateRealPageReached()
        })

        await test.step(`"categories" category's first item redirects to a real page`, async () => {
            console.log(`[STEP] "categories" category's first item redirects to a real page`)
            await sitemapPage.navigateToSitemapPage()
            await sitemapPage.openCategory('categories')
            await sitemapPage.clickFirstCategoryItemAndValidateRealPageReached()
        })

        await test.step(`"content" category's first item redirects to a real page`, async () => {
            console.log(`[STEP] "content" category's first item redirects to a real page`)
            await sitemapPage.navigateToSitemapPage()
            await sitemapPage.openCategory('content')
            await sitemapPage.clickFirstCategoryItemAndValidateRealPageReached()
        })

        await test.step(`"locations" category's first item currently 404s (known site bug)`, async () => {
            console.log(`[STEP] "locations" category's first item currently 404s (known site bug)`)
            await sitemapPage.navigateToSitemapPage()
            await sitemapPage.openCategory('locations')
            await sitemapPage.clickFirstCategoryItemAndValidateItCurrentlyErrors()
        })

        await test.step(`"product images" category's first item loads a real image`, async () => {
            console.log(`[STEP] "product images" category's first item loads a real image`)
            await sitemapPage.navigateToSitemapPage()
            await sitemapPage.openCategory('product images')
            await sitemapPage.clickFirstCategoryItemAndValidateImageLoads()
        })
    })
})
