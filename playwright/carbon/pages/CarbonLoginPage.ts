import { expect, Locator, Page } from '@playwright/test';
import { AbstractLoginPage } from '../../abstracts/AbstractLoginPage';
import { CarbonObjects } from '../utils/objects';

export class CarbonLoginPage extends AbstractLoginPage {
    readonly page: Page;
    public loginHeader: Locator;
    public emailInput: Locator;
    public passwordInput: Locator;
    public signInButton: Locator;
    public signInButtonInProgress: Locator;
    public welcomeUserTopbarDiv: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.loginHeader = CarbonObjects.LoginPage.loginHeader(page);
        this.emailInput = CarbonObjects.LoginPage.emailInput(page);
        this.passwordInput = CarbonObjects.LoginPage.passwordInput(page);
        this.signInButton = CarbonObjects.LoginPage.signInButton(page);
        this.signInButtonInProgress = CarbonObjects.LoginPage.signInButtonInProgress(page);
        this.welcomeUserTopbarDiv = CarbonObjects.LoginPage.welcomeUserTopbarDiv(page);
    }
}