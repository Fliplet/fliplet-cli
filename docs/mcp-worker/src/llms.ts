// Parse the llmstxt.org-shaped index emitted by bin/build-agent-indexes.mjs.
// Returns a flat list of doc entries with their group label preserved.

export interface DocEntry {
  title: string;
  url: string;
  description: string;
  group: string;
}

// Line shape: `- [Doc title](https://example.com/path.html): one-line summary`
// Groups are introduced by `## Group label` headings. The first `# Title` and
// `> Description` (blockquote) lines at the top describe the site; we ignore
// them because the MCP client gets site metadata elsewhere.
const ENTRY_RE = /^-\s+\[([^\]]+)\]\(([^)]+)\)(?::\s*(.*))?$/;
const GROUP_RE = /^##\s+(.+?)\s*$/;

export function parseLlmsTxt(text: string): DocEntry[] {
  const entries: DocEntry[] = [];
  let currentGroup = "Guides";
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const groupMatch = line.match(GROUP_RE);
    if (groupMatch) {
      currentGroup = groupMatch[1];
      continue;
    }
    const entryMatch = line.match(ENTRY_RE);
    if (!entryMatch) continue;
    entries.push({
      title: entryMatch[1].trim(),
      url: entryMatch[2].trim(),
      description: (entryMatch[3] || "").trim(),
      group: currentGroup,
    });
  }
  return entries;
}
