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
  urlForPathMd,
  truncate,
  emitLlmsTxt,
  emitAgentSkills,
  emitSkillMd,
  emitMcpServerCard,
  emitV3LibraryCatalog,
  emitCapabilitiesIndex,
  deriveV3Package,
  parseListFrontmatter,
  isV3CatalogEntry,
  ALLOWED_CATEGORIES,
  ALLOWED_CATEGORIES_SET,
  assignToCluster,
  validateFrontmatter,
  validateCapabilities,
  validateCatalogUniqueness,
  ALLOWED_TYPES,
  CLUSTERS,
  collectDocs,
  extractCrossLinks,
  classifyCrossLink,
  validateCrossLinks,
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

describe('urlForPathMd (raw .md URL for AI surfaces)', () => {
  it('keeps the .md extension for nested paths', () => {
    assert.equal(
      urlForPathMd('API/datasources/joins.md'),
      'https://developers.fliplet.com/API/datasources/joins.md',
    );
  });

  it('maps README.md to /index.md (the published homepage sibling)', () => {
    assert.equal(urlForPathMd('README.md'), 'https://developers.fliplet.com/index.md');
  });

  it('never emits .html (the shape web_fetch / the MCP worker reject)', () => {
    for (const p of ['API/core/storage.md', 'Data-source-security.md', 'API/fliplet-media.md']) {
      assert.ok(urlForPathMd(p).endsWith('.md'));
      assert.ok(!urlForPathMd(p).includes('.html'));
    }
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

  it('flags backticks in title (renders as literal in the layout)', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { ...fullyValid.fm, title: '`Fliplet.X`' } },
      { relPath: 'b.md', fm: { ...fullyValid.fm, title: '`Fliplet.Storage` and `Fliplet.App.Storage`' } },
    ]);
    assert.equal(errs.length, 2);
    assert.ok(errs.every((e) => e.field === 'title'));
    assert.ok(errs.every((e) => e.message.includes('backticks')));
    assert.ok(errs.every((e) => e.hint && e.hint.includes('body H1')));
  });

  it('accepts title without backticks (plain text)', () => {
    const errs = validateFrontmatter([
      { relPath: 'a.md', fm: { ...fullyValid.fm, title: 'Fliplet.X' } },
      { relPath: 'b.md', fm: { ...fullyValid.fm, title: 'Fliplet.Storage and Fliplet.App.Storage' } },
    ]);
    assert.equal(errs.length, 0);
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

describe('parseListFrontmatter', () => {
  it('returns [] for null, undefined, empty, or "[]" input', () => {
    assert.deepEqual(parseListFrontmatter(null), []);
    assert.deepEqual(parseListFrontmatter(undefined), []);
    assert.deepEqual(parseListFrontmatter(''), []);
    assert.deepEqual(parseListFrontmatter('   '), []);
    assert.deepEqual(parseListFrontmatter('[]'), []);
  });

  it('parses a bracketed flow list', () => {
    assert.deepEqual(parseListFrontmatter('[a, b, c]'), ['a', 'b', 'c']);
  });

  it('strips single or double quotes around each item', () => {
    assert.deepEqual(parseListFrontmatter('[a, "b c", \'d e\']'), ['a', 'b c', 'd e']);
  });

  it('accepts a bare comma-separated string (no brackets)', () => {
    assert.deepEqual(parseListFrontmatter('one, two, three'), ['one', 'two', 'three']);
  });

  it('drops empty items and trims whitespace', () => {
    assert.deepEqual(parseListFrontmatter('[ a ,  , b , ]'), ['a', 'b']);
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
    assert.equal(catalog.libraries[0].preloaded, false);
    assert.equal(catalog.libraries[0].namespace, 'Fliplet Barcode');
    assert.deepEqual(catalog.libraries[0].capabilities, []);
    assert.equal(catalog.libraries[0].notes, undefined);
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

  it('includes an API/v3/*.md package doc and honours the namespace override', () => {
    const docs = [
      makeDoc(
        'API/v3/barcode.md',
        { package: 'fliplet-barcode', namespace: 'Fliplet.Barcode', category: 'media' },
        'V3 barcode scanning',
        'Scan on web + native',
      ),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].package, 'fliplet-barcode');
    // namespace comes from frontmatter, NOT the guide-style title
    assert.equal(catalog.libraries[0].namespace, 'Fliplet.Barcode');
    assert.equal(catalog.libraries[0].title, 'V3 barcode scanning');
    assert.equal(catalog.libraries[0].preloaded, false);
    assert.equal(catalog.libraries[0].docUrl, 'https://developers.fliplet.com/API/v3/barcode.html');
  });

  it('excludes docs not matching the installable or ambient path patterns', () => {
    const docs = [
      makeDoc('Building-themes.md', {}, 'Themes'),
      makeDoc('API/components/charts.md', {}, 'Charts'),
      makeDoc('REST-API/Apps.md', {}, 'Apps'),
      makeDoc('API/fliplet-barcode.md'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].package, 'fliplet-barcode');
  });

  it('emits ambient API/core/* docs as preloaded fliplet-core entries', () => {
    const docs = [
      makeDoc('API/core/ai.md', {}, 'Fliplet.AI', 'AI features'),
      makeDoc('API/core/storage.md', {}, 'Fliplet.Storage', 'Persistence'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 2);
    for (const entry of catalog.libraries) {
      assert.equal(entry.preloaded, true);
      assert.equal(entry.package, 'fliplet-core');
    }
    const ai = catalog.libraries.find((l) => l.namespace === 'Fliplet.AI');
    assert.equal(ai.docUrl, 'https://developers.fliplet.com/API/core/ai.html');
    assert.equal(ai.description, 'AI features');
  });

  it('reads capabilities[] frontmatter into a parsed array', () => {
    const docs = [
      makeDoc(
        'API/fliplet-payments.md',
        { capabilities: '[stripe, checkout, "subscription", \'refund\']' },
      ),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.deepEqual(catalog.libraries[0].capabilities, [
      'stripe',
      'checkout',
      'subscription',
      'refund',
    ]);
  });

  it('emits empty capabilities array when frontmatter omits the field', () => {
    const docs = [makeDoc('API/fliplet-barcode.md', {})];
    const catalog = emitV3LibraryCatalog(docs);
    assert.deepEqual(catalog.libraries[0].capabilities, []);
  });

  it('emits notes field only when set', () => {
    const docs = [
      makeDoc('API/fliplet-encryption.md', { notes: 'Modifies Fliplet.DataSources find/insert.' }),
      makeDoc('API/fliplet-barcode.md'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    const enc = catalog.libraries.find((l) => l.package === 'fliplet-encryption');
    const bar = catalog.libraries.find((l) => l.package === 'fliplet-barcode');
    assert.equal(enc.notes, 'Modifies Fliplet.DataSources find/insert.');
    assert.equal(bar.notes, undefined);
  });

  it('sorts installable entries before ambient ones', () => {
    const docs = [
      makeDoc('API/core/storage.md', {}, 'Fliplet.Storage'),
      makeDoc('API/fliplet-zebra.md', {}, 'Fliplet.Zebra'),
      makeDoc('API/core/ai.md', {}, 'Fliplet.AI'),
      makeDoc('API/fliplet-alpha.md', {}, 'Fliplet.Alpha'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.deepEqual(
      catalog.libraries.map((l) => `${l.preloaded ? 'A' : 'I'}:${l.namespace}`),
      ['I:Fliplet.Alpha', 'I:Fliplet.Zebra', 'A:Fliplet.AI', 'A:Fliplet.Storage'],
    );
  });

  it('honors exclude_from_v3_catalog on ambient docs too', () => {
    const docs = [
      makeDoc('API/core/ai.md', {}, 'Fliplet.AI'),
      makeDoc('API/core/overview.md', { exclude_from_v3_catalog: 'true' }, 'Overview'),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].namespace, 'Fliplet.AI');
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

  it('emits category when present in frontmatter', () => {
    const docs = [
      makeDoc('API/fliplet-payments.md', { category: 'commerce' }),
    ];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries[0].category, 'commerce');
  });

  it('omits category when frontmatter is empty', () => {
    const docs = [makeDoc('API/fliplet-payments.md', {})];
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries[0].category, undefined);
  });
});

describe('isV3CatalogEntry', () => {
  function doc(relPath, fm = {}) {
    return { relPath, fm };
  }

  it('returns true for installable fliplet-* docs', () => {
    assert.equal(isV3CatalogEntry(doc('API/fliplet-barcode.md')), true);
    assert.equal(isV3CatalogEntry(doc('API/fliplet-payments.md')), true);
  });

  it('returns true for ambient core/* docs', () => {
    assert.equal(isV3CatalogEntry(doc('API/core/storage.md')), true);
    assert.equal(isV3CatalogEntry(doc('API/core/ai.md')), true);
  });

  it('returns false for paths outside the catalog', () => {
    assert.equal(isV3CatalogEntry(doc('REST-API/Apps.md')), false);
    assert.equal(isV3CatalogEntry(doc('Building-themes.md')), false);
    assert.equal(isV3CatalogEntry(doc('API/components/forms.md')), false);
    assert.equal(isV3CatalogEntry(doc('API/datasources/queries.md')), false);
  });

  it('returns false when frontmatter has exclude_from_v3_catalog: true', () => {
    assert.equal(
      isV3CatalogEntry(doc('API/fliplet-ui.md', { exclude_from_v3_catalog: 'true' })),
      false,
    );
    assert.equal(
      isV3CatalogEntry(doc('API/core/modal.md', { exclude_from_v3_catalog: 'true' })),
      false,
    );
  });

  it('honours the exclude flag only as the literal string "true"', () => {
    assert.equal(
      isV3CatalogEntry(doc('API/fliplet-a.md', { exclude_from_v3_catalog: 'false' })),
      true,
    );
    assert.equal(
      isV3CatalogEntry(doc('API/fliplet-a.md', { exclude_from_v3_catalog: '' })),
      true,
    );
  });

  it('includes API/v3/*.md only when it declares a package', () => {
    assert.equal(isV3CatalogEntry(doc('API/v3/barcode.md', { package: 'fliplet-barcode' })), true);
    // general V3 guides (no package) describe patterns, not a package — stay out
    assert.equal(isV3CatalogEntry(doc('API/v3/routing.md')), false);
    assert.equal(isV3CatalogEntry(doc('API/v3/auth.md', { package: '' })), false);
  });

  it('respects exclude_from_v3_catalog on an API/v3 package doc', () => {
    assert.equal(
      isV3CatalogEntry(doc('API/v3/barcode.md', { package: 'fliplet-barcode', exclude_from_v3_catalog: 'true' })),
      false,
    );
  });

  it('ignores nested API/v3 subdirs (e.g. frameworks/) regardless of package', () => {
    assert.equal(isV3CatalogEntry(doc('API/v3/frameworks/vue.md', { package: 'x' })), false);
  });
});

describe('validateCatalogUniqueness', () => {
  function doc(relPath, fm = {}) {
    return { relPath, fm };
  }

  it('flags a package that resolves to two catalog docs', () => {
    const errors = validateCatalogUniqueness([
      doc('API/fliplet-barcode.md', { package: 'fliplet-barcode', category: 'media', capabilities: '[barcode]' }),
      doc('API/v3/barcode.md', { package: 'fliplet-barcode', category: 'media', capabilities: '[barcode]' }),
    ]);
    assert.equal(errors.length, 2);
    assert.match(errors[0].message, /resolves to 2 V3 catalog entries/);
  });

  it('passes when the shared reference opts out (one catalog doc per package)', () => {
    const errors = validateCatalogUniqueness([
      doc('API/fliplet-barcode.md', { exclude_from_v3_catalog: 'true' }),
      doc('API/v3/barcode.md', { package: 'fliplet-barcode', category: 'media', capabilities: '[barcode]' }),
    ]);
    assert.equal(errors.length, 0);
  });
});

describe('validateCapabilities', () => {
  function entry(relPath, fm = {}) {
    return { relPath, fm };
  }

  it('returns no errors for a well-formed catalog entry', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[stripe, checkout, subscription]',
        category: 'commerce',
      }),
    ];
    assert.deepEqual(validateCapabilities(docs), []);
  });

  it('skips docs outside the V3 catalog (no false positives)', () => {
    const docs = [
      entry('REST-API/Apps.md', {}),
      entry('Building-themes.md', {}),
      entry('API/components/forms.md', {}),
      entry('API/fliplet-x.md', { exclude_from_v3_catalog: 'true' }),
    ];
    assert.deepEqual(validateCapabilities(docs), []);
  });

  it('flags missing capabilities[] on a catalog entry', () => {
    const docs = [entry('API/fliplet-payments.md', { category: 'commerce' })];
    const errors = validateCapabilities(docs);
    const capError = errors.find((e) => e.field === 'capabilities');
    assert.ok(capError);
    assert.match(capError.message, /empty or missing/);
    assert.ok(capError.hint);
    assert.ok(capError.docUrl);
  });

  it('flags empty capabilities[] (e.g. `[]`)', () => {
    const docs = [entry('API/fliplet-payments.md', { capabilities: '[]', category: 'commerce' })];
    const errors = validateCapabilities(docs);
    assert.ok(errors.find((e) => e.field === 'capabilities'));
  });

  it('flags non-lowercase tokens', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[Stripe, checkout]',
        category: 'commerce',
      }),
    ];
    const errors = validateCapabilities(docs);
    const e = errors.find((x) => x.message.includes('Stripe'));
    assert.ok(e);
    assert.match(e.message, /uppercase/);
  });

  it('flags tokens >40 chars', () => {
    const long = 'a-very-very-very-very-very-very-very-long-token';
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: `[${long}]`,
        category: 'commerce',
      }),
    ];
    const errors = validateCapabilities(docs);
    assert.ok(errors.find((e) => e.message.includes('>40 chars')));
  });

  it('flags duplicate tokens within one entry', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[stripe, checkout, stripe]',
        category: 'commerce',
      }),
    ];
    const errors = validateCapabilities(docs);
    assert.ok(errors.find((e) => e.message.includes('duplicate')));
  });

  it('warns when a token starts with `[` (bracket-mismatch footgun)', () => {
    // `capabilities: [stripe, checkout` (missing `]`) parses as
    // `['[stripe', 'checkout']` — the leading `[` token signals this.
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[stripe, checkout',
        category: 'commerce',
      }),
    ];
    const errors = validateCapabilities(docs);
    const warn = errors.find((e) => e.message.includes('bracket-mismatch'));
    assert.ok(warn);
    assert.equal(warn.severity, 'warn');
  });

  it('warns when category is missing on a catalog entry', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[stripe, checkout]',
      }),
    ];
    const errors = validateCapabilities(docs);
    const cat = errors.find((e) => e.field === 'category');
    assert.ok(cat);
    assert.equal(cat.severity, 'warn');
    assert.match(cat.message, /missing/);
  });

  it('errors when category value is not in the allowed enum', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[stripe]',
        category: 'identitiy', // typo
      }),
    ];
    const errors = validateCapabilities(docs);
    const cat = errors.find((e) => e.field === 'category');
    assert.ok(cat);
    assert.equal(cat.severity, undefined); // hard error
    assert.match(cat.message, /not in the allowed set/);
  });

  it('every error carries hint and docUrl', () => {
    const docs = [
      entry('API/fliplet-payments.md', {
        capabilities: '[Stripe, stripe, stripe]',
      }),
    ];
    const errors = validateCapabilities(docs);
    assert.ok(errors.length > 0);
    for (const e of errors) {
      assert.ok(e.hint, `error on field ${e.field} missing hint`);
      assert.ok(e.docUrl, `error on field ${e.field} missing docUrl`);
    }
  });
});

