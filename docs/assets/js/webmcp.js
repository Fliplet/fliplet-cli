// WebMCP integration for developers.fliplet.com.
//
// Exposes a small set of read-only tools to in-browser AI agents that
// implement the WebMCP API (navigator.modelContext.registerTool). The
// tools mirror what the docs MCP worker offers at /mcp, so an agent
// browsing a doc page can search, fetch, and inspect docs without
// leaving the tab.
//
// Spec: https://webmachinelearning.github.io/webmcp/
// Skill: https://isitagentready.com/.well-known/agent-skills/webmcp/SKILL.md
(function () {
  'use strict';

  if (!('modelContext' in navigator) || typeof navigator.modelContext.registerTool !== 'function') {
    return;
  }

  var DOCS_ORIGIN = 'https://developers.fliplet.com';
  var LLMS_URL = DOCS_ORIGIN + '/.well-known/llms.txt';
  var FETCH_TIMEOUT_MS = 5000;
  var MAX_FETCH_BYTES = 2000000;

  // Lazy, in-memory cache of the parsed llms.txt index.
  var indexPromise = null;

  function loadIndex() {
    if (indexPromise) return indexPromise;
    indexPromise = fetch(LLMS_URL, { headers: { Accept: 'text/plain' } })
      .then(function (resp) {
        if (!resp.ok) throw new Error('Failed to load docs index: ' + resp.status);
        return resp.text();
      })
      .then(parseLlmsTxt)
      .catch(function (err) {
        // Reset so a later call can retry.
        indexPromise = null;
        throw err;
      });
    return indexPromise;
  }

  function parseLlmsTxt(text) {
    var entries = [];
    var currentGroup = '';
    var lines = text.split('\n');
    var lineRe = /^- \[([^\]]+)\]\(([^)]+)\)(?:\s*:\s*(.*))?$/;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line.indexOf('## ') === 0) {
        currentGroup = line.slice(3).trim();
        continue;
      }
      var m = lineRe.exec(line);
      if (m) {
        entries.push({
          title: m[1].trim(),
          url: m[2].trim(),
          description: (m[3] || '').trim(),
          group: currentGroup,
        });
      }
    }
    return entries;
  }

  function scoreEntry(entry, terms) {
    var title = entry.title.toLowerCase();
    var description = entry.description.toLowerCase();
    var url = entry.url.toLowerCase();
    var score = 0;
    for (var i = 0; i < terms.length; i++) {
      var t = terms[i];
      if (!t) continue;
      if (title === t) score += 10;
      if (title.indexOf(t) !== -1) score += 5;
      if (new RegExp('\\b' + escapeRegExp(t) + '\\b').test(title)) score += 3;
      if (description.indexOf(t) !== -1) score += 2;
      if (url.indexOf(t) !== -1) score += 1;
    }
    return score;
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function searchDocs(index, opts) {
    var query = String(opts.query || '').toLowerCase().trim();
    if (!query) return [];
    var terms = query.split(/\s+/).filter(Boolean);
    var typeFilter = opts.type ? String(opts.type).toLowerCase() : null;
    var limit = Math.min(Math.max(parseInt(opts.limit, 10) || 5, 1), 50);
    var hits = [];
    for (var i = 0; i < index.length; i++) {
      var entry = index[i];
      if (typeFilter && entry.group.toLowerCase().indexOf(typeFilter) === -1) continue;
      var score = scoreEntry(entry, terms);
      if (score > 0) hits.push({ entry: entry, score: score });
    }
    hits.sort(function (a, b) { return b.score - a.score; });
    return hits.slice(0, limit).map(function (h) {
      return {
        title: h.entry.title,
        url: h.entry.url,
        description: h.entry.description,
        group: h.entry.group,
        score: h.score,
      };
    });
  }

  // Same SSRF guard as docs/mcp-worker/src/ssrf.ts: docs origin only,
  // path must end in .md, no query or fragment.
  function validateDocUrl(rawUrl) {
    var url;
    try { url = new URL(rawUrl); } catch (e) {
      throw new Error('Invalid URL: ' + rawUrl);
    }
    if (url.origin !== DOCS_ORIGIN) {
      throw new Error('URL must be under ' + DOCS_ORIGIN);
    }
    if (!/\.md$/i.test(url.pathname)) {
      throw new Error('URL path must end in .md');
    }
    if (url.search || url.hash) {
      throw new Error('URL must not contain query string or fragment');
    }
    return url.href;
  }

  function fetchWithTimeout(url, timeoutMs) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, { headers: { Accept: 'text/markdown, text/plain' }, signal: controller.signal })
      .then(function (resp) {
        clearTimeout(timer);
        if (!resp.ok) throw new Error('Upstream ' + resp.status + ': ' + resp.statusText);
        return resp.text();
      })
      .then(function (body) {
        if (body.length > MAX_FETCH_BYTES) {
          throw new Error('Document exceeds ' + MAX_FETCH_BYTES + ' bytes');
        }
        return body;
      });
  }

  function currentDocUrl() {
    var path = location.pathname;
    if (path === '/' || path === '') return DOCS_ORIGIN + '/index.md';
    if (/\.html$/.test(path)) path = path.replace(/\.html$/, '.md');
    else if (path.charAt(path.length - 1) === '/') path = path + 'index.md';
    else if (!/\.md$/.test(path)) path = path + '.md';
    return DOCS_ORIGIN + path;
  }

  function register(tool) {
    try {
      navigator.modelContext.registerTool(tool);
    } catch (err) {
      // InvalidStateError is thrown if the tool is already registered
      // (e.g., on bfcache restore). Ignore and continue.
      if (!err || err.name !== 'InvalidStateError') {
        // eslint-disable-next-line no-console
        console.warn('[fliplet-webmcp] failed to register ' + tool.name + ':', err);
      }
    }
  }

  register({
    name: 'search_fliplet_docs',
    title: 'Search Fliplet developer docs',
    description:
      'Search the Fliplet developer docs (developers.fliplet.com) for pages matching a free-text query. ' +
      'Returns up to `limit` results ordered by relevance, derived from /.well-known/llms.txt. ' +
      'Use this to discover relevant API references and guides; then call fetch_fliplet_doc on a result URL ' +
      'to read the full Markdown before writing code.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 1, maxLength: 200, description: 'Free-text search query.' },
        limit: { type: 'integer', minimum: 1, maximum: 50, description: 'Maximum number of results. Default 5.' },
        type: {
          type: 'string',
          description: "Narrow by section heading from llms.txt, e.g. 'Fliplet Core JavaScript APIs' or 'REST APIs'.",
        },
      },
      required: ['query'],
    },
    annotations: { readOnlyHint: true },
    execute: function (input) {
      return loadIndex().then(function (index) {
        var results = searchDocs(index, input || {});
        return { query: (input && input.query) || '', total: results.length, results: results };
      });
    },
  });

  register({
    name: 'fetch_fliplet_doc',
    title: 'Fetch Fliplet doc Markdown',
    description:
      'Fetch the raw Markdown of a Fliplet developer docs page by its canonical URL. ' +
      'URL must be under https://developers.fliplet.com and end in .md (the sibling-Markdown paths ' +
      'published by the docs build). No query strings or fragments. Use after search_fliplet_docs to ' +
      'read full content.',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'Full URL starting with https://developers.fliplet.com and ending in .md.',
        },
      },
      required: ['url'],
    },
    annotations: { readOnlyHint: true },
    execute: function (input) {
      var safeUrl = validateDocUrl(input && input.url);
      return fetchWithTimeout(safeUrl, FETCH_TIMEOUT_MS).then(function (content) {
        return { url: safeUrl, content: content };
      });
    },
  });

  register({
    name: 'get_current_fliplet_doc',
    title: 'Get the current Fliplet doc',
    description:
      'Return the URL, title, and raw Markdown of the Fliplet developer docs page the user is currently ' +
      'viewing. Useful when the agent should ground its answer in what the user is reading right now.',
    inputSchema: { type: 'object', properties: {} },
    annotations: { readOnlyHint: true },
    execute: function () {
      var mdUrl = currentDocUrl();
      return fetchWithTimeout(mdUrl, FETCH_TIMEOUT_MS).then(
        function (content) {
          return {
            pageUrl: location.href,
            markdownUrl: mdUrl,
            title: document.title,
            content: content,
          };
        },
        function () {
          // .md sibling may not exist for every page (e.g. exclusion list).
          return {
            pageUrl: location.href,
            markdownUrl: null,
            title: document.title,
            content: null,
          };
        }
      );
    },
  });
})();
