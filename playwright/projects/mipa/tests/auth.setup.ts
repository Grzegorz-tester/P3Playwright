import {test as setup, expect} from '@playwright/test';
import {mipa} from '@utils/testUsers'
import {testConfig} from '@utils/testConfig';

setup('authenticate as Account Mipa user 1', async ({ request }) => {
    const loginResponse = await request.post(`${testConfig.getApi(process.env.PROJECT)}/auth`, {
        data: {
            'email': mipa.accountTestUser_1.email,
            'password': mipa.accountTestUser_1.password
        }, timeout: 20000
    });
    await expect(loginResponse).toBeOK();
    await request.storageState({ path: testConfig.getAuthFile() });
});
