import { expect, Locator, Page } from '@playwright/test'
import { ProductDetailPage } from '../../../common/abstract-pages/ProductDetailPage'
import { InsinkeratorObjects } from '../utils/objects'

export class InsinkeratorPDPage extends ProductDetailPage {

    constructor(page: Page) {
        super(page);
    }

    // VERIFIED locators — confirmed on staging with country set to Portugal
    // (an ecommerce-enabled country). See objects.ts for the country-gating
    // note: none of this renders at all on non-ecommerce countries — see
    // whereToBuyOpenButton etc. below for that case instead.
    readonly productName = InsinkeratorObjects.ProductDetailPage.productName(this.page);
    readonly productSku = InsinkeratorObjects.ProductDetailPage.productSku(this.page);
    readonly addToBasketButton = InsinkeratorObjects.ProductDetailPage.addToBasketButton(this.page);
    readonly checkoutPopup = InsinkeratorObjects.ProductDetailPage.checkoutPopup(this.page);
    readonly closeAddedToBasketPopupButton = InsinkeratorObjects.ProductDetailPage.closeAddedToBasketPopupButton(this.page);
    readonly goToBasketButton = InsinkeratorObjects.ProductDetailPage.goToBasketButton(this.page);
    readonly basketButton = InsinkeratorObjects.ProductDetailPage.basketButton(this.page);
    readonly actualPricePDP = InsinkeratorObjects.ProductDetailPage.actualPricePDP(this.page);
    // TODO(INSINKERATOR): no quantity-input testid found — this project may
    // only support adding a single unit at a time from the PDP. Confirm.
    readonly itemAmountToAddInput = InsinkeratorObjects.ProductDetailPage.itemAmountToAddInput(this.page);
    readonly basketCount = InsinkeratorObjects.ProductDetailPage.basketCount(this.page);

    // VERIFIED (partially) — see WhereToBuy note in objects.ts for the
    // caveat on modal reliability.
    readonly whereToBuyOpenButton = InsinkeratorObjects.WhereToBuy.openButton(this.page);
    readonly whereToBuyModalHeading = InsinkeratorObjects.WhereToBuy.modalHeading(this.page);
    readonly whereToBuyModalCloseButton = InsinkeratorObjects.WhereToBuy.modalCloseButton(this.page);

    // VERIFIED — present on configurable-bundle PDPs only (e.g.
    // /products/standard-460), not on every PDP. See objects.ts for the
    // full write-up on this feature's DOM quirks.
    readonly configuratorOptions = InsinkeratorObjects.ProductConfigurator.options(this.page);
    readonly configuratorTotalLabel = InsinkeratorObjects.ProductConfigurator.totalPriceLabel(this.page);

    readonly accordionTriggers = InsinkeratorObjects.ProductAccordion.trigger(this.page);
    readonly faqAccordionTriggers = InsinkeratorObjects.ProductAccordion.faqTrigger(this.page);
    readonly featuresCarouselHeading = InsinkeratorObjects.ProductFeaturesCarousel.heading(this.page);
    readonly featuresCarouselPrevButton = InsinkeratorObjects.ProductFeaturesCarousel.prevButton(this.page);
    readonly featuresCarouselNextButton = InsinkeratorObjects.ProductFeaturesCarousel.nextButton(this.page);
    readonly comparisonTableViewProductLinks = InsinkeratorObjects.ProductComparisonTable.viewProductLinks(this.page);
    readonly imageExpandButton = InsinkeratorObjects.ProductImageZoom.expandButton(this.page);
    readonly imageZoomModal = InsinkeratorObjects.ProductImageZoom.modalContent(this.page);

    // NOTE: unlike Kooltech, there is no visible quantity input on this PDP
    // (confirmed absent) — quantityToBuy is accepted for interface
    // compatibility with the abstract contract but currently unused. Update
    // this once/if a quantity control is confirmed to exist.
    async addToBasket(quantityToBuy: number): Promise<void> {
        await expect(this.addToBasketButton).toBeEnabled()
        const basketCountBefore = await this.basketCount.count() > 0
            ? Number(await this.basketCount.textContent())
            : 0
        await this.addToBasketButton.click({ timeout: 5000 })
        await expect(this.checkoutPopup).toBeVisible({ timeout: 25000 })
        await this.closeAddedToBasketPopupButton.click()
        await expect(this.basketCount).toHaveText((basketCountBefore + 1).toString())
    }

    async getBasketCount(): Promise<string> {
        return this.basketCount.textContent()
    }

