// Emitters and shared catalog predicates for the V3 library catalog and the
// auto-generated capabilities index page.
//
// Lives outside `build-agent-indexes.mjs` (the build orchestrator) to keep
// each file navigable and to give the two emitters that share inclusion
// logic — `emitV3LibraryCatalog` and `emitCapabilitiesIndex` — a single
// `isV3CatalogEntry(doc)` source of truth. Both call it; nothing else
// decides what counts as a catalog entry.
//
// Stdlib only — no npm deps. Imported by build-agent-indexes.mjs.

// V3 catalog membership is determined by the path patterns below plus the
// `exclude_from_v3_catalog: true` frontmatter opt-out. Keep these regexes
// private to this module — the predicate `isV3CatalogEntry` is the public
// contract.
const V3_INSTALLABLE_PATH_RE = /^API\/fliplet-[^/]+\.md$/;
const V3_AMBIENT_PATH_RE = /^API\/core\/[^/]+\.md$/;
// A V3-specific capability doc under API/v3/ becomes the catalog entry for its
// package ONLY when it declares `package:` in frontmatter. This lets an
// installable package ship a dedicated V3 doc (e.g. API/v3/barcode.md leading
// with the cross-platform primitive) as the canonical catalog entry, while the
// shared API/fliplet-<name>.md reference opts out via `exclude_from_v3_catalog`.
// The `package:` gate keeps the general V3 guides (routing, auth, frameworks/)
// out of the catalog — they describe patterns, not a single package.
const V3_GUIDE_PATH_RE = /^API\/v3\/[^/]+\.md$/;

// Allowed values for the `category:` frontmatter field. Documented in
// docs/CLAUDE.md as the canonical schema. Each catalog entry picks exactly
// one primary category; the auto-generated capabilities page groups entries
// by this value.
//
// Order matters: the capabilities page renders sections in this order. Most
// commonly-reached-for categories lead (`data`, `identity`); navigation +
// framework follow; orthogonal/service categories (`automation`,
// `analytics`, `observability`, `meta`) trail.
//
// `meta` is the residual bucket — kept deliberately small. If `meta` grows
// past 6-8 entries again, split it further rather than letting it absorb
// the new entries (the same anti-pattern that motivated the framework +
// navigation split when the earlier "platform" residual hit 12+ entries).
export const ALLOWED_CATEGORIES = [
  'data',
  'identity',
  'communications',
  'media',
  'native',
  'commerce',
  'integration',
  'automation',
  'analytics',
  'observability',
  'framework',
  'navigation',
  'meta',
];

export const ALLOWED_CATEGORIES_SET = new Set(ALLOWED_CATEGORIES);

// Shared predicate. Both `emitV3LibraryCatalog` and `emitCapabilitiesIndex`
// must use this — drift between them is a real bug (page would show entries
// the agent doesn't know about, or vice versa).
//
// A doc is a V3 catalog entry when its frontmatter does NOT set
// `exclude_from_v3_catalog: true`, AND its path matches one of:
//   - `API/fliplet-*.md` (installable), OR
//   - `API/core/*.md` (ambient, preloaded via fliplet-core), OR
//   - `API/v3/*.md` that declares `package:` (a package's dedicated V3 doc;
//     the `package:` gate keeps the pattern guides — routing/auth/frameworks —
//     out, since they describe patterns rather than one package).
//
// Note: this is DIFFERENT from `shouldExclude(path)` in exclusions.mjs.
// `shouldExclude` skips a path from indexing entirely (redirect stubs,
// `_site/`, etc.); `isV3CatalogEntry` decides catalog membership for docs
// that ARE indexed. Conflating them mis-fires lints across all docs.
export function isV3CatalogEntry(doc) {
  const fm = doc.fm || {};
  if (fm.exclude_from_v3_catalog === 'true') return false;
  const isInstallable = V3_INSTALLABLE_PATH_RE.test(doc.relPath);
  const isAmbient = V3_AMBIENT_PATH_RE.test(doc.relPath);
  const isV3Guide = V3_GUIDE_PATH_RE.test(doc.relPath) && !!(fm.package && String(fm.package).trim());
  return isInstallable || isAmbient || isV3Guide;
}

