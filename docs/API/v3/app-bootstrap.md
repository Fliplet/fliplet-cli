---
description: The three constraints every V3 boot HTML must satisfy. Covers Fliplet.require.lazy + lazy.chain for dependencies, Fliplet.Media.getContentsAsModule + evalModule for source files, and the Fliplet().then(...) init sequence. Framework-agnostic.
---

# V3 app bootstrap constraints

A V3 app is a single HTML boot page that hosts the whole SPA. The page can use any framework (Vue, React, Svelte, vanilla JS, etc.), but it **must** satisfy three constraints so the Fliplet runtime, dependency loader, and media authentication work correctly.

Each constraint maps to a concrete platform guarantee: (1) dependencies resolve through the Fliplet asset pipeline so versioning, caching, and per-environment injection work; (2) source files are fetched with signed media requests so private apps don't leak their screens; (3) the runtime registers its globals (`Fliplet.ENV`, `Fliplet.Router`, `Fliplet.Session`, etc.) before your framework mounts.

<p class="warning">Skip any of these constraints and the app either fails at boot, or works in dev and breaks in production.</p>

## 1. Fetch dependencies with `Fliplet.require.lazy`

A dependency has two independent dimensions: **what** it is (registered Fliplet package vs external CDN library) and **how** it loads (eager at boot vs lazy on demand). The `add_dependencies` step on the page sets both. The boot HTML calls one of two runtime helpers depending on the entry shape:

| | **Eager (loaded at boot)** | **Lazy (loaded on demand)** |
|---|---|---|
| **Registered Fliplet package** (declared as plain string `"fliplet-datasources"`, or `{ name, latest: "", lazy: true }`) | Symbols ready when `Fliplet().then()` resolves. No runtime call needed. | `await Fliplet.require.lazy.chain('fliplet-datasources')`. The engine resolves the full transitive chain (e.g. fliplet-core, fliplet-utils, leaf) in correct serial/parallel order. **Calling plain `lazy()` on a registered package throws a directive error** to prevent silent transitive failures. |
| **External CDN library** (declared as `{ name, latest: "https://...", lazy: false }` or `lazy: true`) | Boot-time `<script>` tag injection. Rare for CDN libs. | `await Fliplet.require.lazy('vue')`. Single-package, no chain. |

```js
// Single CDN library (e.g. vue declared as { name: 'vue', latest: 'https://unpkg.com/vue@3', lazy: true })
await Fliplet.require.lazy('vue');

// Registered Fliplet package with transitives (e.g. fliplet-barcode declared as { name: 'fliplet-barcode', latest: '', lazy: true })
await Fliplet.require.lazy.chain('fliplet-barcode');

// Loading both in parallel
await Promise.all([
  Fliplet.require.lazy('vue'),
  Fliplet.require.lazy.chain('fliplet-barcode')
]);
```

A few packages are ambient at boot — `fliplet-core`, `fliplet-router`, `fliplet-utils`, `fliplet-runtime` — and don't need to be declared or loaded. Everything else (e.g. `fliplet-datasources`, `fliplet-session`, `fliplet-media`, `fliplet-barcode`) must be declared via `add_dependencies` before the boot HTML can call `lazy.chain` (or read the global, if eager).

Never use `<script>` tags or raw CDN URLs in boot HTML — they bypass the Fliplet asset pipeline and break versioning, caching, and per-environment injection.

## 2. Fetch source files

Source files for the app (component files, templates, JSON config, etc.) live in the app's media library. Their contents **must** be fetched at runtime through Fliplet's authenticated media APIs. Never call `fetch()` on a media URL directly — media URLs require signed access and will fail without it.

There are two helpers, and which one you use depends on whether the file is a **JS module** (something with `export default …`) or **raw text** (a template fragment, JSON, CSS string).

### 2a. JS modules — `Fliplet.Media.getContentsAsModule(fileId)`

For any source file whose contents are a JS module (the common case for V3 — Vue components, React components, route definitions, anything written as `export default { … }`), use `getContentsAsModule`. It fetches the file, evaluates it in a new module scope, and returns whatever the file exported as its default.

```js
const App = await Fliplet.Media.getContentsAsModule(123);
// App is the exported value — typically a component definition object
```

This pairs `getContents` with `evalModule` (see below). It also sets `//# sourceURL=fliplet-media://file/123` on the evaluated source, so DevTools shows the file by id when stepping through.

`getContentsAsModule` is the **only supported way** to load a JS module from the media library. Do not hand-roll `new Function(content)`, `eval(content)`, or `<script>` tag injection of `getContents` results — those patterns:
- have no `sourceURL`, so DevTools shows `eval at <anonymous>` instead of the file id;
- mishandle ESM `import` statements (which `evalModule` rejects with a clear error and a hint pointing to `Fliplet.require.lazy`);
- silently swallow trailing side-effects after the rewrite, leading to mounted-but-broken components.

### 2b. Raw text — `Fliplet.Media.getContents(fileId)`

For non-JS files (HTML templates, JSON config, CSV data, CSS strings), use `getContents` and consume the raw string yourself.

```js
const html = await Fliplet.Media.getContents(456); // returns the raw text
document.getElementById('panel').innerHTML = html;
```

### 2c. Underlying primitive — `Fliplet.Media.evalModule(source, options)`

If you already have the raw source as a string and need to turn it into a module value (rare — usually `getContentsAsModule` is what you want), call `evalModule` directly.

```js
const exported = Fliplet.Media.evalModule(rawSource, { sourceURL: 'my-debug-name.js' });
```

`evalModule` rejects ESM `import` statements, `.vue` SFC content, and named exports with friendly error messages. The original error is preserved on `err.cause` for debugging.

### File ids

The `fileId` argument to all three helpers is the **numeric `id`** of the file in the app's media library (returned by media upload APIs). It is never a URL.

## 3. Init sequence

The boot script must end with this call:

```js
Fliplet().then(function() {
  // runtime is ready. Mount your framework or start your app here.
});
```

`Fliplet().then(...)` waits for the Fliplet runtime to be fully ready before the app starts.

<p class="warning">Skipping this breaks the boot.</p>

## What's next: routing

V3 uses History API routing driven by the manifest at `app.settings.v3`, accessed via `Fliplet.Router`. Hash routing is forbidden on every platform. For the full contract, per-framework examples, and the anti-patterns that break V3 apps, see [V3 routing](routing.md).

## Related

- [V3 routing](routing.md). History API contract, route manifest, and the forbidden-pattern reference.
- [Fliplet Router JS API](fliplet-router.md). Method reference for `Fliplet.Router` (`getBasePath`, `getRouteManifest`, `checkRouteAccess`).
- [V3 app settings convention](app-settings.md). Where `window.ENV.appSettings` comes from and the public/private key convention.
- [Media JS APIs](../fliplet-media.md). Full reference for `Fliplet.Media.getContents` and related media calls.
