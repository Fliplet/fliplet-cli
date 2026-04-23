import { describe, it, expect } from "vitest";
import { searchDocs } from "../src/search.ts";
import type { DocEntry } from "../src/llms.ts";

const FIXTURE: DocEntry[] = [
  {
    title: "Fliplet.DataSources",
    url: "https://developers.fliplet.com/API/fliplet-datasources.html",
    description: "Connect to, query, insert, update, and delete records in Fliplet Data Sources.",
    group: "Fliplet JavaScript APIs",
  },
  {
    title: "Fliplet.User",
    url: "https://developers.fliplet.com/API/core/user.html",
    description: "Get and set the current user's auth token, profile details, and preferences.",
    group: "Fliplet Core JavaScript APIs",
  },
  {
    title: "Fliplet.Media",
    url: "https://developers.fliplet.com/API/fliplet-media.html",
    description: "Browse folders, upload and manage files, and download media.",
    group: "Fliplet JavaScript APIs",
  },
  {
    title: "Apps REST API",
    url: "https://developers.fliplet.com/REST-API/fliplet-apps.html",
    description: "List, read, create, update, and delete Fliplet apps from an external integration.",
    group: "REST APIs",
  },
];

describe("searchDocs", () => {
  it("returns the top-N matches ordered by relevance", () => {
    const hits = searchDocs(FIXTURE, { query: "data sources", limit: 3 });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0].title).toBe("Fliplet.DataSources");
  });

  it("respects the limit argument", () => {
    const hits = searchDocs(FIXTURE, { query: "fliplet", limit: 2 });
    expect(hits).toHaveLength(2);
  });

  it("returns an empty array for queries that match nothing", () => {
    const hits = searchDocs(FIXTURE, { query: "xyzzy-nonexistent-thing", limit: 5 });
    expect(hits).toHaveLength(0);
  });

  it("narrows by type (group substring match) before ranking", () => {
    const hits = searchDocs(FIXTURE, { query: "fliplet", type: "REST APIs", limit: 10 });
    expect(hits.every((h) => h.group === "REST APIs")).toBe(true);
  });

  it("narrows by tags (substring intersection across title+description+group)", () => {
    const hits = searchDocs(FIXTURE, {
      query: "fliplet",
      tags: ["user", "core"],
      limit: 10,
    });
    expect(hits).toHaveLength(1);
    expect(hits[0].title).toBe("Fliplet.User");
  });

  it("defaults limit to 5 when unspecified", () => {
    const hits = searchDocs(FIXTURE, { query: "fliplet" });
    expect(hits.length).toBeLessThanOrEqual(5);
  });

  it("returns top-N from pool when query is empty", () => {
    const hits = searchDocs(FIXTURE, { query: "", limit: 2 });
    expect(hits).toHaveLength(2);
    expect(hits[0].score).toBe(0);
  });
});
