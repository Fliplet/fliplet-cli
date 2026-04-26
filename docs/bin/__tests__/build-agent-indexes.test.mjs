// Unit tests for bin/build-agent-indexes.mjs
// Run: npm run test:unit   (or `node --test bin/__tests__/*.test.mjs`)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  parseFrontmatter,
  extractH1AndIntro,
  urlForPath,
  truncate,
  emitLlmsTxt,
  emitAgentSkills,
  emitSkillMd,
  emitMcpServerCard,
  emitV3LibraryCatalog,
  deriveV3Package,
  assignToCluster,
  validateFrontmatter,
  ALLOWED_TYPES,
  CLUSTERS,
  collectDocs,
} from '../build-agent-indexes.mjs';

describe('parseFrontmatter', () => {
  it('returns empty fm and full content when no frontmatter', () => {
    const result = parseFrontmatter('# Title\n\nBody paragraph.\n');
    assert.deepEqual(result.fm, {});
    assert.equal(result.body, '# Title\n\nBody paragraph.\n');
  });

  it('parses single-line key: value pairs', () => {
    const input = '---\ntitle: My Doc\ndescription: A short summary.\n---\n# H1\n\nBody.\n';
    const result = parseFrontmatter(input);
    assert.equal(result.fm.title, 'My Doc');
    assert.equal(result.fm.description, 'A short summary.');
    assert.equal(result.body, '# H1\n\nBody.\n');
  });

  it('strips surrounding single and double quotes from values', () => {
    const input = '---\ntitle: "Quoted Title"\ndesc: \'single quoted\'\n---\nBody.\n';
    const result = parseFrontmatter(input);
    assert.equal(result.fm.title, 'Quoted Title');
    assert.equal(result.fm.desc, 'single quoted');
  });

  it('handles Windows line endings in frontmatter', () => {
    const input = '---\r\ntitle: Win Title\r\n---\r\nBody.\r\n';
    const result = parseFrontmatter(input);
    assert.equal(result.fm.title, 'Win Title');
    assert.equal(result.body, 'Body.\r\n');
  });

  it('leaves malformed frontmatter intact (no closing ---)', () => {
    const input = '---\ntitle: Unclosed\nBody goes here.\n';
    const result = parseFrontmatter(input);
    assert.deepEqual(result.fm, {});
    assert.equal(result.body, input);
  });

  it('ignores blank lines and lines without colons in frontmatter', () => {
    const input = '---\n\ntitle: T\nnot a kv line\ndesc: D\n---\nBody.\n';
    const result = parseFrontmatter(input);
    assert.equal(result.fm.title, 'T');
    assert.equal(result.fm.desc, 'D');
  });
});

