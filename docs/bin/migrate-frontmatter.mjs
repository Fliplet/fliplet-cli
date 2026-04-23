#!/usr/bin/env node
// One-time (idempotent) migration that adds YAML frontmatter to docs/**/*.md
// where it is missing or incomplete.
//
// Schema:
//   ---
//   title: "..."                 # required
//   description: "..."           # required
//   type: api-reference          # required: api-reference | guide | how-to | concept | tutorial | reference | integration
//   tags: [a, b]                 # required, 1-6 strings
//   v3_relevant: true            # required, default true (false for known V1-only files)
//   deprecated: false            # required, default false
//   ---
//
// Behaviour:
//   - If a file has no frontmatter -> prepend the full schema.
//   - If a file has partial frontmatter -> preserve existing keys, add missing ones.
//   - If a file has all required keys -> skip.
//   - Malformed YAML (unclosed ---) -> flag and skip.
//   - Missing H1 -> use filename stem as title (flagged for human review).
//   - Missing first paragraph -> description left empty (flagged).
//   - First paragraph > 160 chars -> truncated with ellipsis (flagged).
//
// Stdlib only.

import {
  readFileSync,
  writeFileSync,
  renameSync,
  readdirSync,
  mkdtempSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep, basename } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');

// Mirrors bin/build-agent-indexes.mjs's exclusion list so the two agree on
// which files are site content.
const EXCLUDED_FILES = new Set([
  'disable-analytics.md',
  'API/fliplet-encryption.deprecated.md',
  'API/fliplet-core.md',
  'API/fliplet-helper.md',
  'API/core/app-tasks.md',
  'CLAUDE.md',
]);

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

// Files known to be V1-only — v3_relevant is set false for these. Everything
// else defaults to true (most Fliplet JS APIs work in both V1 and V3).
const V3_NOT_RELEVANT = new Set([
  'API/core/app-actions.md',
  'API/core/app-actions-v2.md',
]);

const REQUIRED_FIELDS = ['title', 'description', 'type', 'tags', 'v3_relevant', 'deprecated'];

