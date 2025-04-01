import test from "../utils/Pages";

test.describe('Health Check as Guest User', () => {
    test(`Verify the home page loads`, async ({ homePage }) => {

        await test.step(`Navigate and Validate Home Page...`, async () => {
            await homePage.navigateToHomePage()
            await homePage.validateHomePage();
        })
    })
})