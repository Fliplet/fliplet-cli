---
title: "fliplet-analytics-spa"
description: "Auto page-view tracker for V3 SPA apps. Hooks the History API so every client-side route change emits a pageView — no app code required."
type: reference
tags: [js-api, v3, analytics, spa, routing, page-view]
v3_relevant: true
deprecated: false
category: analytics
capabilities: [page view tracking, spa route tracking, history api, automatic analytics, route name resolution]
---

# `fliplet-analytics-spa`

`fliplet-analytics-spa` is a self-installing runtime that gives every V3 SPA app automatic page-view tracking. It monkey-patches the browser History API and listens for navigation events so that every client-side route change produces a `Fliplet.App.Analytics.pageView()` call enriched with the matched route pattern, route name, and extracted params. No application code is required.

---

## What you get for free

Installing this package on a V3 app monkey-patches `history.pushState` and `history.replaceState`, and attaches listeners for `popstate` and `hashchange`. Every distinct client-side navigation — from any routing framework, a manual `history.pushState` call, or a browser back/forward gesture — fires `Fliplet.App.Analytics.pageView()` with the resolved route context. The initial page view fires when `Fliplet.ready()` resolves, so the core analytics queue is already wired up before the first event is sent. Consecutive navigations to the same URL are de-duplicated, so a router that calls both `pushState` and `replaceState` on the same transition only produces one event.

---

## Boot sequence and install guard

The IIFE runs synchronously at script load time and completes in microseconds. Its first action is to set `window.__FLIPLET_ANALYTICS_SPA = true`. If that flag is already set — because the script loaded twice — it exits immediately, preventing duplicate patching.

After setting the guard, the script checks that `window.Fliplet`, `Fliplet.Env`, `Fliplet.App`, and `Fliplet.App.Analytics` are all present. If any is missing, it exits silently without patching anything.

Next it reads the route manifest:

```js
var manifest = (Fliplet.Env.get('appSettings') || {}).v3 || {};
var routes = Array.isArray(manifest.routes) ? manifest.routes : [];
```

If `routes` is empty or missing, the script exits without patching — there is nothing to match against, so History patching would produce low-quality analytics.

Once all guards pass, the History API is patched and the initial page view is queued:

```js
if (typeof Fliplet.ready === 'function') {
  Fliplet.ready().then(firePageView);
} else {
  setTimeout(firePageView, 0);
}
```

The `setTimeout` fallback ensures the initial `firePageView` is always deferred at least one tick so `window.location` is stable.

---

## How it intercepts route changes

`history.pushState` and `history.replaceState` are each replaced with a wrapper that calls the original method first — committing the navigation — and then schedules `firePageView` via `setTimeout(firePageView, 0)`. The one-tick deferral ensures `window.location.pathname`, `.search`, and `.hash` already reflect the new URL when the page-view payload is read.

`popstate` (browser back/forward) and `hashchange` (hash-only fragment changes) are covered by direct event listeners on `window`. Both call `firePageView` synchronously because the browser has already updated `window.location` by the time these events fire.

---

## Route resolution and the app manifest

Routes are loaded once at boot from `(Fliplet.Env.get('appSettings') || {}).v3.routes`. Each entry is a plain object with at minimum a `path` string, and optionally a `name` string:

```json
{ "path": "/orders/:id/edit", "name": "Edit order" }
```

Routes are sorted longest-pattern-first before any matching happens, so `/orders/:id/edit` is tested before `/orders/:id`. This ensures more-specific patterns win.

`matchPattern(pattern, actual)` splits both strings on `/` and requires equal segment counts. Literal segments must match exactly. Segments whose first character is `:` are named parameters — their corresponding actual-path segment is decoded via `decodeURIComponent` (falling back to the raw value if decoding throws) and stored in a params object keyed by the parameter name without the leading colon.

Before matching, the base path is stripped from `window.location.pathname` using `Fliplet.Env.get('basePath')`. This normalizes slug-hosted URLs (`/my-slug/login` → `/login`) and preview-iframe URLs so analytics always log the logical V3 route rather than the host-specific prefix.

If no route pattern matches the current path, the matched pattern field falls back to the path-only portion of the raw logical URL (no query string, no hash).

---

## Event payload

Each call to `Fliplet.App.Analytics.pageView()` receives:

| Field | Type | Value |
| --- | --- | --- |
| `_pageTitle` | string | `routeName` if the matched route has a `name`; otherwise the matched pattern; otherwise the raw path. |
| `_route` | string | The matched route pattern. Identical to `_pageTitle` when the route has no name. Raw path when no route matches. |
| `_routeRaw` | string | The full logical URL: base-path-stripped pathname + `window.location.search` + `window.location.hash`. |
| `_routeParams` | object | Named parameter values extracted from the matched pattern. Empty object when no route matches. |
| `_routeName` | string \| undefined | The `name` field from the matched manifest route entry. `undefined` when the route has no name or no route matches. |

The V3 analytics guide at [V3 app analytics and event tracking](v3/analytics) documents how `_pageTitle` and `_routeParams` appear in the analytics dashboards and explains what the core tracker adds automatically (session ID, platform, user email, page ID).

---

## Deduplication

`firePageView` begins by computing `rawPath`:

```js
var rawPath = stripBasePath(window.location.pathname)
  + window.location.search
  + window.location.hash;
```

This is compared to a module-level `lastPath` variable initialized to `null`. If `rawPath === lastPath`, the function returns immediately and no event is sent. Otherwise, `lastPath` is updated to the new value before calling `Fliplet.App.Analytics.pageView()`.

This means the first of any pair of identical consecutive navigations passes through, and all subsequent identical ones are suppressed. It is the behavior that prevents double-firing when a router calls both `pushState` and an internal `replaceState` (to normalize the URL) during the same transition.

---

## What this package does not expose

`fliplet-analytics-spa` has no public JavaScript surface. It provides:

- No constructor, class, or namespace on `window` or `Fliplet`
- No configuration object — the only input is the manifest routes array in `appSettings.v3.routes`
- No custom events for the app to subscribe to
- No methods to pause, resume, or flush tracking
- No way to override the payload fields per-navigation

The only lever available is the route manifest. Adding or updating routes in the V3 app manifest changes what pattern and name appear in the analytics payload for matching URLs.

Because page views are tracked automatically, **do not call `Fliplet.App.Analytics.pageView()` yourself** from V3 app code — it will double-count navigations and corrupt pattern-based aggregations in the analytics dashboards.

---

## See also

- [V3 app analytics and event tracking](v3/analytics) — covers what the auto page-view payload means in the dashboards, when to add `Fliplet.App.Analytics.event()` calls for custom events, and taxonomy rules
- [Core analytics API](core/analytics) — full reference for the `Fliplet.Analytics` namespace
- [Core app API](core/app) — documents `Fliplet.App.Analytics.event()` and the full `Fliplet.App.Analytics` surface
