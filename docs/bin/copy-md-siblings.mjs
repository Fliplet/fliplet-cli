#!/usr/bin/env node
// Copy source .md files into _site/ as siblings of their generated .html,
// AND copy docs/.well-known/ into _site/.well-known/ verbatim.
// Run AFTER `bundle exec jekyll build`.
//
// Jekyll converts foo/bar.md → _site/foo/bar.html. This script additionally
// copies foo/bar.md → _site/foo/bar.md so AI agents can fetch the raw
// Markdown at the same URL path with a .md suffix. Combined with _headers'
// `Content-Type: text/markdown` rule, this is a stopgap until Cloudflare's
// native Markdown-for-Agents feature ships.
//
// .well-known/ is excluded from Jekyll (see _config.yml) so its SKILL.md
// frontmatter doesn't trigger Jekyll's Markdown converter. We copy the
// directory verbatim here instead.
//
// Stdlib only.

import {
  readdirSync,
  statSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative, resolve, sep } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const siteDir = join(docsRoot, '_site');

// Mirror build-agent-indexes.mjs's exclusion list so we don't publish .md
// siblings for files that aren't indexed.
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

function shouldExclude(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true;
  if (relPath.endsWith('.deprecated.md')) return true;
  for (const d of EXCLUDED_DIRS) {
    // Match the dir at the root OR nested at any depth (e.g. mcp-worker/node_modules/...).
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

// README.md at repo root is rendered by Jekyll as the homepage (index.html).
// Its sibling URL is therefore /index.md, not /README.md.
export function siblingTargetForRelPath(relPath) {
  if (relPath === 'README.md') return 'index.md';
  return relPath;
}

export function copySiblings(rootDir, outDir) {
  if (!existsSync(outDir)) {
    throw new Error(`_site directory not found: ${outDir}. Run \`bundle exec jekyll build\` first.`);
  }
  let count = 0;
  for (const { fullPath, relPath } of walkMarkdown(rootDir)) {
    const target = join(outDir, siblingTargetForRelPath(relPath));
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(fullPath, target);
    count++;
  }
  return count;
}

// Walk every file under a directory, yielding { fullPath, relPath }.
// Used for the .well-known/ copy (we don't filter by extension since
// .well-known holds .json, .txt, extensionless files, and SKILL.md).
function* walkAll(dir, rootDir = dir) {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    const rel = relative(rootDir, full).split(sep).join('/');
    if (entry.isDirectory()) {
      yield* walkAll(full, rootDir);
    } else if (entry.isFile()) {
      yield { fullPath: full, relPath: rel };
    }
  }
}

// Copy docs/.well-known/ → _site/.well-known/ byte-for-byte. Jekyll is
// configured to skip .well-known entirely (see _config.yml), so without
// this step _site/.well-known/ would not exist.
export function copyWellKnown(rootDir, outDir) {
  const sourceDir = join(rootDir, '.well-known');
  const targetDir = join(outDir, '.well-known');
  if (!existsSync(sourceDir)) {
    throw new Error(
      `.well-known directory not found: ${sourceDir}. Run \`node bin/build-agent-indexes.mjs\` first.`,
    );
  }
  let count = 0;
  for (const { fullPath, relPath } of walkAll(sourceDir)) {
    const target = join(targetDir, relPath);
    mkdirSync(dirname(target), { recursive: true });
    copyFileSync(fullPath, target);
    count++;
  }
  return count;
}

function main() {
  const siblingCount = copySiblings(docsRoot, siteDir);
  console.log(`Copied ${siblingCount} .md siblings into _site/`);
  const wellKnownCount = copyWellKnown(docsRoot, siteDir);
  console.log(`Copied ${wellKnownCount} files from .well-known/ into _site/.well-known/`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
