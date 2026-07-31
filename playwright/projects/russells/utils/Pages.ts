import { test as baseTest } from '@playwright/test'
import { RussellsHomePage } from "../pages/RussellsHomePage";

const test = baseTest.extend<{
    homePage: RussellsHomePage
}>({
    homePage: async ({ page }, use) => {
        await use(new RussellsHomePage(page))
    },
})

export default test
