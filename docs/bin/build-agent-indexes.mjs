#!/usr/bin/env node
// Generate AI doc-discovery primitives from docs/**/*.md.
// Run before `bundle exec jekyll build` so Jekyll copies the outputs into _site/.
// Stdlib only — no npm deps.
//
// Inputs:  docs/**/*.md (walks filesystem directly)
// Outputs: docs/.well-known/
//   llms.txt                  — llmstxt.org format, grouped by area
//   llms-full.txt             — concatenated markdown of all docs
//   agent-skills/index.json   — Agent Skills Discovery v0.2.0
//   api-catalog               — RFC 9727 linkset+json
//
// Title comes from frontmatter `title:` if present, else the H1 (stripped of
// enclosing backticks). Description comes from frontmatter `description:` if
// present, else the first paragraph after the H1. This adapter pattern lets
// Phase 2's frontmatter migration add fields without changing this script.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const wellKnownDir = join(docsRoot, '.well-known');
const agentSkillsDir = join(wellKnownDir, 'agent-skills');

const BASE_URL = 'https://developers.fliplet.com';
const SITE_TITLE = 'Fliplet Developers';
const SITE_DESCRIPTION =
  'Developer documentation for the Fliplet platform — JavaScript APIs, REST APIs, component and helper frameworks, and developer guides for building apps, components, themes, and integrations on Fliplet.';

// Redirect stubs, opt-out pages, and repo-authoring meta-docs that should
// never appear in the product index.
const EXCLUDED_FILES = new Set([
  'disable-analytics.md',
  'API/fliplet-encryption.deprecated.md',
  'API/fliplet-core.md',
  'API/fliplet-helper.md',
  'API/core/app-tasks.md',
  'CLAUDE.md',
]);

// Directory prefixes whose contents are never indexed.
const EXCLUDED_DIRS = [
  '_site',
  '_includes',
  '_layouts',
  '_plugins',
  '_templates',
  'node_modules',
  'docsearch',
  'bin',
  'test',
  '.git',
  '.github',
  '.well-known',
  'assets',
];

// Ordered group labels for llms.txt. First-matching-prefix wins, so put
// narrower prefixes (API/core/) before broader ones (API/).
const GROUPS = [
  { prefix: 'API/core/', label: 'Fliplet Core JavaScript APIs' },
  { prefix: 'API/components/', label: 'App components' },
  { prefix: 'API/helpers/', label: 'Helpers framework' },
  { prefix: 'API/datasources/', label: 'Data Sources' },
  { prefix: 'API/integrations/', label: 'Integrations' },
  { prefix: 'API/libraries/', label: 'Libraries' },
  { prefix: 'API/providers/', label: 'Providers' },
  { prefix: 'API/', label: 'Fliplet JavaScript APIs' },
  { prefix: 'REST-API/', label: 'REST APIs' },
  { prefix: 'components/', label: 'Component framework' },
  { prefix: 'aab/', label: 'Automated App Builds' },
  { prefix: '', label: 'Guides' },
];

function pickGroup(relPath) {
  for (const g of GROUPS) {
    if (relPath.startsWith(g.prefix)) return g.label;
  }
  return 'Guides';
}

function shouldExclude(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true;
  if (relPath.endsWith('.deprecated.md')) return true;
  for (const d of EXCLUDED_DIRS) {
    // Match the dir at the root OR nested at any depth (e.g. mcp-worker/node_modules/...).
    // The nested check is what stops mcp-worker/node_modules/**/README.md from leaking
    // into the index when someone runs the script after `npm install` in mcp-worker/.
    if (relPath === d || relPath.startsWith(d + '/') || relPath.includes('/' + d + '/')) {
      return true;
    }
  }
  return false;
}

function* walkMarkdown(dir, rootDir = dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    const rel = relative(rootDir, full).split(sep).join('/');
    if (shouldExclude(rel)) continue;
    if (entry.isDirectory()) {
      yield* walkMarkdown(full, rootDir);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      yield { fullPath: full, relPath: rel };
    }
  }
}

