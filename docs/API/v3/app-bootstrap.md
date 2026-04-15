---
description: The three constraints every V3 boot HTML must satisfy. Covers Fliplet.require.lazy for dependencies, Fliplet.Media.getContents for source files, and the Fliplet().then(...) init sequence. Framework-agnostic.
---

# V3 app bootstrap constraints

A V3 app is a single HTML boot page that hosts the whole SPA. The page can use any framework (Vue, React, Svelte, vanilla JS, etc.), but it **must** satisfy three constraints so the Fliplet runtime, dependency loader, and media authentication work correctly.

Each constraint maps to a concrete platform guarantee: (1) dependencies resolve through the Fliplet asset pipeline so versioning, caching, and per-environment injection work; (2) source files are fetched with signed media requests so private apps don't leak their screens; (3) the runtime registers its globals (`Fliplet.ENV`, `Fliplet.Router`, `Fliplet.Session`, etc.) before your framework mounts.

<p class="warning">Skip any of these constraints and the app either fails at boot, or works in dev and breaks in production.</p>

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

## What's next: routing

V3 uses History API routing driven by the manifest at `app.settings.v3`, accessed via `Fliplet.Router`. Hash routing is forbidden on every platform. For the full contract, per-framework examples, and the anti-patterns that break V3 apps, see [V3 routing](routing.md).

## Related

- [V3 routing](routing.md). History API contract, route manifest, and the forbidden-pattern reference.
- [Fliplet Router JS API](fliplet-router.md). Method reference for `Fliplet.Router` (`getBasePath`, `getRouteManifest`, `checkRouteAccess`).
- [V3 app settings convention](app-settings.md). Where `window.ENV.appSettings` comes from and the public/private key convention.
- [Media JS APIs](../fliplet-media.md). Full reference for `Fliplet.Media.getContents` and related media calls.
