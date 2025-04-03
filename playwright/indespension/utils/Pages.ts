import { test as baseTest } from '@playwright/test'
import {IndespensionHomePage} from "../pages/IndespensionHomePage";

const test = baseTest.extend<{
    homePage: IndespensionHomePage
}>({
    homePage: async ({ page }, use) => {
        await use(new IndespensionHomePage(page))
    },
})

export default test