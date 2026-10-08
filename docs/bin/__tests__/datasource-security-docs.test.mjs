import { it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLUSTERS, collectDocs, emitLlmsTxt, emitV3LibraryCatalog, validateFrontmatter } from '../build-agent-indexes.mjs';
import { copySiblings } from '../copy-md-siblings.mjs';

const source = fileURLToPath(new URL('../../', import.meta.url));
const paths = ['Data-source-security.md', 'API/fliplet-datasources.md',
  'API/datasources/security-rules.md', 'API/datasources/security-examples.md',
  'API/datasources/testing-security.md'];
const moved = ['security-rules', 'access-rule-structure', 'defining-who-can-access',
  'restricting-columns', 'example-role-based-access-with-protected-fields',
  'example-department-scoped-access', 'data-requirements-and-query-validation',
  'data-requirement-types', 'handlebars-templating', 'require-syntax',
  'custom-security-rules', 'granting-access', 'modifying-the-input-query',
  'checking-data-when-committing-changes', 'reading-data-from-other-data-sources'];

it('discovers every security page in the existing cluster and retains one SDK catalog owner', () => {
  const root = mkdtempSync(join(tmpdir(), 'datasource-security-docs-'));
  try {
    for (const path of paths) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), readFileSync(join(source, path)));
    }
    const docs = collectDocs(root);
    assert.equal(docs.length, paths.length);
    assert.deepEqual(validateFrontmatter(docs), []);
    const cluster = CLUSTERS.find(item => item.name === 'fliplet-data-sources');
    const index = emitLlmsTxt(docs);
    for (const path of paths) {
      assert.ok(cluster.match(path), path);
      assert.ok(index.includes(`https://developers.fliplet.com/${path}`), path);
    }
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].docUrl, 'https://developers.fliplet.com/API/fliplet-datasources.md');
    const site = join(root, '_site');
    mkdirSync(site);
    assert.equal(copySiblings(root, site), paths.length);
    for (const path of paths) assert.equal(readFileSync(join(site, path), 'utf8'), readFileSync(join(source, path), 'utf8'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

it('retains every moved public security fragment with an explicit destination link', () => {
  const body = readFileSync(join(source, paths[0]), 'utf8');
  for (const anchor of moved) {
    assert.match(body, new RegExp(String.raw`<a id="${anchor}"></a>\s+\[[^\]]+\]\(API/datasources/[^)]+\)`));
  }
});

it('security JSON and JavaScript fences parse and templates survive Liquid raw blocks', () => {
  const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  let blocks = 0;
  for (const path of paths.filter(path => path !== 'API/fliplet-datasources.md')) {
    const body = readFileSync(join(source, path), 'utf8');
    for (const match of body.matchAll(/```(json|js)\n([\s\S]*?)```/g)) {
      blocks++;
      if (match[1] === 'json') JSON.parse(match[2]);
      else new AsyncFunction(match[2]);
    }
    let raw = false;
    for (const line of body.split('\n')) {
      if (line.includes('{% raw %}')) raw = true;
      if (line.includes('{{')) assert.ok(raw, `${path}: unescaped template`);
      if (line.includes('{% endraw %}')) raw = false;
    }
  }
  assert.ok(blocks >= 15, 'example fences must actually be exercised');
});