function shouldExclude(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true;
  if (relPath.endsWith('.deprecated.md')) return true;
  for (const d of EXCLUDED_DIRS) {
    if (relPath === d || relPath.startsWith(d + '/')) return true;
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

// Parse existing frontmatter. Returns { fm, body, fmRaw, malformed }.
// `fm` is the key-value dictionary, `fmRaw` is the original frontmatter
// string (for preservation when merging), `body` is everything after the
// closing `---`, and `malformed` is true for unclosed frontmatter.
export function parseFrontmatter(content) {
  const hasUnix = content.startsWith('---\n');
  const hasWin = content.startsWith('---\r\n');
  if (!hasUnix && !hasWin) return { fm: {}, body: content, fmRaw: null, malformed: false };
  const headerLen = hasUnix ? 4 : 5;
  const endMarker = hasUnix ? '\n---\n' : '\r\n---\r\n';
  const endIdx = content.indexOf(endMarker, headerLen);
  if (endIdx === -1) return { fm: {}, body: content, fmRaw: null, malformed: true };
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
  return { fm, body, fmRaw, malformed: false };
}

// Extract H1 from ATX or Setext form. Returns the string or null.
// Strips enclosing backticks so `# `Fliplet.X`` yields "Fliplet.X".
function extractH1(body) {
  const lines = body.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (
      i + 1 < lines.length &&
      line.trim().length > 0 &&
      !line.startsWith('#') &&
      /^=+\s*$/.test(lines[i + 1])
    ) {
      return line.trim();
    }
    if (line.startsWith('# ')) {
      const raw = line.slice(2).trim();
      const match = raw.match(/^`([^`]+)`(\s*\(.+\))?\s*$/);
      return match ? match[1] + (match[2] ? match[2] : '') : raw;
    }
    if (line.startsWith('#')) return null;
  }
  return null;
}

function extractFirstParagraph(body) {
  const lines = body.split(/\r?\n/);
  let i = 0;
  // Skip to after H1
  while (i < lines.length) {
    if (lines[i].startsWith('# ')) {
      i++;
      break;
    }
    if (
      i + 1 < lines.length &&
      lines[i].trim().length > 0 &&
      /^=+\s*$/.test(lines[i + 1])
    ) {
      i += 2;
      break;
    }
    i++;
  }
  // Skip blank lines and HTML warning/info blocks and leading images
  while (i < lines.length && lines[i].trim() === '') i++;
  while (i < lines.length && /^<p\s/.test(lines[i])) {
    while (i < lines.length && !lines[i].includes('</p>')) i++;
    if (i < lines.length) i++;
    while (i < lines.length && lines[i].trim() === '') i++;
  }
  while (i < lines.length && /^!\[.*\]\(.*\)\s*$/.test(lines[i].trim())) {
    i++;
    while (i < lines.length && lines[i].trim() === '') i++;
  }
  const paraLines = [];
  while (
    i < lines.length &&
    lines[i].trim() !== '' &&
    !lines[i].startsWith('#') &&
    !lines[i].startsWith('```') &&
    !lines[i].startsWith('---') &&
    !/^\s*[-*]\s/.test(lines[i]) &&
    !/^\s*\d+\.\s/.test(lines[i])
  ) {
    paraLines.push(lines[i]);
    i++;
  }
  return paraLines.join(' ').replace(/\s+/g, ' ').trim() || null;
}

function filenameStemTitle(relPath) {
  const stem = basename(relPath, '.md');
  // Turn CamelCase-with-dashes into Title Case words
  return stem.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function inferType(relPath) {
  if (/^API\/integrations\//.test(relPath)) return 'integration';
  if (/^API\//.test(relPath) || /^REST-API\//.test(relPath)) return 'api-reference';
  if (/^aab\//.test(relPath)) return 'guide';
  if (/^components\//.test(relPath)) return 'guide';
  const stem = basename(relPath, '.md');
  if (/^(Quickstart|Introduction|README)$/i.test(stem)) return 'tutorial';
  if (/^(coding-standards|javascript-coding-standards|code-api-patterns|UI-guidelines-(build|interface)|approved-libraries|Fliplet-approved-libraries|JS-APIs|API-Documentation|REST-API-Documentation|Changelog|Native-framework-changelog|Rate-limiting-for-API|URLs-and-IP-Addresses|Organization-audit-log-types|Fliplet-SDK)$/i.test(stem))
    return 'reference';
  if (/^(Building-|Cloning-|Custom-|Integrate-|Testing-|Theme-|Theming-|Publishing|Reduce-|Data-|Async-|AI-powered-|VS-Code-|AJAX-|Custom-Headers|Analytics-documentation|Context-targeting|Dependencies-and-assets|Component-events|Event-emitter|Execution-flow|File-security|App-security|disable-analytics|open-source|Upcoming|Best-practises|Theme-Settings-In-CSS)/i.test(stem))
    return 'how-to';
  return 'guide';
}

export function inferTags(relPath) {
  const parts = relPath.replace(/\.md$/, '').split('/');
  const tags = new Set();
  // First-segment tag (canonical area)
  if (parts.length > 1) {
    const first = parts[0].toLowerCase();
    if (first === 'api') tags.add('js-api');
    else if (first === 'rest-api') tags.add('rest-api');
    else if (first === 'components') tags.add('components-framework');
    else if (first === 'aab') tags.add('app-build');
  }
  // Subdirectory tags for API subtree
  if (parts[0] === 'API' && parts.length > 2) {
    const sub = parts[1].toLowerCase();
    tags.add(sub);
  }
  // Filename stem tokens
  const stem = parts[parts.length - 1].toLowerCase();
  // Strip fliplet- prefix and split hyphens
  const stripped = stem.replace(/^fliplet[-.]/, '');
  for (const token of stripped.split(/[-_.]/).filter(Boolean)) {
    if (token.length >= 3 && !/^(the|and|for|with|from|into|api|apis|documentation|page|pages)$/i.test(token)) {
      tags.add(token);
    }
  }
  // Special-case: v3 docs get the `v3` tag
  if (/\/v3\//.test(relPath)) tags.add('v3');
  return Array.from(tags).slice(0, 6);
}

function isV3Relevant(relPath) {
  if (V3_NOT_RELEVANT.has(relPath)) return false;
  return true;
}

function formatYamlScalar(v) {
  if (typeof v !== 'string') return JSON.stringify(v);
  // Quote if the value contains characters YAML might parse as special
  // (colons, hashes, leading dashes, etc). Over-quote rather than gamble.
  if (/^[A-Za-z0-9][A-Za-z0-9 ._/()\-—]*$/.test(v) && !/^(true|false|yes|no|null|on|off)$/i.test(v)) {
    return v;
  }
  return JSON.stringify(v);
}

function formatTags(tags) {
  return '[' + tags.map((t) => formatYamlScalar(t)).join(', ') + ']';
}

function renderFrontmatter(fm) {
  const lines = ['---'];
  lines.push(`title: ${formatYamlScalar(fm.title)}`);
  lines.push(`description: ${formatYamlScalar(fm.description)}`);
  lines.push(`type: ${formatYamlScalar(fm.type)}`);
  lines.push(`tags: ${formatTags(fm.tags)}`);
  lines.push(`v3_relevant: ${fm.v3_relevant}`);
  lines.push(`deprecated: ${fm.deprecated}`);
  lines.push('---');
  return lines.join('\n') + '\n';
}

function truncate(s, max) {
  if (!s) return '';
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + '…';
}

// Generate the complete frontmatter object for a file, merging existing
// values from `existing` on top of auto-derived ones. `flags` collects
// any concerns about data-quality the script wants to surface.
export function deriveFrontmatter(relPath, body, existing) {
  const flags = [];
  const h1 = extractH1(body);
  const para = extractFirstParagraph(body);
  if (!h1) flags.push('no-h1');
  if (!para && !existing.description) flags.push('no-first-paragraph');

  const autoTitle = h1 || filenameStemTitle(relPath);
  const autoDescription = truncate(para || '', 160);
  const autoType = inferType(relPath);
  const autoTags = inferTags(relPath);
  const autoV3 = isV3Relevant(relPath);
  const autoDeprecated = V3_NOT_RELEVANT.has(relPath);

  // Parse existing tags if it was stored as a literal string like "[a, b]"
  let parsedExistingTags = null;
  if (typeof existing.tags === 'string' && existing.tags.startsWith('[')) {
    try {
      parsedExistingTags = existing.tags
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    } catch {}
  }

  return {
    fm: {
      title: existing.title || autoTitle,
      description: existing.description || autoDescription,
      type: existing.type || autoType,
      tags: parsedExistingTags && parsedExistingTags.length > 0 ? parsedExistingTags : autoTags,
      v3_relevant:
        existing.v3_relevant !== undefined
          ? parseBool(existing.v3_relevant, autoV3)
          : autoV3,
      deprecated:
        existing.deprecated !== undefined
          ? parseBool(existing.deprecated, autoDeprecated)
          : autoDeprecated,
    },
    flags,
  };
}

function parseBool(raw, fallback) {
  if (raw === true || raw === 'true') return true;
  if (raw === false || raw === 'false') return false;
  return fallback;
}

function hasAllRequiredFields(existingFm) {
  return REQUIRED_FIELDS.every((k) => k in existingFm);
}

function main() {
  const summary = { migrated: [], upgraded: [], alreadyComplete: [], malformed: [] };
  for (const { fullPath, relPath } of walkMarkdown(docsRoot)) {
    const raw = readFileSync(fullPath, 'utf8');
    const { fm: existing, body, malformed } = parseFrontmatter(raw);
    if (malformed) {
      summary.malformed.push(relPath);
      console.warn(`[malformed] ${relPath}: unclosed --- frontmatter block, skipping.`);
      continue;
    }
    if (hasAllRequiredFields(existing)) {
      summary.alreadyComplete.push(relPath);
      continue;
    }
    const { fm, flags } = deriveFrontmatter(relPath, body, existing);
    const newContent = renderFrontmatter(fm) + body;

    // Atomic write: temp file + rename
    const tmpPath = fullPath + '.migrate.tmp';
    writeFileSync(tmpPath, newContent, 'utf8');
    renameSync(tmpPath, fullPath);

    const entry = { path: relPath, flags };
    if (Object.keys(existing).length > 0) summary.upgraded.push(entry);
    else summary.migrated.push(entry);
  }

  console.log('\n=== Frontmatter migration summary ===');
  console.log(`Fully migrated (had no FM): ${summary.migrated.length}`);
  console.log(`Upgraded (had partial FM):   ${summary.upgraded.length}`);
  console.log(`Already complete (skipped): ${summary.alreadyComplete.length}`);
  console.log(`Malformed (skipped):        ${summary.malformed.length}`);

  const flaggedForReview = [...summary.migrated, ...summary.upgraded].filter(
    (e) => e.flags.length > 0,
  );
  if (flaggedForReview.length > 0) {
    console.log('\n=== Files flagged for human review ===');
    for (const e of flaggedForReview) {
      console.log(`  ${e.path}  (${e.flags.join(', ')})`);
    }
  }
  if (summary.malformed.length > 0) {
    console.log('\n=== Malformed files (needs manual repair before re-run) ===');
    for (const p of summary.malformed) console.log(`  ${p}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
