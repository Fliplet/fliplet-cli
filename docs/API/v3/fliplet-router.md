---
description: Fliplet.Router JS API reference for V3 apps. Covers getBasePath, getRouteManifest, getRouteConfig, and checkRouteAccess including return shapes, reason codes, and rejection behavior.
---

# Fliplet Router JS API

`Fliplet.Router` is the client-side routing helper for V3 SPA apps. It reads the route manifest from `app.settings.v3`, normalizes the base path for the current hosting context (slug-hosted web, Studio preview iframe, native shell), and performs server-ACL-backed access checks for each route.

<p class="info"><code>Fliplet.Router</code> is available on V3 apps only and is auto-loaded at boot. It depends on <code>fliplet-core</code> (<code>Fliplet.Env</code>, <code>Fliplet.User</code>) and <code>fliplet-media</code> (<code>Fliplet.Media.getContents</code>).</p>

For the full routing contract, per-framework integration examples, and forbidden patterns, see [V3 routing](routing.md). This page is the API reference only.

## Contents

- [Methods](#methods)
  - [getBasePath()](#flipletroutergetbasepath)
  - [getRouteManifest()](#flipletroutergetroutemanifest)
  - [getRouteConfig(path)](#flipletroutergetrouteconfigpath)
  - [checkRouteAccess(pathOrRoute)](#flipletroutercheckrouteaccesspathorroute)
- [Reason codes](#reason-codes)
- [Manifest shape](#manifest-shape)
- [Related](#related)

## Methods

### `Fliplet.Router.getBasePath()`

Returns the base path used by the router's history mode, normalized with a trailing slash so string concatenation doesn't produce `//route`.

**Returns:** `String`

The value depends on the hosting context:

| Context | Example value |
|---|---|
| Root-hosted web app | `/` |
| Slug-hosted web app | `/my-slug/` |
| Studio preview iframe | `/v1/apps/42/pages/99/preview/` |
| Native shell | Computed by the shell at runtime |

```js
var base = Fliplet.Router.getBasePath();

// Pass to Vue Router 4:
var history = VueRouter.createWebHistory(base);

// Pass to React Router 6:
var router = ReactRouterDOM.createBrowserRouter(routes, { basename: base });
```

<p class="warning">Never hardcode <code>'/'</code>. Slug-hosted apps, preview iframes, and native shells all mount the SPA at a different base.</p>

### `Fliplet.Router.getRouteManifest()`

Returns the route manifest stored in `app.settings.v3`. Defaults are provided for every field so callers can use the return value without null checks.

**Returns:** `Object` with the following properties:

| Property | Type | Default | Description |
|---|---|---|---|
| `routes` | `Array<Object>` | `[]` | Route entries. See [Manifest shape](#manifest-shape). |
| `defaultRoute` | `String` | `'/'` | Path to redirect to from `/`. |
| `authRedirect` | `String` | `'/login'` | Path to redirect to when a route is denied. |

```js
var manifest = Fliplet.Router.getRouteManifest();

manifest.routes.forEach(function(r) {
  console.log(r.name, r.path, r.fileId, r.public);
});

console.log(manifest.defaultRoute); // '/home'
console.log(manifest.authRedirect); // '/login'
```

### `Fliplet.Router.getRouteConfig(path)`

Looks up a single route entry from the manifest by path. The lookup is path-based and normalizes leading slashes (`home` and `/home` match the same route).

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `path` | `String` | Route path, with or without a leading slash. |

**Returns:** `Object | undefined`. The matching route entry from `manifest.routes`, or `undefined` if no route matches.

```js
var route = Fliplet.Router.getRouteConfig('/home');

if (route) {
  console.log(route.fileId);   // 222
  console.log(route.public);   // true
} else {
  // Path isn't in the manifest
}
```

### `Fliplet.Router.checkRouteAccess(pathOrRoute)`

Checks whether the current user can access a route, and fetches the screen source if they can. The server's media ACL is the source of truth; this method either fast-fails when the outcome is known (no session, unknown route) or derives the decision from the server's 401/403 response.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `pathOrRoute` | `String \| Object` | A route path (string) or a route entry object from the manifest. |

**Returns:** `Promise` that:

- **Resolves** with an access decision (see shapes below).
- **Rejects** with the underlying error on transient or infra failures (network errors, 5xx responses) so callers can show an error UI instead of redirecting silently.

**Resolution shape on success:**

```js
{
  allowed: true,
  content: '<!-- raw screen HTML/JS source -->',
  route: { name: 'Home', path: '/home', fileId: 222, public: true }
}
```

**Resolution shape on denial:**

```js
{
  allowed: false,
  redirectTo: '/login',      // manifest.authRedirect
  reason: 'no-session',      // see Reason codes below
  status: 401                // only present when reason is 'media-denied'
}
```

<p class="warning">Don't call <code>Fliplet.Media.getContents(fileId)</code> yourself. <code>checkRouteAccess</code> already does this internally and returns the content in <code>result.content</code>. A second fetch duplicates the round trip, can race with the access check, and fails outright on private media where auth headers aren't applied.</p>

**Example:**

```js
Fliplet.Router.checkRouteAccess('/my-account').then(function(result) {
  if (!result.allowed) {
    // Redirect to the auth screen (or wherever the server says)
    navigate(result.redirectTo);
    return;
  }

  // Mount the screen using result.content
  mountScreen(result.content, result.route);
}, function(err) {
  // Transient failure (network, 5xx). Show an error UI rather than redirecting.
  showErrorScreen(err);
});
```

**Passing a route object instead of a path:**

If you already have a route entry from the manifest, you can pass it directly to skip the path lookup:

```js
var manifest = Fliplet.Router.getRouteManifest();
var route = manifest.routes[0];

Fliplet.Router.checkRouteAccess(route).then(function(result) {
  // ...
});
```

## Reason codes

When `checkRouteAccess` resolves with `allowed: false`, the `reason` property indicates why. Handle each case explicitly.

| `reason` | Triggered when | `redirectTo` | `status` |
|---|---|---|---|
| `unknown-route` | The path doesn't match any manifest entry, or the matched entry has no `fileId`. | `manifest.authRedirect` | Not set |
| `no-session` | The route is non-public and `Fliplet.User.getCachedSession()` returned no session. | `manifest.authRedirect` | Not set |
| `media-denied` | The server returned `401` or `403` when fetching the screen source. | `manifest.authRedirect` | `401` or `403` |

<p class="warning">The manifest's <code>public: true</code> flag is advisory. It just lets the client skip a known-401 round trip. Flipping <code>public: true</code> in the manifest without updating the media file's access rule grants no access; the server still returns 401 and <code>checkRouteAccess</code> resolves with <code>reason: 'media-denied'</code>.</p>

Transient errors (network failures, 5xx responses) do not resolve with a reason. They **reject** the Promise with the underlying error so you can distinguish "user can't access this" from "infrastructure is broken".

## Manifest shape

The manifest is stored at `app.settings.v3` and emitted to the runtime via `window.ENV.appSettings`. See [V3 app settings convention](app-settings.md) for how settings are stored and filtered.

```json
{
  "routes": [
    { "name": "Home",      "path": "/home",       "fileId": 222, "public": true },
    { "name": "Login",     "path": "/login",      "fileId": 444, "public": true },
    { "name": "MyAccount", "path": "/my-account", "fileId": 333 }
  ],
  "defaultRoute": "/home",
  "authRedirect": "/login"
}
```

Each route entry has the following properties:

| Property | Type | Required | Description |
|---|---|---|---|
| `name` | `String` | Yes | Display name for the route. Used in Studio UI and as a named route in framework routers. |
| `path` | `String` | Yes | URL path the route is mounted at. Must begin with `/`. |
| `fileId` | `Number` | Yes | Numeric `id` of the media file holding the screen source. `checkRouteAccess` fetches this via `Fliplet.Media.getContents`. |
| `public` | `Boolean` | No | If `true`, the client skips the session check before fetching media. Defaults to `false`. Advisory only; the server media ACL is still enforced. |

Update the manifest via the App Settings API (`PUT /v1/apps/:id` with `settings.v3`) or the Studio routing UI whenever you add or remove a user-visible route.

## Related

- [V3 routing](routing.md). Full routing contract, per-framework examples, forbidden patterns, and post-login redirect.
- [V3 app bootstrap constraints](app-bootstrap.md). Three constraints every V3 boot HTML must satisfy.
- [V3 app settings convention](app-settings.md). Where the route manifest is stored (`app.settings.v3`).
- [Media JS APIs](../fliplet-media.md). `Fliplet.Media.getContents` details.
