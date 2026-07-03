import test from '../utils/Pages'
import { carbon } from "@utils/testUsers";
import { generateDeliveryAddress } from "@utils/fakeData";


// We can use Steps like in Cucumber format as shown below
test(`Verify User's My Account flow: address book.`, async ({
    page,
    loginPage,
    accountPage,
}) => {

    const user = Object.assign({}, carbon.testUser_1)
    const address = generateDeliveryAddress()

    await test.step(`Login to Carbon`, async () => {
        console.log(`[STEP] Login to Carbon`)
        await loginPage.navigateToLoginPage()
        await loginPage.loginToApplication(user.email, user.password)
    })
    await test.step(`Validate Account page`, async () => {
        console.log(`[STEP] Validate Account page`)
        await accountPage.navigateToAccountPage()
        await accountPage.waitForLoginToBeCompleted()
        await accountPage.validateAccountPage()
    })
    await test.step(`Add a delivery address`, async () => {
        console.log(`[STEP] Add a delivery address`)
        await accountPage.addDeliveryAddress(address)
    })
})