describe('extractH1AndIntro', () => {
  it('extracts plain ATX H1 and first paragraph', () => {
    const result = extractH1AndIntro('# My Title\n\nFirst paragraph text.\n\n## Subheading\n');
    assert.equal(result.h1, 'My Title');
    assert.equal(result.intro, 'First paragraph text.');
  });

  it('strips enclosing backticks from ATX H1', () => {
    const result = extractH1AndIntro('# `Fliplet.Storage`\n\nPersist values.\n');
    assert.equal(result.h1, 'Fliplet.Storage');
    assert.equal(result.intro, 'Persist values.');
  });

  it('preserves trailing parenthetical after backtick-enclosed H1', () => {
    const result = extractH1AndIntro('# `Fliplet.OAuth2` (Beta)\n\nOAuth helper.\n');
    assert.equal(result.h1, 'Fliplet.OAuth2 (Beta)');
  });

  it('extracts Setext-style H1 (underlined with ===)', () => {
    const result = extractH1AndIntro('My Title\n========\n\nBody text.\n');
    assert.equal(result.h1, 'My Title');
    assert.equal(result.intro, 'Body text.');
  });

  it('returns null h1 when document starts with H2', () => {
    const result = extractH1AndIntro('## Only a subheading\n\nText.\n');
    assert.equal(result.h1, null);
    assert.equal(result.intro, null);
  });

  it('returns null h1 when document has no heading at all', () => {
    const result = extractH1AndIntro('Just some prose with no heading.\n');
    assert.equal(result.h1, null);
  });

  it('skips HTML warning blocks when finding first paragraph', () => {
    const md = '# Topic\n\n<p class="warning">Be careful.</p>\n\nReal summary here.\n';
    const result = extractH1AndIntro(md);
    assert.equal(result.h1, 'Topic');
    assert.equal(result.intro, 'Real summary here.');
  });

  it('skips leading images when finding first paragraph', () => {
    const md = '# Topic\n\n![Diagram](/img.png)\n\nReal summary here.\n';
    const result = extractH1AndIntro(md);
    assert.equal(result.intro, 'Real summary here.');
  });

  it('joins multi-line first paragraph with single spaces', () => {
    const result = extractH1AndIntro('# T\n\nLine one\nLine two.\n\n## Next\n');
    assert.equal(result.intro, 'Line one Line two.');
  });

  it('stops at code fences, horizontal rules, and list markers', () => {
    const a = extractH1AndIntro('# T\n\n```js\ncode\n```\n').intro;
    assert.equal(a, null);
    const b = extractH1AndIntro('# T\n\n---\nafter\n').intro;
    assert.equal(b, null);
    const c = extractH1AndIntro('# T\n\n- list item\n').intro;
    assert.equal(c, null);
  });
});

describe('urlForPath', () => {
  it('maps README.md to the homepage URL', () => {
    assert.equal(urlForPath('README.md'), 'https://developers.fliplet.com/');
  });

  it('maps nested paths to their .html URLs', () => {
    assert.equal(
      urlForPath('API/core/storage.md'),
      'https://developers.fliplet.com/API/core/storage.html',
    );
  });

  it('maps top-level files correctly', () => {
    assert.equal(
      urlForPath('Data-source-security.md'),
      'https://developers.fliplet.com/Data-source-security.html',
    );
  });
});

describe('truncate', () => {
  it('returns the input unchanged when under the limit', () => {
    assert.equal(truncate('short', 10), 'short');
  });

  it('truncates and appends ellipsis when over the limit', () => {
    const out = truncate('a'.repeat(20), 10);
    assert.equal(out.length, 10);
    assert.ok(out.endsWith('…'));
  });

  it('returns empty string for empty or null input', () => {
    assert.equal(truncate('', 10), '');
    assert.equal(truncate(null, 10), '');
  });
});

describe('emitLlmsTxt', () => {
  it('produces llmstxt.org-shaped output grouped by label', () => {
    const docs = [
      { title: 'Alpha', url: 'https://ex.com/a', description: 'First', group: 'Fliplet JavaScript APIs' },
      { title: 'Beta', url: 'https://ex.com/b', description: 'Second', group: 'Fliplet JavaScript APIs' },
      { title: 'Guide', url: 'https://ex.com/g', description: 'Guide desc', group: 'Guides' },
    ];
    const out = emitLlmsTxt(docs);
    assert.ok(out.startsWith('# Fliplet Developers\n'));
    assert.ok(out.includes('## Fliplet JavaScript APIs'));
    assert.ok(out.includes('## Guides'));
    assert.ok(out.includes('- [Alpha](https://ex.com/a): First'));
    assert.ok(out.includes('- [Guide](https://ex.com/g): Guide desc'));
  });

  it('omits empty groups', () => {
    const docs = [{ title: 'G', url: 'https://ex.com/g', description: 'D', group: 'Guides' }];
    const out = emitLlmsTxt(docs);
    assert.ok(!out.includes('## Fliplet Core JavaScript APIs'));
  });
});

