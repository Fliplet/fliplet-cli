#!/usr/bin/env node
// Generates the agent-discovery files under docs/.well-known/ from ai-index.json.
// Run before `bundle exec jekyll build` so Jekyll copies the output into _site/.
// Stdlib only — no npm deps.
//
// Outputs:
//   docs/.well-known/api-catalog                 — RFC 9727 linkset+json
//   docs/.well-known/agent-skills/index.json     — Agent Skills Discovery v0.2.0
//
// SHA256 is computed over the SOURCE Markdown file on disk. Once Cloudflare's
// Markdown-for-Agents feature is live, agents fetching via Accept: text/markdown
// will receive content whose hash matches this value.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const docsRoot = resolve(here, '..');
const indexJsonPath = join(docsRoot, 'ai-index.json');
const wellKnownDir = join(docsRoot, '.well-known');
const agentSkillsDir = join(wellKnownDir, 'agent-skills');

const BASE_URL = 'https://developers.fliplet.com';

const entries = JSON.parse(readFileSync(indexJsonPath, 'utf8'));

const urlFor = (path) => `${BASE_URL}/${path.replace(/\.md$/, '.html')}`;

const linkset = {
  linkset: Object.entries(entries).map(([, entry]) => {
    const href = urlFor(entry.path);
    return {
      anchor: href,
      'service-doc': [{ href, type: 'text/html', title: entry.title }],
    };
  }),
};

const skills = Object.entries(entries).map(([name, entry]) => {
  const sourcePath = join(docsRoot, entry.path);
  const sha256 = createHash('sha256')
    .update(readFileSync(sourcePath))
    .digest('hex');
  return {
    name,
    type: 'documentation',
    description: entry.description,
    url: urlFor(entry.path),
    sha256,
  };
});

const agentSkills = {
  $schema: 'https://agentskills.io/schema/v0.2.0/index.json',
  skills,
};

mkdirSync(agentSkillsDir, { recursive: true });

writeFileSync(
  join(wellKnownDir, 'api-catalog'),
  JSON.stringify(linkset, null, 2) + '\n',
);
writeFileSync(
  join(agentSkillsDir, 'index.json'),
  JSON.stringify(agentSkills, null, 2) + '\n',
);

console.log('Generated:');
console.log(`  .well-known/api-catalog             (${linkset.linkset.length} entries)`);
console.log(`  .well-known/agent-skills/index.json (${skills.length} skills)`);
