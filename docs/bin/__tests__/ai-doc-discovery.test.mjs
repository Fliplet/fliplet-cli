import { it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectDocs, emitLlmsTxt, emitV3LibraryCatalog, validateFrontmatter } from '../build-agent-indexes.mjs';
import { copySiblings } from '../copy-md-siblings.mjs';

it('indexes nested AI pages and copies raw siblings while retaining one Fliplet.AI namespace', () => {
  const source = fileURLToPath(new URL('../../', import.meta.url));
  const root = mkdtempSync(join(tmpdir(), 'ai-doc-discovery-'));
  const paths = ['API/core/ai.md', 'API/core/ai/models.md', 'API/core/ai/chatbot.md', 'API/core/ai/audio-transcription.md'];
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
