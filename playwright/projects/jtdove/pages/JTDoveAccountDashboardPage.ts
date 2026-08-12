import { expect, Page } from '@playwright/test'
import { AccountPage } from '../../../common/abstract-pages/AccountPage'
import { JTDoveObjects } from '../utils/objects'

/**
 * VERIFIED live (staging, 2026-08-11): /account - the logged-in
 * dashboard. The account menu (welcome message, account number, Sign
 * Out, 6 nav items) is shared markup present on every /account/* page,
 * so its locators/methods live here and are reused by the other account
 * page objects rather than duplicated.
 */
export class JTDoveAccountDashboardPage extends AccountPage {

    constructor(page: Page) {
        super(page);
    }

    readonly welcome = JTDoveObjects.AccountMenu.welcome(this.page);
    readonly logoutButton = JTDoveObjects.AccountMenu.logoutButton(this.page);
    readonly cards = JTDoveObjects.AccountDashboardPage.cards(this.page);

    async waitForLoginToBeCompleted(): Promise<void> {
        await expect(this.page).toHaveURL(/\/account$/, { timeout: 20000 })
    }

    async validateAccountPage(): Promise<void> {
        await expect(this.welcome).toBeVisible({ timeout: 20000 })
        await expect(this.cards).toHaveCount(3, { timeout: 15000 })
    }

    async getWelcomeText(): Promise<string> {
        return (await this.welcome.textContent()) ?? ''
    }

    // VERIFIED live (staging, 2026-08-11): each of the 6 account-menu
    // items carries a stable `data-value` attribute and a real `href`,
    // matched instead of visible text.
    async navigateViaMenu(value: 'Dashboard' | 'Profile' | 'Address Book' | 'Invoices' | 'My Lists' | 'Make a Payment'): Promise<void> {
        await JTDoveObjects.AccountMenu.itemByValue(value)(this.page).first().click()
    }

    async verifyMenuItemActive(value: string): Promise<void> {
        const item = JTDoveObjects.AccountMenu.itemByValue(value)(this.page).first()
        await expect(item.getByTestId('account-menu-item__active-block')).toBeVisible({ timeout: 10000 })
    }

    async signOut(): Promise<void> {
        await this.logoutButton.click()
    }

    async getCardContent(title: string): Promise<string> {
        return (await JTDoveObjects.AccountDashboardPage.cardByTitle(title)(this.page).getByTestId('account-card__content').textContent()) ?? ''
    }

    async clickCardViewAll(title: string): Promise<void> {
        await JTDoveObjects.AccountDashboardPage.cardByTitle(title)(this.page).getByRole('link', { name: 'View all' }).click()
    }
}
