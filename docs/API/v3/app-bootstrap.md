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

V3 apps use the History API on every platform (web and native). `Fliplet.Router` is auto-loaded on V3 apps and exposes the routing contract:

```js
var base     = Fliplet.Router.getBasePath();        // '/', '/my-slug/', preview path, or native base
var manifest = Fliplet.Router.getRouteManifest();   // { routes, defaultRoute, authRedirect }
```

- **Never hardcode the base path or history mode.** Always call `getBasePath()` and `createWebHistory(base)` (or your framework's equivalent). Slug-hosted apps (`apps.fliplet.com/my-slug/`), preview iframes, and native shells all have different base paths; the helper returns the right value.
- **The manifest is the source of truth.** Build your framework's route table from `manifest.routes`. When you add or remove a route, call `update_route_manifest` so the manifest stays in sync.
- **Protect every route with `checkRouteAccess`.** In each route's component resolver, call `Fliplet.Router.checkRouteAccess(path)`. It returns `{ allowed: true, content, route }` on success or `{ allowed: false, redirectTo, reason }` on denial, and rejects on transient/infra errors so you can show an error UI instead of redirecting silently.
- **Server media ACL is the final gate.** The manifest's `public: true` flag is advisory — it just lets the client skip a known-401 round trip. Flipping `public: true` in the manifest without updating the media file's access rule grants no access.

Canonical snippet (Vue Router 4; the same pattern works across React Router, Svelte, and vanilla — see `v3-routing-frameworks`):

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

**Post-login redirect.** When `checkRouteAccess` returns `reason: 'no-session'` or `reason: 'media-denied'`, stash the intended path before navigating to `authRedirect`:

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

**Don't read `window.location` manually.** The server handles deep-link URLs and sets `<base href>` on initial render. Your router picks up the initial path itself — hard refresh on `/my-slug/my-account` works out of the box.

---

## When to fetch this doc

Call `get_fliplet_docs('v3-app-bootstrap')`:

- Before your **first** `update_screen_code` of any new build.
- Any time you're unsure how the boot HTML should fetch dependencies, load source files, or initialize the runtime.

The result is cached per session — repeat calls in the same conversation are free.
