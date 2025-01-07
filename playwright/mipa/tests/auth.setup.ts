import {test as setup, expect} from '@playwright/test';
import {mipa} from '@utils/testUsers'
import {testConfig} from '@utils/testConfig';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const accountTestUser_1_file = (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + 'tests/.auth/accountTestUser_1.json';
setup('authenticate as Account Mipa user 1', async ({ request}) => {
    const loginResponse = await request.post(`${testConfig.storefrontApi}/auth`, {
        data: {
            'email': mipa.accountTestUser_1.email,
            'password': mipa.accountTestUser_1.password
        }, timeout: 20000
    });
    await delay(2000)
    await request.storageState({ path: accountTestUser_1_file });
});