// Parse single-line-value YAML frontmatter. Good enough for this repo today;
// Phase 2's schema migration (title/description/type/tags/v3_relevant) will
// still be single-line per field aside from tags:, which this parser keeps as
// a literal string — adequate for lookup, but upgrade if tag filtering is
// needed.
export function parseFrontmatter(content) {
  const hasUnix = content.startsWith('---\n');
  const hasWin = content.startsWith('---\r\n');
  if (!hasUnix && !hasWin) return { fm: {}, body: content };
  const headerLen = hasUnix ? 4 : 5;
  // endMarker spans the full line-separator before the closing --- so fmRaw
  // doesn't get a trailing \r on Windows.
  const endMarker = hasUnix ? '\n---\n' : '\r\n---\r\n';
  const endIdx = content.indexOf(endMarker, headerLen);
  if (endIdx === -1) return { fm: {}, body: content };
  const fmRaw = content.slice(headerLen, endIdx);
  const body = content.slice(endIdx + endMarker.length);
  const fm = {};
  for (const line of fmRaw.split(/\r\n|\r|\n/)) {
    const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    fm[m[1]] = v;
  }
  return { fm, body };
}

// Extract H1 and first paragraph from markdown body.
// Handles ATX (`# Title`) and Setext (`Title\n===`) H1s. Strips enclosing
// backticks from ATX H1s so `` # `Fliplet.X` `` yields the plain string
// "Fliplet.X", suitable for index display.
export function extractH1AndIntro(body) {
  const lines = body.split(/\r?\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Setext-style H1: non-empty line followed by ===...
    if (
      i + 1 < lines.length &&
      line.trim().length > 0 &&
      !line.startsWith('#') &&
      /^=+\s*$/.test(lines[i + 1])
    ) {
      return findIntro(lines, i + 2, line.trim());
    }
    if (line.startsWith('# ')) {
      const raw = line.slice(2).trim();
      const match = raw.match(/^`([^`]+)`(\s*\(.+\))?\s*$/);
      const h1 = match ? match[1] + (match[2] ? match[2] : '') : raw;
      return findIntro(lines, i + 1, h1);
    }
    if (line.startsWith('#')) return { h1: null, intro: null };
    i++;
  }
  return { h1: null, intro: null };
}

function findIntro(lines, startIdx, h1) {
  let j = startIdx;
  while (j < lines.length && lines[j].trim() === '') j++;
  // Skip HTML warning/info blocks (<p class="warning">, <p class="info">, etc)
  while (j < lines.length && /^<p\s/.test(lines[j])) {
    while (j < lines.length && !lines[j].includes('</p>')) j++;
    if (j < lines.length) j++;
    while (j < lines.length && lines[j].trim() === '') j++;
  }
  // Skip standalone image lines
  while (j < lines.length && /^!\[.*\]\(.*\)\s*$/.test(lines[j].trim())) {
    j++;
    while (j < lines.length && lines[j].trim() === '') j++;
  }
  const paraLines = [];
  while (
    j < lines.length &&
    lines[j].trim() !== '' &&
    !lines[j].startsWith('#') &&
    !lines[j].startsWith('```') &&
    !lines[j].startsWith('---') &&
    !/^\s*[-*]\s/.test(lines[j]) &&
    !/^\s*\d+\.\s/.test(lines[j])
  ) {
    paraLines.push(lines[j]);
    j++;
  }
  const intro = paraLines.join(' ').replace(/\s+/g, ' ').trim() || null;
  return { h1, intro };
}

export function urlForPath(relPath) {
  if (relPath === 'README.md') return `${BASE_URL}/`;
  return `${BASE_URL}/${relPath.replace(/\.md$/, '.html')}`;
}

