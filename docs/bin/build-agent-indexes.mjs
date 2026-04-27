#!/usr/bin/env node
// Generate AI doc-discovery primitives from docs/**/*.md.
// Run before `bundle exec jekyll build` so Jekyll copies the outputs into _site/.
// Stdlib only — no npm deps.
//
// Inputs:  docs/**/*.md (walks filesystem directly)
// Outputs: docs/.well-known/
//   llms.txt                              — llmstxt.org format, grouped by area
//   llms-full.txt                         — concatenated markdown of all docs
//   agent-skills/index.json               — Agent Skills Discovery v0.2.0,
//                                           cluster-shaped (one skill per
//                                           Fliplet capability area, not per
//                                           doc page)
//   agent-skills/<cluster>/SKILL.md       — auto-generated entry point for
//                                           each cluster, listing its docs
//   mcp/server-card.json                  — MCP Server Card (SEP-1649) for
//                                           the Worker at developers.fliplet
//                                           .com/mcp
//
// Title comes from frontmatter `title:` if present, else the H1 (stripped of
// enclosing backticks). Description comes from frontmatter `description:` if
// present, else the first paragraph after the H1. This adapter pattern lets
// Phase 2's frontmatter migration add fields without changing this script.

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { shouldExclude } from './exclusions.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const wellKnownDir = join(docsRoot, '.well-known');
const agentSkillsDir = join(wellKnownDir, 'agent-skills');
const mcpDir = join(wellKnownDir, 'mcp');

const BASE_URL = 'https://developers.fliplet.com';
const MCP_ENDPOINT = `${BASE_URL}/mcp`;
const SITE_TITLE = 'Fliplet Developers';
const SITE_DESCRIPTION =
  'Developer documentation for the Fliplet platform — JavaScript APIs, REST APIs, component and helper frameworks, and developer guides for building apps, components, themes, and integrations on Fliplet.';

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

