# Fliplet developer documentation

Developer documentation for the Fliplet platform — JavaScript APIs, REST APIs,
component and helper frameworks, and developer guides. Served at
developers.fliplet.com via Cloudflare Pages. Sources lives under `docs/` in
the `Fliplet/fliplet-cli` repo.

Jekyll renders `docs/**/*.md` → HTML. A Node build step generates AI-doc
discovery primitives under `docs/.well-known/`. A post-build step copies
source `.md` files into `_site/` as siblings so AI agents can fetch raw
Markdown at the same URL.

## Authoring a new doc

1. Copy `_templates/doc-template.md` as a starting point, or use the
   `/fl-write-dev-doc` skill if you have it installed.
2. Put your file under the appropriate directory (see **Directory map** below).
3. Fill in frontmatter per the schema. Title must match the H1. Description
   must be a 1–2 sentence standalone summary (<=160 chars).
4. Write the body. Open with a paragraph that works as a summary — do not
   jump from H1 straight to a subheading. The llms.txt extractor relies on
   there being a prose paragraph between H1 and the first `##`.

## Frontmatter schema (required)

Every .md file outside the exclusion list below MUST have YAML frontmatter
with these fields:

```yaml
---
title: "Fliplet.DataSources"                  # matches the H1 (minus backticks)
description: "1–2 sentence summary, <=160 chars"
type: api-reference                           # see allowed values
tags: [js-api, datasources]                   # 1–6 lowercase dash-separated
v3_relevant: true                             # default true
deprecated: false                             # default false
---
```

**`type` values:** `api-reference` | `guide` | `how-to` | `concept` | `tutorial` | `reference` | `integration`

**`tags` convention:** first tag is the canonical area (`js-api`, `rest-api`,
`components-framework`, `app-build`). Add 1–5 specifics. Lowercase, dash-
separated, no duplicates.

**`v3_relevant`:** true for docs applicable to V3 apps (most Fliplet JS APIs
work in both V1 and V3). Set false only for clearly V1-only content.

**`deprecated`:** true for docs describing deprecated APIs. The llms.txt
index still emits them; it is up to the consumer to prefer non-deprecated.

## Exclusion list — do not index, do not polish

These files are handled at the server or build layer and must never be
indexed by `build-agent-indexes.mjs` or served as a `.md` sibling:

- `disable-analytics.md` — analytics opt-out utility page
- `API/fliplet-encryption.deprecated.md` — `.deprecated.md` pattern
- `API/fliplet-core.md` — client-side JS redirect stub
- `API/fliplet-helper.md` — client-side JS redirect stub
- `API/core/app-tasks.md` — client-side JS redirect stub

Any `*.deprecated.md` pattern is excluded automatically.

Directory-level exclusions: `_site/`, `_includes/`, `_layouts/`, `_plugins/`,
`_templates/`, `node_modules/`, `docsearch/`, `bin/`, `test/`, `.git/`,
`.github/`, `.well-known/`, `assets/`.

## Build pipeline

Three steps, each independent. Cloudflare Pages runs all three on every deploy:

```
docs/**/*.md
   │
   ├── node bin/build-agent-indexes.mjs
   │     ↓
   │     docs/.well-known/{
   │       llms.txt, llms-full.txt,
   │       agent-skills/index.json,
   │       agent-skills/<cluster>/SKILL.md   (12 capability clusters),
   │       mcp/server-card.json
   │     }
   │
   ├── bundle exec jekyll build
   │     ↓
   │     docs/_site/**/*.html
   │     (Jekyll is configured to SKIP .well-known/ — see _config.yml.
   │      Its SKILL.md frontmatter would otherwise trigger Jekyll's
   │      Markdown→HTML conversion and break the URLs we publish.)
   │
   └── node bin/copy-md-siblings.mjs
         ↓
         docs/_site/<path>.md       (source .md sibling of each .html)
         docs/_site/.well-known/**  (verbatim copy, post-Jekyll)
```

Run locally:

```bash
cd docs
node bin/build-agent-indexes.mjs
bundle exec jekyll build
node bin/copy-md-siblings.mjs
```

Run the unit tests:

```bash
cd docs
npm run test:unit    # stdlib node:test; covers both bin/ scripts
```

## Primitives published under `.well-known/`

These are the AI-consumption surfaces. Publish URLs on `developers.fliplet.com`:

