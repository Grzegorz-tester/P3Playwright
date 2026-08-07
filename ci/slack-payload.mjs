// Builds the Slack payload for a single project's e2e run.
// Output: slack-payload-<PROJECT_CLIENT>.json at the repo root.

import { writeFileSync } from 'node:fs'

const client = process.env.PROJECT_CLIENT || process.env.PROJECT || 'unknown'
const environment = process.env.ENV_STAGE || process.env.ENV || 'stage'
const passed = (process.env.CI_JOB_STATUS || '').toLowerCase() === 'success'
const jobUrl = process.env.CI_JOB_URL || ''


const triggeredByUpstream = Boolean(process.env.UPSTREAM_PROJECT_NAME)
const dev = triggeredByUpstream ? (process.env.GITLAB_USER_NAME || '') : ''

const payload = {
    client,
    environment,
    status: passed ? 'passed' : 'failed',
    status_emoji: passed ? '✅' : '❌',
    pipeline_url: process.env.CI_PIPELINE_URL || '',
    job_url: jobUrl,
    report_url: jobUrl
        ? `${jobUrl}/artifacts/browse/playwright/projects/${client}/html-report/`
        : '',
    branch: process.env.CI_COMMIT_REF_NAME || '',
    commit: process.env.CI_COMMIT_SHORT_SHA || '',
    triggered_by: process.env.CI_PIPELINE_SOURCE || '',
    dev,
}

writeFileSync(`slack-payload-${client}.json`, JSON.stringify(payload, null, 2))
console.log(`[slack-payload] wrote slack-payload-${client}.json`, payload)
