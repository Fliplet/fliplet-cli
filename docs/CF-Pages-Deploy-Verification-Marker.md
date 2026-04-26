---
title: Cloudflare Pages deploy verification marker
description: Diagnostic marker doc to verify CF Pages preview and production deploys produce the expected .well-known/llms.txt, agent-skills, and .md sibling outputs end-to-end.
type: reference
tags: [diagnostic, cf-pages, verification, marker]
v3_relevant: false
deprecated: false
---
# Cloudflare Pages deploy verification marker

This is a diagnostic marker page that exists solely to verify the AI doc-discovery pipeline is working end-to-end. It is **not** meant to remain in the docs long-term — once the verification round is complete, it should be reverted.

## What this proves when present

If you are reading this page on `developers.fliplet.com/CF-Pages-Deploy-Verification-Marker.html`, every step of the pipeline below is working:

1. Cloudflare Pages picked up the push to the relevant branch.
2. `bin/build-agent-indexes.mjs` ran and indexed this file with frontmatter as the source of truth.
3. `bundle exec jekyll build` rendered this Markdown to HTML.
4. `bin/copy-md-siblings.mjs` ran and copied this file as a `.md` sibling alongside the generated HTML.
5. `_headers` applied the right `Content-Type`, `Cache-Control`, and CORS headers.
6. CF's edge cache is serving the deploy.

## What to verify on the deploy

Once the deploy lands (preview URL or production):

- `https://<deploy-host>/CF-Pages-Deploy-Verification-Marker.html` returns 200 with the rendered HTML.
- `https://<deploy-host>/CF-Pages-Deploy-Verification-Marker.md` returns 200 with `Content-Type: text/markdown; charset=utf-8` and the raw frontmatter + body.
- `https://<deploy-host>/.well-known/llms.txt` includes a line for this entry under the `## Guides` group (since `type: reference` and no other group prefix matches).
- `https://<deploy-host>/.well-known/agent-skills/index.json` contains a skill named `cf-pages-deploy-verification-marker` with the description above and a populated `sha256`.
- `https://<deploy-host>/.well-known/llms-full.txt` contains the body of this doc.

## Lifecycle

- Created as part of a verification PR.
- After preview-build verification: the PR is reviewed and either merged (to verify production deploy) or discarded (if preview already exposes a problem).
- After production-deploy verification: a follow-up PR is opened to delete this file. Production deploy is verified again to confirm the deletion takes effect.

If you are seeing this in production and it has been more than a week since it was created, please open a PR to delete it — leaving it around dilutes the docs index.
