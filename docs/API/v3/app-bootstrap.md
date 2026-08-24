---
title: "V3 app bootstrap constraints"
description: The four constraints every V3 boot HTML must satisfy. Covers Fliplet.require.lazy for dependencies, Fliplet.Media.getContents for source files, the Fliplet().then(...) init sequence, and the locked viewport meta. Framework-agnostic.
type: guide
tags: [js-api, v3, bootstrap]
v3_relevant: true
deprecated: false
---

# V3 app bootstrap constraints

A V3 app is a single HTML boot page that hosts the whole SPA. The page can use any framework (Vue, React, Svelte, vanilla JS, etc.), but it **must** satisfy four constraints so the Fliplet runtime, dependency loader, media authentication, and native shell work correctly.

Each constraint maps to a concrete platform guarantee:

1. Dependencies resolve through the Fliplet asset pipeline so versioning, caching, and per-environment injection work.
2. Source files are fetched with signed media requests so private apps don't leak their screens.
3. The runtime registers its globals (`Fliplet.ENV`, `Fliplet.Router`, `Fliplet.Session`, etc.) before your framework mounts.
4. The viewport is locked so native apps don't pinch-zoom or auto-zoom when users focus an input field.

<p class="warning">Skip any of these constraints and the app fails at boot, or works in dev but breaks in production. Constraints 1 and 2 are also enforced by the boot-HTML lint.</p>

## 1. Fetch dependencies with `Fliplet.require.lazy`

Any registered Fliplet dependency (Vue, React, Vue Router, etc.) **must** be loaded with `Fliplet.require.lazy(name)`. Never use `<script>` tags, `import`, or raw CDN URLs. These bypass the Fliplet asset pipeline and break versioning, caching, and dependency resolution.

Declaring the dependency on the page is a prerequisite, not an alternative: `Fliplet.require.lazy(name)` resolves only names present in `window.ENV.dependencies.lazy`, which the engine populates from the page's declared dependencies. A name that was never declared rejects at runtime (lint rule `undeclared-lazy-name`).

```js
Fliplet.require.lazy('vue').then(function() {
  // the 'vue' global is now available
});
```

Chain multiple `.then()` calls to load several dependencies in sequence.

## 2. Fetch source files with `Fliplet.Media.getContents`

Source files for the app (component files, templates, JSON config, etc.) live in the app's media library. Their contents **must** be fetched at runtime with `Fliplet.Media.getContents(fileId)`. Never call `fetch()` on a media URL directly. Media URLs require authentication and will fail without it.

```js
Fliplet.Media.getContents(fileId).then(function(content) {
  // content is the raw file source as a string
});
```

The `fileId` is the **numeric `id`** of the file in the app's media library (returned by media upload APIs). It is never a URL.

## 3. Init sequence

The boot script must end with this call:

```js
Fliplet().then(function() {
  // runtime is ready. Mount your framework or start your app here.
});
```

`Fliplet().then(...)` waits for the Fliplet runtime to be fully ready before the app starts.

<p class="warning">Skipping this breaks the boot.</p>

## 4. Lock the viewport

The document `<head>` **must** contain this exact viewport meta:

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

On native devices the app runs in a system webview that honors `user-scalable=no`. Without it, users can pinch-zoom the app and iOS automatically zooms the page when an input with font-size under 16px receives focus — the app feels like a website instead of an app. Most web browsers ignore `user-scalable=no` for accessibility (iOS Safari always; Android Chrome users can force-enable zoom), so web pinch-zoom is preserved; the same tag is correct on every platform. `viewport-fit=cover` lets the app draw edge-to-edge behind device notches (pair it with `env(safe-area-inset-*)` padding).

<p class="warning">A layout whose viewport meta is missing or allows user scaling does not satisfy this constraint — add the tag exactly as shown above.</p>

## Forbidden patterns

The Fliplet Studio AI builder lints every boot HTML it generates and reports the patterns below; hand-authored apps must avoid them too. Each violation carries a `ruleId` matching a row here.

Every rule carries a **severity**, which is the deploy contract rather than a hint about how bad the pattern is. A `block` rule is a guaranteed runtime break, so the AI builder refuses the save — the screen does not deploy until the violation is fixed. A `warn` rule deploys: the save succeeds and the violation comes back as a warning alongside it. Warnings are still wrong and should be fixed; they just don't hold up the deploy.

| `ruleId` | What's forbidden | What to do instead | Severity |
|---|---|---|---|
| `duplicate-fliplet-require` | A bare `Fliplet.require(...)` call in the boot HTML, typically over the page's `window.ENV.dependencies.js` list | Delete the call. The engine already injects the page's dependencies at render time, so calling it again loads every dependency twice and throws `SyntaxError: Identifier 'Utils' has already been declared`. To load one dependency on demand, use `Fliplet.require.lazy(name)` for CDN libraries or `Fliplet.require.lazy.chain(name)` for registered Fliplet packages. | `block` |
| `undeclared-lazy-name` | `Fliplet.require.lazy('name')` (or `.lazy.chain('name')`) where `name` is not a declared page dependency | Declare the dependency on the page first — the lazy registry is built from the page's declared dependencies, so an undeclared name rejects at runtime. In the AI builder that means calling `add_dependencies({ dependencies: [{ name: 'name', latest: '<cdn-url>', lazy: true }] })` before the boot HTML uses it, then loading it with `Fliplet.require.lazy('name')`. A registered Fliplet package is declared the same way but with `latest: ''`, and loads with `Fliplet.require.lazy.chain('name')` — declaring it by plain name instead makes it eager, so the name never reaches the lazy registry and `lazy.chain` rejects. | `block` |
| `get-contents-as-module-default-access` | Any `.default` access on an identifier assigned from `await Fliplet.Media.getContentsAsModule(...)`, whether it is called (`<id>.default(...)`) or just read | Drop the `.default`. The helper is CommonJS-shaped and resolves to the exported value directly, so `<id>.default` never resolves and the usual call throws `TypeError: <id>.default is not a function`. Call `<id>(...)`, or pass `<id>` straight to your framework's mount function. | `block` |
| `font-awesome-not-available` | `<i class="fa fa-…">` — Font Awesome is not available in the app runtime, so the icon renders as an invisible 0x0 element | Use a Lucide icon instead: `<i data-lucide="icon-name"></i>` plus a `lucide.createIcons()` call once the markup is in the DOM. | `warn` |

The routing rules (`hash-change-event`, `window-location-hash`, `create-web-hash-history`, `unguarded-web-history`, `react-browser-router`, `hash-router-react`, `hash-href`, `path-dispatcher`) are documented with the same columns in [Forbidden patterns](routing#forbidden-patterns) on the V3 routing page.

## What's next: routing

V3 routing is driven by the manifest at `app.settings.v3`, accessed via `Fliplet.Router`. It's platform-conditional: History API on web, hash on native (Cordova `file://` blocks `pushState` path changes) — branch on `Fliplet.Router.isNative()`. For the full contract, per-framework examples, and the anti-patterns that break V3 apps, see [V3 routing](routing).

## Related

- [V3 routing](routing). History API contract, route manifest, and the forbidden-pattern reference.
- [Fliplet Router JS API](../fliplet-router). Method reference for `Fliplet.Router` (`getBasePath`, `getRouteManifest`, `resolveRoute`).
- [V3 app settings convention](app-settings). Where `window.ENV.appSettings` comes from and the public/private key convention.
- [Media JS APIs](../fliplet-media). Full reference for `Fliplet.Media.getContents` and related media calls.
