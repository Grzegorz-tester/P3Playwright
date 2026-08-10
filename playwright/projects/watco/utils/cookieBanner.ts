import { Page, expect } from '@playwright/test'
import { WatcoObjects } from './objects'

/**
 * Dismisses the OneTrust cookie-consent banner that appears on every fresh
 * session (no persisted cookies). Call this right after the first
 * navigation in every test, mirroring this repo's established pattern for
 * a mandatory first-load overlay (see Insinkerator's countrySelector.ts).
 *
 * VERIFIED live (staging, 2026-08-05): a single click on the Accept All
 * button cleanly hides the banner, the preference centre, and its dark-
 * filter overlay — no follow-up dismissal needed.
 */
export async function dismissCookieBanner(page: Page): Promise<void> {
    const acceptButton = WatcoObjects.CookieBanner.acceptAllButton(page)
    const appeared = await acceptButton
        .waitFor({ state: 'visible', timeout: 8000 })
        .then(() => true)
        .catch(() => false)
    if (appeared) {
        await acceptButton.click()
        await expect(acceptButton).toBeHidden({ timeout: 10000 })
    }
    await dismissStrayPreferenceCentre(page)
}

// CONFIRMED SITE BEHAVIOUR: on some navigations (observed after a login →
// multi-page journey) OneTrust's preference-centre panel and its
// .onetrust-pc-dark-filter overlay can reappear even after Accept All was
// already clicked earlier in the same session, intercepting clicks on
// whatever's underneath (e.g. the PDP add-to-basket button). Call this
// defensively before any click that has been seen to collide with it.
export async function dismissStrayPreferenceCentre(page: Page): Promise<void> {
    const darkFilter = page.locator('.onetrust-pc-dark-filter')
    const present = await darkFilter.isVisible().catch(() => false)
    if (present) {
        const closeButton = page.locator('#close-pc-btn-handler')
        await closeButton.click({ force: true }).catch(() => {})
        await darkFilter.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {})
    }
}