// Cluster definitions for agent-skills/index.json. Each cluster represents a
// Fliplet capability area (the right shape for Agent Skills v0.2.0, which is
// designed for capability-level discovery — not per-doc indexing; that's what
// llms.txt is for).
//
// Order matters: assignToCluster() returns the FIRST matching cluster, so
// narrower predicates must come before broader ones. The catch-all fallback
// (`fliplet-docs-index`) lives last and intentionally describes itself as a
// fallback so embedding rankers score it low on capability queries.
export const CLUSTERS = [
  {
    name: 'fliplet-data-sources',
    title: 'Fliplet data sources',
    description:
      'Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.',
    landingUrl: `${BASE_URL}/API/fliplet-datasources.html`,
    tags: ['data-sources', 'js-api', 'security'],
    match: (p) =>
      p.startsWith('API/datasources/') ||
      p === 'API/fliplet-datasources.md' ||
      p === 'Data-source-security.md' ||
      p === 'Data-Source-Hooks.md' ||
      p === 'Data-flow.md' ||
      p === 'File-security.md',
  },
  {
    name: 'fliplet-app-actions',
    title: 'Fliplet App Actions (server-side automations)',
    description:
      'Build server-side automations that run on a schedule or in response to events. Covers App Actions v1, v2, and v3 APIs.',
    landingUrl: `${BASE_URL}/API/core/app-actions.html`,
    tags: ['app-actions', 'js-api', 'server-side'],
    match: (p) => /^API\/core\/app-actions(-v[23])?\.md$/.test(p),
  },
  {
    name: 'fliplet-helpers-framework',
    title: 'Fliplet helpers framework',
    description:
      'Build helpers — reusable Vue-based interface components with editable interface fields, hooks, methods, libraries, and templates.',
    landingUrl: `${BASE_URL}/API/helpers/overview.html`,
    tags: ['helpers-framework', 'components-framework'],
    match: (p) => p.startsWith('API/helpers/'),
  },
  {
    name: 'fliplet-rest-api',
    title: 'Fliplet REST API',
    description:
      'Server-side REST API for managing organizations, apps, users, data sources, files, and screens from your own backend.',
    landingUrl: `${BASE_URL}/REST-API-Documentation.html`,
    tags: ['rest-api', 'server-side'],
    match: (p) =>
      p.startsWith('REST-API/') ||
      p === 'REST-API-Documentation.md' ||
      p === 'Rate-limiting-for-API.md',
  },
  {
    name: 'fliplet-components-framework',
    title: 'Fliplet components framework',
    description:
      'Build custom components (widgets) that ship inside Fliplet apps: component definitions, lifecycle, events, dependencies, providers, custom templates, testing.',
    landingUrl: `${BASE_URL}/Building-components.html`,
    tags: ['components-framework', 'widgets'],
    match: (p) =>
      p.startsWith('components/') ||
      p === 'Building-components.md' ||
      p === 'Building-functions.md' ||
      p === 'Component-events.md' ||
      p === 'Cloning-widgets.md' ||
      p === 'Context-targeting.md' ||
      p === 'Custom-Headers.md' ||
      p === 'Custom-template-for-components.md' ||
      p === 'Dependencies-and-assets.md' ||
      p === 'Testing-components.md' ||
      p === 'UI-guidelines-build.md' ||
      p === 'UI-guidelines-interface.md',
  },
  {
    name: 'fliplet-themes-framework',
    title: 'Fliplet themes framework',
    description:
      'Build custom themes that control app appearance: color palettes, typography, theme settings exposed in the editor, CSS overrides.',
    landingUrl: `${BASE_URL}/Building-themes.html`,
    tags: ['themes-framework'],
    match: (p) =>
      p === 'Building-themes.md' ||
      p === 'Theme-Settings-In-CSS.md' ||
      p === 'Theming-appearance.md' ||
      p === 'API/fliplet-themes.md',
  },
  {
    name: 'fliplet-menus-framework',
    title: 'Fliplet menus framework',
    description:
      'Build custom menus that ship inside Fliplet apps to navigate between screens.',
    landingUrl: `${BASE_URL}/Building-menus.html`,
    tags: ['menus-framework'],
    match: (p) => p === 'Building-menus.md',
  },
  {
    name: 'fliplet-app-build-and-publish',
    title: 'Fliplet app build and publish',
    description:
      'Publish Fliplet apps to iOS, Android, and the web: bundle size, certificates, automated app builds, platform-specific gotchas.',
    landingUrl: `${BASE_URL}/Publishing.html`,
    tags: ['publish', 'platform'],
    match: (p) =>
      p === 'Publishing.md' ||
      p === 'Platform-iOS.md' ||
      p === 'Platform-Android.md' ||
      p.startsWith('aab/') ||
      p === 'Reduce-app-bundle-size.md',
  },
  {
    name: 'fliplet-security-and-compliance',
    title: 'Fliplet security and compliance',
    description:
      'App-level security, IP allowlisting, organization audit logs, privacy controls. (Data-source-level security lives in fliplet-data-sources.)',
    landingUrl: `${BASE_URL}/App-security.html`,
    tags: ['security', 'compliance'],
    match: (p) =>
      p === 'App-security.md' ||
      p === 'URLs-and-IP-Addresses.md' ||
      p === 'Organization-audit-log-types.md',
  },
  {
    name: 'fliplet-integrations',
    title: 'Fliplet integrations',
    description:
      'Integrate with external systems: SSO/SAML2, the Data Integration Service, external REST APIs, OAuth2, AJAX cross-domain.',
    landingUrl: `${BASE_URL}/Data-integration-service.html`,
    tags: ['integrations', 'sso', 'oauth'],
    match: (p) =>
      p.startsWith('API/integrations/') ||
      p === 'Data-integration-service.md' ||
      p === 'Integrate-with-external-API.md' ||
      p === 'AJAX-cross-domain.md' ||
      p === 'API/fliplet-oauth2.md',
  },
  {
    name: 'fliplet-js-api',
    title: 'Fliplet JavaScript API (Fliplet.*)',
    description:
      'The Fliplet client-side JavaScript API: every Fliplet.X namespace (Storage, User, Navigate, Profile, Communicate, Media, Notifications, UI, ...).',
    landingUrl: `${BASE_URL}/API-Documentation.html`,
    tags: ['js-api'],
    match: (p) =>
      p.startsWith('API/') ||
      p === 'API-Documentation.md' ||
      p === 'JS-APIs.md' ||
      p === 'Fliplet-SDK.md' ||
      p === 'Fliplet-approved-libraries.md' ||
      p === 'approved-libraries.md' ||
      p === 'code-api-patterns.md',
  },
  // Fallback last. Description is intentionally meta-heavy and capability-
  // light so embedding rankers score it low on domain queries. Tagged
  // `fallback` so tag filters can deprioritize.
  {
    name: 'fliplet-docs-index',
    title: 'Fliplet developer documentation (fallback index)',
    description:
      'Site-wide index of the Fliplet developer documentation. Use only as a fallback when no other Fliplet skill (js-api, rest-api, data-sources, app-actions, components-framework, helpers-framework, themes-framework, menus-framework, app-build-and-publish, security-and-compliance, integrations) matches your query. Points at /.well-known/llms.txt for full-site discovery.',
    landingUrl: `${BASE_URL}/`,
    tags: ['meta', 'index', 'fallback'],
    match: () => true,
  },
];

