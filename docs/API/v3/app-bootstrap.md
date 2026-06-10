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

<p class="warning">Skip any of these constraints and the app fails at boot, works in dev but breaks in production, or is rejected by the boot-HTML lint.</p>

## 1. Fetch dependencies with `Fliplet.require.lazy`

Any registered Fliplet dependency (Vue, React, Vue Router, etc.) **must** be loaded with `Fliplet.require.lazy(name)`. Never use `<script>` tags, `import`, or raw CDN URLs. These bypass the Fliplet asset pipeline and break versioning, caching, and dependency resolution.

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

<p class="warning">The boot-HTML lint rejects layouts whose viewport meta is missing or allows user scaling (rule <code>viewport-not-locked</code>).</p>

## What's next: routing

V3 routing is driven by the manifest at `app.settings.v3`, accessed via `Fliplet.Router`. It's platform-conditional: History API on web, hash on native (Cordova `file://` blocks `pushState` path changes) — branch on `Fliplet.Router.isNative()`. For the full contract, per-framework examples, and the anti-patterns that break V3 apps, see [V3 routing](routing).

## Related

- [V3 routing](routing). History API contract, route manifest, and the forbidden-pattern reference.
- [Fliplet Router JS API](../fliplet-router). Method reference for `Fliplet.Router` (`getBasePath`, `getRouteManifest`, `resolveRoute`).
- [V3 app settings convention](app-settings). Where `window.ENV.appSettings` comes from and the public/private key convention.
- [Media JS APIs](../fliplet-media). Full reference for `Fliplet.Media.getContents` and related media calls.