export function deriveV3Package(relPath) {
  const match = relPath.match(/^API\/(fliplet-[^/]+)\.md$/);
  return match ? match[1] : null;
}

// Parse a YAML-style flow list (`[a, b, c]`) or a bare comma-separated
// string into a clean array of trimmed strings. Returns [] for empty,
// missing, or `[]` inputs. The minimal frontmatter parser upstream keeps
// the raw value as a literal string, so this is where the list shape
// becomes an array.
export function parseListFrontmatter(raw) {
  if (raw == null) return [];
  const s = String(raw).trim();
  if (s === '' || s === '[]') return [];
  const body = s.startsWith('[') && s.endsWith(']') ? s.slice(1, -1) : s;
  return body
    .split(',')
    .map((t) => t.trim())
    .map((t) => {
      if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
        return t.slice(1, -1);
      }
      return t;
    })
    .filter((t) => t.length > 0);
}

// V3 library catalog manifest. Emitted at /.well-known/llms-v3-libraries.json
// and consumed by Studio's `searchLibraries.js` tool and the V3 builder
// system prompt to drive library discovery.
//
// Inclusion rules: see `isV3CatalogEntry`. The catalog also surfaces three
// optional curation fields read from doc frontmatter:
//   - `capabilities:` — bracketed list of keywords used to anchor user-
//     described capabilities ("stripe", "checkout", "image generation") to
//     the canonical Fliplet API. Always emitted as an array; empty when
//     frontmatter omits it.
//   - `category:` — single string from `ALLOWED_CATEGORIES`. Drives the
//     capabilities index page grouping. Emitted as `category` when present.
//   - `notes:` — short curation note for side-effects or do-not-use caveats
//     (e.g. fliplet-encryption modifies Fliplet.DataSources). Only emitted
//     when present.
export function emitV3LibraryCatalog(docs) {
  const libraries = [];
  for (const doc of docs) {
    if (!isV3CatalogEntry(doc)) continue;
    const isAmbient = V3_AMBIENT_PATH_RE.test(doc.relPath);
    const fm = doc.fm || {};

    let pkg;
    if (!isAmbient) {
      pkg = (fm.package && fm.package.trim()) || deriveV3Package(doc.relPath);
      if (!pkg) continue;
    } else {
      pkg = 'fliplet-core';
    }

    // For most docs the title IS the JS namespace (e.g. "Fliplet.Barcode"). A
    // dedicated V3 doc is titled as a guide ("V3 barcode scanning"), so it can
    // declare the actual global via `namespace:` — the builder's registry shows
    // `package → namespace`, so this must be the real global, not the doc title.
    const namespace = (fm.namespace && fm.namespace.trim()) || doc.title;

    const entry = {
      package: pkg,
      namespace,
      title: doc.title,
      description: doc.description || '',
      // AI-consumption surface: emit the raw .md URL (Studio's V3 builder fetches
      // this directly; web_fetch refuses HTML). Falls back to .url for any doc
      // record without urlMd (e.g. test fixtures).
      docUrl: doc.urlMd || doc.url,
      preloaded: isAmbient,
      capabilities: parseListFrontmatter(fm.capabilities),
    };

    if (fm.category && fm.category.trim() !== '') {
      entry.category = fm.category.trim();
    }
    if (fm.notes && fm.notes.trim() !== '') {
      entry.notes = fm.notes.trim();
    }

    libraries.push(entry);
  }
  // Stable sort: installable first (preloaded=false), then ambient, alpha by
  // package then namespace as a tiebreaker.
  libraries.sort((a, b) => {
    if (a.preloaded !== b.preloaded) return a.preloaded ? 1 : -1;
    const pkgCmp = (a.package || '').localeCompare(b.package || '');
    if (pkgCmp !== 0) return pkgCmp;
    return (a.namespace || '').localeCompare(b.namespace || '');
  });
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    libraries,
  };
}

