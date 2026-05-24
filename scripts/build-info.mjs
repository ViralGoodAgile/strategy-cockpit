// Emits public/build-info.json from the test reports + CI env, so the deployed site
// carries a verifiable record (served at /build-info.json) that the tests ran — now
// covering BOTH the Vitest (unit/BDD) suite and the Playwright (e2e) suite.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null; // no report (e.g. local run, or a suite that didn't run) — counts stay 0
  }
}

const vitest = readJson('test-results.json'); // vitest --reporter=json
const pw = readJson('playwright-results.json'); // playwright --reporter=json

const unit = {
  total: vitest?.numTotalTests ?? 0,
  passed: vitest?.numPassedTests ?? 0,
  failed: vitest?.numFailedTests ?? 0,
  suites: vitest?.numTotalTestSuites ?? 0,
};

// Playwright JSON puts counts in top-level `stats`: expected (passed), unexpected
// (failed), flaky (passed on retry), skipped.
const s = pw?.stats ?? {};
const e2e = {
  total: (s.expected ?? 0) + (s.unexpected ?? 0) + (s.flaky ?? 0),
  passed: (s.expected ?? 0) + (s.flaky ?? 0),
  failed: s.unexpected ?? 0,
};

const env = process.env;
const total = unit.total + e2e.total;
const passed = unit.passed + e2e.passed;
const failed = unit.failed + e2e.failed;

const info = {
  commit: env.GITHUB_SHA ?? null,
  ref: env.GITHUB_REF_NAME ?? null,
  runUrl:
    env.GITHUB_RUN_ID && env.GITHUB_REPOSITORY
      ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
      : null,
  builtAt: new Date().toISOString(),
  // Combined headline (unit + e2e) plus a breakdown so the badge is honest about both.
  tests: { total, passed, failed, suites: unit.suites, unit, e2e },
  ok: vitest?.success === true && failed === 0,
};

mkdirSync('public', { recursive: true });
writeFileSync('public/build-info.json', JSON.stringify(info, null, 2));
console.log('build-info:', JSON.stringify(info));
