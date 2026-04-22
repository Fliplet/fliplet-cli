// T4 test: assert the Jekyll build emits .well-known/* and _headers under _site/.
// Run AFTER `node bin/build-agent-indexes.mjs && bundle exec jekyll build`:
//   node test/wellknown.test.mjs
// Exits 1 on any failure.

import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const siteRoot = join(docsRoot, '_site');

let failed = 0;
const check = (label, cond, detail = '') => {
  if (cond) {
    console.log(`ok: ${label}`);
  } else {
    console.error(`FAIL: ${label}${detail ? ' — ' + detail : ''}`);
    failed += 1;
  }
};

const mustExist = (relPath) => {
  const p = join(siteRoot, relPath);
  check(`${relPath} exists in _site`, existsSync(p) && statSync(p).isFile(), p);
  return p;
};

// Presence
const apiCatalogPath = mustExist('.well-known/api-catalog');
const agentSkillsPath = mustExist('.well-known/agent-skills/index.json');
const headersPath = mustExist('_headers');

// api-catalog schema
try {
  const linkset = JSON.parse(readFileSync(apiCatalogPath, 'utf8'));
  check('api-catalog has linkset array', Array.isArray(linkset.linkset));
  check('api-catalog has >= 1 entry', linkset.linkset.length >= 1);
  const firstEntry = linkset.linkset[0] || {};
  check(
    'first linkset entry has anchor + service-doc',
    typeof firstEntry.anchor === 'string' && Array.isArray(firstEntry['service-doc']),
  );
} catch (err) {
  check('api-catalog parses as JSON', false, err.message);
}

// agent-skills schema
try {
  const idx = JSON.parse(readFileSync(agentSkillsPath, 'utf8'));
  check('agent-skills has $schema', typeof idx.$schema === 'string');
  check('agent-skills has skills array', Array.isArray(idx.skills));
  check('agent-skills has >= 1 skill', idx.skills.length >= 1);
  const first = idx.skills[0] || {};
  check(
    'first skill has name/type/description/url/sha256',
    typeof first.name === 'string' &&
      typeof first.type === 'string' &&
      typeof first.description === 'string' &&
      typeof first.url === 'string' &&
      /^[a-f0-9]{64}$/.test(first.sha256 || ''),
  );
} catch (err) {
  check('agent-skills parses as JSON', false, err.message);
}

// _headers content
const headers = readFileSync(headersPath, 'utf8');
check(
  '_headers sets Content-Type for api-catalog',
  /\/\.well-known\/api-catalog[\s\S]*Content-Type:\s*application\/linkset\+json/.test(headers),
);
check(
  '_headers sets Cache-Control for .well-known/*',
  /\/\.well-known\/\*[\s\S]*Cache-Control:/.test(headers),
);

if (failed > 0) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll T4 checks passed.');
