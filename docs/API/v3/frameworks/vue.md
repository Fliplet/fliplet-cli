---
description: Constraints for building V3 apps in Vue 3. Covers the runtime-compiler vs runtime-only build choice, the .vue single-file-component tradeoff without a loader, and the Vue Router base-path wiring to Fliplet.Router.getBasePath.
---

# V3 Vue apps

Vue 3 is the best-supported multi-screen framework in V3 because a runtime-compiler build exists — meaning `template` strings compile in the browser without a toolchain. The traps below come from using the wrong Vue build, or reaching for features that assume Vite/webpack.

## Loading the framework

Add `vue` via `add_dependencies` with `lazy: true`, then:

```js
await Fliplet.require.lazy('vue');
const Vue = window.Vue;
```

`Fliplet.require.lazy(name)` resolves once the UMD bundle has executed; the module itself lands on `window` (`window.Vue`, `window.VueRouter`). Read it off `window` after the `await` — assigning the awaited value directly gives you the URL string, not the module.

**Pick the runtime-compiler build (usually `vue.global.js`), not the runtime-only build.** The runtime-only build (`vue.runtime.global.js`) does not include the template compiler — any component that uses `template: '...'` strings will fail to render. The runtime-only build only works if every component is authored as a pre-compiled render function, which is impractical without a bundler.

For Vue Router, the separate dependency:

```js
await Fliplet.require.lazy('vue-router');
const VueRouter = window.VueRouter;
```

## Features that need a build step

| Feature | Why it fails | Do this instead |
|---|---|---|
| `.vue` single-file components | There is no loader resolving them at runtime | Use plain component objects with `template:` strings, **or** add `vue3-sfc-loader` as a dependency if the app genuinely needs SFCs. Pick one approach per app and stay consistent. |
| `<script setup>` | Requires SFC compilation | Use the Options API or explicit `setup()` function on component objects. |
| `<style scoped>` | Requires SFC compilation | Scope manually by wrapping each component's CSS in a root class selector. |
| Bare ESM imports (`import Vue from 'vue'`) | No bundler resolves the specifier | Use `Fliplet.require.lazy('vue')`. |
| TypeScript (`.ts`, `.tsx`) | No transpiler | Plain JavaScript. |

## Wiring to Fliplet.Router

Full contract is in [V3 routing](../routing.md). Vue-specific note: pass the base path into `createWebHistory`:

```js
const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(Fliplet.Router.getBasePath()),
  routes: [...]
});
```

`createWebHashHistory` is rejected by the boot-HTML lint (rule `create-web-hash-history`).

Build routes from `Fliplet.Router.getRouteManifest()` — do not hardcode. In each route's resolver, call `Fliplet.Router.checkRouteAccess(path)`; it already fetches the screen source via `Fliplet.Media.getContents`, so don't fetch it yourself.

## Binding Fliplet.Media.authenticate

Authenticated URLs resolve asynchronously — bind through reactivity, not at module load:

```js
// inside a component
data() { return { logoSrc: '' }; },
async mounted() {
  this.logoSrc = await Fliplet.Media.authenticate(rawUrl);
}
```

Then `<img :src="logoSrc">`. Using `src="{{ rawUrl }}"` directly, or computing the authenticated URL at module scope, leaves the image broken until the template re-renders.

## Common errors

| Symptom in `get_preview_logs('errors')` | Cause | Fix |
|---|---|---|
| `[Vue warn]: Component is missing template or render function` | Runtime-only Vue build loaded; `template:` strings silently ignored | Switch to the runtime-compiler build (`vue.global.js`) |
| `Uncaught SyntaxError: Unexpected token '<'` inside a component file | `.vue` SFC uploaded without `vue3-sfc-loader` | Either convert the component to a plain object with `template:` string, or add `vue3-sfc-loader` |
| Blank screen, no errors | Component returned from `Fliplet.Media.getContents` wasn't registered before router resolved | Register the component inside the route resolver, not at module load |

## DO / DON'T

- DO use `Fliplet.require.lazy('vue')` and the runtime-compiler build.
- DO build the router from `Fliplet.Router.getRouteManifest()` + `getBasePath()`.
- DO bind authenticated media URLs into reactive `data()` fields.
- DON'T use `createWebHashHistory` — rejected by lint.
- DON'T author `.vue` SFCs without `vue3-sfc-loader` loaded.
- DON'T `import` anything — use `Fliplet.require.lazy`.

## Related

- [V3 app bootstrap](../app-bootstrap.md)
- [V3 routing](../routing.md)
- [V3 framework overview](overview.md)
