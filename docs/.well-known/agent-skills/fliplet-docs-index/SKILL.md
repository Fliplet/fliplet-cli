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

## General docs in this bucket

These docs don't belong to a single capability cluster — they are general onboarding, conventions, or cross-cutting references. Listed here so they remain reachable via agent-skills discovery even when no specific cluster is loaded:

- [Fliplet Developers documentation](https://developers.fliplet.com/): Reference and guides for extending Fliplet apps with the JS API, REST API, and custom components, themes, and menus.
- [AI-powered Fliplet development with Cursor](https://developers.fliplet.com/AI-powered-development-with-Cursor.html): How to install and use the Fliplet VS Code extension inside Cursor to generate, refactor, and debug Fliplet app code with AI assistance.
- [Fliplet analytics event reference](https://developers.fliplet.com/Analytics-documentation.html): List the analytics event types Fliplet emits for page views, navigation, app management, sharing, and component interactions.
- [Writing more readable code when using the JS APIs](https://developers.fliplet.com/Async-await.html): Use async/await with Fliplet's Promise-based JS APIs for cleaner data-source reads, navigation, hooks, and user-session code, with try/catch error handling.
- [Best practice and advices when building components](https://developers.fliplet.com/Best-practises.html): Gotchas for Fliplet components: instance data, multi-drop handling, Handlebars escaping for Vue/Angular curly braces, and required dependencies.
- [Changelog](https://developers.fliplet.com/Changelog.html): Changelog notes giving a summary of recent significant changes to the documentation.
- [Fliplet coding and documentation standards](https://developers.fliplet.com/coding-standards.html): Coding and documentation standards used across Fliplet APIs, components, and examples, so both humans and AI tools produce consistent Fliplet code.
- [Sending events between components](https://developers.fliplet.com/Event-emitter.html): Components interfaces can send events to Fliplet Studio using a event emitter bus provided with the `fliplet-core` dependency.
- [Fliplet app execution flow](https://developers.fliplet.com/Execution-flow.html): The rendering and hook lifecycle Fliplet apps go through before a screen is shown to the user, and where to safely run custom code within it.
- [Introduction to the Fliplet developer platform](https://developers.fliplet.com/Introduction.html): Overview of the Fliplet developer stack (JavaScript, SASS, Handlebars) and the kinds of apps, components, themes, and menus you can build on it.
- [JavaScript coding standards for Fliplet apps](https://developers.fliplet.com/javascript-coding-standards.html): Recommended ES6+ patterns for new Fliplet code and ES5 patterns for legacy apps, covering promises, async/await, and API integration.
- [fliplet-docs-mcp](https://developers.fliplet.com/mcp-worker/README.html): Cloudflare Worker exposing an MCP server at developers.fliplet.com/mcp with search_fliplet_docs and fetch_fliplet_doc tools backed by llms.txt.
- [Native framework changelog](https://developers.fliplet.com/Native-framework-changelog.html): Release notes for the Fliplet iOS and Android native frameworks — rebuild your app against a newer version to unlock new features.
- [Fliplet open source resources](https://developers.fliplet.com/open-source.html): Where to find Fliplet's open-source code, pre-built app solutions, screen templates, community code examples, and developer documentation.
- [Fliplet CLI quickstart](https://developers.fliplet.com/Quickstart.html): Install Node.js and the Fliplet CLI so you can develop and test components, themes, and menus on your machine.
- [Upcoming and recently launched features](https://developers.fliplet.com/Upcoming.html): Tracker of Fliplet features recently shipped or in beta, linking to their developer documentation.
- [Fliplet VS Code extension](https://developers.fliplet.com/VS-Code-Extension-Setup-Usage.html): Install, authenticate, and use the Fliplet VS Code extension to develop Fliplet apps directly from your editor.

## Full site index

If you need the complete list across every cluster, fetch [https://developers.fliplet.com/.well-known/llms.txt](https://developers.fliplet.com/.well-known/llms.txt). Each entry is a one-line summary; replace `.html` with `.md` on any doc URL to fetch the raw Markdown.

## MCP server

For tool-driven discovery, point an MCP-aware client at [https://developers.fliplet.com/mcp](https://developers.fliplet.com/mcp). The server exposes `search_fliplet_docs` and `fetch_fliplet_doc`.
