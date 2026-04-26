// Friendly HTML response for human visitors who hit the /mcp endpoint in
// a browser. MCP-aware clients send `Accept: text/event-stream` (or
// `application/json, text/event-stream`) per the Streamable HTTP spec —
// browsers send `Accept: text/html,...`. Distinguishing them lets us
// return a small explanatory page instead of the cryptic JSON-RPC
// "Not Acceptable" error.

const LANDING_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Fliplet docs MCP server</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
         max-width: 38rem; margin: 4rem auto; padding: 0 1.5rem; line-height: 1.55;
         color: #1a1a1a; background: #fff; }
  h1 { font-size: 1.5rem; margin: 0 0 0.5rem; }
  p { margin: 1rem 0; }
  code { background: #f3f4f6; padding: 0.1rem 0.35rem; border-radius: 3px;
         font-size: 0.9em; }
  a { color: #0066cc; }
  hr { border: 0; border-top: 1px solid #e5e7eb; margin: 2rem 0; }
  .muted { color: #6b7280; font-size: 0.9rem; }
</style>
</head>
<body>
<h1>Fliplet docs MCP server</h1>
<p>This URL is the streamable-HTTP endpoint of a
<a href="https://modelcontextprotocol.io">Model Context Protocol</a> server.
It is designed to be configured into MCP-aware tooling, not browsed
directly — that's why a plain browser visit returns a JSON-RPC
<code>Not Acceptable</code> error.</p>
<p>Endpoint: <code>https://developers.fliplet.com/mcp</code></p>
<p>Server card with capabilities and transport details:<br>
<a href="/.well-known/mcp/server-card.json">/.well-known/mcp/server-card.json</a></p>
<hr>
<p class="muted">Looking for the human-readable docs? Visit
<a href="/">developers.fliplet.com</a>.</p>
</body>
</html>
`;

export function isBrowserGet(request: Request): boolean {
  if (request.method !== "GET") return false;
  const accept = request.headers.get("accept") ?? "";
  return accept.toLowerCase().includes("text/html");
}

export function renderLandingPage(): Response {
  return new Response(LANDING_HTML, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Short cache: the page is static, but we may iterate the wording.
      "Cache-Control": "public, max-age=300",
    },
  });
}
