import { describe, it, expect } from "vitest";
import { isBrowserGet, renderLandingPage } from "../src/landing.ts";

describe("isBrowserGet", () => {
  it("returns true for a GET with Accept: text/html", () => {
    const req = new Request("https://x/mcp", {
      method: "GET",
      headers: { Accept: "text/html" },
    });
    expect(isBrowserGet(req)).toBe(true);
  });

  it("returns true for a typical browser Accept header", () => {
    const req = new Request("https://x/mcp", {
      method: "GET",
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
    });
    expect(isBrowserGet(req)).toBe(true);
  });

  it("returns false for an MCP client GET (Accept: text/event-stream only)", () => {
    const req = new Request("https://x/mcp", {
      method: "GET",
      headers: { Accept: "text/event-stream" },
    });
    expect(isBrowserGet(req)).toBe(false);
  });

  it("returns false for an MCP client GET (Accept: application/json, text/event-stream)", () => {
    const req = new Request("https://x/mcp", {
      method: "GET",
      headers: { Accept: "application/json, text/event-stream" },
    });
    expect(isBrowserGet(req)).toBe(false);
  });

  it("returns false for any POST regardless of Accept", () => {
    const req = new Request("https://x/mcp", {
      method: "POST",
      headers: { Accept: "text/html" },
    });
    expect(isBrowserGet(req)).toBe(false);
  });

  it("returns false when Accept is missing", () => {
    const req = new Request("https://x/mcp", { method: "GET" });
    expect(isBrowserGet(req)).toBe(false);
  });

  it("is case-insensitive on the Accept value", () => {
    const req = new Request("https://x/mcp", {
      method: "GET",
      headers: { Accept: "TEXT/HTML" },
    });
    expect(isBrowserGet(req)).toBe(true);
  });
});

describe("renderLandingPage", () => {
  it("returns 200 OK with HTML Content-Type", async () => {
    const resp = renderLandingPage();
    expect(resp.status).toBe(200);
    expect(resp.headers.get("Content-Type")).toMatch(/^text\/html/);
  });

  it("includes the server-card link and the canonical endpoint", async () => {
    const resp = renderLandingPage();
    const body = await resp.text();
    expect(body).toContain("/.well-known/mcp/server-card.json");
    expect(body).toContain("https://developers.fliplet.com/mcp");
  });

  it("explains why a plain browser visit returns Not Acceptable", async () => {
    const resp = renderLandingPage();
    const body = await resp.text();
    expect(body).toMatch(/Not Acceptable/i);
    expect(body).toMatch(/MCP/i);
  });

  it("sets a public Cache-Control with a non-zero max-age", () => {
    const resp = renderLandingPage();
    const cc = resp.headers.get("Cache-Control") ?? "";
    expect(cc).toMatch(/public/);
    expect(cc).toMatch(/max-age=\d+/);
  });
});