export function assignToCluster(relPath) {
  for (const c of CLUSTERS) {
    if (c.match(relPath)) return c;
  }
  return CLUSTERS[CLUSTERS.length - 1]; // unreachable; fallback always matches
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

// Build the cluster-shaped agent-skills index. Each entry points at a
// SKILL.md emitted under .well-known/agent-skills/<cluster>/SKILL.md.
// `sha256` is the digest of the rendered SKILL.md so consumers can detect
// drift the same way they could with per-doc entries.
export function emitAgentSkills(docsByCluster) {
  return {
    skills: CLUSTERS.map((c) => {
      const entry = docsByCluster.get(c.name) || { skillMdSha256: '', count: 0 };
      return {
        name: c.name,
        title: c.title,
        description: c.description,
        url: `${BASE_URL}/.well-known/agent-skills/${c.name}/SKILL.md`,
        landingUrl: c.landingUrl,
        tags: c.tags,
        sha256: entry.skillMdSha256,
      };
    }),
  };
}

// Render the SKILL.md body for a cluster. Body lists every doc the cluster
// owns (auto-generated; new docs added under a matching path appear without
// edits). The fallback cluster gets a different body that explicitly tells
// the agent to prefer specific clusters first.
export function emitSkillMd(cluster, docsInCluster) {
  const fm = `---\nname: ${cluster.name}\ndescription: ${cluster.description}\n---\n`;

  if (cluster.name === 'fliplet-docs-index') {
    const fallbackDocs = docsInCluster
      .map((d) => `- [${d.title}](${d.url})${d.description ? `: ${d.description}` : ''}`)
      .join('\n');
    return (
      fm +
      `\n# Fliplet developer documentation index\n\n` +
      `${cluster.description}\n\n` +
      `## Prefer a specific Fliplet skill\n\n` +
      `Before loading this fallback skill, check whether one of the following matches your query:\n\n` +
      CLUSTERS.filter((c) => c.name !== 'fliplet-docs-index')
        .map((c) => `- \`${c.name}\` — ${c.description}`)
        .join('\n') +
      `\n\n## General docs in this bucket\n\n` +
      `These docs don't belong to a single capability cluster — they are general onboarding, conventions, or cross-cutting references. Listed here so they remain reachable via agent-skills discovery even when no specific cluster is loaded:\n\n` +
      fallbackDocs +
      `\n\n## Full site index\n\n` +
      `If you need the complete list across every cluster, fetch [${BASE_URL}/.well-known/llms.txt](${BASE_URL}/.well-known/llms.txt). Each entry is a one-line summary; replace \`.html\` with \`.md\` on any doc URL to fetch the raw Markdown.\n\n` +
      `## MCP server\n\n` +
      `For tool-driven discovery, point an MCP-aware client at [${MCP_ENDPOINT}](${MCP_ENDPOINT}). The server exposes \`search_fliplet_docs\` and \`fetch_fliplet_doc\`.\n`
    );
  }

  const docList = docsInCluster
    .map((d) => `- [${d.title}](${d.url})${d.description ? `: ${d.description}` : ''}`)
    .join('\n');

  return (
    fm +
    `\n# ${cluster.title}\n\n` +
    `${cluster.description}\n\n` +
    `## Documentation\n\n` +
    docList +
    `\n\n## How to load full content\n\n` +
    `Replace \`.html\` with \`.md\` on any URL above to fetch the raw Markdown source. To search across all Fliplet developer docs, use the MCP server at [${MCP_ENDPOINT}](${MCP_ENDPOINT}) (tools: \`search_fliplet_docs\`, \`fetch_fliplet_doc\`), or fetch [${BASE_URL}/.well-known/llms-full.txt](${BASE_URL}/.well-known/llms-full.txt) for the entire site as a single stream.\n`
  );
}

// V3 library catalog manifest. Emitted at /.well-known/llms-v3-libraries.json
// and consumed by Studio's `searchLibraries.js` tool to drive V3 builder
// library discovery, replacing the legacy /v1/widgets/assets fetch.
//
// Inclusion rule: docs whose `relPath` matches `API/fliplet-*.md` AND that
// do NOT have `exclude_from_v3_catalog: true` in frontmatter. Package name
// defaults to the URL slug (`API/fliplet-barcode.md` → `fliplet-barcode`)
// and can be overridden via `package:` frontmatter for the rare slug-vs-pkg
// mismatch case (none in the initial catalog, but the override exists).
//
// Schema is intentionally minimal: 4 fields per entry. Title and description
// are reused from the existing build pipeline (frontmatter or H1+intro
// extraction). No `provides`, `tags`, or `preloaded` — those either live in
// `assets.json` (provides, consumed by dependencyDetector) or are
// derivable / decorative for the agent (tags, preloaded). See
// docs/plans/v3-library-catalog.md in the studio repo for the full design.
const V3_LIBRARY_PATH_RE = /^API\/fliplet-[^/]+\.md$/;

export function deriveV3Package(relPath) {
  const match = relPath.match(/^API\/(fliplet-[^/]+)\.md$/);
  return match ? match[1] : null;
}

export function emitV3LibraryCatalog(docs) {
  const libraries = [];
  for (const doc of docs) {
    if (!V3_LIBRARY_PATH_RE.test(doc.relPath)) continue;
    const fm = doc.fm || {};
    if (fm.exclude_from_v3_catalog === 'true') continue;
    const pkg = (fm.package && fm.package.trim()) || deriveV3Package(doc.relPath);
    if (!pkg) continue;
    libraries.push({
      package: pkg,
      title: doc.title,
      description: doc.description || '',
      docUrl: doc.url,
    });
  }
  libraries.sort((a, b) => a.package.localeCompare(b.package));
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    libraries,
  };
}

