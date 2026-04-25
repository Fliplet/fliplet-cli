---
title: "fliplet-docs-mcp"
description: "Cloudflare Worker exposing an MCP server at developers.fliplet.com/mcp with search_fliplet_docs and fetch_fliplet_doc tools backed by llms.txt."
type: reference
tags: [mcp, internal]
v3_relevant: false
deprecated: false
---
# fliplet-docs-mcp

Cloudflare Worker exposing an MCP (Model Context Protocol) server at **https://developers.fliplet.com/mcp** with `search_fliplet_docs` and `fetch_fliplet_doc` tools backed by `.well-known/llms.txt`.

Any MCP-aware AI client (Claude Code, Cursor, custom OpenAI tools) can add
this URL as an MCP server and immediately get two tools:

- **`search_fliplet_docs({ query, limit?, tags?, type? })`** — fuzzy search
  the docs index at `.well-known/llms.txt`, returns ranked matches with
  title, URL, description, group, and relevance score.
- **`fetch_fliplet_doc({ url })`** — fetch the raw Markdown of a docs page.
  Strict URL validation: must be under `developers.fliplet.com` and end in
  `.md`. No query strings, no fragments. SSRF-safe.

## Architecture

- **Stateless.** Fresh `McpServer` instance per request; no Durable Objects.
- **Index source.** `search_fliplet_docs` reads `.well-known/llms.txt` from
  the same origin; caches 60 s in module scope per isolate.
- **CORS.** `Access-Control-Allow-Origin: *` on all responses and a bare
  204 for preflight `OPTIONS`. Read-only surface on public docs.
- **Rate limiting.** Configured via a Cloudflare Ruleset rate-limit rule on
  the `developers.fliplet.com` zone (not in code). Start with 100 req/min
  per IP, 429 with `Retry-After`.

## Local development

```bash
cd docs/mcp-worker
npm install
npm run dev          # wrangler dev, local MCP server at http://localhost:8787
npm test             # vitest — parser, search, SSRF guard
npm run typecheck    # tsc --noEmit
```

Smoke test the local server:

```bash
curl -sX POST http://localhost:8787 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | jq

curl -sX POST http://localhost:8787 \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"search_fliplet_docs","arguments":{"query":"data sources"}}}' | jq
```

## Pinned dependencies

`@modelcontextprotocol/sdk@1.20.2` + `agents@0.2.21` are pinned **exactly**
— versions `1.21.0+` of the SDK bundle `ajv@8.17.1`, which relies on
`new Function()` / `eval()` and cannot run in the Cloudflare Workers
runtime. See the Phase 0.13 SDK spike notes in the plan file at
`~/.claude/plans/sites-fliplet-studio-currently-has-a-crystalline-lemon.md`
for the full write-up.

## Deployment

Via `wrangler deploy` from this directory. Requires the `fliplet.com` zone
in the Cloudflare account and the route binding in `wrangler.jsonc`.

CI/CD: wire `wrangler deploy` into a GitHub Actions workflow when ready —
not included in this PR. Must be triggered only on `mcp-worker/**` changes
on `master`.

## MCP client configuration

Claude Code:

```json
{
  "mcpServers": {
    "fliplet-docs": {
      "type": "http",
      "url": "https://developers.fliplet.com/mcp"
    }
  }
}
```

Cursor, Codex, and other Streamable-HTTP MCP clients take the same
endpoint URL.

## Naming note

`fliplet-kb` (the Fliplet-internal code-and-docs knowledge base MCP server)
also historically exposed a tool named `search_fliplet_docs`. To avoid a
collision when an AI client is configured with both servers, fliplet-kb
renames its dev-docs-scoped tool to `search_fliplet_dev_docs` (broader
scope: includes internal docs + source code) while this server keeps the
short name for the public docs surface.
