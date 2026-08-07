import test from '../../utils/Pages'
import { selectCountryOnFreshLoad, changeCountry } from '../../utils/countrySelector'

/**
 * MID-SESSION COUNTRY SWITCH
 * ==========================
 * Covers: switching country via the utility bar's picker (changeCountry)
 * AFTER the initial page load, as opposed to the mandatory fresh-load
 * modal already covered by every other spec's selectCountryOnFreshLoad
 * call. Confirms a PDP's ecommerce gating re-renders correctly live,
 * without a page reload.
 *
 * VERIFIED live (staging, 2026-07-22): the SAME PDP
 * (/products/sink-flange-oil-rubbed-bronze) shows "Where to buy" for
 * Poland (non-ecommerce, matching poland-non-ecommerce-journey.test.ts)
 * and correctly switches to Add to Basket / price for Portugal after
 * calling changeCountry() mid-session, with no navigation in between.
 * changeCountry() itself already existed in countrySelector.ts but had
 * never been exercised by any test until now.
 */
test.describe('Mid-Session Country Switch (Poland → Portugal)', () => {
    test('User can switch country via the utility bar and see PDP ecommerce gating update live', async ({
        page,
        homePage,
        productDetailPage,
    }) => {
        await test.step(`Navigate to Home Page and select Poland`, async () => {
            console.log(`[STEP] Navigate to Home Page and select Poland`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Poland')
        })

        await test.step(`Open a product and confirm it's non-ecommerce for Poland`, async () => {
            console.log(`[STEP] Open a product and confirm it's non-ecommerce for Poland`)
            await page.goto('/products/sink-flange-oil-rubbed-bronze')
            await productDetailPage.validateNonEcommercePDP()
        })

        await test.step(`Switch to Portugal via the utility bar, without navigating away`, async () => {
            console.log(`[STEP] Switch to Portugal via the utility bar, without navigating away`)
            await changeCountry(page, 'Portugal')
        })

        await test.step(`Confirm the same PDP now shows ecommerce elements`, async () => {
            console.log(`[STEP] Confirm the same PDP now shows ecommerce elements`)
            await productDetailPage.validateEcommercePDP()
        })
    })
})
