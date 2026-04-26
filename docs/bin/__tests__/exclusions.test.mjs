// Unit tests for bin/exclusions.mjs
// Run: npm run test:unit   (or `node --test bin/__tests__/*.test.mjs`)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { EXCLUDED_FILES, EXCLUDED_DIRS, shouldExclude } from '../exclusions.mjs';

describe('EXCLUDED_FILES', () => {
  it('contains the redirect-stub and meta-doc files', () => {
    assert.ok(EXCLUDED_FILES.has('disable-analytics.md'));
    assert.ok(EXCLUDED_FILES.has('API/fliplet-core.md'));
    assert.ok(EXCLUDED_FILES.has('API/fliplet-helper.md'));
    assert.ok(EXCLUDED_FILES.has('API/core/app-tasks.md'));
    assert.ok(EXCLUDED_FILES.has('CLAUDE.md'));
  });

  it('does NOT include real product docs', () => {
    assert.ok(!EXCLUDED_FILES.has('API/fliplet-datasources.md'));
    assert.ok(!EXCLUDED_FILES.has('Quickstart.md'));
    assert.ok(!EXCLUDED_FILES.has('README.md'));
  });
});

describe('EXCLUDED_DIRS', () => {
  it('lists the build/Jekyll/tooling dirs that must never be walked', () => {
    for (const d of ['_site', '_includes', '_layouts', '_plugins', '_templates']) {
      assert.ok(EXCLUDED_DIRS.includes(d), `expected ${d} in EXCLUDED_DIRS`);
    }
    for (const d of ['node_modules', 'docsearch', 'bin', 'test', '.git', '.github', '.well-known', 'assets']) {
      assert.ok(EXCLUDED_DIRS.includes(d), `expected ${d} in EXCLUDED_DIRS`);
    }
  });
});

describe('shouldExclude', () => {
  it('returns true for files in EXCLUDED_FILES', () => {
    assert.equal(shouldExclude('disable-analytics.md'), true);
    assert.equal(shouldExclude('CLAUDE.md'), true);
    assert.equal(shouldExclude('API/fliplet-core.md'), true);
  });

  it('returns true for any *.deprecated.md regardless of path', () => {
    assert.equal(shouldExclude('API/fliplet-encryption.deprecated.md'), true);
    assert.equal(shouldExclude('Random-Top-Level.deprecated.md'), true);
    assert.equal(shouldExclude('REST-API/legacy.deprecated.md'), true);
  });

  it('returns true for any path under an EXCLUDED_DIR at the root', () => {
    assert.equal(shouldExclude('_site/index.html'), true);
    assert.equal(shouldExclude('_layouts/default.html'), true);
    assert.equal(shouldExclude('node_modules/foo/README.md'), true);
    assert.equal(shouldExclude('bin/build-agent-indexes.mjs'), true);
    assert.equal(shouldExclude('.well-known/llms.txt'), true);
  });

  it('returns true for nested EXCLUDED_DIRs at any depth', () => {
    // The nested-node_modules trap from the original drift bug:
    // npm install inside mcp-worker/ would otherwise leak transitive
    // README.md files into the indexed set.
    assert.equal(shouldExclude('mcp-worker/node_modules/foo/README.md'), true);
    assert.equal(shouldExclude('docs/.git/HEAD'), true);
    assert.equal(shouldExclude('something/_layouts/x.md'), true);
    assert.equal(shouldExclude('a/b/c/node_modules/d/e.md'), true);
  });

  it('matches a dir name with the trailing slash form too', () => {
    // Edge: relPath === <dir> with no trailing content. shouldExclude
    // covers this for completeness.
    assert.equal(shouldExclude('_site'), true);
    assert.equal(shouldExclude('node_modules'), true);
  });

  it('returns false for legitimate doc paths', () => {
    assert.equal(shouldExclude('README.md'), false);
    assert.equal(shouldExclude('Quickstart.md'), false);
    assert.equal(shouldExclude('API/fliplet-datasources.md'), false);
    assert.equal(shouldExclude('API/core/storage.md'), false);
    assert.equal(shouldExclude('REST-API/Apps.md'), false);
    assert.equal(shouldExclude('aab/create-p12-certificate.md'), false);
  });

  it('does not false-match dir names that are substrings of other paths', () => {
    // "bin" excluded shouldn't accidentally exclude "binary-data.md".
    assert.equal(shouldExclude('binary-data.md'), false);
    // ".git" shouldn't match "gitops-guide.md".
    assert.equal(shouldExclude('gitops-guide.md'), false);
    // "test" shouldn't match "testing-components.md".
    assert.equal(shouldExclude('testing-components.md'), false);
  });
});
