import { test as setup, expect } from '@playwright/test'
import { jtdove } from '@utils/testUsers'
import { testConfig } from '@utils/testConfig'

// CONFIRMED live (staging, 2026-08-11): the /auth REST endpoint on this
// project's API host (staging-api.jtdove.pub) returns 200 and a bearer
// cookie, but that cookie is scoped to the API domain, not the web
// domain (staging.jtdove.pub) the storefront actually runs on - same
// situation already documented for Insinkerator EU. UI login through
// /login is VERIFIED working end-to-end (real dashboard reached, real
// account data visible) via a live browser, so this uses the UI form
// directly rather than the API.
setup('authenticate as Account JTDove user 1', async ({ page }) => {
    await page.goto('/login')
    await page.getByTestId('login-form__email-input').fill(jtdove.accountTestUser_1.email)
    await page.getByTestId('login-form__password-input').fill(jtdove.accountTestUser_1.password)
    await page.getByTestId('login-form__submit-button').click()
    await expect(page).toHaveURL(/\/account$/, { timeout: 20000 })
    await page.context().storageState({ path: testConfig.getAuthFile() })
})