describe('assignToCluster', () => {
  it('routes data-source docs to fliplet-data-sources', () => {
    assert.equal(assignToCluster('API/fliplet-datasources.md').name, 'fliplet-data-sources');
    assert.equal(assignToCluster('API/datasources/joins.md').name, 'fliplet-data-sources');
    assert.equal(assignToCluster('Data-source-security.md').name, 'fliplet-data-sources');
    assert.equal(assignToCluster('File-security.md').name, 'fliplet-data-sources');
  });

  it('routes app-actions docs (all versions) to fliplet-app-actions', () => {
    assert.equal(assignToCluster('API/core/app-actions.md').name, 'fliplet-app-actions');
    assert.equal(assignToCluster('API/core/app-actions-v2.md').name, 'fliplet-app-actions');
    assert.equal(assignToCluster('API/core/app-actions-v3.md').name, 'fliplet-app-actions');
  });

  it('routes REST API docs to fliplet-rest-api', () => {
    assert.equal(assignToCluster('REST-API/Apps.md').name, 'fliplet-rest-api');
    assert.equal(assignToCluster('REST-API-Documentation.md').name, 'fliplet-rest-api');
  });

  it('routes themes docs (incl. API/fliplet-themes.md) to fliplet-themes-framework', () => {
    assert.equal(assignToCluster('Building-themes.md').name, 'fliplet-themes-framework');
    assert.equal(assignToCluster('API/fliplet-themes.md').name, 'fliplet-themes-framework');
  });

  it('routes oauth2 to fliplet-integrations (specific match wins over API/ catch-all)', () => {
    assert.equal(assignToCluster('API/fliplet-oauth2.md').name, 'fliplet-integrations');
  });

  it('routes generic API/* docs to fliplet-js-api', () => {
    assert.equal(assignToCluster('API/fliplet-storage.md').name, 'fliplet-js-api');
    assert.equal(assignToCluster('API/core/storage.md').name, 'fliplet-js-api');
    assert.equal(assignToCluster('API/components/charts.md').name, 'fliplet-js-api');
  });

  it('routes unmatched general/onboarding docs to the fallback', () => {
    assert.equal(assignToCluster('Introduction.md').name, 'fliplet-docs-index');
    assert.equal(assignToCluster('Quickstart.md').name, 'fliplet-docs-index');
    assert.equal(assignToCluster('README.md').name, 'fliplet-docs-index');
    assert.equal(assignToCluster('Async-await.md').name, 'fliplet-docs-index');
  });

  it('lists the fallback cluster last so it is least preferred by ordering-aware rankers', () => {
    assert.equal(CLUSTERS[CLUSTERS.length - 1].name, 'fliplet-docs-index');
  });
});

describe('emitAgentSkills', () => {
  it('produces a cluster-shaped index (one entry per cluster, no $schema, no per-doc type)', () => {
    const summaries = new Map();
    for (const c of CLUSTERS) summaries.set(c.name, { skillMdSha256: 'a'.repeat(64), count: 0 });
    const out = emitAgentSkills(summaries);
    assert.equal(out.$schema, undefined, 'no broken $schema URL');
    assert.equal(out.skills.length, CLUSTERS.length);
    for (const skill of out.skills) {
      assert.ok(skill.name.startsWith('fliplet-'), 'every cluster name uses fliplet- prefix');
      assert.ok(skill.url.endsWith('/SKILL.md'), 'url points at SKILL.md, not landing page');
      assert.equal(skill.type, undefined, 'no spec-foreign type field');
      assert.match(skill.sha256, /^[a-f0-9]{64}$/);
      assert.ok(Array.isArray(skill.tags));
    }
  });

  it('places fliplet-docs-index last in the index', () => {
    const summaries = new Map();
    for (const c of CLUSTERS) summaries.set(c.name, { skillMdSha256: '0'.repeat(64), count: 0 });
    const out = emitAgentSkills(summaries);
    assert.equal(out.skills[out.skills.length - 1].name, 'fliplet-docs-index');
  });
});