// Capabilities index page (`docs/v3/capabilities.md`). Auto-generated from
// the same catalog set as `emitV3LibraryCatalog`. Renders one section per
// `ALLOWED_CATEGORIES` value, with entries sorted by namespace.
//
// Output is a complete Markdown file with frontmatter — Jekyll renders it
// at developers.fliplet.com/v3/capabilities like any other doc. Frontmatter
// is required so `validateFrontmatter` passes on the generated file.
//
// Byte-stable: no timestamps in the output. Two runs against identical
// input produce byte-identical output.
export function emitCapabilitiesIndex(docs) {
  const entries = [];
  const uncategorized = [];

  for (const doc of docs) {
    if (!isV3CatalogEntry(doc)) continue;
    const fm = doc.fm || {};
    const category = fm.category && fm.category.trim();
    const isAmbient = V3_AMBIENT_PATH_RE.test(doc.relPath);
    const item = {
      namespace: (fm.namespace && fm.namespace.trim()) || doc.title,
      description: doc.description || '',
      url: doc.url,
      preloaded: isAmbient,
    };
    if (category && ALLOWED_CATEGORIES_SET.has(category)) {
      entries.push({ category, ...item });
    } else {
      uncategorized.push(item);
    }
  }

  // Group by category, preserving ALLOWED_CATEGORIES order for stable output.
  const byCategory = new Map(ALLOWED_CATEGORIES.map((c) => [c, []]));
  for (const e of entries) byCategory.get(e.category).push(e);
  for (const c of ALLOWED_CATEGORIES) {
    byCategory.get(c).sort((a, b) => a.namespace.localeCompare(b.namespace));
  }
  uncategorized.sort((a, b) => a.namespace.localeCompare(b.namespace));

  const lines = [];
  lines.push('---');
  lines.push('title: "V3 capabilities"');
  lines.push(
    'description: "Auto-generated index of every Fliplet JS API surface available to V3 apps, grouped by capability category."',
  );
  lines.push('type: reference');
  lines.push('tags: [v3, capabilities, js-api]');
  lines.push('v3_relevant: true');
  lines.push('---');
  lines.push('');
  lines.push('<!-- AUTO-GENERATED by bin/emitters.mjs (emitCapabilitiesIndex) — do not hand-edit. -->');
  lines.push('<!-- Source: frontmatter `category:` across docs/API/**/*.md catalog entries. -->');
  lines.push('');
  lines.push('# V3 capabilities');
  lines.push('');
  lines.push(
    'Every Fliplet JS API available to V3 apps, grouped by capability category. Each entry links to its full API reference. Ambient namespaces (preloaded into every app via `fliplet-core`) are marked **preloaded**; everything else is installable via `add_dependencies`.',
  );
  lines.push('');

  const HEADERS = {
    data: 'Data',
    identity: 'Identity',
    communications: 'Communications',
    media: 'Media',
    native: 'Native',
    commerce: 'Commerce',
    integration: 'Integration',
    automation: 'Automation',
    analytics: 'Analytics',
    observability: 'Observability',
    framework: 'Framework',
    navigation: 'Navigation',
    meta: 'Meta',
  };

  for (const cat of ALLOWED_CATEGORIES) {
    const items = byCategory.get(cat);
    if (items.length === 0) continue;
    lines.push(`## ${HEADERS[cat] || cat}`);
    lines.push('');
    for (const item of items) {
      const tag = item.preloaded ? ' **(preloaded)**' : '';
      lines.push(`- [\`${item.namespace}\`](${item.url})${tag} — ${item.description}`);
    }
    lines.push('');
  }

  if (uncategorized.length > 0) {
    lines.push('## Uncategorized');
    lines.push('');
    lines.push(
      '_These entries are missing a `category:` value in frontmatter. See `docs/CONTRIBUTING.md` for how to assign one._',
    );
    lines.push('');
    for (const item of uncategorized) {
      const tag = item.preloaded ? ' **(preloaded)**' : '';
      lines.push(`- [\`${item.namespace}\`](${item.url})${tag} — ${item.description}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
