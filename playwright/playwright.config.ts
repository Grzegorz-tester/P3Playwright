import { defineConfig, devices } from "@playwright/test";
import { testConfig } from "@utils/testConfig";
require("dotenv").config();

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

const userAgentStrings = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
];

export default defineConfig({
  testDir: `./projects/${process.env.PROJECT}/tests`,
  timeout: 120000,
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  // NOTE(RUSSELLS): staging.russells-parts.work doesn't reliably handle the
  // default worker count under load - a full-suite run with the default
  // parallelism produced widespread failures on completely unrelated tests,
  // including the trivial health-check, while every individual file and
  // small-batch run passed cleanly (confirmed live, 2026-08-07). Tried 2
  // workers next - still one residual failure, a shared-account race
  // between two checkout tests hitting the same logged-in account's
  // billing step at once. Capped to 1 rather than splitting the
  // difference, for this project rather than every storefront, since this
  // instability hasn't been observed elsewhere on this branch.
  //
  // NOTE(INSINKERATOR EU): staging.insinkerator-eu.work doesn't reliably
  // handle the default worker count under load either - a full-suite run
  // with 4 parallel Chrome sessions produced widespread page.goto timeouts
  // on completely unrelated tests (confirmed live, 2026-08-07: 14 failures
  // out of 32 at the default worker count). Tried 2 workers next - still
  // 4 failures, all a SEPARATE pre-existing networkidle-wait flakiness
  // that also shows up (just less often) running fully serially, so it's
  // not fixable via worker count alone. Serial (1 worker) was both the
  // most reliable (31/32) and not meaningfully slower than 2 workers
  // (14.4min vs 13.2min for the full suite) - use that rather than
  // splitting the difference. Both caps are per-project rather than
  // global, since neither instability has been observed elsewhere.
  //
  // NOTE(JTDOVE): staging.jtdove.pub doesn't reliably handle the default
  // worker count under load either - a full-suite run with the default
  // parallelism produced widespread failures on completely unrelated
  // tests, including the trivial health-check, while running fully
  // serially (1 worker) passed cleanly and was notably faster overall
  // too (confirmed live, 2026-08-10).
  workers: process.env.CI ? 1 : (["russells", "insinkerator_eu", "jtdove"].includes(process.env.PROJECT ?? "") ? 1 : undefined),
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    [
      "html",
      {
        open: "never",
        outputFolder: `./projects/${process.env.PROJECT}/html-report`,
      },
    ],
    // JSON report parsed by ci/slack-payload.mjs to include pass/fail counts in the Slack notification.
    [
      "json",
      {
        outputFile: `./projects/${process.env.PROJECT}/results.json`,
      },
    ],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    navigationTimeout: 90000,
    actionTimeout: 60000 /* Base URL to use in actions like `await page.goto('/')`. */,
    // baseURL: 'http://localhost:3000',
    baseURL: testConfig.getUrl(process.env.PROJECT),
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on",
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: `Chrome`,
      use: {
        // Configure the browser to use.
        browserName: `chromium`,

        userAgent:
          userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)],

        //Chrome Browser Config
        channel: `chrome`,

        //Picks Base Url based on User input
        baseURL: testConfig.getUrl(process.env.PROJECT),
        //Browser Mode
        headless: true,

        //Browser height and width
        viewport: { width: 1440, height: 960 },
        ignoreHTTPSErrors: true,

        //Enable File Downloads in Chrome
        acceptDownloads: true,
        navigationTimeout: 90000,
        actionTimeout: 60000,
        //Artifacts
        screenshot: `on`,
        video: `on`,
        trace: `on`,

        //Slows down execution by ms
        launchOptions: {
          slowMo: 0,
        },
      },
      timeout: 160000,
      dependencies: ["setup"],
    },

    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
