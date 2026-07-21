import test from "../utils/Pages";
import { selectCountryOnFreshLoad } from "../utils/countrySelector";

test.describe('Health Check as Guest User', () => {
    test(`Verify the home page loads`, async ({ page, homePage }) => {

        await test.step(`Navigate and dismiss the mandatory country modal...`, async () => {
            console.log(`[STEP] Navigate and dismiss the mandatory country modal...`)
            await homePage.navigateToHomePage()
            // CRITICAL: do this before anything else on a fresh page load —
            // see countrySelector.ts for why.
            await selectCountryOnFreshLoad(page, 'Portugal')
        })
        await test.step(`Validate Home Page...`, async () => {
            console.log(`[STEP] Validate Home Page...`)
            await homePage.validateHomePage();
        })
    })
})
