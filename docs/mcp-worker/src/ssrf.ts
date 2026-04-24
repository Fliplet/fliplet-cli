// SSRF guard for the fetch_fliplet_doc tool.
//
// Extracted to its own module so unit tests can import it without pulling in
// `agents/mcp` (and its cloudflare:* imports) which only load in the
// Cloudflare Workers runtime.

export function validateDocUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error("Invalid URL");
  }
  if (url.protocol !== "https:") {
    throw new Error("URL must be https");
  }
  if (url.hostname !== "developers.fliplet.com") {
    throw new Error("URL host must be developers.fliplet.com");
  }
  if (!url.pathname.endsWith(".md")) {
    throw new Error("URL path must end in .md");
  }
  if (url.search) {
    throw new Error("URL must not contain a query string");
  }
  if (url.hash) {
    throw new Error("URL must not contain a fragment");
  }
  return url;
}