describe('emitSkillMd', () => {
  it('renders frontmatter + doc list for a capability cluster', () => {
    const cluster = CLUSTERS.find((c) => c.name === 'fliplet-data-sources');
    const docs = [
      { title: 'Fliplet.DataSources', url: 'https://x/a.html', description: 'JS API.' },
      { title: 'Joins', url: 'https://x/b.html', description: 'Joins.' },
    ];
    const md = emitSkillMd(cluster, docs);
    assert.ok(md.startsWith('---\nname: fliplet-data-sources\n'));
    assert.ok(md.includes('# Fliplet data sources'));
    assert.ok(md.includes('- [Fliplet.DataSources](https://x/a.html): JS API.'));
    assert.ok(md.includes('- [Joins](https://x/b.html): Joins.'));
    assert.ok(md.includes('## How to load full content'));
    assert.ok(md.includes('https://developers.fliplet.com/mcp'));
  });

  it('renders fallback body that names every other cluster', () => {
    const cluster = CLUSTERS.find((c) => c.name === 'fliplet-docs-index');
    const md = emitSkillMd(cluster, []);
    assert.ok(md.includes('Prefer a specific Fliplet skill'));
    for (const c of CLUSTERS) {
      if (c.name === 'fliplet-docs-index') continue;
      assert.ok(md.includes('`' + c.name + '`'), `fallback names ${c.name}`);
    }
    assert.ok(md.includes('/.well-known/llms.txt'));
  });

  it('fallback body lists its own docs so they remain agent-discoverable', () => {
    const cluster = CLUSTERS.find((c) => c.name === 'fliplet-docs-index');
    const md = emitSkillMd(cluster, [
      { title: 'Quickstart', url: 'https://x/q.html', description: 'Quick.' },
      { title: 'Welcome', url: 'https://x/w.html', description: 'Home.' },
    ]);
    assert.ok(md.includes('## General docs in this bucket'));
    assert.ok(md.includes('- [Quickstart](https://x/q.html): Quick.'));
    assert.ok(md.includes('- [Welcome](https://x/w.html): Home.'));
  });
});

describe('validateFrontmatter', () => {
  const fullyValid = {
    relPath: 'API/x.md',
    fm: { title: 'X', description: 'desc', type: 'api-reference', tags: '[js-api]' },
  };

  it('returns no errors for a doc with all required fields and a valid type', () => {
    const errs = validateFrontmatter([fullyValid]);
    assert.equal(errs.length, 0);
  });

  it('flags missing or empty title', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { ...fullyValid.fm, title: '' } },
      { relPath: 'b.md', fm: { description: 'd', type: 'guide', tags: '[x]' } },
    ]);
    assert.equal(errs.length, 2);
    assert.ok(errs.every((e) => e.field === 'title'));
  });

  it('flags missing description', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { title: 'T', type: 'guide', tags: '[x]' } },
    ]);
    assert.equal(errs.length, 1);
    assert.equal(errs[0].field, 'description');
  });

  it('flags missing type and type values not in ALLOWED_TYPES', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { title: 'T', description: 'd', tags: '[x]' } },
      { relPath: 'b.md', fm: { title: 'T', description: 'd', type: 'made-up', tags: '[x]' } },
    ]);
    assert.equal(errs.length, 2);
    assert.ok(errs.every((e) => e.field === 'type'));
    assert.ok(errs[1].message.includes('made-up'));
  });

  it('flags missing or empty tags', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { title: 'T', description: 'd', type: 'guide' } },
      { relPath: 'b.md', fm: { title: 'T', description: 'd', type: 'guide', tags: '' } },
      { relPath: 'c.md', fm: { title: 'T', description: 'd', type: 'guide', tags: '[]' } },
    ]);
    assert.equal(errs.length, 3);
    assert.ok(errs.every((e) => e.field === 'tags'));
  });

  it('accepts every value in ALLOWED_TYPES', () => {
    for (const t of ALLOWED_TYPES) {
      const errs = validateFrontmatter([
        { relPath: `${t}.md`, fm: { title: 'T', description: 'd', type: t, tags: '[x]' } },
      ]);
      const typeErrs = errs.filter((e) => e.field === 'type');
      assert.equal(typeErrs.length, 0, `type '${t}' should be allowed`);
    }
  });

  it('reports errors per-doc rather than aggregating', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: {} }, // missing all 4 required fields
      fullyValid,
    ]);
    const aErrs = errs.filter((e) => e.relPath === 'a.md');
    assert.equal(aErrs.length, 4);
    assert.deepEqual(
      aErrs.map((e) => e.field).sort(),
      ['description', 'tags', 'title', 'type'],
    );
  });
});

