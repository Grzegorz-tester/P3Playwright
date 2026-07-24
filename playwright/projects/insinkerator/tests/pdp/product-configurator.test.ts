import test from '../../utils/Pages'
import { selectCountryOnFreshLoad } from '../../utils/countrySelector'

/**
 * PDP PRODUCT CONFIGURATOR (Standard 460, Portugal)
 * ==================================================
 * Covers: selecting a priced configurator option (flange/stopper/air
 * switch bundle) and verifying the PDP's live Total updates correctly;
 * and adding the configured bundle to basket and verifying the basket
 * reflects it correctly.
 *
 * VERIFIED live (staging, 2026-07-22): /products/standard-460 is a
 * configurable-bundle PDP - a different template from the simpler
 * /category/accessories-style PDP already covered by logged-in-purchase-journey.test.ts.
 * Selects the first available priced (non-"Included") option generically,
 * so this doesn't depend on hardcoded catalog variant names/IDs.
 * CONFIRMED via a clean automated run that adding to basket on this PDP
 * DOES show the same confirmation popup as the simpler template - an
 * earlier manual (logged-in, long-lived session) exploration suggested
 * otherwise, but that didn't hold up here and has been corrected.
 *
 * CONFIRMED SITE BUG: the PDP's advertised price delta for a configured
 * extra can differ from what the basket displays for the SAME selection
 * by a small (~1 cent) rounding amount - see the TODO on
 * InsinkeratorBasketPage.validateConfiguredExtra(). Worth a UI ticket.
 */
test.describe('PDP Product Configurator (Portugal)', () => {
    test('Selecting a priced option updates the Total, and the basket reflects the configured bundle', async ({
        page,
        homePage,
        productDetailPage,
        basketPage,
    }) => {
        await test.step(`Navigate to Home Page, dismiss the country modal, then go to the Standard 460 PDP`, async () => {
            console.log(`[STEP] Navigate to Home Page, dismiss the country modal, then go to the Standard 460 PDP`)
            await homePage.navigateToHomePage()
            await selectCountryOnFreshLoad(page, 'Portugal')
            await page.goto('/products/standard-460')
        })

        let expectedName: string
        let expectedSku: string
        let selectedExtra: { name: string, priceDelta: number }

        await test.step(`Select a priced configurator option and validate the Total updates`, async () => {
            console.log(`[STEP] Select a priced configurator option and validate the Total updates`)
            expectedName = (await productDetailPage.productName.textContent()) ?? ''
            expectedSku = ((await productDetailPage.productSku.textContent()) ?? '').replace(/^SKU\s*/, '')
            selectedExtra = await productDetailPage.selectFirstPricedConfiguratorOptionAndValidateTotal()
        })

        await test.step(`Add the configured bundle to basket`, async () => {
            console.log(`[STEP] Add the configured bundle to basket`)
            await productDetailPage.addToBasket(1)
        })

        await test.step(`Verify the basket reflects the configured bundle correctly`, async () => {
            console.log(`[STEP] Verify the basket reflects the configured bundle correctly`)
            await basketPage.proceedToBasketPage()
            await basketPage.validateMainProduct(expectedName, expectedSku)
            await basketPage.validateConfiguredExtra(selectedExtra.name, selectedExtra.priceDelta)
            await basketPage.validateGrandTotalIsInternallyConsistent()
        })
    })
})