function skillNameForPath(relPath) {
  return relPath
    .replace(/\.md$/, '')
    .replace(/\//g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .toLowerCase();
}

export function truncate(s, max) {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

export function emitLlmsTxt(docs) {
  let out = `# ${SITE_TITLE}\n\n> ${SITE_DESCRIPTION}\n`;
  const byGroup = new Map();
  for (const doc of docs) {
    if (!byGroup.has(doc.group)) byGroup.set(doc.group, []);
    byGroup.get(doc.group).push(doc);
  }
  for (const group of GROUPS) {
    const entries = byGroup.get(group.label);
    if (!entries || entries.length === 0) continue;
    out += `\n## ${group.label}\n\n`;
    for (const doc of entries) {
      const desc = doc.description ? `: ${doc.description}` : '';
      out += `- [${doc.title}](${doc.url})${desc}\n`;
    }
  }
  return out;
}

export function emitLlmsFullTxt(docs) {
  return docs
    .map((doc) => `# ${doc.title}\nURL: ${doc.url}\n\n${doc.body.trim()}\n`)
    .join('\n---\n\n');
}

export function emitAgentSkills(docs) {
  return {
    $schema: 'https://agentskills.io/schema/v0.2.0/index.json',
    skills: docs.map((doc) => ({
      name: doc.skillName,
      type: 'documentation',
      description: doc.description,
      url: doc.url,
      sha256: doc.sha256,
    })),
  };
}

export function emitApiCatalog(docs) {
  return {
    linkset: docs.map((doc) => ({
      anchor: doc.url,
      'service-doc': [{ href: doc.url, type: 'text/html', title: doc.title }],
    })),
  };
}

export function collectDocs(rootDir) {
  const docs = [];
  for (const { fullPath, relPath } of walkMarkdown(rootDir)) {
    const raw = readFileSync(fullPath, 'utf8');
    const { fm, body } = parseFrontmatter(raw);
    const { h1, intro } = extractH1AndIntro(body);
    if (!h1 && !fm.title) {
      console.warn(`[skip] no H1 or frontmatter title: ${relPath}`);
      continue;
    }
    const title = fm.title || h1;
    const description = fm.description || intro || '';
    const sha256 = createHash('sha256').update(raw).digest('hex');
    docs.push({
      relPath,
      url: urlForPath(relPath),
      title,
      description: truncate(description, 200),
      group: pickGroup(relPath),
      sha256,
      skillName: skillNameForPath(relPath),
      body,
    });
  }
  docs.sort((a, b) => a.url.localeCompare(b.url));
  return docs;
}

function main() {
  const docs = collectDocs(docsRoot);
  console.log(`Discovered ${docs.length} docs for indexing`);

  mkdirSync(agentSkillsDir, { recursive: true });

  const llmsTxt = emitLlmsTxt(docs);
  writeFileSync(join(wellKnownDir, 'llms.txt'), llmsTxt);

  const llmsFull = emitLlmsFullTxt(docs);
  writeFileSync(join(wellKnownDir, 'llms-full.txt'), llmsFull);

  const agentSkills = emitAgentSkills(docs);
  writeFileSync(
    join(agentSkillsDir, 'index.json'),
    JSON.stringify(agentSkills, null, 2) + '\n',
  );

  const apiCatalog = emitApiCatalog(docs);
  writeFileSync(
    join(wellKnownDir, 'api-catalog'),
    JSON.stringify(apiCatalog, null, 2) + '\n',
  );

  console.log('Generated:');
  console.log(`  .well-known/llms.txt                 (${llmsTxt.length} bytes, ${docs.length} entries)`);
  console.log(`  .well-known/llms-full.txt            (${llmsFull.length} bytes)`);
  console.log(`  .well-known/agent-skills/index.json  (${docs.length} skills)`);
  console.log(`  .well-known/api-catalog              (${docs.length} entries)`);
}

// Run main() only when invoked as a script, not when imported by tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
