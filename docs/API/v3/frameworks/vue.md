---
title: "V3 Vue apps"
description: "Build Vue 3 apps in V3 with the browser compiler, reactive asynchronous state, platform-aware routing and authenticated media."
type: guide
tags: [js-api, v3, framework, vue]
v3_relevant: true
deprecated: false
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

Full contract is in [V3 routing](../routing). Vue-specific note: the history backend is platform-conditional — path history with the base path on web, hash history on native (Cordova `file://` blocks `pushState` path changes):

```js
const router = VueRouter.createRouter({
  history: Fliplet.Router.isNative()
    ? VueRouter.createWebHashHistory()                       // native — hash only
    : VueRouter.createWebHistory(Fliplet.Router.getBasePath()), // web — path + basename
  routes: [...]
});
```

Unconditional `createWebHistory()` throws a `file:` `SecurityError` on native; unconditional `createWebHashHistory()` produces ugly `#/route` URLs on web. The boot-HTML lint flags both unless you branch on `Fliplet.Router.isNative()` (`unguarded-web-history` / `create-web-hash-history`).

Build routes from `Fliplet.Router.getRouteManifest()` — do not hardcode. In each route's resolver, call `Fliplet.Router.resolveRoute(path)`. The `content` field in its result IS the screen's source — already fetched for you via `Fliplet.Media.getContents`. Return it from your loader and render it in your component; don't fetch the file again.

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

## Updating reactive state asynchronously

Update the reactive state used by the template when processing asynchronous results, progress events or streamed text. In Vue 3, inserting a plain object into a reactive array does not make that original object reactive. Retrieve the item from the array before keeping it in a callback; otherwise its mutations may appear only when another state change causes a render. See Vue's [reactive proxy behavior](https://vuejs.org/guide/essentials/reactivity-fundamentals.html#reactive-proxy-vs-original).

After loading Vue as described above, add `<div id="async-results"></div>` to the screen and run this example. `demoUpdates` simulates two delayed text updates before completion; replace it with your asynchronous source while keeping its updates directed to reactive state.

{% raw %}
```js
function demoUpdates(onText) {
  return new Promise(function(resolve) {
    setTimeout(function() { onText('First update. '); }, 100);
    setTimeout(function() { onText('Second update.'); }, 200);
    setTimeout(resolve, 300);
  });
}

const resultsScreen = Vue.createApp({
  data: function() { return { results: [], nextResultId: 1 }; },
  template: '<ol><li v-for="result in results" :key="result.id">' +
    '<p>{{ result.text }}</p><small>{{ result.status }}</small></li></ol>',
  methods: {
    createResult: function() {
      const rawResult = { id: this.nextResultId++, text: '', status: 'pending' };
      this.results.push(rawResult);
      // Return the reactive item, not rawResult, to the asynchronous callback.
      return this.results[this.results.length - 1];
    },
    beginUpdates: async function(receiveUpdates) {
      const result = this.createResult();
      try {
        await receiveUpdates(function(text) { result.text += text; });
        result.status = 'complete';
      } catch (error) {
        result.status = 'interrupted';
      }
      return result;
    }
  }
}).mount('#async-results');

resultsScreen.beginUpdates(demoUpdates);
```
{% endraw %}

The first update appears while the operation is pending, the second extends the same item, and completion changes that item's status. In the Composition API, retrieve an inserted item through `results.value[index]` for a normal array `ref`, or through the array returned by `reactive()`. Keep using that proxy rather than the original object.

Vue batches DOM updates. Use `await this.$nextTick()` (Options API) or `await Vue.nextTick()` when you need to inspect or scroll the updated DOM. Calling `nextTick()` after mutating a non-reactive original object does not schedule a render. Test updates after the initial pending item has rendered so an earlier scheduled render cannot hide the mistake. Apply your screen's unmount/cancellation handling to stop late updates after disposal.

## Common errors

| Symptom in `get_preview_logs('errors')` | Cause | Fix |
|---|---|---|
| `[Vue warn]: Component is missing template or render function` | Runtime-only Vue build loaded; `template:` strings silently ignored | Switch to the runtime-compiler build (`vue.global.js`) |
| `Uncaught SyntaxError: Unexpected token '<'` inside a component file | `.vue` SFC uploaded without `vue3-sfc-loader` | Either convert the component to a plain object with `template:` string, or add `vue3-sfc-loader` |
| Blank screen, no errors | Component returned from `Fliplet.Media.getContents` wasn't registered before router resolved | Register the component inside the route resolver, not at module load |

## DO / DON'T

- DO use `Fliplet.require.lazy('vue')` and the runtime-compiler build.
- DO build the router from `Fliplet.Router.getRouteManifest()` + `getBasePath()`.
- DO branch the history backend on `Fliplet.Router.isNative()` — `createWebHashHistory()` on native, `createWebHistory(getBasePath())` on web.
- DO bind authenticated media URLs into reactive `data()` fields.
- DON'T use `createWebHistory()` unconditionally — it throws a `file:` `SecurityError` on native. Gate it on `Fliplet.Router.isNative()`.
- DON'T use `createWebHashHistory()` on web — hash mode is only for native.
- DON'T author `.vue` SFCs without `vue3-sfc-loader` loaded.
- DON'T `import` anything — use `Fliplet.require.lazy`.

## Related

- [V3 app bootstrap](../app-bootstrap)
- [V3 routing](../routing)
- [V3 framework overview](overview)
