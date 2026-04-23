// Fuzzy search over the docs index using Fuse.js.
// Weighted fields: title 3x, description 1x, group 0.5x. Tags/type filters
// are applied as a narrow-then-rank pipeline.

import Fuse, { IFuseOptions } from "fuse.js";
import type { DocEntry } from "./llms.ts";

export interface SearchOptions {
  query: string;
  limit?: number;
  tags?: string[];
  type?: string;
}

export interface SearchHit extends DocEntry {
  score: number;
}

const FUSE_OPTIONS: IFuseOptions<DocEntry> = {
  keys: [
    { name: "title", weight: 3 },
    { name: "description", weight: 1 },
    { name: "group", weight: 0.5 },
  ],
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
};

export function searchDocs(entries: DocEntry[], opts: SearchOptions): SearchHit[] {
  const limit = Math.max(1, Math.min(50, opts.limit ?? 5));

  // Narrow by tag / type / group if requested. Currently llms.txt doesn't
  // carry per-entry tags or type (that metadata lives in agent-skills/index.json),
  // so tag/type filters fall back to a substring match on group/title until
  // the worker is upgraded to read agent-skills alongside llms.txt.
  let pool = entries;
  if (opts.type) {
    const t = opts.type.toLowerCase();
    pool = pool.filter((e) => e.group.toLowerCase().includes(t));
  }
  if (opts.tags && opts.tags.length > 0) {
    const needles = opts.tags.map((s) => s.toLowerCase());
    pool = pool.filter((e) => {
      const hay = (e.title + " " + e.description + " " + e.group).toLowerCase();
      return needles.every((n) => hay.includes(n));
    });
  }

  if (!opts.query || opts.query.trim() === "") {
    return pool.slice(0, limit).map((e) => ({ ...e, score: 0 }));
  }

  const fuse = new Fuse(pool, FUSE_OPTIONS);
  const results = fuse.search(opts.query, { limit });
  return results.map((r) => ({ ...r.item, score: r.score ?? 0 }));
}
