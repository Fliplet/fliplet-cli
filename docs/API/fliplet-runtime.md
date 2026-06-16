---
title: "fliplet-runtime"
description: "V3 SPA bootstrap that wires Fliplet.Env, Registry, Studio, Navigator, and Locale into the global Fliplet object and manages the page-ready lifecycle."
type: api-reference
tags: [js-api, framework, runtime, boot, lifecycle]
v3_relevant: true
deprecated: false
category: framework
capabilities: [bootstrap, spa, lifecycle, locale, i18n, dependency loading, ready promise, studio bridge]
---

# `fliplet-runtime`

`fliplet-runtime` is the foundational bootstrap script for every Fliplet SPA. It assigns the global `Fliplet` object, registers the core ambient namespaces (`Env`, `Registry`, `Studio`, `Navigator`), wires the page-ready Promise chain, and — on web — auto-initializes locale before signalling that the app is ready.

---

Dependency name: `fliplet-runtime`

## What this package does

When the browser loads `fliplet-runtime`, it runs immediately as a self-invoking function scoped to `window`. It creates the `Fliplet` callable shim, attaches the core ambient namespaces as IIFEs, configures three internal Promises (`pluginsReadyPromise`, `readyPromise`, and `requirePromise`) that gate the app's ready lifecycle, and registers `Fliplet.require` and `Fliplet.require.lazy` for dynamic dependency loading. On web (non-`interact`) platforms, the package automatically calls `Fliplet.initializeLocale()` once `Fliplet.require` signals that all eager dependencies have loaded, then resolves the ready Promise so app code can run. On native platforms, the same flow is triggered manually by calling `Fliplet.Navigator.ready()`.

---

## Boot sequence

The following steps happen in order each time `fliplet-runtime` loads. Line numbers refer to `runtime.js` v1.0.