describe('emitCapabilitiesIndex', () => {
  function doc(relPath, title, description, fm = {}) {
    return {
      relPath,
      url: `https://developers.fliplet.com/${relPath.replace(/\.md$/, '.html')}`,
      title,
      description,
      fm,
    };
  }

  it('skips docs outside the V3 catalog', () => {
    const docs = [
      doc('Building-themes.md', 'Themes', 'Theme guide'),
      doc('REST-API/Apps.md', 'Apps', 'REST'),
    ];
    const out = emitCapabilitiesIndex(docs);
    assert.match(out, /No content/i.test(out) || !/Building-themes/.test(out) ? /.*/ : /unreachable/);
    assert.ok(!out.includes('Themes — Theme guide'));
  });

  it('groups entries by category in ALLOWED_CATEGORIES order', () => {
    const docs = [
      doc('API/fliplet-payments.md', 'Fliplet.Payments', 'Stripe', { category: 'commerce', capabilities: '[stripe]' }),
      doc('API/fliplet-datasources.md', 'Fliplet.DataSources', 'CRUD', { category: 'data', capabilities: '[crud]' }),
      doc('API/core/user.md', 'Fliplet.User', 'Auth', { category: 'identity', capabilities: '[auth]' }),
    ];
    const out = emitCapabilitiesIndex(docs);
    const dataIdx = out.indexOf('## Data');
    const identityIdx = out.indexOf('## Identity');
    const commerceIdx = out.indexOf('## Commerce');
    assert.ok(dataIdx > 0);
    assert.ok(identityIdx > dataIdx, 'Identity section after Data');
    assert.ok(commerceIdx > identityIdx, 'Commerce after Identity');
  });

  it('puts uncategorised entries under an Uncategorized heading', () => {
    const docs = [
      doc('API/fliplet-x.md', 'Fliplet.X', 'No category here', {}),
    ];
    const out = emitCapabilitiesIndex(docs);
    assert.match(out, /## Uncategorized/);
    assert.match(out, /Fliplet\.X/);
  });

  it('marks ambient entries as preloaded', () => {
    const docs = [
      doc('API/core/storage.md', 'Fliplet.Storage', 'Persist', { category: 'data', capabilities: '[storage]' }),
      doc('API/fliplet-datasources.md', 'Fliplet.DataSources', 'Query', { category: 'data', capabilities: '[crud]' }),
    ];
    const out = emitCapabilitiesIndex(docs);
    assert.match(out, /Fliplet\.Storage[^—]*\*\*\(preloaded\)\*\*/);
    // Installable should NOT have the preloaded tag
    const dsLine = out.split('\n').find((l) => l.includes('Fliplet.DataSources'));
    assert.ok(!dsLine.includes('preloaded'));
  });

  it('contains required frontmatter so validateFrontmatter passes on the generated file', () => {
    const out = emitCapabilitiesIndex([]);
    assert.match(out, /^---\n/);
    assert.match(out, /title:/);
    assert.match(out, /description:/);
    assert.match(out, /type: reference/);
    assert.match(out, /tags: \[v3, capabilities, js-api\]/);
  });

  it('produces byte-identical output across two runs (no timestamp drift)', () => {
    const docs = [
      doc('API/fliplet-payments.md', 'Fliplet.Payments', 'Stripe', { category: 'commerce', capabilities: '[stripe]' }),
      doc('API/core/user.md', 'Fliplet.User', 'Auth', { category: 'identity', capabilities: '[auth]' }),
    ];
    const a = emitCapabilitiesIndex(docs);
    const b = emitCapabilitiesIndex(docs);
    assert.equal(a, b);
  });

  it('sorts entries within a category alphabetically by namespace', () => {
    const docs = [
      doc('API/fliplet-payments.md', 'Fliplet.Payments', 'd', { category: 'commerce', capabilities: '[a]' }),
      doc('API/fliplet-app-submissions.md', 'Fliplet.App.Submissions', 'd', { category: 'commerce', capabilities: '[a]' }),
    ];
    const out = emitCapabilitiesIndex(docs);
    const submissionsIdx = out.indexOf('Fliplet.App.Submissions');
    const paymentsIdx = out.indexOf('Fliplet.Payments');
    assert.ok(submissionsIdx > 0 && paymentsIdx > 0);
    assert.ok(submissionsIdx < paymentsIdx, 'App.Submissions sorts before Payments');
  });

  it('treats unknown category values as uncategorised', () => {
    const docs = [
      doc('API/fliplet-x.md', 'Fliplet.X', 'd', { category: 'bogus', capabilities: '[a]' }),
    ];
    const out = emitCapabilitiesIndex(docs);
    assert.match(out, /## Uncategorized/);
  });
});

describe('ALLOWED_CATEGORIES', () => {
  it('has exactly 13 values', () => {
    assert.equal(ALLOWED_CATEGORIES.length, 13);
  });

  it('matches the documented enum order', () => {
    assert.deepEqual(ALLOWED_CATEGORIES, [
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
    ]);
  });

  it('exposes a Set for fast lookup', () => {
    assert.ok(ALLOWED_CATEGORIES_SET instanceof Set);
    assert.equal(ALLOWED_CATEGORIES_SET.size, ALLOWED_CATEGORIES.length);
    for (const c of ALLOWED_CATEGORIES) {
      assert.ok(ALLOWED_CATEGORIES_SET.has(c));
    }
  });
});

describe('extractCrossLinks', () => {
  it('captures inline links and reference definitions', () => {
    const body = '[a](foo/bar)\n\nText [b](../baz) more.\n\n[ref]: qux/quux\n';
    const targets = extractCrossLinks(body).map((l) => l.target);
    assert.deepEqual(targets, ['foo/bar', '../baz', 'qux/quux']);
  });

  it('skips images', () => {
    const targets = extractCrossLinks('![alt](pic.png) and [real](doc)').map((l) => l.target);
    assert.deepEqual(targets, ['doc']);
  });

  it('skips links inside fenced code blocks (``` and ~~~)', () => {
    const body = '```\n[notalink](nope)\n```\n\n[real](yes)\n\n~~~\n[also](nope2)\n~~~\n';
    const targets = extractCrossLinks(body).map((l) => l.target);
    assert.deepEqual(targets, ['yes']);
  });

  it('skips links inside inline-code spans', () => {
    const targets = extractCrossLinks('Use `[x](y)` literally, but [real](z) counts.').map((l) => l.target);
    assert.deepEqual(targets, ['z']);
  });

  it('flags the lint-ignore-link marker on the line', () => {
    const links = extractCrossLinks('[skip](broken) <!-- lint-ignore-link -->');
    assert.equal(links[0].ignore, true);
  });

  it('reports 1-based line numbers', () => {
    const links = extractCrossLinks('line1\n\n[x](y)\n');
    assert.equal(links[0].line, 3);
  });
});

describe('classifyCrossLink', () => {
  const from = 'API/fliplet-datasources.md'; // dir = API

  it('resolves a bare directory-relative link', () => {
    assert.deepEqual(classifyCrossLink('datasources/joins', from), { resolved: 'API/datasources/joins' });
  });

  it('resolves a ./ current-dir link', () => {
    assert.deepEqual(classifyCrossLink('./fliplet-ui', from), { resolved: 'API/fliplet-ui' });
  });

  it('resolves a ../ parent link WITHOUT emitting literal ".."', () => {
    const r = classifyCrossLink('../API-Documentation', from);
    assert.deepEqual(r, { resolved: 'API-Documentation' });
    assert.ok(!r.resolved.includes('..'));
  });

  it('resolves a deeper ../../ parent link', () => {
    assert.deepEqual(classifyCrossLink('../../API-Documentation', 'API/v3/auth.md'), {
      resolved: 'API-Documentation',
    });
  });

  it('resolves a /-rooted link against the docs root', () => {
    assert.deepEqual(classifyCrossLink('/Quickstart', from), { resolved: 'Quickstart' });
  });

  it('strips a #anchor before resolving', () => {
    assert.deepEqual(classifyCrossLink('../routing#guards', from), { resolved: 'routing' });
  });

  it('skips a pure #anchor', () => {
    assert.deepEqual(classifyCrossLink('#section', from), { skip: true });
  });

  it('skips foreign hosts', () => {
    assert.deepEqual(classifyCrossLink('https://platform.openai.com/x', from), { skip: true });
    assert.deepEqual(classifyCrossLink('https://help.fliplet.com/x', from), { skip: true });
  });

  it('resolves an absolute developers.fliplet.com link', () => {
    assert.deepEqual(
      classifyCrossLink('https://developers.fliplet.com/API/datasources/joins.html', from),
      { resolved: 'API/datasources/joins.html' },
    );
  });

  it('skips non-doc asset extensions (.txt/.png/.pdf)', () => {
    assert.deepEqual(classifyCrossLink('../../assets/misc/cert.txt', from), { skip: true });
    assert.deepEqual(classifyCrossLink('logo.png', from), { skip: true });
  });

  it('skips mailto: and other schemes', () => {
    assert.deepEqual(classifyCrossLink('mailto:a@b.com', from), { skip: true });
  });

  it('flags a relative link that escapes the docs root', () => {
    assert.deepEqual(classifyCrossLink('../../../etc/passwd.md', 'API/foo.md'), { escaped: true });
  });
});

describe('validateCrossLinks (end-to-end on a tmp fixture)', () => {
  const fixtureDir = join(tmpdir(), `cross-links-test-${Date.now()}`);
  mkdirSync(join(fixtureDir, 'API', 'datasources'), { recursive: true });
  // Valid targets on disk
  writeFileSync(join(fixtureDir, 'README.md'), '# Home\n\nIntro.\n');
  writeFileSync(join(fixtureDir, 'API-Documentation.md'), '# API\n\nIndex.\n');
  writeFileSync(join(fixtureDir, 'API', 'datasources', 'joins.md'), '# Joins\n\nJoins doc.\n');
  // A redirect-stub-style EXCLUDED file: indexing skips it, but it is a VALID link target
  writeFileSync(join(fixtureDir, 'API', 'fliplet-core.md'), '# Core\n\nStub.\n');

  function doc(relPath, body) {
    return { relPath, body };
  }

  it('returns no errors when every internal link resolves', () => {
    const docs = [
      doc(
        'API/fliplet-datasources.md',
        '# DS\n\nSee [joins](datasources/joins) and [back](../API-Documentation).\n' +
          'Also [core](fliplet-core) and [home](/README.md).\n' +
          '[ext](https://platform.openai.com/x) and ![img](pic.png).\n',
      ),
    ];
    assert.deepEqual(validateCrossLinks(docs, fixtureDir), []);
  });

  it('treats an EXCLUDED_FILES target (redirect stub) as valid', () => {
    const docs = [doc('API/x.md', '[core](fliplet-core)')];
    assert.deepEqual(validateCrossLinks(docs, fixtureDir), []);
  });

  it('resolves .html links to their .md source', () => {
    const docs = [doc('API/x.md', '[j](datasources/joins.html)')];
    assert.deepEqual(validateCrossLinks(docs, fixtureDir), []);
  });

  it('flags a broken link with the full error contract', () => {
    const docs = [doc('API/x.md', '# X\n\n[bad](datasources/missing)\n')];
    const errors = validateCrossLinks(docs, fixtureDir);
    assert.equal(errors.length, 1);
    const e = errors[0];
    assert.equal(e.relPath, 'API/x.md');
    assert.equal(e.link, 'datasources/missing');
    assert.equal(e.resolvedTarget, 'API/datasources/missing');
    assert.match(e.message, /not found/);
    assert.ok(e.hint);
    assert.equal(typeof e.line, 'number');
  });

  it('suppresses a broken link marked lint-ignore-link', () => {
    const docs = [doc('API/x.md', '[bad](datasources/missing) <!-- lint-ignore-link -->')];
    assert.deepEqual(validateCrossLinks(docs, fixtureDir), []);
  });

  it('does not flag links inside fenced code blocks', () => {
    const docs = [doc('API/x.md', '```\n[bad](datasources/missing)\n```\n')];
    assert.deepEqual(validateCrossLinks(docs, fixtureDir), []);
  });

  it('(teardown)', () => {
    rmSync(fixtureDir, { recursive: true, force: true });
  });
});
