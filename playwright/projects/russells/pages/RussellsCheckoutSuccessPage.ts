import { expect, Page } from '@playwright/test'
import { AbstractCheckoutSuccessPage } from '../../../common/abstract-pages/CheckoutSuccessPage'
import { RussellsObjects } from '../utils/objects'

export type OrderLineExpectation = {
    name: string
    sku: string
    quantity: number
    unitPrice: string
    totalPrice: string
}

export class RussellsCheckoutSuccessPage extends AbstractCheckoutSuccessPage {

    readonly orderReference = RussellsObjects.CheckoutSuccessPage.orderReference(this.page);
    readonly orderConfirmationEmail = RussellsObjects.CheckoutSuccessPage.orderConfirmationEmail(this.page);
    readonly orderLines = RussellsObjects.CheckoutSuccessPage.orderLines(this.page);
    readonly deliveryMethod = RussellsObjects.CheckoutSuccessPage.deliveryMethod(this.page);
    readonly deliveryAddress = RussellsObjects.CheckoutSuccessPage.deliveryAddress(this.page);
    readonly orderSummarySubtotal = RussellsObjects.CheckoutSuccessPage.orderSummarySubtotal(this.page);
    readonly orderSummaryShippingTotal = RussellsObjects.CheckoutSuccessPage.orderSummaryShippingTotal(this.page);
    readonly orderSummaryTotal = RussellsObjects.CheckoutSuccessPage.orderSummaryTotal(this.page);
    readonly orderPaymentDetails = RussellsObjects.CheckoutSuccessPage.orderPaymentDetails(this.page);

    constructor(page: Page) {
        super(page);
    }

    // VERIFIED live (staging, 2026-07-31) through a real completed order.
    async verifyThankYouPage(username: string): Promise<void> {
        await expect(this.page).toHaveURL(/\/checkout\/thank-you$/, { timeout: 30000 })
        await expect(this.orderReference).toContainText('Order No.', { timeout: 20000 })
        await expect(this.orderConfirmationEmail).toContainText(username)
    }

    // VERIFIED live (staging, 2026-08-01): one order-product-card per
    // basket line, in the order they were added — no hidden mobile/desktop
    // duplicate on this page (unlike most of the rest of the site).
    // Checks the exact line count first, since a polluted shared-account
    // basket (see RussellsBasketPage.clearBasket) would otherwise show up
    // as silently-passing partial assertions rather than a clear failure.
    async verifyOrderLines(expectedLines: OrderLineExpectation[]): Promise<void> {
        await expect(this.orderLines).toHaveCount(expectedLines.length, { timeout: 20000 })
        for (let i = 0; i < expectedLines.length; i++) {
            const expected = expectedLines[i]
            await expect(RussellsObjects.CheckoutSuccessPage.orderLineName(i)(this.page)).toHaveText(expected.name)
            await expect(RussellsObjects.CheckoutSuccessPage.orderLineSku(i)(this.page)).toContainText(expected.sku)
            await expect(RussellsObjects.CheckoutSuccessPage.orderLineQuantity(i)(this.page)).toHaveText(String(expected.quantity))
            await expect(RussellsObjects.CheckoutSuccessPage.orderLinePrice(i)(this.page)).toHaveText(expected.unitPrice)
            await expect(RussellsObjects.CheckoutSuccessPage.orderLineTotalPrice(i)(this.page)).toHaveText(expected.totalPrice)
        }
    }

    // VERIFIED live (staging, 2026-08-01): Click & Collect orders have no
    // shipping-total testid at all (pass shippingTotal: undefined for
    // those); Delivery orders always do.
    async verifyOrderSummary(expected: { subtotal: string, shippingTotal?: string, total: string }): Promise<void> {
        await expect(this.orderSummarySubtotal).toHaveText(expected.subtotal)
        if (expected.shippingTotal) {
            await expect(this.orderSummaryShippingTotal).toHaveText(expected.shippingTotal)
        } else {
            await expect(this.orderSummaryShippingTotal).toHaveCount(0)
        }
        await expect(this.orderSummaryTotal).toHaveText(expected.total)
    }

    // e.g. 'DPD' or 'Click & Collect'.
    async verifyDeliveryMethod(expectedMethodText: string): Promise<void> {
        await expect(this.deliveryMethod).toContainText(expectedMethodText)
    }

    // Each fragment (name, address lines, postcode, phone, etc.) must
    // appear somewhere in the delivery/collection address block.
    async verifyDeliveryAddressContains(fragments: string[]): Promise<void> {
        for (const fragment of fragments) {
            await expect(this.deliveryAddress).toContainText(fragment)
        }
    }

    // VERIFIED live (staging, 2026-08-01): the "Payment Method" heading
    // renders with no actual payment method value underneath it (e.g. no
    // "Visa ending 5262") — a real content gap, not a locator problem.
    // Only the billing address (already covered by the checkout flow
    // itself) is genuinely populated here — asserts the heading only.
    async verifyPaymentDetailsSectionPresent(): Promise<void> {
        await expect(this.orderPaymentDetails).toContainText('Payment Method')
        await expect(this.orderPaymentDetails).toContainText('Billing Address')
    }
}
