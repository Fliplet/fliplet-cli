import { spawnSync } from 'node:child_process';
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { collectDocs, validateFrontmatter, emitV3LibraryCatalog, CLUSTERS } from '../build-agent-indexes.mjs';
import { copySiblings } from '../copy-md-siblings.mjs';
const source = fileURLToPath(new URL('../../', import.meta.url));
const paths = ['API/fliplet-datasources.md', ...['reading-data', 'writing-data', 'file-attachments', 'subscriptions', 'offline-database', 'managing-data-sources', 'query-operators', 'joins', 'views'].map(name => `API/datasources/${name}.md`)];
it('discovers split SDK references and copies exact raw pages without adding namespace owners', () => {
  const root = mkdtempSync(join(tmpdir(), 'datasource-reference-'));
  try {
    for (const path of paths) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), readFileSync(join(source, path)));
    }
    const docs = collectDocs(root);
    assert.equal(docs.length, paths.length);
    assert.deepEqual(validateFrontmatter(docs), []);
    const cluster = CLUSTERS.find(cluster => cluster.name === 'fliplet-data-sources');
    for (const path of paths) assert.ok(cluster.match(path), path);
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].docUrl, 'https://developers.fliplet.com/API/fliplet-datasources.md');
    const out = join(root, '_site'); mkdirSync(out);
    assert.equal(copySiblings(root, out), paths.length);
    for (const path of paths) assert.equal(readFileSync(join(out, path), 'utf8'), readFileSync(join(source, path), 'utf8'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
it('SDK reference JSON and plain JavaScript examples parse independently', () => {
  const AsyncFunction = Object.getPrototypeOf(async function() {}).constructor;
  let blocks = 0;
  for (const path of paths) {
    const body = readFileSync(join(source, path), 'utf8');
    for (const match of body.matchAll(/```(json|js)\n([\s\S]*?)```/g)) {
      blocks++;
      if (match[1] === 'json') JSON.parse(match[2]);
      else if (/^import /m.test(match[2])) {
        const parsed = spawnSync(process.execPath, ['--check', '--input-type=module'], { input: match[2], encoding: 'utf8' });
        assert.equal(parsed.status, 0, `${path}: ${parsed.stderr}`);
      } else assert.doesNotThrow(() => new AsyncFunction(match[2]), path);
    }
  }
  assert.ok(blocks >= 20);
});
