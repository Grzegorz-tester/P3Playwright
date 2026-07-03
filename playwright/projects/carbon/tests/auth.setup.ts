import {test as setup, expect} from '@playwright/test';
import {carbon} from '@utils/testUsers'
import {testConfig} from '@utils/testConfig';

setup('authenticate as user 1', async ({ request }) => {
    const loginResponse = await request.post(`${testConfig.getApi(process.env.PROJECT)}/auth`, {
        data: {
            'email': carbon.testUser_1.email,
            'password': carbon.testUser_1.password
        }, timeout: 20000
    });
    await expect(loginResponse).toBeOK();
    await request.storageState({ path: testConfig.getAuthFile() });
});
