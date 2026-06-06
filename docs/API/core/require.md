---
title: "`Fliplet.require`"
description: "Load scripts and stylesheets on demand, and resolve lazy dependencies registered in the app bundle."
type: api-reference
tags: [js-api, framework, runtime, dependencies, lazy-load]
v3_relevant: true
deprecated: false
category: framework
capabilities: [dynamic import, lazy load, script loader, stylesheet loader, dependency resolution, module loader, cdn]
---
# `Fliplet.require`

`Fliplet.require` and its `Fliplet.require.lazy` family give you two ways to load scripts and stylesheets at runtime: through the bootstrap gate (blocking app startup until assets are ready) or on demand after the app is already running.

## Two-tier model

Fliplet's runtime has two distinct loading tiers:

- **Bootstrap gate** (`Fliplet.require`) — assets declared here must finish loading before the `plugins-ready` promise resolves. The app does not start rendering until they are done. Use this for foundational libraries your entire app depends on.
- **On-demand** (`Fliplet.require.lazy` and family) — assets load without touching the bootstrap gate. Each call returns its own Promise and the rest of the app continues running. Use this for optional features, heavy third-party libraries, or anything you want to defer until a user action.

## `Fliplet.require`

Loads one or more scripts after `plugins-ready` and, when they have finished loading, resolves the internal bootstrap gate so the app can proceed.

**Signature**

```js
Fliplet.require(scripts)
```

| Parameter | Type | Description |
|---|---|---|
| `scripts` | `String \| Array<String>` | A single script URL or an array of script URLs to load in series. |

The function does not return a Promise. It fires-and-forgets — the runtime resolves the bootstrap gate internally once all scripts have loaded.

**Example**

```js
// Load a single script before the app starts
Fliplet.require('https://cdn.example.com/chart.min.js');

// Load multiple scripts in series
Fliplet.require([
  'https://cdn.example.com/moment.min.js',
  'https://cdn.example.com/moment-timezone.min.js'
]);
```

## `Fliplet.require.lazy`

Loads a single dependency on demand without blocking the bootstrap gate. Returns a Promise that resolves when the asset is ready. Input can be a registered name, a raw URL, or a media file ID.

**Signature**

```js
Fliplet.require.lazy(input, options)
```

| Parameter | Type | Description |
|---|---|---|
| `input` | `String \| Number` | Registered dependency name, a URL (http/https/protocol-relative), or a numeric media file ID. |
| `options` | `Object` | Optional. Supported key: `responseType` (used when `input` is a media file ID). |

### By registered name

Dependencies registered in the app bundle under `Fliplet.Env.get('dependencies').lazy` can be loaded by name. The runtime resolves the correct URL for the current environment (web or native) automatically.

If the named dependency has transitive deps (`dep.chain` is set), calling `.lazy()` rejects with an error instructing you to use `.chain()` instead.

```js
Fliplet.require.lazy('signature-pad').then(function() {
  // SignaturePad is now available on window
  var pad = new SignaturePad(document.getElementById('canvas'));
});
```

### By URL

Pass any `http://`, `https://`, or protocol-relative (`//`) URL. The runtime infers the asset type from the file extension — `.css` triggers `loadStylesheet`, everything else triggers `loadScript`. Duplicate URLs are deduped: a second call with the same URL resolves immediately without a second network request.

```js
// Load a JavaScript library
Fliplet.require.lazy('https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js').then(function() {
  var ctx = document.getElementById('myChart').getContext('2d');
  new Chart(ctx, { type: 'bar', data: { labels: ['A', 'B'], datasets: [{ data: [1, 2] }] } });
});

// Load a stylesheet
Fliplet.require.lazy('https://cdn.example.com/theme.css').then(function() {
  console.log('Stylesheet applied');
});
```

### By media file ID

Pass a numeric Fliplet media file ID. The runtime fetches the file's metadata to determine its content type, then loads it as a script, stylesheet, or raw content accordingly. Requires `fliplet-media` to be loaded.

Pass `{ responseType: 'json' }` (or any other `responseType`) to skip content-type detection and return the raw file contents directly via `Fliplet.Media.getContents`.

```js
// Load by media file ID — content type detected automatically
Fliplet.require.lazy(123456).then(function() {
  console.log('Media file loaded');
});

// Fetch a JSON media file's contents directly
Fliplet.require.lazy(123456, { responseType: 'json' }).then(function(data) {
  console.log('JSON data:', data);
});
```

## `Fliplet.require.lazy.chain`

Loads a registered dependency that has transitive dependencies (`dep.chain`), walking the chain in serial order. This is the required path for any named dep that `.lazy()` rejects on — the error message from `.lazy()` tells you to call `.chain()`.

The result per name is memoized in `chainPromises{}`, so repeated calls within the same session resolve from the cache without re-loading.

For named deps that have no chain, `.chain()` falls back to `Fliplet.require.lazy(name)` automatically.

**Signature**

```js
Fliplet.require.lazy.chain(name)
```

| Parameter | Type | Description |
|---|---|---|
| `name` | `String` | Registered lazy dependency name. |

Returns a `Promise` that resolves when the named dependency and all its transitive deps have loaded.

**Example**

```js
// 'select2' is registered with a dep.chain (jQuery must load first)
Fliplet.require.lazy.chain('select2').then(function() {
  $('#my-select').select2();
});
```

## Inspect the registry

### `Fliplet.require.lazy.list()`

Returns an array of all registered lazy dependency names from `Fliplet.Env.get('dependencies').lazy`.

```js
var names = Fliplet.require.lazy.list();
console.log(names); // e.g. ['signature-pad', 'select2', 'chart-js']
```

### `Fliplet.require.lazy.get(name)`

Returns the resolved URL for a named dependency without loading it. On native apps, returns `dep.path`; on web, returns `dep.url`. Returns `null` if the name is not registered.

```js
var url = Fliplet.require.lazy.get('signature-pad');
console.log(url); // 'https://cdn.fliplet.com/libs/signature-pad/1.5.3/signature_pad.min.js'
```

## Error handling

`Fliplet.require.lazy` (and `.chain`) rejects under these conditions:

- **Not a string or number** — input type is invalid; message: `Fliplet.require.lazy() expects a string or number`.
- **Named dep with a chain** — the dep is registered with transitive deps; message instructs use of `.chain()`.
- **Named dep with no URL** — the dep record has neither `dep.path` (native) nor `dep.url` (web).
- **Unrecognized string that is not a URL** — input is not a registered name and not an `http://`, `https://`, or `//` URL; message lists all available registered names.
- **Unregistered name passed to `.chain()`** — name is not in the lazy deps map; message lists all available registered names.
- **Media file loaded without `fliplet-media`** — `Fliplet.Media` is not defined when a numeric ID is passed; message: `Fliplet.Media is not available. Ensure fliplet-media is loaded.`

## See also

- [`API/fliplet-runtime.md`](../fliplet-runtime) — the full runtime package that provides `Fliplet.require`
- [`API/core/environment.md`](environment) — `Fliplet.Env.get('dependencies')` where lazy dep metadata lives
