import { test as setup, expect } from '@playwright/test';
import { insinkerator } from '@utils/testUsers'
import { testConfig } from '@utils/testConfig';

// NOTE: UI login is VERIFIED working this session with these credentials
// (see testUsers.ts) - confirmed via the browser, not via this API-based
// setup. This setup assumes an /auth REST endpoint exists on this
// project's API host, matching Kooltech's pattern, but that endpoint
// itself was never directly exercised or confirmed here - only the UI
// login form was tested. If this setup fails, fall back to UI login via
// loginPage.loginToApplication(...) (confirmed working) instead of
// assuming the account/credentials are the problem.
setup('authenticate as Account Insinkerator user 1', async ({ request }) => {
    const loginResponse = await request.post(`${testConfig.getApi(process.env.PROJECT)}/auth`, {
        data: {
            'email': insinkerator.accountTestUser_1.email,
            'password': insinkerator.accountTestUser_1.password
        }, timeout: 20000
    });
    await expect(loginResponse).toBeOK();
    await request.storageState({ path: testConfig.getAuthFile() });
});
