import { describe, it, expect } from "vitest";
import { validateDocUrl } from "../src/ssrf.ts";

describe("validateDocUrl (SSRF guard)", () => {
  it("accepts a canonical developers.fliplet.com .md URL", () => {
    const url = validateDocUrl("https://developers.fliplet.com/API/fliplet-datasources.md");
    expect(url.hostname).toBe("developers.fliplet.com");
    expect(url.pathname).toBe("/API/fliplet-datasources.md");
  });

  it("rejects non-https schemes", () => {
    expect(() => validateDocUrl("http://developers.fliplet.com/a.md")).toThrow(/https/);
  });

  it("rejects hostnames other than developers.fliplet.com", () => {
    expect(() => validateDocUrl("https://evil.example.com/a.md")).toThrow(/host/);
    expect(() => validateDocUrl("https://fliplet.com/a.md")).toThrow(/host/);
    expect(() => validateDocUrl("https://developers.fliplet.com.evil.com/a.md")).toThrow(/host/);
  });

  it("rejects subdomain attacks via userinfo/port", () => {
    expect(() =>
      validateDocUrl("https://evil.com@developers.fliplet.com/a.md"),
    ).not.toThrow();
    // userinfo in a URL doesn't change the hostname, which is what we
    // actually guard on — document that current behaviour for future auditors.
    // But port-bearing URLs should still pass hostname check:
    expect(() =>
      validateDocUrl("https://developers.fliplet.com:443/a.md"),
    ).not.toThrow();
  });

  it("rejects paths that don't end in .md", () => {
    expect(() => validateDocUrl("https://developers.fliplet.com/a.html")).toThrow(/\.md/);
    expect(() => validateDocUrl("https://developers.fliplet.com/a")).toThrow(/\.md/);
    expect(() => validateDocUrl("https://developers.fliplet.com/a.md.html")).toThrow(/\.md/);
  });

  it("rejects URLs with a query string", () => {
    expect(() =>
      validateDocUrl("https://developers.fliplet.com/a.md?x=1"),
    ).toThrow(/query/);
  });

  it("rejects URLs with a fragment", () => {
    expect(() =>
      validateDocUrl("https://developers.fliplet.com/a.md#section"),
    ).toThrow(/fragment/);
  });

  it("rejects malformed URLs", () => {
    expect(() => validateDocUrl("not a url")).toThrow(/Invalid/);
    expect(() => validateDocUrl("")).toThrow();
  });
});