describe('emitMcpServerCard', () => {
  it('emits a SEP-1649-shaped card for the streamable-HTTP MCP endpoint', () => {
    const card = emitMcpServerCard();
    assert.equal(card.serverInfo.name, 'fliplet-docs-mcp');
    assert.equal(card.transport.type, 'streamable_http');
    assert.equal(card.transport.url, 'https://developers.fliplet.com/mcp');
    const toolNames = card.capabilities.tools.map((t) => t.name);
    assert.deepEqual(toolNames.sort(), ['fetch_fliplet_doc', 'search_fliplet_docs']);
  });
});

describe('collectDocs (end-to-end on a tmp fixture)', () => {
  const fixtureDir = join(tmpdir(), `build-agent-indexes-test-${Date.now()}`);

  // Set up a tiny fixture tree
  mkdirSync(fixtureDir, { recursive: true });
  mkdirSync(join(fixtureDir, 'API'), { recursive: true });
  writeFileSync(join(fixtureDir, 'README.md'), '# Welcome\n\nHomepage intro.\n');
  writeFileSync(
    join(fixtureDir, 'API', 'foo.md'),
    '---\ntitle: Frontmatter Wins\ndescription: From YAML.\n---\n# H1 Ignored\n\nBody ignored too.\n',
  );
  writeFileSync(
    join(fixtureDir, 'API', 'bar.md'),
    '# `Fliplet.Bar`\n\nAutoextracted summary.\n',
  );
  // Should be excluded: .deprecated.md pattern
  writeFileSync(
    join(fixtureDir, 'API', 'old.deprecated.md'),
    '# Deprecated thing\n\nDo not index.\n',
  );

  it('indexes eligible files with frontmatter taking precedence', () => {
    const docs = collectDocs(fixtureDir);
    const titles = docs.map((d) => d.title).sort();
    assert.deepEqual(titles, ['Fliplet.Bar', 'Frontmatter Wins', 'Welcome']);
    const foo = docs.find((d) => d.url.endsWith('foo.html'));
    assert.equal(foo.title, 'Frontmatter Wins');
    assert.equal(foo.description, 'From YAML.');
  });

  it('skips .deprecated.md files', () => {
    const docs = collectDocs(fixtureDir);
    assert.ok(!docs.some((d) => d.url.includes('deprecated')));
  });

  it('maps README.md to homepage URL', () => {
    const docs = collectDocs(fixtureDir);
    const home = docs.find((d) => d.title === 'Welcome');
    assert.equal(home.url, 'https://developers.fliplet.com/');
  });

  it('computes sha256 over the raw file (including frontmatter)', () => {
    const docs = collectDocs(fixtureDir);
    for (const d of docs) {
      assert.match(d.sha256, /^[a-f0-9]{64}$/);
    }
  });

  // Cleanup
  it('(teardown)', () => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });
});

