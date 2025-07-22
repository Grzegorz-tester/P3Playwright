import { expect, Locator, Page } from '@playwright/test';
import { AbstractLoginPage } from '../../abstracts/AbstractLoginPage';
import { CarbonObjects } from '../utils/objects';
import {AbstractBranchesPage} from "../../abstracts/AbstractBranchesPage";

export class CarbonBranchesPage extends AbstractBranchesPage {
    readonly page: Page;
    public branch1PinDiv: Locator;
    public branch1AddressDiv: Locator;
    public branch2PinDiv: Locator;
    public branch2AddressDiv: Locator;

    constructor(page: Page) {
        super(page);
        this.page = page;
        this.branch1PinDiv = CarbonObjects.BranchesPage.branch1PinDiv(page);
        this.branch1AddressDiv = CarbonObjects.BranchesPage.branch1AddressDiv(page);
        this.branch2PinDiv = CarbonObjects.BranchesPage.branch2PinDiv(page);
        this.branch2AddressDiv = CarbonObjects.BranchesPage.branch2AddressDiv(page);
    }

    async proceedToBranchPage(branch: String): Promise<void> {
        if (branch === "Leeds") {
            await expect(this.branch1PinDiv).toBeVisible()
            await this.branch1PinDiv.click()
            await expect(this.branch1AddressDiv).toBeVisible()
            await this.branch1AddressDiv.click()
            await expect(this.page).toHaveURL('/branches/leeds')
        }
        if (branch === "Liverpool") {
            await expect(this.branch2PinDiv).toBeVisible()
            await this.branch2PinDiv.click()
            await expect(this.branch2AddressDiv).toBeVisible()
            await this.branch2AddressDiv.click()
            await expect(this.page).toHaveURL('/branches/liverpool')
        }
    }
}