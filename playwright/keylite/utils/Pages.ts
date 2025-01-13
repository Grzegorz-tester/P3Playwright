import { test as baseTest } from '@playwright/test'
import {KeyliteHomePage} from "../pages/KeyliteHomePage";

const test = baseTest.extend<{
    homePage: KeyliteHomePage
}>({
    homePage: async ({ page }, use) => {
        await use(new KeyliteHomePage(page))
    },
})

export default test