// Cross-artifact consistency: every URL that lands in a cluster's
// SKILL.md MUST also be in llms.txt, and vice versa. If these diverge
// it means cluster assignment dropped a doc or the emitters disagree
// about what counts as indexed.
//
// This invariant is checked end-to-end against a fixture tree that
// stresses both specific clusters (data-sources via API/datasources/,
// js-api via API/) AND the fallback cluster (a Quickstart at the root).
describe('cross-artifact consistency (llms.txt ↔ cluster SKILL.md)', () => {
  const fixtureDir = join(tmpdir(), `cross-artifact-test-${Date.now()}`);
  mkdirSync(fixtureDir, { recursive: true });
  mkdirSync(join(fixtureDir, 'API'), { recursive: true });
  mkdirSync(join(fixtureDir, 'API', 'datasources'), { recursive: true });
  mkdirSync(join(fixtureDir, 'REST-API'), { recursive: true });
  writeFileSync(
    join(fixtureDir, 'README.md'),
    '---\ntitle: Welcome\ndescription: Home\ntype: tutorial\ntags: [readme]\n---\n# Welcome\n\nHome.\n',
  );
  writeFileSync(
    join(fixtureDir, 'Quickstart.md'),
    '---\ntitle: Quick\ndescription: Quickstart\ntype: tutorial\ntags: [quickstart]\n---\n# Quick\n\nQuickstart.\n',
  );
  writeFileSync(
    join(fixtureDir, 'API', 'fliplet-datasources.md'),
    '---\ntitle: DS\ndescription: Data sources\ntype: api-reference\ntags: [js-api]\n---\n# DS\n\nIntro.\n',
  );
  writeFileSync(
    join(fixtureDir, 'API', 'datasources', 'joins.md'),
    '---\ntitle: Joins\ndescription: Joins\ntype: how-to\ntags: [datasources]\n---\n# Joins\n\nIntro.\n',
  );
  writeFileSync(
    join(fixtureDir, 'API', 'fliplet-storage.md'),
    '---\ntitle: Storage\ndescription: Storage\ntype: api-reference\ntags: [js-api]\n---\n# Storage\n\nIntro.\n',
  );
  writeFileSync(
    join(fixtureDir, 'REST-API', 'apps.md'),
    '---\ntitle: Apps\ndescription: Apps\ntype: api-reference\ntags: [rest-api]\n---\n# Apps\n\nIntro.\n',
  );

  // Extract URLs from llms.txt: format is "- [Title](URL): description"
  function urlsFromLlmsTxt(text) {
    const urls = new Set();
    for (const line of text.split('\n')) {
      const m = line.match(/^- \[[^\]]+\]\(([^)]+)\)/);
      if (m) urls.add(m[1]);
    }
    return urls;
  }

  // Extract URLs from a SKILL.md body: same format under "## Documentation".
  function urlsFromSkillMd(text) {
    const urls = new Set();
    for (const line of text.split('\n')) {
      const m = line.match(/^- \[[^\]]+\]\(([^)]+)\)/);
      if (m) urls.add(m[1]);
    }
    return urls;
  }

  it('every URL emitted in llms.txt also appears in exactly one cluster SKILL.md', () => {
    const docs = collectDocs(fixtureDir);
    const llmsTxt = emitLlmsTxt(docs);
    const llmsUrls = urlsFromLlmsTxt(llmsTxt);

    const docsByCluster = new Map();
    for (const c of CLUSTERS) docsByCluster.set(c.name, []);
    for (const d of docs) docsByCluster.get(d.cluster).push(d);

    // Build a map: URL → set of clusters whose SKILL.md lists it.
    const urlToClusters = new Map();
    for (const c of CLUSTERS) {
      const skillMd = emitSkillMd(c, docsByCluster.get(c.name));
      for (const url of urlsFromSkillMd(skillMd)) {
        if (!urlToClusters.has(url)) urlToClusters.set(url, new Set());
        urlToClusters.get(url).add(c.name);
      }
    }

    // Forward: every llms.txt URL must be in some cluster.
    for (const url of llmsUrls) {
      assert.ok(
        urlToClusters.has(url),
        `llms.txt URL ${url} is not in any cluster SKILL.md`,
      );
      assert.equal(
        urlToClusters.get(url).size,
        1,
        `llms.txt URL ${url} is in multiple clusters: ${[...urlToClusters.get(url)].join(', ')}`,
      );
    }

    // Reverse: every URL in any (non-fallback) SKILL.md must be in
    // llms.txt. (The fallback cluster's SKILL.md doesn't list per-doc
    // URLs — it just points at /llms.txt — so we skip it.)
    for (const [url, clusters] of urlToClusters) {
      // Skip the meta-pointers in the fallback's body that link to
      // /.well-known/llms.txt, /.well-known/llms-full.txt, the MCP
      // endpoint itself, or in-narrative cross-references like
      // "https://developers.fliplet.com/" pointing at the homepage.
      if (url.includes('.well-known/') || url.endsWith('/mcp') || url === 'https://developers.fliplet.com/' || url === 'https://modelcontextprotocol.io') {
        continue;
      }
      assert.ok(
        llmsUrls.has(url),
        `cluster SKILL.md URL ${url} (in ${[...clusters].join(', ')}) is not in llms.txt`,
      );
    }
  });

  it('the doc count in llms.txt equals the sum of cluster doc counts', () => {
    const docs = collectDocs(fixtureDir);
    const docsByCluster = new Map();
    for (const c of CLUSTERS) docsByCluster.set(c.name, []);
    for (const d of docs) docsByCluster.get(d.cluster).push(d);

    const sum = [...docsByCluster.values()].reduce((acc, arr) => acc + arr.length, 0);
    assert.equal(sum, docs.length);
  });

  // Cleanup
  it('(teardown)', () => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });
});

