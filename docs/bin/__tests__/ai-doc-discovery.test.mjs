import { it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectDocs, emitLlmsTxt, emitV3LibraryCatalog, validateFrontmatter } from '../build-agent-indexes.mjs';
import { copySiblings } from '../copy-md-siblings.mjs';

it('indexes nested AI pages and copies raw siblings while retaining one Fliplet.AI namespace', () => {
  const source = fileURLToPath(new URL('../../', import.meta.url));
  const root = mkdtempSync(join(tmpdir(), 'ai-doc-discovery-'));
  const paths = ['API/core/ai.md', 'API/core/ai/models.md', 'API/core/ai/chatbot.md', 'API/core/ai/audio-transcription.md', 'API/core/ai/tool-calling.md', 'API/core/ai/web-search.md', 'API/core/ai/file-and-image-analysis.md'];
  try {
    for (const path of paths) {
      mkdirSync(dirname(join(root, path)), { recursive: true });
      writeFileSync(join(root, path), readFileSync(join(source, path)));
    }
    const docs = collectDocs(root);
    assert.equal(docs.length, paths.length);
    assert.equal(validateFrontmatter(docs).length, 0);
    const index = emitLlmsTxt(docs);
    for (const path of paths) assert.ok(index.includes(`https://developers.fliplet.com/${path}`));
    assert.ok(index.includes('[Web search and citations]'));
    assert.ok(index.includes('[File and image analysis]'));
    assert.equal(/grounded-answers|media-inputs/.test(index), false, 'Discovery publishes only canonical guide paths');
    const catalog = emitV3LibraryCatalog(docs);
    assert.equal(catalog.libraries.length, 1);
    assert.equal(catalog.libraries[0].namespace, 'Fliplet.AI');
    assert.equal(catalog.libraries[0].preloaded, true);
    assert.equal(catalog.libraries[0].docUrl, 'https://developers.fliplet.com/API/core/ai.md');
    const site = join(root, '_site');
    mkdirSync(site);
    assert.equal(copySiblings(root, site), paths.length);
    for (const path of paths) assert.equal(readFileSync(join(site, path), 'utf8'), readFileSync(join(root, path), 'utf8'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});


it('ships permanent legacy AI guide redirects without converting Markdown into HTML', () => {
  const source = fileURLToPath(new URL('../../', import.meta.url));
  const config = readFileSync(join(source, '_config.yml'), 'utf8');
  const includes = config.match(/^include:\n((?:[ \t]+.*\n)*)/m)?.[1] || '';
  assert.match(includes, /^  - _redirects$/m, 'Jekyll must publish the Cloudflare redirect configuration');
  const rules = readFileSync(join(source, '_redirects'), 'utf8').split('\n')
    .map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => line.split(/\s+/));
  for (const [oldSlug, newSlug] of [['grounded-answers', 'web-search'], ['media-inputs', 'file-and-image-analysis']]) {
    assert.equal(existsSync(join(source, 'API/core/ai/' + oldSlug + '.md')), false, 'Old pages must not remain duplicate documents');
    for (const extension of ['', '.html', '.md']) {
      const from = '/API/core/ai/' + oldSlug + extension;
      const matching = rules.filter(rule => rule[0] === from);
      assert.equal(matching.length, 1, 'One unambiguous redirect for ' + from);
      assert.deepEqual(matching[0].slice(1), ['/API/core/ai/' + newSlug + (extension === '.md' ? '.md' : ''), '301']);
    }
  }
});
