import {test as setup, expect} from '@playwright/test';
import {kooltech} from '@utils/testUsers'
import {testConfig} from '@utils/testConfig';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const accountTestUser_1_file = (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + `${process.env.PROJECT}/tests/.auth/accountTestUser_1.json`;
setup('authenticate as Account Kooltech user 1', async ({ request}) => {
    const loginResponse = await request.post(`${testConfig.getApi(process.env.PROJECT)}/auth`, {
        data: {
            'email': kooltech.accountTestUser_1.email,
            'password': kooltech.accountTestUser_1.password
        }, timeout: 20000
    });
    await delay(2000)
    await expect(loginResponse).toBeOK();
    await request.storageState({ path: accountTestUser_1_file });
});
