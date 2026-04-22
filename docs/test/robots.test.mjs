// R1 regression test: robots.txt must Disallow /Data-flow.html for every
// named User-agent block AND the wildcard. If this fails, the rewrite has
// silently dropped an existing rule. Run with: node docs/test/robots.test.mjs

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const robotsPath = join(here, '..', 'robots.txt');
const text = readFileSync(robotsPath, 'utf8');

const groups = [];
let current = null;
for (const rawLine of text.split(/\r?\n/)) {
  const line = rawLine.split('#')[0].trim();
  if (!line) continue;
  const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
  if (!m) continue;
  const [, field, value] = [m[0], m[1].toLowerCase(), m[2].trim()];
  if (field === 'user-agent') {
    if (!current || current._lastField !== 'user-agent') {
      current = { agents: [], rules: [] };
      groups.push(current);
    }
    current.agents.push(value);
  } else if (field === 'disallow' || field === 'allow') {
    if (current) current.rules.push({ type: field, path: value });
  }
  if (current) current._lastField = field;
}

const requiredAgents = [
  '*',
  'GPTBot',
  'ClaudeBot',
  'Claude-Web',
  'PerplexityBot',
  'Google-Extended',
  'CCBot',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'cohere-ai',
];

let failed = 0;
for (const ua of requiredAgents) {
  const group = groups.find((g) => g.agents.some((a) => a === ua));
  if (!group) {
    console.error(`FAIL: no User-agent block for "${ua}"`);
    failed += 1;
    continue;
  }
  const hasDisallow = group.rules.some(
    (r) => r.type === 'disallow' && r.path === '/Data-flow.html',
  );
  if (!hasDisallow) {
    console.error(`FAIL: User-agent "${ua}" does not Disallow /Data-flow.html`);
    failed += 1;
  } else {
    console.log(`ok: ${ua} Disallows /Data-flow.html`);
  }
}

if (!/^\s*Sitemap:\s*https:\/\/developers\.fliplet\.com\/sitemap\.xml\s*$/m.test(text)) {
  console.error('FAIL: Sitemap directive missing or pointing at wrong URL');
  failed += 1;
} else {
  console.log('ok: Sitemap directive present');
}

if (!/^\s*Content-Signal:\s*.*search=yes.*ai-train=yes.*ai-input=yes/m.test(text)) {
  console.error('FAIL: Content-Signal directive missing expected values');
  failed += 1;
} else {
  console.log('ok: Content-Signal directive present');
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed.`);
  process.exit(1);
}
console.log('\nAll R1 checks passed.');
