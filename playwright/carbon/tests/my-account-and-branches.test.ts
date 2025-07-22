import test from '../utils/Pages'
import { products } from "../utils/products/products";
import {carbon} from "@utils/testUsers";
import addresses from "../utils/addresses/addresses";

// We can use Steps like in Cucumber format as shown below
test.describe( 'Tests with Auto User 2: ', () => {
    test.use({storageState: (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + 'carbon/tests/.auth/accountTestUser_1.json'});
    test(`Verify correct branches are displayed, addresses are addable and deletable`, async ({
                                                                                   page,
                                                                                   loginPage,
                                                                                   accountPage,
                                                                                   homePage,
                                                                                   branchesPage
                                                                               }) => {

        const user = Object.assign({}, carbon.testUser_2)
        const address = Object.assign({}, addresses.address_1)

        await test.step(`Login `, async () => {
            await loginPage.navigateToLoginPage()
            await loginPage.loginToApplication(user.email, user.password)
        })
        await test.step(`Proceed to Branches page`, async () => {
            await branchesPage.navigateToBranchesPage()
        })
        await test.step(`Validate Liverpool branch is visible and page is opened`, async () => {
            await branchesPage.proceedToBranchPage("Liverpool")
        })
        await test.step(`Proceed to My Account page`, async () => {
            await accountPage.navigateToAccountPage()
        })
        await test.step(`Validate My Account Page and Add an address`, async () => {
            await accountPage.validateAccountPage()
            await accountPage.addDeliveryAddress(address)
        })
        await test.step(`Delete an address`, async () => {
            await accountPage.deleteDeliveryAddress(address)
        })
    })
})