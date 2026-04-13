# V3 App Bootstrap Constraints

A V3 app is a single HTML page passed to `update_screen_code`. The page can use any framework (Vue, React, Svelte, vanilla JS, etc.), but it **must** satisfy three constraints so the Fliplet runtime, dependency loader, and media authentication work correctly.

---

## 1. Fetch dependencies with `Fliplet.require.lazy`

Any registered Fliplet dependency (Vue, React, Vue Router, etc.) **must** be loaded with `Fliplet.require.lazy(name)`. Never use `<script>` tags, `import`, or raw CDN URLs — those bypass the Fliplet asset pipeline and break versioning, caching, and dependency resolution.

```js
Fliplet.require.lazy('vue').then(function() {
  // the 'vue' global is now available
});
```

Chain multiple `.then()` calls to load several dependencies in sequence.

## 2. Fetch source files with `Fliplet.Media.getContents`

Source files for the app (component files, templates, JSON config, etc.) live in the app's media library. Their contents **must** be fetched at runtime with `Fliplet.Media.getContents(fileId)`. Never `fetch()` a media URL directly — media URLs require authentication and will fail without it.

```js
Fliplet.Media.getContents(fileId).then(function(content) {
  // content is the raw file source as a string
});
```

The `fileId` is the **numeric `id`** returned by `upload_media_file` — never a URL.

## 3. Init sequence

The boot script must end with this exact two-line sequence:

```js
Fliplet.require(window.ENV.dependencies.js);
Fliplet().then(function() {
  // runtime is ready — mount your framework / start your app here
});
```

`Fliplet.require(window.ENV.dependencies.js)` registers every dependency declared in the app's manifest. `Fliplet().then(...)` waits for the Fliplet runtime to be fully ready before the app starts. Skipping or reordering either line breaks the boot.

## 4. Routing

V3 uses History API routing driven by the manifest at `app.settings.v3`, accessed via `Fliplet.Router`. Hash routing is forbidden on every platform.

For any multi-screen app, call `get_fliplet_docs('v3-routing')` **before** writing boot HTML — that doc is the canonical routing reference and mirrors the `update_screen_code` lint rules.

---

## When to fetch this doc

Call `get_fliplet_docs('v3-app-bootstrap')`:

- Before your **first** `update_screen_code` of any new build.
- Any time you're unsure how the boot HTML should fetch dependencies, load source files, or initialize the runtime.

The result is cached per session — repeat calls in the same conversation are free.