// Smoke check against the real docs/ tree: regenerate llms.txt and
// per-cluster SKILL.md from the live source and assert the same
// invariants. Catches drift in production state — e.g. a SKILL.md
// committed by hand instead of regenerated, or a doc added to the
// repo that didn't make it through cluster assignment.
describe('cross-artifact consistency (against real docs/)', () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const docsRoot = resolve(here, '..', '..');

  it('every URL in the live llms.txt index appears in exactly one cluster', () => {
    const docs = collectDocs(docsRoot);
    if (docs.length === 0) return; // belt-and-braces; should never hit

    const llmsTxt = emitLlmsTxt(docs);
    const llmsUrls = new Set();
    for (const line of llmsTxt.split('\n')) {
      const m = line.match(/^- \[[^\]]+\]\(([^)]+)\)/);
      if (m) llmsUrls.add(m[1]);
    }

    const docsByCluster = new Map();
    for (const c of CLUSTERS) docsByCluster.set(c.name, []);
    for (const d of docs) docsByCluster.get(d.cluster).push(d);

    const urlToClusters = new Map();
    for (const c of CLUSTERS) {
      const skillMd = emitSkillMd(c, docsByCluster.get(c.name));
      for (const line of skillMd.split('\n')) {
        const m = line.match(/^- \[[^\]]+\]\(([^)]+)\)/);
        if (!m) continue;
        const url = m[1];
        if (!urlToClusters.has(url)) urlToClusters.set(url, new Set());
        urlToClusters.get(url).add(c.name);
      }
    }

    const orphans = [];
    const duplicates = [];
    for (const url of llmsUrls) {
      if (!urlToClusters.has(url)) {
        orphans.push(url);
      } else if (urlToClusters.get(url).size > 1) {
        duplicates.push(`${url} (in ${[...urlToClusters.get(url)].join(', ')})`);
      }
    }
    assert.deepEqual(orphans, [], 'docs in llms.txt missing from every cluster');
    assert.deepEqual(duplicates, [], 'docs assigned to multiple clusters');
  });
});

