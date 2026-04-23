// Unit tests for bin/build-agent-indexes.mjs
// Run: npm run test:unit   (or `node --test bin/__tests__/*.test.mjs`)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  parseFrontmatter,
  extractH1AndIntro,
  urlForPath,
  truncate,
  emitLlmsTxt,
  emitAgentSkills,
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

describe('emitAgentSkills', () => {
  it('produces v0.2.0 schema with one skill per doc', () => {
    const docs = [
      {
        title: 'Doc One',
        url: 'https://ex.com/a',
        description: 'Summary one',
        skillName: 'doc-one',
        sha256: 'abc123',
      },
    ];
    const out = emitAgentSkills(docs);
    assert.equal(out.$schema, 'https://agentskills.io/schema/v0.2.0/index.json');
    assert.equal(out.skills.length, 1);
    assert.equal(out.skills[0].name, 'doc-one');
    assert.equal(out.skills[0].type, 'documentation');
    assert.equal(out.skills[0].sha256, 'abc123');
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