    private parsePrice(text: string): number {
        const match = text.match(/([\d.,]+)\s*€/)
        if (!match) {
            throw new Error(`Could not parse a price out of "${text}"`)
        }
        return parseFloat(match[1].replace(/\./g, '').replace(',', '.'))
    }

    private async getConfiguratorTotal(): Promise<number> {
        const text = await this.configuratorTotalLabel.evaluate(el => el.nextElementSibling?.textContent ?? '')
        return this.parsePrice(text)
    }

    // VERIFIED — confirmed on /products/standard-460 (a configurable-bundle
    // PDP). Picks the first available option whose OWN advertised price
    // delta is non-zero (skipping the free/"(Included)" default), so this
    // works regardless of which specific variant IDs/names exist in the
    // catalog — no hardcoded product data. Returns the selected option's
    // name and price delta so the caller can cross-check the basket
    // afterwards (see addConfiguredExtraName/addConfiguredExtraPrice usage
    // in the spec).
    async selectFirstPricedConfiguratorOptionAndValidateTotal(): Promise<{ name: string, priceDelta: number }> {
        const totalBefore = await this.getConfiguratorTotal()
        const options = await this.configuratorOptions.evaluateAll(els => els.map((el, index) => ({
            index,
            text: el.closest('button')?.textContent?.trim() ?? ''
        })))
        const target = options.find(o => /\+\s*[1-9]/.test(o.text))
        if (!target) {
            throw new Error('No priced (non-Included) configurator option found on this PDP')
        }
        const match = target.text.match(/^(.*?)\+\s*([\d.,]+\s*€|€\d)/)
        if (!match) {
            throw new Error(`Could not parse a name/price out of configurator option text "${target.text}"`)
        }
        const name = match[1].trim()
        const priceDelta = this.parsePrice(target.text.slice(match[1].length))
        await this.configuratorOptions.nth(target.index).click()
        const expectedTotal = Math.round((totalBefore + priceDelta) * 100) / 100
        await expect(async () => {
            const totalAfter = await this.getConfiguratorTotal()
            expect(totalAfter).toBeCloseTo(expectedTotal, 2)
        }).toPass({ timeout: 10000 })
        return { name, priceDelta }
    }

    // Used to confirm a PLP click landed on the RIGHT product — the spec
    // captures the clicked card's name before navigating and passes it in,
    // rather than hardcoding a product name here.
    async validateProductNameMatches(expectedName: string): Promise<void> {
        await expect(this.productName).toBeVisible({ timeout: 30000 })
        await expect(this.productName).toHaveText(expectedName)
    }

