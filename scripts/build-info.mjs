// Emits public/build-info.json from the Vitest JSON report + CI env, so the deployed
// site carries a verifiable record (served at /build-info.json) that tests ran.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

let report = {};
try {
  report = JSON.parse(readFileSync('test-results.json', 'utf8'));
} catch {
  // no report (e.g. local run) — counts stay null
}

const env = process.env;
const info = {
  commit: env.GITHUB_SHA ?? null,
  ref: env.GITHUB_REF_NAME ?? null,
  runUrl:
    env.GITHUB_RUN_ID && env.GITHUB_REPOSITORY
      ? `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`
      : null,
  builtAt: new Date().toISOString(),
  tests: {
    total: report.numTotalTests ?? null,
    passed: report.numPassedTests ?? null,
    failed: report.numFailedTests ?? null,
    suites: report.numTotalTestSuites ?? null,
  },
  ok: report.success === true,
};

mkdirSync('public', { recursive: true });
writeFileSync('public/build-info.json', JSON.stringify(info, null, 2));
console.log('build-info:', JSON.stringify(info));
