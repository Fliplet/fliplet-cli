---
description: Picking a frontend framework for a V3 app. Lists the runtime constraints every framework must cope with (no build step, no bundler, no transpile) and compares Vue, React, Alpine, and vanilla JS against them.
---

# V3 framework guide — picking and setup

V3 apps run **without a build step**. Source files are uploaded to the media library and fetched at runtime via `Fliplet.Media.getContents`. Dependencies are resolved through `Fliplet.require.lazy`, not `import`. This changes which framework features work and which quietly fail.

Fetch the per-framework doc (`v3-framework-vue`, `v3-framework-react`, etc.) before scaffolding. This doc is for picking.

## The runtime constraints (apply to every framework)

| Constraint | What it means |
|---|---|
| No transpile | JSX, TSX, and any other syntax the browser can't parse natively will throw `SyntaxError: Unexpected token`. |
| No bundler | Bare ESM imports (`import x from 'vue'`) fail. Dependencies must come from `Fliplet.require.lazy(name)` or a full CDN URL added via `add_dependencies`. |
| No CSS preprocessing | No CSS Modules, no Sass, no PostCSS. Styles are plain CSS inlined in `<style>` or component HTML. |
| Routing is platform-conditional | History API on web, hash on native (Cordova `file://` blocks `pushState` path changes). Branch the history backend on `Fliplet.Router.isNative()`. The boot-HTML lint flags unguarded hash patterns (`createWebHashHistory`, `location.hash`, `hashchange`, `href="#/..."`) AND unguarded `createWebHistory`. React is the exception — `createHashRouter` on every platform, no branch. See [V3 routing](../routing.md). |
| Preloaded libraries | jQuery, Bootstrap CSS, Lodash, Moment, Animate.css, and fliplet-media are always available — never add them as dependencies. |

## Framework comparison

| Framework | Needs compile? | Router support | Good fit for |
|---|---|---|---|
| Vanilla JS | No | History API on web, hash on native (manual branch) | Single-screen apps, very simple flows |
| Vue 3 | No (runtime-compiler build) | Vue Router 4 (`createWebHistory` / `createWebHashHistory`, branched on `isNative()`) | Multi-screen apps with reactive state |
| React | **Yes, for JSX** | React Router 6 (`createHashRouter`, no branch) | Users who asked for React; otherwise prefer Vue |
| Alpine.js | No | Pair with platform-conditional History/hash routing | Form-heavy, attribute-driven UIs |

## Picking rules

Default order when the user hasn't expressed a preference:

1. **One screen, no forms**: vanilla JS
2. **Multi-screen, reactive state**: Vue 3 — best balance of no-build ergonomics and features
3. **Form-heavy single-page CRUD**: Alpine.js
4. **User explicitly asked for React**: React, via `htm` or `React.createElement` (see `v3-framework-react`)

## What to fetch next

After picking, call `get_fliplet_docs('v3-framework-<name>')` for the specific constraints. Every per-framework doc covers: loading the framework, features that need a build step (and what to do instead), wiring to `Fliplet.Router`, binding `Fliplet.Media.authenticate`, common errors, and DO/DON'T.

## Related

- [V3 app bootstrap](../app-bootstrap.md) — the three boot constraints every app must satisfy regardless of framework
- [V3 routing](../routing.md) — History API contract, route manifest, forbidden-pattern reference
- [V3 authentication patterns](../auth.md) — session, login, protected routes
