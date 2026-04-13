---
description: Canonical routing patterns for V3 SPA apps — base path, route manifest, access guard, per-framework translations, and the full list of forbidden patterns that break V3 apps.
---

# V3 Routing

This is the canonical routing reference for V3 apps. It covers the `Fliplet.Router` contract, the forbidden patterns that break V3 apps on one or more hosting contexts, a canonical snippet, per-framework translations, and the post-login redirect pattern.

Routing in V3 is non-obvious because the defaults in most frameworks are wrong for the platform — V3 apps run in three different hosting contexts (slug-hosted web, Studio preview iframe, native shell), each with a different base path. Read this doc before writing boot HTML for any multi-screen V3 app.

---

## The contract

V3 uses the **History API on every platform** (web, preview iframe, and native). Hash routing is forbidden because every hosting context (slug-hosted web apps, the Studio preview iframe, and native shells) mounts the SPA at a different base path — hashes hide that base from the server, break deep-link sharing, and make post-login redirects unreliable across the three contexts.

`Fliplet.Router` is auto-loaded on V3 apps and is the only sanctioned router API. You build your framework's router from the manifest; you do not hand-roll routes.

```js
var base     = Fliplet.Router.getBasePath();        // '/', '/my-slug/', '/v1/apps/42/pages/99/preview/', or native base
var manifest = Fliplet.Router.getRouteManifest();   // { routes, defaultRoute, authRedirect }
```

Four requirements:

1. **Read the base path** with `Fliplet.Router.getBasePath()` and pass it to your router's history/basename option. Never hardcode `'/'` — slug-hosted apps, preview iframes, and native shells all have different bases.
2. **Read the manifest** with `Fliplet.Router.getRouteManifest()`. Build your route table from `manifest.routes`. The manifest lives at `app.settings.v3` (see [App Settings](app-settings.md)) — update it via the App Settings API (`PUT /v1/apps/:id` with `settings.v3`) or the Studio routing UI whenever you add or remove a user-visible route.
3. **Guard each route with `Fliplet.Router.checkRouteAccess(path)`** in the component / loader / resolver. It returns `{ allowed: true, content, route }` on success or `{ allowed: false, redirectTo, reason }` on denial, and internally fetches the screen source via `Fliplet.Media.getContents(fileId)` — you don't call it yourself. It rejects on transient/infra errors (5xx, network) so you can show an error UI instead of redirecting silently.
4. **Guard against stale navigations.** If the user has navigated away before an access check resolves, don't redirect. Compare the resolved route against the current route before calling `push`.

**Server media ACL is the final gate.** The manifest's `public: true` flag is advisory — it just lets the client skip a known-401 round trip. Flipping `public: true` in the manifest without updating the media file's access rule grants no access.

---

## Forbidden patterns

These patterns break V3 apps on at least one hosting context (slug-hosted web, preview iframe, or native). Treat them as hard constraints. The Fliplet Studio AI builder enforces them with an automated lint on generated boot HTML (each violation carries a `ruleId` matching the rows below); hand-authored apps must follow the same rules.

| `ruleId` | What's forbidden | What to do instead |
|---|---|---|
| `hash-change-event` | `window.addEventListener('hashchange', …)` or `window.onhashchange = …` | Use `popstate` with `history.pushState` — the browser fires `popstate` on back/forward, and you call `pushState` explicitly when navigating. |
| `window-location-hash` | Reading or writing `window.location.hash` / `location.hash` | Navigate with `history.pushState(state, '', Fliplet.Router.getBasePath() + path)`. Read the current path from `location.pathname` after stripping the base prefix. |
| `create-web-hash-history` | `VueRouter.createWebHashHistory(…)` | `VueRouter.createWebHistory(Fliplet.Router.getBasePath())`. |
| `hash-router-react` | `HashRouter` (React Router) | `createBrowserRouter(routes, { basename: Fliplet.Router.getBasePath() })`. |
| `hash-href` | `href="#/..."` or `href='#/...'` | Use real paths (`href="/home"`) and intercept clicks to call `history.pushState` via your router. |

These five rules are the ones Fliplet can detect automatically from the boot HTML. Additional anti-patterns (hand-rolled `SCREENS` maps, pathname reads without base-stripping, double-fetching media) live in the "Common pitfalls" section below — they aren't detected statically but are equally wrong.

---

## Canonical snippet (Vue Router 4)

The default V3 stack is Vue 3 + Vue Router 4. Translations for other frameworks are further down; the structure is identical.