1. **`window.Fliplet` callable shim assigned** (line 10–12). If `window.Fliplet` is not already defined, it is set to a function that returns `Fliplet.Navigator.onReady()`. Any argument passed to this function is ignored — the function always delegates to the ready Promise. See [The Fliplet(callback) callable shim](#the-flipletcallback-callable-shim) below.

2. **`Fliplet.Env` IIFE executes** (line 22–54). Registers `get`, `set`, and `is` methods that read and write `window.ENV`. `window.ENV` must already exist; the runtime does not create it.

3. **`Fliplet.Registry` IIFE executes** (line 59–74). Creates a private registry map with `set` and `get`. Calling `set` on an already-registered key prints a console warning and is a no-op.

4. **`Fliplet.Studio` IIFE executes** (line 102–175). Registers `emit`, `onEvent`, `onMessage`, and `getPreviewDevice`. These are the bridge to the Studio editor frame over `postMessage`.

5. **`Fliplet.Navigator` IIFE executes** (line 515–607). Creates three internal Promises:
   - `pluginsReadyPromise` — resolves when the device/DOM is ready.
   - `readyPromise` — resolves when the app is fully initialized (returned by `Fliplet.Navigator.onReady()`).
   - `requirePromise` — resolves when `Fliplet.require` has finished loading all eager dependencies.

6. **`pluginsReadyPromise` is wired to the platform event** (line 536–542):
   - **Native**: resolved on the Cordova `deviceready` document event.
   - **Web (DOM not yet complete)**: resolved on `DOMContentLoaded`.
   - **Web (DOM already complete)**: resolved synchronously (i.e., `resolvePluginsReady()` is called immediately).

7. **`Fliplet.require` is assigned** (line 623–635). Calling `Fliplet.require(scripts)` with a non-empty array waits for `pluginsReadyPromise`, then loads the scripts in series/parallel order and resolves `requirePromise`. Calling it with no arguments or an empty array resolves `requirePromise` immediately.

8. **`Fliplet.require.lazy` (and `.lazy.list`, `.lazy.get`, `.lazy.chain`) are assigned** (line 692–801). These are independent of `requirePromise`; each call returns its own Promise and does not affect the boot sequence.

9. **Web auto-ready path** (line 579–587): When `requirePromise` resolves AND `Fliplet.Env.get('platform') === 'web'` AND `Fliplet.Env.get('mode') !== 'interact'`, the runtime calls `Fliplet.initializeLocale()` and then resolves `readyPromise` via `systemReady()`. The `interact` mode check suppresses this auto-flow inside the Studio editor canvas — in interact mode the ready Promise never resolves automatically.

10. **Native manual-ready path**: On native, `requirePromise` resolving does not trigger `systemReady`. Instead, `Fliplet.initializeLocale()` is **not called automatically**; the app (or its widget orchestrator) must call `Fliplet.Navigator.ready()` explicitly. `Fliplet.Navigator.ready()` calls `requirePromise.then(systemReady)` (line 604).

---

## Ambient namespaces

The following namespaces are registered by `fliplet-runtime` and are available globally as soon as the script loads. Each links to its dedicated reference doc.

- **`Fliplet.Env`** — read and write environment variables from `window.ENV`. See [`Fliplet.Env`](core/environment.md).
- **`Fliplet.Registry`** — a write-once, key/value store shared across all packages loaded in the same page. See [`Fliplet.Registry`](core/registry.md).
- **`Fliplet.Studio`** — `postMessage` bridge for communicating with the Studio editor frame. See [`Fliplet.Studio`](core/studio.md).
- **`Fliplet.Navigator`** — the ready-Promise API (`onReady`, `onPluginsReady`, `ready`). See [`Fliplet.Navigator`](core/navigator.md).
- **`Fliplet.Locale`** — assigned after `Fliplet.initializeLocale()` resolves; provides `translate`, `date`, `number`, and `addTranslation`. See [`Fliplet.Locale`](core/localization.md).
- **`Fliplet.require` / `Fliplet.require.lazy`** — eager and lazy dynamic dependency loading. See [`Fliplet.require`](core/require.md).

---

## The `Fliplet(callback)` callable shim

`fliplet-runtime` sets `window.Fliplet` to a plain function that, when called, returns `Fliplet.Navigator.onReady()`:

```js
// Lines 10–12 in runtime.js
w.Fliplet = w.Fliplet || function() {
  return Fliplet.Navigator.onReady();
};
```

**The shim ignores every argument you pass to it.** Calling `Fliplet(myFn)` does _not_ invoke `myFn` — it returns the ready Promise. The correct usage pattern is to chain `.then()`:

```js
// Correct: chain .then() to run code when the app is ready
Fliplet().then(function() {
  console.log('App is ready');
});

// Also correct: identical behaviour, no argument needed
Fliplet.Navigator.onReady().then(function() {
  console.log('App is ready');
});
```

If you want to run a named function:

```js
function onAppReady() {
  console.log('App is ready');
}

// Pass the function reference into .then(), not into Fliplet()
Fliplet().then(onAppReady);
```

---

## Top-level helpers

### `Fliplet.extend(obj, fn)`

Merges properties returned by `fn` onto `obj`. Both arguments are required; `fn` must return a plain object.

**Signature**

```js
Fliplet.extend(obj, fn)
```

- `obj` **Required** (Object) — the target object to extend.
- `fn` **Required** (Function) — a factory function that returns an object whose keys are merged onto `obj`.

Throws if either argument is the wrong type, or if `fn()` does not return an object.

**Example**

```js
// Extend Fliplet with a custom namespace
Fliplet.extend(Fliplet, function() {
  return {
    MyUtils: {
      greet: function(name) {
        return 'Hello, ' + name;
      }
    }
  };
});

console.log(Fliplet.MyUtils.greet('Alice')); // 'Hello, Alice'
```

---

### `Fliplet.parseNumber(input [, allowNaN])`

Converts a mixed-type input into a JavaScript number, handling strings and locale-agnostic numeric coercion. This function is assigned to `Fliplet.parseNumber` inside `Fliplet.initializeLocale()` (line 366), so **it is only available after `Fliplet.ready()` has resolved** (i.e., after locale initialization).

**Signature**

```js
Fliplet.parseNumber(input)
Fliplet.parseNumber(input, allowNaN)
```

- `input` **Required** (any) — the value to convert.
- `allowNaN` **Optional** (Boolean, default `false`) — when `true`, `undefined`, `null`, and empty strings return `NaN` instead of `0` or `null`.

**Return values (default mode, `allowNaN = false`)**

| Input | Return |
|---|---|
| `undefined` or `0` | `0` |
| String with no digits (e.g. `'abc'`) | `null` |
| Numeric string (e.g. `'3.14'`) | `3.14` |
| Any value `Number()` can parse | the parsed number |
| Any value `Number()` returns `NaN` for | `null` |

**Return values (`allowNaN = true`)**

| Input | Return |
|---|---|
| `undefined`, `null`, or `''` | `NaN` |
| Everything else | `Number(input)` (may be `NaN`) |

**Example**

```js
// Only call after Fliplet.ready(), because parseNumber is assigned during locale init
Fliplet().then(function() {
  console.log(Fliplet.parseNumber('42'));        // 42
  console.log(Fliplet.parseNumber(''));          // null
  console.log(Fliplet.parseNumber(undefined));   // 0
  console.log(Fliplet.parseNumber('', true));    // NaN
});
```

---

### `Fliplet.initializeLocale()`

Bootstraps `i18next` with the app's locale configuration from `Fliplet.Env`, assigns `window.T` (translate), `window.TD` (localize date), and `window.TN` (localize number), and populates `Fliplet.Locale`. Returns a Promise that resolves when i18next is initialized.

On web (non-`interact`) apps, the runtime calls this automatically as part of the boot sequence (step 9 above). You only need to call it directly in exceptional cases such as re-initializing locale after a language change.

**Signature**

```js
Fliplet.initializeLocale()
// Returns: Promise
```

**What it assigns on resolution**

| Global | Type | Description |
|---|---|---|
| `window.T` | Function | `i18next.t(key, options)` — translate a key |
| `window.TD` | Function | `localizeDate(value, options)` — format a date for the current locale |
| `window.TN` | Function | `localizeNumber(input, options)` — format a number for the current locale |
| `Fliplet.Locale` | Object | `{ addTranslation, translate, date, number, getDefault, plugins }` |
| `Fliplet.parseNumber` | Function | See [`Fliplet.parseNumber`](#flipletparsenumberinput--allownan) above |

**Example**

```js
// Normally called automatically on web. Example of manual use:
Fliplet.initializeLocale().then(function() {
  console.log(window.T('app.greeting')); // translated string
  console.log(Fliplet.Locale.getDefault()); // e.g. 'en'
});
```

---

## Side effects on load

`fliplet-runtime` makes the following mutations to the global environment when the script is parsed and executed. These occur before any app code runs.

- **`window.Fliplet`** (line 10) — assigned to the callable shim function if not already defined.
- **`window.ENV`** — read by `Fliplet.Env.get` and written by `Fliplet.Env.set`. The runtime reads from it immediately (e.g., to determine `platform` and `mode`); it does not create `window.ENV`.
- **`document` event listener: `'deviceready'`** (line 537) — added on native platform to resolve `pluginsReadyPromise`.
- **`document` event listener: `'DOMContentLoaded'`** (line 539) — added on web when the DOM is not yet complete, to resolve `pluginsReadyPromise`.
- **`window.T` / `window.TD` / `window.TN`** (line 470–472) — assigned _after_ `Fliplet.initializeLocale()` resolves (deferred; not immediate).
- **`Fliplet.Locale`** (line 474–487) — assigned _after_ `Fliplet.initializeLocale()` resolves (deferred).
- **`Fliplet.parseNumber`** (line 366) — assigned _after_ `Fliplet.initializeLocale()` resolves (deferred).
- **`<script>` tag injected into `<head>`** (line 929) — each call to `loadScript` (internally, via `Fliplet.require` or `Fliplet.require.lazy`) appends a `<script>` element to `document.head`.
- **`<link rel="stylesheet">` tag injected into `<head>`** (line 967) — each call to `loadStylesheet` (internally, via `Fliplet.require` or `Fliplet.require.lazy`) appends a `<link>` element to `document.head`.

---

## See also

- [`Fliplet.Env`](core/environment.md) — environment variable API
- [`Fliplet.Registry`](core/registry.md) — write-once global registry
- [`Fliplet.Studio`](core/studio.md) — Studio editor postMessage bridge
- [`Fliplet.Navigator`](core/navigator.md) — device and page-ready lifecycle
- [`Fliplet.Locale`](core/localization.md) — i18n, date, and number formatting
- [`Fliplet.require`](core/require.md) — eager and lazy dependency loading

---

[Back to API documentation](../API-Documentation)
{: .buttons}
