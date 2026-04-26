// Unit tests for bin/copy-md-siblings.mjs
// Run: npm run test:unit   (or `node --test bin/__tests__/*.test.mjs`)

import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { siblingTargetForRelPath, copySiblings, copyWellKnown } from '../copy-md-siblings.mjs';

describe('siblingTargetForRelPath', () => {
  it('maps README.md to index.md for homepage serving', () => {
    assert.equal(siblingTargetForRelPath('README.md'), 'index.md');
  });

  it('leaves non-README paths unchanged', () => {
    assert.equal(siblingTargetForRelPath('API/core/storage.md'), 'API/core/storage.md');
    assert.equal(siblingTargetForRelPath('Data-source-security.md'), 'Data-source-security.md');
  });
});

describe('copySiblings', () => {
  const root = join(tmpdir(), `copy-siblings-test-${Date.now()}`);
  const site = join(root, '_site');

  // Fixture: a tiny docs tree with a mix of eligible and excluded files
  mkdirSync(root, { recursive: true });
  mkdirSync(join(root, 'API'), { recursive: true });
  mkdirSync(join(root, 'API', 'core'), { recursive: true });
  mkdirSync(site, { recursive: true });

  writeFileSync(join(root, 'README.md'), '# Welcome\n');
  writeFileSync(join(root, 'Guide.md'), '# Guide\n');
  writeFileSync(join(root, 'API', 'foo.md'), '# Foo\n');
  writeFileSync(join(root, 'API', 'core', 'bar.md'), '# Bar\n');
  // Exclusions the script must honor:
  writeFileSync(join(root, 'disable-analytics.md'), '# Skip me\n');
  writeFileSync(join(root, 'API', 'fliplet-core.md'), '# Redirect stub\n');
  writeFileSync(join(root, 'API', 'legacy.deprecated.md'), '# Deprecated\n');

  it('copies eligible .md files into _site/', () => {
    const count = copySiblings(root, site);
    assert.equal(count, 4);
    assert.ok(existsSync(join(site, 'index.md')));
    assert.ok(existsSync(join(site, 'Guide.md')));
    assert.ok(existsSync(join(site, 'API', 'foo.md')));
    assert.ok(existsSync(join(site, 'API', 'core', 'bar.md')));
  });

  it('maps root README.md to _site/index.md', () => {
    const content = readFileSync(join(site, 'index.md'), 'utf8');
    assert.equal(content, '# Welcome\n');
  });

  it('skips excluded files (disable-analytics, redirect stubs, .deprecated)', () => {
    assert.ok(!existsSync(join(site, 'disable-analytics.md')));
    assert.ok(!existsSync(join(site, 'API', 'fliplet-core.md')));
    assert.ok(!existsSync(join(site, 'API', 'legacy.deprecated.md')));
  });

  it('is idempotent — running twice produces the same result', () => {
    const count = copySiblings(root, site);
    assert.equal(count, 4);
    assert.ok(existsSync(join(site, 'index.md')));
  });

  it('throws a clear error when _site/ does not exist', () => {
    const missingRoot = join(tmpdir(), `copy-siblings-missing-${Date.now()}`);
    const missingSite = join(missingRoot, '_site');
    mkdirSync(missingRoot, { recursive: true });
    writeFileSync(join(missingRoot, 'x.md'), '# X\n');
    assert.throws(
      () => copySiblings(missingRoot, missingSite),
      /_site directory not found/,
    );
    rmSync(missingRoot, { recursive: true, force: true });
  });

  // Cleanup
  it('(teardown)', () => {
    rmSync(root, { recursive: true, force: true });
  });
});

describe('copyWellKnown', () => {
  const root = join(tmpdir(), `copy-well-known-test-${Date.now()}`);
  const site = join(root, '_site');
  const wk = join(root, '.well-known');

  mkdirSync(wk, { recursive: true });
  mkdirSync(join(wk, 'agent-skills', 'fliplet-data-sources'), { recursive: true });
  mkdirSync(join(wk, 'mcp'), { recursive: true });
  mkdirSync(site, { recursive: true });

  writeFileSync(join(wk, 'llms.txt'), 'index\n');
  writeFileSync(join(wk, 'api-catalog'), '{}\n');
  writeFileSync(join(wk, 'agent-skills', 'index.json'), '{"skills":[]}\n');
  writeFileSync(
    join(wk, 'agent-skills', 'fliplet-data-sources', 'SKILL.md'),
    '---\nname: fliplet-data-sources\n---\n# DS\n',
  );
  writeFileSync(join(wk, 'mcp', 'server-card.json'), '{"x":1}\n');

  it('copies every file under .well-known/ verbatim', () => {
    const count = copyWellKnown(root, site);
    assert.equal(count, 5);
    assert.ok(existsSync(join(site, '.well-known', 'llms.txt')));
    assert.ok(existsSync(join(site, '.well-known', 'api-catalog')));
    assert.ok(existsSync(join(site, '.well-known', 'agent-skills', 'index.json')));
    assert.ok(
      existsSync(join(site, '.well-known', 'agent-skills', 'fliplet-data-sources', 'SKILL.md')),
    );
    assert.ok(existsSync(join(site, '.well-known', 'mcp', 'server-card.json')));
  });

  it('preserves SKILL.md byte-for-byte (no Jekyll conversion)', () => {
    const original = readFileSync(
      join(wk, 'agent-skills', 'fliplet-data-sources', 'SKILL.md'),
      'utf8',
    );
    const copied = readFileSync(
      join(site, '.well-known', 'agent-skills', 'fliplet-data-sources', 'SKILL.md'),
      'utf8',
    );
    assert.equal(copied, original);
  });

  it('throws a clear error when .well-known/ does not exist', () => {
    const empty = join(tmpdir(), `copy-wk-missing-${Date.now()}`);
    mkdirSync(join(empty, '_site'), { recursive: true });
    assert.throws(
      () => copyWellKnown(empty, join(empty, '_site')),
      /\.well-known directory not found/,
    );
    rmSync(empty, { recursive: true, force: true });
  });

  // Cleanup
  it('(teardown)', () => {
    rmSync(root, { recursive: true, force: true });
  });
});
