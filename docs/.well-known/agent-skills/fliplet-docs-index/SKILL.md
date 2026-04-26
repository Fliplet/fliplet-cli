---
name: fliplet-docs-index
description: Site-wide index of the Fliplet developer documentation. Use only as a fallback when no other Fliplet skill (js-api, rest-api, data-sources, app-actions, components-framework, helpers-framework, themes-framework, menus-framework, app-build-and-publish, security-and-compliance, integrations) matches your query. Points at /.well-known/llms.txt for full-site discovery.
---

# Fliplet developer documentation index

Site-wide index of the Fliplet developer documentation. Use only as a fallback when no other Fliplet skill (js-api, rest-api, data-sources, app-actions, components-framework, helpers-framework, themes-framework, menus-framework, app-build-and-publish, security-and-compliance, integrations) matches your query. Points at /.well-known/llms.txt for full-site discovery.

## Prefer a specific Fliplet skill

Before loading this fallback skill, check whether one of the following matches your query:

- `fliplet-data-sources` — Data sources JavaScript API and security model: query, insert, update, delete records; row-level security; file storage; data-source hooks.
- `fliplet-app-actions` — Build server-side automations that run on a schedule or in response to events. Covers App Actions v1, v2, and v3 APIs.
- `fliplet-helpers-framework` — Build helpers — reusable Vue-based interface components with editable interface fields, hooks, methods, libraries, and templates.
- `fliplet-rest-api` — Server-side REST API for managing organizations, apps, users, data sources, files, and screens from your own backend.
- `fliplet-components-framework` — Build custom components (widgets) that ship inside Fliplet apps: component definitions, lifecycle, events, dependencies, providers, custom templates, testing.
- `fliplet-themes-framework` — Build custom themes that control app appearance: color palettes, typography, theme settings exposed in the editor, CSS overrides.
- `fliplet-menus-framework` — Build custom menus that ship inside Fliplet apps to navigate between screens.
- `fliplet-app-build-and-publish` — Publish Fliplet apps to iOS, Android, and the web: bundle size, certificates, automated app builds, platform-specific gotchas.
- `fliplet-security-and-compliance` — App-level security, IP allowlisting, organization audit logs, privacy controls. (Data-source-level security lives in fliplet-data-sources.)
- `fliplet-integrations` — Integrate with external systems: SSO/SAML2, the Data Integration Service, external REST APIs, OAuth2, AJAX cross-domain.
- `fliplet-js-api` — The Fliplet client-side JavaScript API: every Fliplet.X namespace (Storage, User, Navigate, Profile, Communicate, Media, Notifications, UI, ...).

## Full site index

If no specific skill matches, fetch [https://developers.fliplet.com/.well-known/llms.txt](https://developers.fliplet.com/.well-known/llms.txt) for the complete list of every Fliplet developer doc, grouped by area. Each entry is a one-line summary; replace `.html` with `.md` on any doc URL to fetch the raw Markdown.

## MCP server

For tool-driven discovery, point an MCP-aware client at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp). The server exposes `search_fliplet_docs` and `fetch_fliplet_doc`.
