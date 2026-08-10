import test from "../utils/Pages";

test.describe('Health Check as Guest User', () => {
    test(`Verify the home page loads`, async ({ homePage }) => {

        await test.step(`Navigate and Validate Home Page...`, async () => {
            console.log(`[STEP] Navigate and Validate Home Page...`)
            await homePage.navigateToHomePage()
            await homePage.validateHomePage();
        })
    })
})
