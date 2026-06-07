---
title: "V3 routing"
description: Canonical routing patterns for V3 SPA apps. Covers base path, route manifest, access guard, per-framework examples, and the full list of forbidden patterns that break V3 apps.
type: guide
tags: [js-api, v3, routing]
v3_relevant: true
deprecated: false
---

# V3 routing

This is the canonical routing reference for V3 apps. It covers the `Fliplet.Router` contract, the forbidden patterns that break V3 apps on one or more hosting contexts, per-framework examples (Vue Router 4, Vue Router 3, React Router, Svelte, vanilla JS), and the post-login redirect pattern.

Routing in V3 is non-obvious because the defaults in most frameworks are wrong for the platform. V3 apps run in three different hosting contexts (slug-hosted web, Studio preview iframe, native shell), each with a different base path. Read this doc before writing boot HTML for any multi-screen V3 app.

## Contents

- [The contract](#the-contract)
- [Forbidden patterns](#forbidden-patterns)
- [Framework examples](#framework-examples)
- [Post-login redirect](#post-login-redirect)
- [Common pitfalls](#common-pitfalls)
- [Related](#related)

## The contract

V3 routing is **platform-conditional**: the **History API on web** (slug-hosted apps and the Studio preview iframe) and **hash routing on native** (Cordova `file://` shells). `Fliplet.Router` is the single source of truth for the decision — `Fliplet.Router.isNative()` returns whether the app is running in a native shell, and `Fliplet.Router.getHistoryMode()` returns `'hash'` on native, `'history'` on web.

On web, hash routing is wrong: every hosting context mounts the SPA at a different base path, and hashes hide that base from the server, break deep-link sharing, and make post-login redirects unreliable. On native, path-based history is *impossible*: WebKit blocks `history.pushState()` / `replaceState()` from changing the path of a `file:` URL — only the query and fragment may change — so the first path navigation throws `SecurityError: … Only differences in query and fragment are allowed for file: URLs` and the screen goes blank. Native apps must route through the hash.

Build the history backend by branching on `Fliplet.Router.isNative()` — see the per-framework examples below. React is the exception: it uses `createHashRouter` on both platforms (which also fixes a preview-iframe blank-render issue), so it needs no branch.

<p class="info"><code>Fliplet.Router</code> is auto-loaded on V3 apps and is the only sanctioned router API. You build your framework's router from the manifest; you do not hand-roll routes.</p>

```js
var base     = Fliplet.Router.getBasePath();        // '/', '/my-slug/', '/v1/apps/42/pages/99/preview/', or native base
var manifest = Fliplet.Router.getRouteManifest();   // { routes, defaultRoute, authRedirect }
```

Four requirements:

1. **On web, read the base path** with `Fliplet.Router.getBasePath()` and pass it to your router's history/basename option. Never hardcode `'/'`. Slug-hosted apps and preview iframes host the SPA under different non-root bases. On native the app routes through the hash, so the base path doesn't apply to the history backend (`createWebHashHistory()` / `location.hash` take no base). Branch on `Fliplet.Router.isNative()`.
2. **Read the manifest** with `Fliplet.Router.getRouteManifest()`. Build your route table from `manifest.routes`. The manifest lives at `app.settings.v3` (see [App settings](app-settings.md)). Update it via the App Settings API (`PUT /v1/apps/:id` with `settings.v3`) or the Studio routing UI whenever you add or remove a user-visible route.
3. **Guard each route with `Fliplet.Router.resolveRoute(path)`** in the component, loader, or resolver:
   - It returns `{ allowed: true, content, route }` on success.
   - It returns `{ allowed: false, redirectTo, reason }` on denial, where `reason` is `'no-session'` or `'media-denied'`.
   - It already fetches the screen source via `Fliplet.Media.getContents(fileId)` internally. Don't call it yourself.
   - It rejects on transient or infra errors (5xx, network) so you can show an error UI instead of redirecting silently.
4. **Guard against stale navigations.** If the user has navigated away before an access check resolves, don't redirect. Compare the resolved route against the current route before calling `push`.

<p class="warning"><strong>Server media ACL is the final gate.</strong> The manifest's <code>public: true</code> flag is advisory. It just lets the client skip a known-401 round trip. Flipping <code>public: true</code> in the manifest without updating the media file's access rule grants no access.</p>

## Forbidden patterns

These patterns break V3 apps on at least one hosting context (slug-hosted web, preview iframe, or native). Treat them as hard constraints. The Fliplet Studio AI builder enforces them with an automated lint on generated boot HTML (each violation carries a `ruleId` matching the rows below); hand-authored apps must follow the same rules.

The hash rows are **platform-conditional**: hash navigation is *required* on native, so the lint suppresses them when the boot HTML branches on `Fliplet.Router.isNative()` / `getHistoryMode()`. Unguarded, they fire — because hash mode on web (or path mode on native) is wrong. The two React rows fire **unconditionally**: `createHashRouter` is correct for React on every platform, so neither `createBrowserRouter` nor the `<HashRouter>` component is ever right in a V3 app.

| `ruleId` | What's forbidden (unguarded) | What to do instead |
|---|---|---|
| `hash-change-event` | `window.addEventListener('hashchange', …)` or `window.onhashchange = …` with no platform guard | On web, use `popstate` with `history.pushState`. On native, `hashchange` is the correct event — branch on `Fliplet.Router.isNative()` so the listener matches the navigation mechanism (`popstate` on web, `hashchange` on native). |
| `window-location-hash` | Reading or writing `window.location.hash` / `location.hash` with no platform guard | On web, navigate with `history.pushState(state, '', Fliplet.Router.getBasePath() + path)` and read the current path from `location.pathname` after stripping the base. On native, `location.hash` is required (path `pushState` is blocked on `file:`). Branch on `Fliplet.Router.isNative()`. |
| `create-web-hash-history` | `VueRouter.createWebHashHistory(…)` used unconditionally | Make it platform-conditional: `Fliplet.Router.isNative() ? VueRouter.createWebHashHistory() : VueRouter.createWebHistory(Fliplet.Router.getBasePath())`. |
| `unguarded-web-history` | `VueRouter.createWebHistory(…)` with no platform guard anywhere in the document | Same branch as above — unguarded path history throws a `file:` `SecurityError` on native. Gate the history backend on `Fliplet.Router.isNative()`. |
| `react-browser-router` | `createBrowserRouter(…)` (React Router) | `ReactRouterDOM.createHashRouter(routes)` (no basename). It renders correctly in the preview iframe and works on native unchanged — React needs no platform branch. |
| `hash-router-react` | `HashRouter` component (React Router) | Use the `createHashRouter(routes)` data-router form, not the `<HashRouter>` component. |
| `hash-href` | `href="#/..."` or `href='#/...'` in markup with no platform guard | Render real paths (`href="/home"`) and intercept clicks to call your router, which picks the URL shape per platform (path on web, hash on native). |
| `path-dispatcher` | 3+ `if (location.pathname === '/…')` branches, or `switch (location.pathname) { case '/…': … }`, used as a hand-rolled router | Build your framework's router from `Fliplet.Router.getRouteManifest()`. Each framework's wiring is in [Framework examples](#framework-examples) below. Single-branch guards like `if (location.pathname === '/login') return;` are fine — the lint only fires on dispatcher-shaped chains. |

These rules are the ones Fliplet can detect automatically from the boot HTML. Additional anti-patterns (hand-rolled `SCREENS` maps, pathname reads without base-stripping, double-fetching media) live in the [Common pitfalls](#common-pitfalls) section below. They aren't detected statically but are equally wrong.

## Framework examples

The same pattern applies to every framework: read the base path and manifest from `Fliplet.Router`, build the framework's router from that, and call `resolveRoute` in the component, loader, or resolver. The examples below show the shape in five common stacks; pick whichever matches your app.

Every example assumes this manifest shape (see [App settings](app-settings) for how it's stored):

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

### Vue Router 4 (Vue 3)

```js
Fliplet.require.lazy('vue-router').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();
  // Platform-conditional: native (file://) must route through the hash; web
  // uses path history under the base path.
  var history = Fliplet.Router.isNative()
    ? VueRouter.createWebHashHistory()                         // native — hash only
    : VueRouter.createWebHistory(Fliplet.Router.getBasePath()); // web — path + basename

  var routes = manifest.routes.map(function(r) {
    return {
      path: r.path,
      name: r.name,
      component: function() {
        return Fliplet.Router.resolveRoute(r.path).then(function(result) {
          if (!result.allowed) {
            // Race guard: only redirect if the user is still on this route.
            if (router.currentRoute.value.path === r.path) {
              router.push(result.redirectTo);
            }

            return { template: '<div></div>' };
          }

          return parseScreen(result.content); // framework-specific
        });
      }
    };
  });

  routes.unshift({ path: '/', redirect: manifest.defaultRoute });

  var router = VueRouter.createRouter({ history: history, routes: routes });
  // mount and use the router as usual
});
```

### Vue Router 3 (Vue 2)

```js
Fliplet.require.lazy('vue-router').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();

  var routes = manifest.routes.map(function(r) {
    return {
      path: r.path,
      name: r.name,
      component: function(resolve) {
        Fliplet.Router.resolveRoute(r.path).then(function(result) {
          if (!result.allowed) {
            if (router.currentRoute.path === r.path) {
              router.push(result.redirectTo);
            }

            resolve({ template: '<div></div>' });

            return;
          }

          resolve(parseScreen(result.content));
        });
      }
    };
  });

  routes.unshift({ path: '/', redirect: manifest.defaultRoute });

  var router = new VueRouter({
    // Platform-conditional: native (file://) must use hash mode; web uses
    // path history under the base path.
    mode: Fliplet.Router.isNative() ? 'hash' : 'history',
    base: Fliplet.Router.isNative() ? undefined : Fliplet.Router.getBasePath(),
    routes: routes
  });
});
```

### React Router 6

React uses `createHashRouter` (no basename) on every platform — it sidesteps both the preview-iframe blank-render issue (initial URL has no path after the basename) and the native `file:` `pushState` restriction, so no platform branch is needed. Use a loader to call `resolveRoute` before the component renders.

```js
Fliplet.require.lazy('react-router-dom').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();

  function routeLoader(path) {
    return function() {
      return Fliplet.Router.resolveRoute(path).then(function(result) {
        if (!result.allowed) {
          throw ReactRouterDOM.redirect(result.redirectTo);
        }

        return { content: result.content, route: result.route };
      });
    };
  }

  var routes = manifest.routes.map(function(r) {
    return {
      path: r.path,
      loader: routeLoader(r.path),
      element: React.createElement(ScreenRenderer)
    };
  });

  routes.unshift({ path: '/', loader: function() { throw ReactRouterDOM.redirect(manifest.defaultRoute); } });

  var router = ReactRouterDOM.createHashRouter(routes);   // no basename — hash mode works in the preview iframe and on native unchanged
});
```

`ScreenRenderer` reads `useLoaderData()` and renders `data.content`. Race-handling is built in; React Router cancels stale loaders automatically.

### Svelte

Most Svelte routers default to hash mode. Pick one that supports history, or thin-wrap `history.pushState` yourself:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();
var native = Fliplet.Router.isNative();   // file:// → route via the hash
var basePrefix = base.replace(/\/$/, '');

function currentPath() {
  if (native) return location.hash.replace(/^#/, '') || '/';
  return location.pathname.replace(new RegExp('^' + basePrefix), '') || '/';
}

function navigate(path) {
  if (native) {
    location.hash = path;                 // fires 'hashchange' → render
  } else {
    history.pushState({}, '', basePrefix + path);
    render(path);                         // pushState doesn't fire popstate; render directly
  }
}

function render(path) {
  var target = path === '/' ? manifest.defaultRoute : path;

  Fliplet.Router.resolveRoute(target).then(function(result) {
    if (currentPath() !== target) return; // stale

    if (!result.allowed) {
      navigate(result.redirectTo);

      return;
    }

    mountScreen(result.content);
  });
}

// hashchange on native, popstate on web — matches the navigate() mechanism.
window.addEventListener(native ? 'hashchange' : 'popstate', function() {
  render(currentPath());
});

render(currentPath());
```

### Vanilla JS (no router library)

Same pattern as Svelte, branched on platform: on web `pushState` for navigation and `popstate` for back/forward (normalized against the base path); on native `location.hash` and `hashchange` (path `pushState` is blocked on `file:`). Keep a module-scoped `currentNavId` to ignore stale resolutions:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();
var basePrefix = base.replace(/\/$/, '');
var native = Fliplet.Router.isNative();   // file:// → route via the hash
var currentNavId = 0;

function currentPath() {
  if (native) return location.hash.replace(/^#/, '') || '/';
  return stripBase(location.pathname);
}

function stripBase(pathname) {
  if (basePrefix && pathname.indexOf(basePrefix) === 0) {
    return pathname.slice(basePrefix.length) || '/';
  }
  return pathname || '/';
}

function render(path) {
  var navId = ++currentNavId;
  var target = (path && path !== '/') ? path : manifest.defaultRoute;

  return Fliplet.Router.resolveRoute(target).then(function(result) {
    if (navId !== currentNavId) return; // user navigated away, ignore

    if (!result.allowed) {
      navigate(result.redirectTo);
      return;
    }

    document.getElementById('app').innerHTML = result.content;
  });
}

function navigate(path) {
  if (native) {
    location.hash = path;                 // fires 'hashchange' → render
  } else {
    history.pushState({}, '', basePrefix + path);
    render(path);                         // pushState doesn't fire popstate; render directly
  }
}

document.addEventListener('click', function(event) {
  var link = event.target.closest('a[href^="/"]');
  if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  navigate(link.getAttribute('href'));
});

// hashchange on native, popstate on web — matches the navigate() mechanism.
window.addEventListener(native ? 'hashchange' : 'popstate', function() {
  render(currentPath());
});

render(currentPath());
```

## Post-login redirect

When `resolveRoute` returns `reason: 'no-session'` or `reason: 'media-denied'`, stash the intended path before navigating to `authRedirect`. After a successful login, consume it.

### Vue Router 4 example

```js
// Before redirecting to the auth screen:
sessionStorage.setItem('fl:postLoginPath', router.currentRoute.value.fullPath);
router.push(result.redirectTo);

// After a successful login:
var target = sessionStorage.getItem('fl:postLoginPath');
sessionStorage.removeItem('fl:postLoginPath');
router.push(target || manifest.defaultRoute);
```

### Framework-agnostic equivalent

```js
// Before redirecting to the auth screen:
sessionStorage.setItem('fl:postLoginPath', location.pathname + location.search);
navigate(result.redirectTo);

// After a successful login:
var target = sessionStorage.getItem('fl:postLoginPath');
sessionStorage.removeItem('fl:postLoginPath');
navigate(target || manifest.defaultRoute);
```

Replace `navigate(...)` with the same helper used in your router (Svelte, vanilla JS, or React Router's `navigate()` from `useNavigate()`).

## Common pitfalls

- **Don't hand-roll a `SCREENS = { home: 1234, … }` map or a pathname-if-chain.** That's what the route manifest is for. Store it in `app.settings.v3` and read it back via `Fliplet.Router.getRouteManifest().routes`. Hand-rolled maps drift when screens are renamed, duplicate the `public` and `fileId` metadata the server already authored, and bypass the manifest as the single source of truth for routing.
- **Don't read `window.location.pathname` directly to determine the current route.** On web, strip the base path first — `Fliplet.Router.getBasePath()` returns the prefix to remove. Slug-hosted apps and preview iframes host the SPA under a non-root path; raw `pathname` reads will misidentify the current route in both contexts. On native the route lives in `location.hash`, not the pathname — branch on `Fliplet.Router.isNative()` (a single `currentPath()` helper that returns the hash on native and the base-stripped pathname on web keeps the rest of the router platform-agnostic).
- **Don't fetch the screen's media URL yourself.** `Fliplet.Router.resolveRoute` already calls `Fliplet.Media.getContents(fileId)` under the hood and returns the content in `result.content`. A second fetch duplicates the network round trip, can race with the access check, and will fail outright on private media where auth headers aren't applied.
- **Don't discard `result.content` from `resolveRoute`.** The `content` field IS the screen's source — already fetched for you. Your route loader should return `{ content: result.content, route: result.route }` so the component can render `data.content` directly. If your loader returns only `{ path }` and your screens are defined inline in the component, you've duplicated every screen in two places — the manifest's `fileId` and the hardcoded inline copy — and you've paid for a fetch you then threw away. The `resolveRoute` name is the hint: the method resolves a route to its **full resolution** (access + content), not just an access decision.
- **Don't assume the server-side ACL matches the manifest's `public` flag.** The manifest is advisory; the server decides. Always handle `reason: 'media-denied'`. Flipping `public: true` without updating the media file's access rule grants no access; you'll ship an app that works in dev and 401s in production.
- **Don't skip the route manifest on multi-screen apps.** The manifest at `app.settings.v3` IS the app's routing definition. Without it, `Fliplet.Router.getRouteManifest().routes` is empty and nothing resolves. The boot HTML has no fallback path list; an empty manifest silently renders a blank app.
- **Don't use raw `<a href="/path">` for in-app navigation.** It triggers a full page reload and tears down your SPA — the framework re-bootstraps from scratch on every click, state is lost, and the post-login redirect pattern breaks because your app never saw the original navigation. Intercept clicks via your framework's router: Vue Router's `<router-link>`, React Router's `<Link>` (or `useNavigate()`), or a vanilla click handler that calls `history.pushState`. External links (`http(s)://…`, `mailto:`, `tel:`) are fine as raw `<a>` — those are *supposed* to leave the SPA.

## Related

- [Fliplet Router JS API](../fliplet-router). Full method reference for `Fliplet.Router` with return shapes, reason codes, and manifest shape.
- [V3 app bootstrap constraints](app-bootstrap). The three boot-HTML fundamentals (dependencies, media fetch, init sequence). Routing defers to this doc.
- [V3 app settings convention](app-settings). Where the route manifest is stored (`app.settings.v3`).
- [Media JS APIs](../fliplet-media). `Fliplet.Media.getContents` details.
