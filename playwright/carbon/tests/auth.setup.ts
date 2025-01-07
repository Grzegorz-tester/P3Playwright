import {test as setup, expect} from '@playwright/test';
import {carbon} from '@utils/testUsers'
import {testConfig} from '@utils/testConfig';

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

const tradeGbUser_1_file = (process.env.CI ? process.env.CI_PROJECT_DIR + '/playwright/' : '') + 'tests/.auth/tradeGbUser_1.json';
setup('authenticate as Trade GB user 1', async ({ request}) => {
    const loginResponse = await request.post(`${testConfig.storefrontApi}/auth`, {
        data: {
            'email': carbon.testUser_1.email,
            'password': carbon.testUser_1.password
        }, timeout: 20000
    });
    await delay(2000)
    await request.storageState({ path: tradeGbUser_1_file });
});