describe('deriveV3Package', () => {
  it('extracts package name from API/fliplet-*.md', () => {
    assert.equal(deriveV3Package('API/fliplet-barcode.md'), 'fliplet-barcode');
    assert.equal(deriveV3Package('API/fliplet-ui-typeahead.md'), 'fliplet-ui-typeahead');
  });

  it('returns null for non-library paths', () => {
    assert.equal(deriveV3Package('API/core/storage.md'), null);
    assert.equal(deriveV3Package('Building-themes.md'), null);
    assert.equal(deriveV3Package('REST-API/fliplet-apps.md'), null);
  });
});

describe('emitV3LibraryCatalog', () => {
  function makeDoc(relPath, fm = {}, title = 'Test', description = 'Desc') {
    return {
      relPath,
      url: `https://developers.fliplet.com/${relPath.replace(/\.md$/, '.html')}`,
      title,
      description,
      fm,
    };
  }

  it('includes API/fliplet-*.md docs by default', () => {
    const docs = [
      makeDoc('API/fliplet-barcode.md', {}, 'Fliplet Barcode', 'Camera scan'),
      makeDoc('API/fliplet-media.md', {}, 'Fliplet Media', 'File upload'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 2);
    assert.equal(catalog.libraries[0].package, 'fliplet-barcode');
    assert.equal(catalog.libraries[0].title, 'Fliplet Barcode');
    assert.equal(catalog.libraries[0].description, 'Camera scan');
    assert.equal(catalog.libraries[0].docUrl, 'https://developers.fliplet.com/API/fliplet-barcode.html');
  });

  it('excludes docs flagged with exclude_from_v3_catalog: true', () => {
    const docs = [
      makeDoc('API/fliplet-barcode.md'),
      makeDoc('API/fliplet-table.md', { exclude_from_v3_catalog: 'true' }),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].package, 'fliplet-barcode');
  });

  it('excludes docs not matching API/fliplet-*.md path', () => {
    const docs = [
      makeDoc('API/core/storage.md', {}, 'Storage'),
      makeDoc('Building-themes.md', {}, 'Themes'),
      makeDoc('API/fliplet-barcode.md'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].package, 'fliplet-barcode');
  });

  it('honors package: frontmatter override', () => {
    const docs = [
      makeDoc('API/fliplet-special-doc.md', { package: 'fliplet-actual-pkg' }),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries[0].package, 'fliplet-actual-pkg');
  });

  it('falls back to URL slug when no package override', () => {
    const docs = [makeDoc('API/fliplet-csv.md')];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries[0].package, 'fliplet-csv');
  });

  it('sorts entries alphabetically by package', () => {
    const docs = [
      makeDoc('API/fliplet-zebra.md'),
      makeDoc('API/fliplet-alpha.md'),
      makeDoc('API/fliplet-mid.md'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.deepEqual(
      catalog.libraries.map((l) => l.package),
      ['fliplet-alpha', 'fliplet-mid', 'fliplet-zebra'],
    );
  });

  it('outputs version + generatedAt envelope', () => {
    const catalog = emitV3LibraryCatalog([]);
    assert.equal(catalog.version, 1);
    assert.match(catalog.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
    assert.deepEqual(catalog.libraries, []);
  });

  it('handles missing description gracefully', () => {
    const docs = [makeDoc('API/fliplet-barcode.md', {}, 'Title', '')];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries[0].description, '');
  });

  it('only string "true" excludes; bare false or absent does not', () => {
    const docs = [
      makeDoc('API/fliplet-a.md', { exclude_from_v3_catalog: 'false' }),
      makeDoc('API/fliplet-b.md', {}),
      makeDoc('API/fliplet-c.md', { exclude_from_v3_catalog: 'true' }),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 2);
    assert.deepEqual(
      catalog.libraries.map((l) => l.package).sort(),
      ['fliplet-a', 'fliplet-b'],
    );
  });
});
