// Cloudflare Worker entry point for the Fliplet docs MCP server.
//
// Exposes two MCP tools over Streamable HTTP at developers.fliplet.com/mcp:
//
//   search_fliplet_docs({ query, limit?, tags?, type? })
//     Fuzzy-searches the llms.txt index emitted by
//     bin/build-agent-indexes.mjs, returning top-N matches with URL,
//     title, description, and a relevance score.
//
//   fetch_fliplet_doc({ url })
//     Fetches the raw Markdown sibling of a docs page. Strict URL
//     validation (SSRF mitigation): hostname must be exactly
//     developers.fliplet.com, path must end in .md, no query/fragment.
//
// Stateless — a fresh McpServer is instantiated per request, and the
// llms.txt index is cached in module scope for 60 seconds per isolate.

import { createMcpHandler } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseLlmsTxt, type DocEntry } from "./llms.ts";
import { searchDocs } from "./search.ts";
import { validateDocUrl } from "./ssrf.ts";
import { isBrowserGet, renderLandingPage } from "./landing.ts";

// === Config ===
const DOCS_ORIGIN = "https://developers.fliplet.com";
const LLMS_URL = `${DOCS_ORIGIN}/.well-known/llms.txt`;
const LLMS_CACHE_TTL_MS = 60_000;
const FETCH_TIMEOUT_MS = 5_000;
const MAX_FETCH_BYTES = 2_000_000;

// === llms.txt cache (per isolate) ===
interface LlmsCache {
  entries: DocEntry[];
  fetchedAt: number;
}
let llmsCache: LlmsCache | null = null;

async function loadIndex(): Promise<DocEntry[]> {
  const now = Date.now();
  if (llmsCache && now - llmsCache.fetchedAt < LLMS_CACHE_TTL_MS) {
    return llmsCache.entries;
  }
  const resp = await fetch(LLMS_URL, {
    headers: { Accept: "text/plain" },
    cf: { cacheTtl: 60 },
  } as RequestInit);
  if (!resp.ok) {
    throw new Error(`Index fetch failed: ${resp.status} ${resp.statusText}`);
  }
  const text = await resp.text();
  const entries = parseLlmsTxt(text);
  llmsCache = { entries, fetchedAt: now };
  return entries;
}

// === SSRF-safe fetcher for fetch_fliplet_doc ===
async function fetchDoc(rawUrl: string): Promise<{ url: string; content: string }> {
  const url = validateDocUrl(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const resp = await fetch(url.href, {
      headers: { Accept: "text/markdown, text/plain" },
      signal: controller.signal,
    });
    if (!resp.ok) {
      throw new Error(`Upstream ${resp.status}: ${resp.statusText}`);
    }
    // Enforce size cap in case someone serves a huge file at a .md path.
    const body = await resp.text();
    if (body.length > MAX_FETCH_BYTES) {
      throw new Error(`Document exceeds ${MAX_FETCH_BYTES} bytes; refusing to serve.`);
    }
    return { url: url.href, content: body };
  } finally {
    clearTimeout(timer);
  }
}

// === MCP server factory ===
function createServer(): McpServer {
  const server = new McpServer({
    name: "fliplet-docs-mcp",
    version: "0.1.0",
  });

  server.registerTool(
    "search_fliplet_docs",
    {
      description:
        "Search the Fliplet developer docs for pages matching a free-text query. " +
        "Returns up to `limit` results ordered by relevance. Results are derived from " +
        "https://developers.fliplet.com/.well-known/llms.txt. Optional `tags` and `type` " +
        "arguments further narrow the pool. Snippets are for ranking only and may omit " +
        "code signatures — call fetch_fliplet_doc on the chosen result before writing code.",
      inputSchema: {
        query: z.string().min(1).max(200).describe("Free-text search query."),
        limit: z
          .number()
          .int()
          .min(1)
          .max(50)
          .optional()
          .describe("Maximum number of results. Default 5."),
        tags: z
          .array(z.string())
          .optional()
          .describe("Narrow results to pages whose text mentions all of these tags."),
        type: z
          .string()
          .optional()
          .describe(
            "Narrow by category, e.g. 'Fliplet Core JavaScript APIs' or 'REST APIs'.",
          ),
      },
    },
    async ({ query, limit, tags, type }) => {
      const index = await loadIndex();
      const hits = searchDocs(index, { query, limit, tags, type });
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                query,
                total: hits.length,
                results: hits.map((h) => ({
                  title: h.title,
                  url: h.url,
                  description: h.description,
                  group: h.group,
                  score: h.score,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  server.registerTool(
    "fetch_fliplet_doc",
    {
      description:
        "Fetch the raw Markdown of a Fliplet developer docs page by its canonical URL. " +
        "URL must be under developers.fliplet.com and end in .md (these are the " +
        "sibling-markdown paths published by the docs build). No query strings, no " +
        "fragments. Use after search_fliplet_docs to read full content before writing code.",
      inputSchema: {
        url: z
          .string()
          .url()
          .describe(
            "Full URL starting with https://developers.fliplet.com and ending in .md.",
          ),
      },
    },
    async ({ url }) => {
      const doc = await fetchDoc(url);
      return {
        content: [
          {
            type: "text",
            text: doc.content,
          },
        ],
      };
    },
  );

  return server;
}

// === CORS wrapper ===
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "3600",
};

function withCors(resp: Response): Response {
  const headers = new Headers(resp.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(resp.body, {
    status: resp.status,
    statusText: resp.statusText,
    headers,
  });
}

// === Worker entry ===
export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    // Friendly explanatory page for plain browser visits. MCP-aware
    // clients send Accept: text/event-stream (or .../json) — only
    // browsers send text/html, so this branch never fires for legitimate
    // protocol clients.
    if (isBrowserGet(request)) {
      return withCors(renderLandingPage());
    }
    try {
      const resp = await createMcpHandler(createServer())(request, env, ctx);
      return withCors(resp);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return withCors(
        new Response(JSON.stringify({ error: msg }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }),
      );
    }
  },
} satisfies ExportedHandler;

// Re-export internals for unit testing (but see src/ssrf.ts for the
// SSRF guard — unit tests import from there directly to avoid loading
// the Workers-only agents/mcp module in Node).
export { fetchDoc, loadIndex, createServer };
