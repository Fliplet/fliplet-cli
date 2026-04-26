// Shared exclusion list for every bin/ script that walks docs/**/*.md.
//
// Three scripts (build-agent-indexes.mjs, copy-md-siblings.mjs,
// migrate-frontmatter.mjs) walk the same source tree and skip the same
// files. Keeping the list in one place avoids the drift bug that bit us
// before (a new exclusion added to one script but missed in the other
// two; in particular nested node_modules under mcp-worker/ leaking into
// the index).

// Specific files that must never be indexed, served as .md siblings, or
// migrated. Reasons:
//   - disable-analytics.md          analytics opt-out utility, not a doc
//   - API/fliplet-encryption.deprecated.md
//                                   the *.deprecated.md pattern (also
//                                   caught generically below)
//   - API/fliplet-core.md
//   - API/fliplet-helper.md
//   - API/core/app-tasks.md         redirect stubs that exist only for
//                                   client-side JS, not human reading
//   - CLAUDE.md                     repo-authoring meta-doc
export const EXCLUDED_FILES = new Set([
  'disable-analytics.md',
  'API/fliplet-encryption.deprecated.md',
  'API/fliplet-core.md',
  'API/fliplet-helper.md',
  'API/core/app-tasks.md',
  'CLAUDE.md',
]);

// Directory prefixes whose contents are never indexed. Matched both at
// the docs root AND at any depth (e.g. mcp-worker/node_modules/...) so
// transitive node_modules don't leak in when someone runs `npm install`
// inside mcp-worker/ before regenerating.
export const EXCLUDED_DIRS = [
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

export function shouldExclude(relPath) {
  if (EXCLUDED_FILES.has(relPath)) return true;
  if (relPath.endsWith('.deprecated.md')) return true;
  for (const d of EXCLUDED_DIRS) {
    // Match the dir at the root OR nested at any depth.
    if (relPath === d || relPath.startsWith(d + '/') || relPath.includes('/' + d + '/')) {
      return true;
    }
  }
  return false;
}
