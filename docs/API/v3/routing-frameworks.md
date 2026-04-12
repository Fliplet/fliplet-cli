---
description: V3 routing translation table for Vue Router 4, Vue Router 3, React Router 6, Svelte, and vanilla routers. Canonical Fliplet.Router pattern for each framework.
---

# V3 Routing — Per-Framework Translation Table

The contract is the same across every framework:

1. Read the base path with `Fliplet.Router.getBasePath()`.
2. Read the manifest with `Fliplet.Router.getRouteManifest()`.
3. In each route's component / loader, call `Fliplet.Router.checkRouteAccess(path)` and either render `result.content` or redirect to `result.redirectTo`.
4. Guard against stale navigations — if the user has navigated away before the access check resolves, don't redirect.

Only the framework-specific glue differs. Every snippet below assumes a manifest like:

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

## Vue Router 4 (Vue 3)

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
            if (router.currentRoute.value.path === r.path) {
              router.push(result.redirectTo);
            }

            return { template: '<div></div>' };
          }

          return parseScreen(result.content);
        });
      }
    };
  });

  routes.unshift({ path: '/', redirect: manifest.defaultRoute });
  var router = VueRouter.createRouter({ history: history, routes: routes });
});
```

## Vue Router 3 (Vue 2)

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

## React Router 6

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

## Svelte (svelte-spa-router / tinro alternative)

Most Svelte routers use hash mode by default — pick one that supports history. Example with a thin custom router that uses `history.pushState`:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();

var currentPath = location.pathname.replace(new RegExp('^' + base.replace(/\/$/, '')), '') || '/';

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

render(currentPath);
```

## Vanilla JS (no router library)

Use the same pattern as Svelte above — pushState for navigation, popstate for back/forward, normalize against the base path. Keep a module-scoped `currentNavId` to detect stale resolutions:

```js
var manifest = Fliplet.Router.getRouteManifest();
var base = Fliplet.Router.getBasePath();
var currentNavId = 0;

function navigate(path) {
  var navId = ++currentNavId;

  history.pushState({}, '', base.replace(/\/$/, '') + path);

  Fliplet.Router.checkRouteAccess(path).then(function(result) {
    if (navId !== currentNavId) return; // user navigated away — ignore

    if (!result.allowed) {
      navigate(result.redirectTo);

      return;
    }

    document.getElementById('app').innerHTML = result.content;
  });
}
```

## Common pitfalls

- **Don't hand-roll a `SCREENS = { home: 1234, ... }` map or a pathname-if-chain.** That's the route manifest — put it in `update_route_manifest` and read it back via `Fliplet.Router.getRouteManifest().routes`. Every path → fileId mapping belongs on the server; none belong in boot HTML or `App.js`.
- **Don't call `createWebHashHistory()` on any platform.** V3 uses History API everywhere — native included. The API server sets `<base href>` and the native shell computes `window.ENV.basePath` to make `history.pushState` URLs resolve on refresh.
- **Don't read `window.location.pathname` directly to determine the current route.** Strip the base path first — `Fliplet.Router.getBasePath()` returns the prefix to remove.
- **Don't fetch the screen's media URL yourself.** `Fliplet.Router.checkRouteAccess` already calls `Fliplet.Media.getContents(fileId)` under the hood and returns the content in `result.content`. Calling both produces a double fetch and may race.
- **Don't assume the server-side ACL matches the manifest's `public` flag.** The manifest is advisory; the server decides. Always handle `reason: 'media-denied'`.

## Related

- [V3 App Bootstrap Template](app-bootstrap.md) — the canonical Vue Router 4 snippet and routing contract overview.
- [V3 App Settings Convention](app-settings.md) — where the route manifest is stored (`app.settings.v3`).
- [Media JS APIs](../fliplet-media.md) — `Fliplet.Media.getContents` details.
