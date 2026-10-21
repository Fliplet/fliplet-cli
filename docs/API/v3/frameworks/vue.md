---
title: "V3 Vue apps"
description: "Build Vue 3 apps in V3 with the browser compiler, reactive asynchronous state, platform-aware routing and authenticated media."
type: guide
tags: [js-api, v3, framework, vue]
v3_relevant: true
deprecated: false
---

# V3 Vue apps

V3 Vue apps use the browser runtime compiler and Fliplet’s media helpers to load Vue single-file components (SFCs) without a build step. Keep `App.js` as a JavaScript component export and each screen as ordinary `<template>`, `<script>` and `<style>` blocks.

## Loading the framework

Register Vue and Vue Router as lazy app resources with verified CDN URLs through `add_dependencies`. They are third-party libraries, so an empty dependency URL does not select a Fliplet package. For example:

```json
[
  { "name": "vue", "latest": "https://unpkg.com/vue@3/dist/vue.global.prod.js", "lazy": true },
  { "name": "vue-router", "latest": "https://unpkg.com/vue-router@4/dist/vue-router.global.prod.js", "lazy": true }
]
```

Run the following inside your boot script's `Fliplet().then(async function() { ... })` callback, before creating the router or mounting the app:

```js
await Fliplet.require.lazy.chain('vue');
await Fliplet.require.lazy.chain('vue-router');
const Vue = window.Vue;
const VueRouter = window.VueRouter;
```

Load Vue before its companion libraries; they read `window.Vue` when executing. The lazy loader resolves to the resource URL, so read the module from its browser global after awaiting it.

Use the runtime-compiler build (`vue.global.js` or `vue.global.prod.js`). It compiles the extracted template in the browser. The runtime-only build cannot compile these templates.

## Loading Vue screen files

The boot script loads a screen's source through `Fliplet.Router.resolveRoute(path)`, which already uses authenticated media loading. `Fliplet.Media.parseSFC(source)` extracts `{ template, script, style }` strings; `Fliplet.Media.evalModule(parts.script)` returns the component's default export. Assign the template to that component and insert its CSS. These Fliplet helpers are preloaded; this path needs no `vue3-sfc-loader` dependency.

Upload each screen as a `.vue` file and register it in the [route manifest](../routing). A simple screen looks like this:

{% raw %}
```html
<template>
  <section class="welcome-screen"><h1>{{ title }}</h1></section>
</template>
<script>
export default {
  data: function() { return { title: 'Welcome' }; }
};
</script>
<style>
.welcome-screen { padding: 24px; }
</style>
```
{% endraw %}

Use this helper in the boot script before building the routes below:

```js
function loadVueScreen(source) {
  const parts = Fliplet.Media.parseSFC(source);
  const screen = Fliplet.Media.evalModule(parts.script);
  screen.template = parts.template;
  if (parts.style) {
    const style = document.createElement('style');
    style.textContent = parts.style;
    document.head.appendChild(style);
  }
  return screen;
}
```

`parseSFC` extracts blocks; it does not compile advanced Vue syntax or preprocess CSS. Use `export default { ... }` in the screen's script, without a separate `template` property. Styles are global: prefix selectors with the screen's root class. Keep `App.js` as JavaScript only and load its exported component with `Fliplet.Media.getContentsAsModule(appFileId)`; pass that returned object directly to `Vue.createApp(App)`.

## Features that need a build step

| Feature | Why it fails | Do this instead |
|---|---|---|
| `<script setup>` | Requires SFC compilation | Use the Options API or explicit `setup()` function on component objects. |
| `<style scoped>` or CSS preprocessing | Extracted styles are inserted as plain global CSS | Use plain CSS with a screen-specific root class; `scoped` and `lang` attributes do not transform it. |
| Bare ESM imports (`import Vue from 'vue'`) | No bundler resolves the specifier | Use `Fliplet.require.lazy('vue')`. |
| TypeScript (`.ts`, `.tsx`) | No transpiler | Plain JavaScript. |

## Wiring to Fliplet.Router

After loading Vue, Vue Router and the helper above, build routes from the [V3 route manifest](../routing). This example requires a registered home screen at `/`. Use path history with the base path on web and hash history on native, where Cordova `file://` blocks path changes:

```js
const manifest = Fliplet.Router.getRouteManifest();
const routes = manifest.routes.map(function(route) {
  return {
    path: route.path,
    component: function() {
      return Fliplet.Router.resolveRoute(route.path).then(function(result) {
        return loadVueScreen(result.content);
      });
    }
  };
});

const router = VueRouter.createRouter({
  history: Fliplet.Router.isNative()
    ? VueRouter.createWebHashHistory()                       // native — hash only
    : VueRouter.createWebHistory(Fliplet.Router.getBasePath()), // web — path + basename
  routes: routes
});
```

Unconditional `createWebHistory()` throws a `file:` `SecurityError` on native; unconditional `createWebHashHistory()` produces ugly `#/route` URLs on web. The boot-HTML lint flags both unless you branch on `Fliplet.Router.isNative()` (`unguarded-web-history` / `create-web-hash-history`).

Mount your root component with `Vue.createApp(App).use(router).mount('#app')` after loading `App.js`, inside the [Fliplet initialization callback](../app-bootstrap#3-init-sequence). Its template should contain `<router-view></router-view>` and the boot HTML must contain `<div id="app"></div>`. Open `/` to confirm the registered screen renders. Reuse `result.content`; do not fetch the screen again.

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
| `Uncaught SyntaxError: Unexpected token '<'` inside a component file | SFC or HTML content was evaluated as JavaScript | For a screen, extract its script with `parseSFC` before `evalModule`; keep `App.js` free of HTML and style blocks. |
| Blank route | The resolver did not return a component with its extracted template, or no route matched | Return `loadVueScreen(result.content)` and confirm the manifest contains the opened route. |

## DO / DON'T

- DO use `Fliplet.require.lazy('vue')` and the runtime-compiler build.
- DO build the router from `Fliplet.Router.getRouteManifest()` + `getBasePath()`.
- DO branch the history backend on `Fliplet.Router.isNative()` — `createWebHashHistory()` on native, `createWebHistory(getBasePath())` on web.
- DO bind authenticated media URLs into reactive `data()` fields.
- DON'T use `createWebHistory()` unconditionally — it throws a `file:` `SecurityError` on native. Gate it on `Fliplet.Router.isNative()`.
- DON'T use `createWebHashHistory()` on web — hash mode is only for native.
- DO load screen SFCs through `parseSFC` and `evalModule`, then assign the extracted template.
- DON'T `import` anything — use `Fliplet.require.lazy`.

## Related

- [V3 app bootstrap](../app-bootstrap)
- [V3 routing](../routing)
- [V3 framework overview](overview)
