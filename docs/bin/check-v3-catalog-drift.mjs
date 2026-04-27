#!/usr/bin/env node
// Validates the V3 library catalog manifest against the live API.
// Run after build-agent-indexes.mjs to catch:
//   1. ERRORS  — catalog package names that don't exist in /v1/widgets/assets
//                (typo, renamed package, deleted package — manifest is stale).
//   2. WARNINGS — first-party assets in the API that have no V3 catalog entry
//                 (could be a forgotten doc; review signal, not blocking).
//
// CI usage: `npm run check:v3-catalog` after the docs build. Fails on errors.
// Warnings appear in the build log so reviewers can spot drift in PR notes.
//
// Network failures: in non-strict mode (default), skip silently — CI shouldn't
// block on transient API outages. In `--strict` mode, fail.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const manifestPath = resolve(docsRoot, '.well-known/llms-v3-libraries.json');
const ASSETS_URL = process.env.FLIPLET_ASSETS_URL || 'https://api.fliplet.com/v1/widgets/assets';

async function main() {
  const strict = process.argv.includes('--strict');

  let manifest;
  try {
    manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  } catch (err) {
    console.error(`[error] cannot read manifest at ${manifestPath}: ${err.message}`);
    console.error('  Run `npm run build:agent-indexes` first.');
    process.exit(1);
  }

  const catalogPackages = new Set(manifest.libraries.map((l) => l.package));
  console.log(`V3 catalog: ${catalogPackages.size} entr${catalogPackages.size === 1 ? 'y' : 'ies'}`);

  console.log(`Fetching ${ASSETS_URL} ...`);
  let assets;
  try {
    const resp = await fetch(ASSETS_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
    assets = await resp.json();
  } catch (err) {
    const msg = `cannot fetch live assets: ${err.message}`;
    if (strict) {
      console.error(`[error] ${msg}`);
      process.exit(1);
    }
    console.warn(`[warn]  ${msg} — skipping drift check (non-strict mode)`);
    process.exit(0);
  }

  // The live endpoint shape is `{ assets: { "<package-name>": {...} } }`.
  // Tolerate both wrapped and bare-object responses (different envs may differ).
  const liveRoot = assets.assets || assets.data || assets;
  const livePackages = new Set(Object.keys(liveRoot));
  const firstPartyLive = Object.entries(liveRoot)
    .filter(([, v]) => v && v.category === 'first-party')
    .map(([k]) => k);

  console.log(`Live API: ${livePackages.size} total packages, ${firstPartyLive.length} first-party`);

  // Check 1: every catalog package must exist in live API.
  const errors = [];
  for (const pkg of catalogPackages) {
    if (!livePackages.has(pkg)) {
      errors.push(`catalog package "${pkg}" is not in /v1/widgets/assets (typo, stale, or renamed?)`);
    }
  }

  // Check 2: warn on first-party assets without catalog entries.
  // These could be:
  //   - intentionally excluded (most cases — see studio/docs/plans/v3-library-catalog-curation.md)
  //   - oversights (rare — flag for review)
  // Either way, surfacing them in PR review signals "did you check this addition?"
  const warnings = [];
  for (const pkg of firstPartyLive) {
    if (!catalogPackages.has(pkg)) {
      warnings.push(`first-party asset "${pkg}" has no V3 catalog entry — intentional exclusion or oversight?`);
    }
  }

  for (const e of errors) console.error(`[error] ${e}`);
  for (const w of warnings) console.warn(`[warn]  ${w}`);

  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);

  if (errors.length > 0) process.exit(1);
}

main();
