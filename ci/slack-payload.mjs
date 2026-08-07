// Builds the Slack payload for a single project's e2e run.
// Output: slack-payload-<PROJECT_CLIENT>.json at the repo root.

import { writeFileSync, readFileSync, existsSync } from 'node:fs'

const client = process.env.PROJECT_CLIENT || process.env.PROJECT || 'unknown'
const environment = process.env.ENV_STAGE || process.env.ENV || 'stage'
const passed = (process.env.CI_JOB_STATUS || '').toLowerCase() === 'success'
const jobUrl = process.env.CI_JOB_URL || ''

const triggeredByUpstream = Boolean(process.env.UPSTREAM_PROJECT_NAME)
const dev = triggeredByUpstream ? (process.env.GITLAB_USER_NAME || '') : ''


function testCounts() {
    const counts = { passed: 0, failed: 0, flaky: 0, skipped: 0, total: 0 }
    const reportPath = `playwright/projects/${client}/results.json`
    if (!existsSync(reportPath)) return counts
    let report
    try {
        report = JSON.parse(readFileSync(reportPath, 'utf8'))
    } catch {
        return counts
    }

    const s = report.stats
    if (s && typeof s.expected === 'number') {
        counts.passed = s.expected || 0
        counts.failed = s.unexpected || 0
        counts.flaky = s.flaky || 0
        counts.skipped = s.skipped || 0
    } else {
        const walk = (suite) => {
            for (const spec of suite.specs || []) {
                for (const t of spec.tests || []) {
                    if (t.status === 'expected') counts.passed++
                    else if (t.status === 'unexpected') counts.failed++
                    else if (t.status === 'flaky') counts.flaky++
                    else if (t.status === 'skipped') counts.skipped++
                }
            }
            for (const child of suite.suites || []) walk(child)
        }
        for (const suite of report.suites || []) walk(suite)
    }
    counts.total = counts.passed + counts.failed + counts.flaky + counts.skipped
    return counts
}

const counts = testCounts()

// Flaky tests pass on retry, so they are counted as passed. The flaky sub-count
// is still surfaced for visibility, but it is included in `passed`, not added on
// top of it, and not counted again in the total.
const passedCount = counts.passed + counts.flaky
const totalCount = passedCount + counts.failed + counts.skipped

const summary =
    `${passedCount} passed, ${counts.failed} failed` +
    (counts.flaky ? ` (${counts.flaky} flaky)` : '') +
    (counts.skipped ? `, ${counts.skipped} skipped` : '')

const payload = {
    client,
    environment,
    status: passed ? 'passed' : 'failed',
    status_emoji: passed ? '✅' : '❌',
    tests_summary: summary,
    tests_passed: String(passedCount),
    tests_failed: String(counts.failed),
    tests_flaky: String(counts.flaky),
    tests_skipped: String(counts.skipped),
    tests_total: String(totalCount),
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
