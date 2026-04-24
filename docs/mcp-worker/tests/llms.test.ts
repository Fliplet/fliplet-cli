import { describe, it, expect } from "vitest";
import { parseLlmsTxt } from "../src/llms.ts";

describe("parseLlmsTxt", () => {
  it("returns entries with title, url, description, and group", () => {
    const text = `# Site
> Site description

## Group A

- [Title One](https://example.com/a.html): First summary
- [Title Two](https://example.com/b.html): Second summary

## Group B

- [Title Three](https://example.com/c.html): Third summary
`;
    const entries = parseLlmsTxt(text);
    expect(entries).toHaveLength(3);
    expect(entries[0]).toEqual({
      title: "Title One",
      url: "https://example.com/a.html",
      description: "First summary",
      group: "Group A",
    });
    expect(entries[2].group).toBe("Group B");
  });

  it("ignores the site title and blockquote description", () => {
    const text = `# Big Site
> A description.

## Group

- [Entry](https://x/a.html): desc
`;
    const entries = parseLlmsTxt(text);
    expect(entries).toHaveLength(1);
    expect(entries[0].title).toBe("Entry");
  });

  it("handles entries without a description", () => {
    const text = `## Group

- [Barebones](https://x/y.html)
`;
    const entries = parseLlmsTxt(text);
    expect(entries[0]).toMatchObject({
      title: "Barebones",
      url: "https://x/y.html",
      description: "",
    });
  });

  it("assigns 'Guides' as the default group when no ## heading precedes entries", () => {
    const text = `- [Stray](https://x/s.html): stray desc
`;
    const entries = parseLlmsTxt(text);
    expect(entries[0].group).toBe("Guides");
  });

  it("tolerates CRLF line endings", () => {
    const text = `## Group A\r\n\r\n- [T](https://x/a.html): d\r\n`;
    const entries = parseLlmsTxt(text);
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe("https://x/a.html");
  });
});
