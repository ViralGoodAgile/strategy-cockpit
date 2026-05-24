// Generates public/cockpit-data.json — the real-data snapshot the cockpit loads in
// preference to its synthetic defaults (see src/data/snapshot.ts for the contract).
//
// TODAY this is a placeholder: source 'synthetic', no signal overrides, so the app behaves
// exactly as before (an empty/absent snapshot changes nothing). When MCP/API connectors
// are available, populate `signals` from them:
//   outcomes    <- product analytics       (Amplitude / Mixpanel / PostHog)
//   reliability <- observability+incidents  (Datadog / PagerDuty / Grafana)
//   dora        <- CI/CD + observability
//   datadog     <- production telemetry      (Datadog)
//   radar       <- issue tracker             (Jira / Linear / GitHub Projects)
//
// Run: node scripts/build-data.mjs   (later: wire into the deploy workflow once real).
import { writeFileSync, mkdirSync } from 'node:fs';

const snapshot = {
  generatedAt: new Date().toISOString(),
  source: 'synthetic', // TODO: 'mcp:...' once a connector feeds real signals
  signals: {}, // empty → cockpit uses synthetic defaults (no behaviour change)
};

mkdirSync('public', { recursive: true });
writeFileSync('public/cockpit-data.json', JSON.stringify(snapshot, null, 2));
console.log('cockpit-data:', JSON.stringify(snapshot));