| Path | Format | Purpose |
|---|---|---|
| `/.well-known/llms.txt` | llmstxt.org text | Grouped one-line index of all docs (per-page) |
| `/.well-known/llms-full.txt` | Concatenated markdown | Full content of all docs for clients that want to ingest in bulk |
| `/.well-known/agent-skills/index.json` | Agent Skills v0.2.0 | Capability-clustered skill registry (12 entries, SHA256 per cluster's SKILL.md) |
| `/.well-known/agent-skills/<cluster>/SKILL.md` | Markdown w/ frontmatter | Per-cluster entry point listing the cluster's docs |
| `/.well-known/mcp/server-card.json` | SEP-1649 server card | Discovery for the MCP Worker at `/mcp` |

`_headers` sets CORS (`Access-Control-Allow-Origin: *`) and `Cache-Control:
max-age=3600` for all of these. `/*.md` paths also get
`Content-Type: text/markdown; charset=utf-8` and CORS so agents can fetch
raw Markdown siblings.

## Markdown siblings

Every `foo/bar.md` source file becomes both `foo/bar.html` (Jekyll output)
and `foo/bar.md` (raw markdown sibling, copied by
`bin/copy-md-siblings.mjs`). Root `README.md` is published as both `/` (the
homepage HTML) and `/index.md` (the raw markdown).

This is a stopgap for Cloudflare Pages' future native Markdown-for-Agents
feature; when that ships we can drop the copy step.

## MCP server

A Cloudflare Worker at `developers.fliplet.com/mcp` exposes an MCP server
over Streamable HTTP with two tools:

- `search_fliplet_docs({ query, limit?, tags?, type? })` — fuzzy-search
  the index built from `.well-known/llms.txt`.
- `fetch_fliplet_doc({ url })` — fetch the raw Markdown of a single doc
  page; SSRF-safe (URL must be under `developers.fliplet.com` and end in
  `.md`).

Source lives at `mcp-worker/`. Deploy with `cd mcp-worker && npx wrangler
deploy` from a machine with Cloudflare credentials. Discovery is published
at `/.well-known/mcp/server-card.json` per SEP-1649.

`fliplet-kb` (the Fliplet-internal code-and-docs MCP server) renames its
dev-docs-scoped tool to `search_fliplet_dev_docs` to avoid collision with
this server when an AI client is configured with both.

## Skill routing

- Product ideas, "is this worth building" → `/fl-app-prd`
- New developer doc → `/fl-write-dev-doc`
- API reference → `/fl-write-api-ref`
- Customer-facing help doc → `/fl-write-support-doc`
- Audit an existing doc → `/fl-review-doc` or `/fl-audit`
- Update docs after shipping a feature → `/fl-update-docs`
- Shipping the skill pack itself → `/fl-ship`

## Sunset register

Speculative or workaround artifacts that should be reviewed (and most
likely deleted) by the listed date. Re-evaluate each at the start of the
quarter the date falls in. Keeping this list short forces the pruning
loop — if an entry survives its sunset date, document why; otherwise
delete it.

| Item | Sunset date | Trigger to delete |
|---|---|---|
| `agent-skills/` cluster files (12 SKILL.md) + emitter in `bin/build-agent-indexes.mjs` | 2027-04-01 | No documented agent runtime consuming them |
| `MCP SDK 1.20.2` pin in `mcp-worker/wrangler.jsonc` | When upstream fixes ajv `eval`/`new Function` on Workers (track `@modelcontextprotocol/sdk` releases > 1.20.2) | Unpin once `npm test` and the deploy smoke test still pass on a newer version |
| `.md` sibling copy step (`bin/copy-md-siblings.mjs`) | When Cloudflare Pages ships native Markdown-for-Agents | CF announces and we can drop the post-build copy |

When adding a new external-facing artifact (a new `.well-known/` surface,
a new build-pipeline output, a new MCP tool) that isn't anchored to ≥1
documented consumer, add a row here with a sunset date.

## What NOT to add

Counters drift toward more layers when fewer would do:

- **No new `.well-known/` surface** without a documented external
  consumer. Five surfaces today, each tied to a real spec; a sixth needs
  the same justification.
- **No per-doc metadata files.** Frontmatter in the `.md` file is the
  single source of truth — every downstream artifact derives from it.
- **No new `bin/` script** that isn't part of the 3-stage build pipeline.
  One-shot migrations belong in a PR commit, not as carried code.
- **No client-side script in `_layouts/default.html`** that runs on every
  page without a feature-detect guard. The layout is shared by every
  doc; cost is paid 174× per visitor.
- **No second taxonomy for the same docs.** We already publish per-page
  (`llms.txt`) and clustered (`agent-skills/`) views; a third
  classification needs a distinct audience that neither serves.

## Repository conventions

- **American English in all docs.** "color" not "colour", "customize" not "customise".
- **One doc per concept.** Prefer linking to existing docs over duplicating content.
- **Code examples MUST run.** Verify APIs against `~/Sites/fliplet/api/libs/` before citing signatures.
- **H1 backticks for JS namespaces.** `` # `Fliplet.X` ``, not `# Fliplet.X API`.
- **Sentence case for non-namespace H1s.** `# Building Fliplet components`, not `# Building Fliplet Components`.