// MCP Server Card per SEP-1649
// (https://github.com/modelcontextprotocol/modelcontextprotocol/pull/2127).
// The schema is still being standardized; consumers that pre-date the SEP
// can still consume `serverInfo`, `transport`, and `capabilities.tools` —
// those are the load-bearing fields validators check today.
export function emitMcpServerCard() {
  return {
    schemaVersion: '2025-06-18',
    serverInfo: {
      name: 'fliplet-docs-mcp',
      title: 'Fliplet developer docs MCP server',
      version: '0.1.0',
    },
    transport: {
      type: 'streamable_http',
      url: MCP_ENDPOINT,
    },
    capabilities: {
      tools: [
        {
          name: 'search_fliplet_docs',
          description:
            'Fuzzy-search the Fliplet developer documentation index (llms.txt). Returns ranked matches with title, URL, description, group, and relevance score.',
        },
        {
          name: 'fetch_fliplet_doc',
          description:
            'Fetch the raw Markdown source of a single Fliplet developer documentation page. URL must be under developers.fliplet.com and end in .md.',
        },
      ],
    },
    documentation: `${BASE_URL}/`,
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
    const cluster = assignToCluster(relPath);
    docs.push({
      relPath,
      url: urlForPath(relPath),
      title,
      description: truncate(description, 200),
      group: pickGroup(relPath),
      cluster: cluster.name,
      sha256,
      skillName: skillNameForPath(relPath),
      body,
      // Preserve raw frontmatter on the doc record so strict-mode
      // validation (validateFrontmatter) can check type, tags, etc.
      // without re-parsing the file.
      fm,
    });
  }
  docs.sort((a, b) => a.url.localeCompare(b.url));
  return docs;
}

// Allowed values for the `type:` frontmatter field. Documented in
// docs/CLAUDE.md as the canonical schema; any addition here must also
// land there.
export const ALLOWED_TYPES = new Set([
  'api-reference',
  'guide',
  'how-to',
  'concept',
  'tutorial',
  'reference',
  'integration',
]);

// Strict-mode frontmatter validator. Returns an array of error objects
// (`{ relPath, field, message }`) — empty array means clean. We only
// validate fields the build is load-bearing on (title, description) plus
// the schema fields explicitly documented in CLAUDE.md as required
// (type, tags). Aspirational fields (v3_relevant, deprecated) are not
// enforced here so the spec can evolve without bricking the build.
export function validateFrontmatter(docs) {
  const errors = [];
  for (const doc of docs) {
    const fm = doc.fm || {};
    if (!fm.title || fm.title.trim() === '') {
      errors.push({
        relPath: doc.relPath,
        field: 'title',
        message: 'missing or empty `title:` in frontmatter',
      });
    }
    if (!fm.description || fm.description.trim() === '') {
      errors.push({
        relPath: doc.relPath,
        field: 'description',
        message: 'missing or empty `description:` in frontmatter',
      });
    }
    if (!fm.type || fm.type.trim() === '') {
      errors.push({
        relPath: doc.relPath,
        field: 'type',
        message: 'missing or empty `type:` in frontmatter',
      });
    } else if (!ALLOWED_TYPES.has(fm.type.trim())) {
      errors.push({
        relPath: doc.relPath,
        field: 'type',
        message: `\`type: ${fm.type}\` is not in allowed set [${[...ALLOWED_TYPES].join(', ')}]`,
      });
    }
    // tags is parsed as a literal string by our minimal YAML parser
    // (e.g. "[js-api, datasources]"). We just check it's non-empty.
    if (!fm.tags || fm.tags.trim() === '' || fm.tags.trim() === '[]') {
      errors.push({
        relPath: doc.relPath,
        field: 'tags',
        message: 'missing or empty `tags:` in frontmatter (need at least one)',
      });
    }
  }
  return errors;
}