```js
Fliplet.require.lazy('vue-router').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();
  var history = VueRouter.createWebHistory(Fliplet.Router.getBasePath());

  var routes = manifest.routes.map(function(r) {
    return {
      path: r.path,
      name: r.name,
      component: function() {
        return Fliplet.Router.checkRouteAccess(r.path).then(function(result) {
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

Every snippet below assumes the same manifest shape:

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

---

## Per-framework translations

### Vue Router 3 (Vue 2)

```js
Fliplet.require.lazy('vue-router').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();

  var routes = manifest.routes.map(function(r) {
    return {
      path: r.path,
      name: r.name,
      component: function(resolve) {
        Fliplet.Router.checkRouteAccess(r.path).then(function(result) {
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
    mode: 'history',
    base: Fliplet.Router.getBasePath(),
    routes: routes
  });
});
```

### React Router 6

React Router doesn't infer the base path — you must pass it to `basename`. Use a loader to call `checkRouteAccess` before the component renders.

```js
Fliplet.require.lazy('react-router-dom').then(function() {
  var manifest = Fliplet.Router.getRouteManifest();

  function routeLoader(path) {
    return function() {
      return Fliplet.Router.checkRouteAccess(path).then(function(result) {
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

  var router = ReactRouterDOM.createBrowserRouter(routes, {
    basename: Fliplet.Router.getBasePath()
  });
});
```

`ScreenRenderer` reads `useLoaderData()` and renders `data.content`. Race-handling is built in — React Router cancels stale loaders automatically.

### Svelte

Most Svelte routers use hash mode by default — pick one that supports history, or thin-wrap `history.pushState` yourself:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();

function navigate(path) {
  history.pushState({}, '', base.replace(/\/$/, '') + path);
  render(path);
}

function render(path) {
  var target = path === '/' ? manifest.defaultRoute : path;

  Fliplet.Router.checkRouteAccess(target).then(function(result) {
    if (location.pathname !== base.replace(/\/$/, '') + target) return; // stale

    if (!result.allowed) {
      navigate(result.redirectTo);

      return;
    }

    mountScreen(result.content);
  });
}

window.addEventListener('popstate', function() {
  render(location.pathname.replace(new RegExp('^' + base.replace(/\/$/, '')), '') || '/');
});

render(location.pathname.replace(new RegExp('^' + base.replace(/\/$/, '')), '') || '/');
```

### Vanilla JS (no router library)

Same pattern as Svelte — `pushState` for navigation, `popstate` for back/forward, normalize against the base path. Keep a module-scoped `currentNavId` to ignore stale resolutions:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();
var basePrefix = base.replace(/\/$/, '');
var currentNavId = 0;

function stripBase(pathname) {
  if (basePrefix && pathname.indexOf(basePrefix) === 0) {
    return pathname.slice(basePrefix.length) || '/';
  }
  return pathname || '/';
}

function render(path) {
  var navId = ++currentNavId;
  var target = (path && path !== '/') ? path : manifest.defaultRoute;

  return Fliplet.Router.checkRouteAccess(target).then(function(result) {
    if (navId !== currentNavId) return; // user navigated away — ignore

    if (!result.allowed) {
      navigate(result.redirectTo);
      return;
    }

    document.getElementById('app').innerHTML = result.content;
  });
}

function navigate(path) {
  history.pushState({}, '', basePrefix + path);
  render(path);
}

document.addEventListener('click', function(event) {
  var link = event.target.closest('a[href^="/"]');
  if (!link || link.target === '_blank' || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  navigate(link.getAttribute('href'));
});

window.addEventListener('popstate', function() {
  render(stripBase(location.pathname));
});

render(stripBase(location.pathname));
```

---

## Post-login redirect

When `checkRouteAccess` returns `reason: 'no-session'` or `reason: 'media-denied'`, stash the intended path before navigating to `authRedirect`:

```js
sessionStorage.setItem('fl:postLoginPath', router.currentRoute.value.fullPath);
router.push(result.redirectTo);
```

After a successful login, consume it:

```js
var target = sessionStorage.getItem('fl:postLoginPath');
sessionStorage.removeItem('fl:postLoginPath');
router.push(target || manifest.defaultRoute);
```

---

## Common pitfalls

- **Don't hand-roll a `SCREENS = { home: 1234, … }` map or a pathname-if-chain.** That's what the route manifest is for — store it in `app.settings.v3` and read it back via `Fliplet.Router.getRouteManifest().routes`. *(Hand-rolled maps drift when screens are renamed, duplicate the `public`/`fileId` metadata the server already authored, and bypass the manifest as the single source of truth for routing.)*
- **Don't read `window.location.pathname` directly to determine the current route.** Strip the base path first — `Fliplet.Router.getBasePath()` returns the prefix to remove. *(Slug-hosted apps and preview iframes host the SPA under a non-root path; raw `pathname` reads will misidentify the current route in both contexts.)*
- **Don't fetch the screen's media URL yourself.** `Fliplet.Router.checkRouteAccess` already calls `Fliplet.Media.getContents(fileId)` under the hood and returns the content in `result.content`. *(A second fetch duplicates the network round trip, can race with the access check, and will fail outright on private media where auth headers aren't applied.)*
- **Don't assume the server-side ACL matches the manifest's `public` flag.** The manifest is advisory; the server decides. Always handle `reason: 'media-denied'`. *(Flipping `public: true` without updating the media file's access rule grants no access — you'll ship an app that works in dev and 401s in production.)*
- **Don't skip the route manifest on multi-screen apps.** The manifest at `app.settings.v3` IS the app's routing definition — without it, `Fliplet.Router.getRouteManifest().routes` is empty and nothing resolves. *(The boot HTML has no fallback path list; an empty manifest silently renders a blank app.)*

---

## Related

- [V3 App Bootstrap Template](app-bootstrap.md) — the three boot-HTML fundamentals (dependencies, media fetch, init sequence). Routing defers to this doc.
- [V3 App Settings Convention](app-settings.md) — where the route manifest is stored (`app.settings.v3`).
- [Media JS APIs](../fliplet-media.md) — `Fliplet.Media.getContents` details.