    // VERIFIED — confirmed on /products/standard-460 for both the main
    // Overview/Features/Specifications/Downloads accordion and the
    // separate FAQs accordion: the first item is expanded by default, and
    // opening a second item collapses the first (single-open behaviour,
    // not independently-toggleable panels). Uses positional indices (0,
    // 1), not visible label text, so it doesn't depend on exact copy.
    private async validateSingleOpenAccordionBehaviour(triggers: Locator): Promise<void> {
        await expect(triggers.nth(0)).toHaveAttribute('aria-expanded', 'true')
        await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'false')
        await triggers.nth(1).click()
        await expect(triggers.nth(1)).toHaveAttribute('aria-expanded', 'true')
        await expect(triggers.nth(0)).toHaveAttribute('aria-expanded', 'false')
    }

    async validateAccordionSingleOpenBehaviour(): Promise<void> {
        await this.validateSingleOpenAccordionBehaviour(this.accordionTriggers)
    }

    async validateFaqAccordionSingleOpenBehaviour(): Promise<void> {
        await this.validateSingleOpenAccordionBehaviour(this.faqAccordionTriggers)
    }

    private async getFeaturesCarouselScrollState(): Promise<{ scrollLeft: number, hasOverflow: boolean }> {
        return this.featuresCarouselHeading.evaluate(el => {
            const section = el.parentElement?.parentElement
            const scrollable = section?.querySelector('[class*="overflow"]') as HTMLElement | null
            return {
                scrollLeft: scrollable?.scrollLeft ?? 0,
                hasOverflow: (scrollable?.scrollWidth ?? 0) > (scrollable?.clientWidth ?? 0)
            }
        })
    }

    // VERIFIED — confirmed on /products/standard-460 at multiple real
    // viewport widths (see ProductFeaturesCarousel note in objects.ts).
    // Whether "next" should be enabled depends on whether the carousel's
    // own content actually overflows at the CURRENT viewport — at wide
    // viewports (this project's own `Chrome` config included) all 3
    // features fit with no overflow, and both buttons being disabled is
    // the CORRECT state, not a bug. This checks the real scroll state
    // first and asserts whichever behaviour is actually correct for it,
    // rather than assuming one fixed viewport's behaviour.
    async validateFeaturesCarouselNavigation(): Promise<void> {
        // Settle wait — clicks were observed to silently no-op without it.
        await this.page.waitForTimeout(800)
        const { hasOverflow } = await this.getFeaturesCarouselScrollState()
        if (!hasOverflow) {
            await expect(this.featuresCarouselPrevButton).toBeDisabled()
            await expect(this.featuresCarouselNextButton).toBeDisabled()
            return
        }
        await expect(this.featuresCarouselPrevButton).toBeDisabled()
        await expect(this.featuresCarouselNextButton).toBeEnabled()
        await this.featuresCarouselNextButton.click({ delay: 100 })
        await expect(async () => {
            const { scrollLeft } = await this.getFeaturesCarouselScrollState()
            expect(scrollLeft).toBeGreaterThan(0)
        }).toPass({ timeout: 10000 })
        await expect(this.featuresCarouselPrevButton).toBeEnabled()
    }

    // Returns every OTHER product in the comparison table (excluding the
    // one currently being viewed) with its href and displayed name, read
    // from the column's own image alt text — so the caller can pick one
    // to click through to and verify against, without hardcoding catalog
    // data.
    async getOtherComparisonTableProducts(currentHref: string): Promise<{ href: string, name: string }[]> {
        await expect(this.comparisonTableViewProductLinks.first()).toBeVisible({ timeout: 30000 })
        return this.comparisonTableViewProductLinks.evaluateAll((els, current) => els
            .map(el => ({
                href: el.getAttribute('href') ?? '',
                name: el.closest('th')?.querySelector('img')?.getAttribute('alt') ?? ''
            }))
            .filter(p => p.href !== current), currentHref)
    }

    async clickComparisonTableViewProduct(targetHref: string): Promise<void> {
        const link = this.page.locator(`a[href="${targetHref}"]`).first()
        await expect(link).toBeVisible({ timeout: 15000 })
        await link.click()
        await expect(this.page).toHaveURL(new RegExp(`${targetHref}$`), { timeout: 30000 })
    }

    // CONFIRMED SITE BUG: see ProductImageZoom note in objects.ts — a
    // sticky header intercepts pointer events at this button's position;
    // force:true is the same workaround already used for
    // HomePage.chooseMenuCategory. Only opening is exercised — see the
    // "unreliable to close" note in objects.ts for why closing isn't
    // asserted on.
    async openImageZoom(): Promise<void> {
        await this.imageExpandButton.first().click({ force: true })
        await expect(this.imageZoomModal.locator('visible=true').first()).toBeVisible({ timeout: 15000 })
    }

    /**
     * VERIFIED: confirms this is a NON-ecommerce PDP — none of the
     * ecommerce elements (price, add-to-basket) are present, and the
     * "Where to buy" button is. Use this for non-ecommerce-country specs
     * (e.g. Poland) instead of addToBasket().
     */
    async validateNonEcommercePDP(): Promise<void> {
        await expect(this.whereToBuyOpenButton).toBeVisible({ timeout: 30000 })
        await expect(this.addToBasketButton).toHaveCount(0)
        await expect(this.actualPricePDP).toHaveCount(0)
    }

    // Mirror of validateNonEcommercePDP — confirms the SAME page has
    // switched to showing ecommerce elements (used to verify a mid-session
    // country change re-renders correctly without a page reload).
    async validateEcommercePDP(): Promise<void> {
        await expect(this.addToBasketButton).toBeVisible({ timeout: 30000 })
        await expect(this.actualPricePDP).toBeVisible()
        await expect(this.whereToBuyOpenButton).toHaveCount(0)
    }

    /**
     * TODO(INSINKERATOR): UNRELIABLE — see the WhereToBuy note in
     * objects.ts. This modal opened successfully once during exploration
     * but failed to open on every subsequent attempt in the same
     * session, with no error and no network request fired. Treat this
     * method as best-effort/known-flaky until root-caused; consider
     * wrapping calls to it in a retry, or skipping/soft-asserting on
     * failure rather than hard-failing a whole spec over it.
     */
    async openWhereToBuyModal(): Promise<void> {
        await this.whereToBuyOpenButton.click()
        await expect(this.whereToBuyModalHeading).toBeVisible({ timeout: 15000 })
    }
}