function main() {
  const strict = process.argv.includes('--strict');
  const docs = collectDocs(docsRoot);
  console.log(`Discovered ${docs.length} docs for indexing`);

  // Strict mode: validate frontmatter before emitting anything. CI runs
  // this on every PR that touches docs/**/*.md (see .github/workflows/
  // docs-validate.yml) so authoring violations get caught at review time
  // rather than degrading the published artifacts silently.
  const fmErrors = validateFrontmatter(docs);
  if (fmErrors.length > 0) {
    const tag = strict ? '[error]' : '[warn]';
    for (const e of fmErrors) {
      console.error(`${tag} ${e.relPath}: ${e.message}`);
    }
    if (strict) {
      console.error(
        `\n${fmErrors.length} frontmatter error${fmErrors.length === 1 ? '' : 's'} — failing build (--strict).`,
      );
      process.exit(1);
    }
  }

  mkdirSync(agentSkillsDir, { recursive: true });
  mkdirSync(mcpDir, { recursive: true });

  const llmsTxt = emitLlmsTxt(docs);
  writeFileSync(join(wellKnownDir, 'llms.txt'), llmsTxt);

  const llmsFull = emitLlmsFullTxt(docs);
  writeFileSync(join(wellKnownDir, 'llms-full.txt'), llmsFull);

  // Group docs by cluster, render SKILL.md per cluster, hash each rendered
  // SKILL.md for the index entry's sha256, then emit the cluster-shaped
  // index.json.
  const docsByClusterName = new Map();
  for (const c of CLUSTERS) docsByClusterName.set(c.name, []);
  for (const d of docs) docsByClusterName.get(d.cluster).push(d);

  const skillSummaries = new Map();
  for (const c of CLUSTERS) {
    const clusterDocs = docsByClusterName.get(c.name);
    const skillMd = emitSkillMd(c, clusterDocs);
    const skillMdSha256 = createHash('sha256').update(skillMd).digest('hex');
    const clusterDir = join(agentSkillsDir, c.name);
    mkdirSync(clusterDir, { recursive: true });
    writeFileSync(join(clusterDir, 'SKILL.md'), skillMd);
    skillSummaries.set(c.name, { skillMdSha256, count: clusterDocs.length });
  }

  const agentSkills = emitAgentSkills(skillSummaries);
  writeFileSync(
    join(agentSkillsDir, 'index.json'),
    JSON.stringify(agentSkills, null, 2) + '\n',
  );

  const mcpCard = emitMcpServerCard();
  writeFileSync(
    join(mcpDir, 'server-card.json'),
    JSON.stringify(mcpCard, null, 2) + '\n',
  );

  const v3Catalog = emitV3LibraryCatalog(docs);
  writeFileSync(
    join(wellKnownDir, 'llms-v3-libraries.json'),
    JSON.stringify(v3Catalog, null, 2) + '\n',
  );

  console.log('Generated:');
  console.log(`  .well-known/llms.txt                 (${llmsTxt.length} bytes, ${docs.length} entries)`);
  console.log(`  .well-known/llms-full.txt            (${llmsFull.length} bytes)`);
  console.log(`  .well-known/agent-skills/index.json  (${CLUSTERS.length} clusters, ${docs.length} docs)`);
  for (const c of CLUSTERS) {
    const n = skillSummaries.get(c.name).count;
    console.log(`    └─ ${c.name.padEnd(34)} (${n} doc${n === 1 ? '' : 's'})`);
  }
  console.log(`  .well-known/mcp/server-card.json     (${MCP_ENDPOINT})`);
  console.log(`  .well-known/llms-v3-libraries.json   (${v3Catalog.libraries.length} V3 librar${v3Catalog.libraries.length === 1 ? 'y' : 'ies'})`);
}

// Run main() only when invoked as a script, not when imported by tests.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
