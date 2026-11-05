// Execute the published recipe, not a separately maintained implementation.
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const guide = readFileSync(new URL('../../API/v3/frameworks/vue.md', import.meta.url), 'utf8');
const helper = guide.match(/```js\n(function loadVueScreen[\s\S]*?)```/)[1];
const wiring = guide.split('## Wiring to Fliplet.Router')[1].match(/```js\n([\s\S]*?)```/)[1];
const vue = readFileSync(require.resolve('vue/dist/vue.global.prod.js'), 'utf8');
const routerSource = readFileSync(require.resolve('vue-router/dist/vue-router.global.prod.js'), 'utf8');

async function fixture() {
  const dom = new JSDOM('<div id="app"></div>', { url: 'https://example.test/preview/', runScripts: 'outside-only' });
  const w = dom.window;
  w.eval(vue); w.eval(routerSource);
  const entries = [{ path: '/', fileId: 1, public: true }, { path: '/items/:id', fileId: 2 }, { path: '/login', fileId: 3, public: true }];
  const state = { denied: false, failure: false, calls: [], evaluations: 0 };
  const source = id => `<template><p>${id === 2 ? 'Item {{ $route.params.id }}' : 'Screen ' + id}</p></template><script>export default {};</script><style>.example { padding: 1px; }</style>`;
  w.Fliplet = {
    Hooks: { on() {} }, // Media registers unrelated login/logout cache hooks.
    Env: { get: key => ({ appSettings: { v3: { routes: entries, authRedirect: '/login' } }, basePath: '/preview/', platform: 'web' })[key] },
    User: { getCachedSession: async () => state.denied ? null : {} },
    Media: {
      parseSFC: text => Object.fromEntries(['template', 'script', 'style'].map(tag => [tag, text.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1] || ''])),
      evalModule: text => w.Function(text.replace('export default', 'return'))()
    }
  };
  if (process.env.FLIPLET_API_ROOT) {
    for (const [folder, file] of [['fliplet-media', 'media'], ['fliplet-router', 'router']]) {
      w.eval(readFileSync(`${process.env.FLIPLET_API_ROOT}/public/assets/${folder}/1.0/${file}.js`, 'utf8'));
    }
  } else {
    w.Fliplet.Router = {
      getRouteManifest: () => ({ routes: entries }), isNative: () => false, getBasePath: () => '/preview/',
      resolveRoute: async entry => {
        if (!entry.public && state.denied) return { allowed: false, redirectTo: '/login' };
        return { allowed: true, content: await w.Fliplet.Media.getContents(entry.fileId) };
      }
    };
  }
  w.Fliplet.Media.getContents = async id => { if (state.failure) throw new Error('Network unavailable'); return source(id); };
  const resolve = w.Fliplet.Router.resolveRoute;
  w.Fliplet.Router.resolveRoute = entry => { state.calls.push(entry); return resolve(entry); };
  const evaluate = w.Fliplet.Media.evalModule;
  w.Fliplet.Media.evalModule = text => { state.evaluations++; return evaluate(text); };
  w.eval(helper + wiring + '\nwindow.router = router; window.app = Vue.createApp({ template: "<router-view />" }).use(router).mount("#app");');
  await w.router.isReady(); await w.Vue.nextTick();
  return { dom, w, state };
}

it('loads extracted SFCs and resolves manifest identity for dynamic navigation', async () => {
  const { dom, w, state } = await fixture();
  try {
    assert.match(w.document.body.textContent, /Screen 1/);
    await w.router.push('/items/42'); await w.Vue.nextTick();
    assert.equal(state.calls.at(-1).path, '/items/:id');
    assert.match(w.document.body.textContent, /Item 42/);
    const count = state.calls.length;
    await w.router.push('/items/43'); await w.Vue.nextTick();
    assert.equal(state.calls.length, count + 1);
    assert.match(w.document.body.textContent, /Item 43/);
    await w.router.push('/unknown'); await w.Vue.nextTick();
    assert.match(w.document.body.textContent, /Page not found/);
  } finally { dom.window.close(); }
});

it('denies before evaluation and rechecks cached routes; network errors do not become authorization', async () => {
  const { dom, w, state } = await fixture();
  try {
    state.denied = true;
    await w.router.push('/items/42'); await w.Vue.nextTick();
    assert.equal(w.router.currentRoute.value.path, '/login');
    assert.equal(state.evaluations, 2); // Home and login only.
    state.denied = false;
    await w.router.push('/items/42'); await w.router.push('/');
    state.denied = true;
    await w.router.push('/items/43');
    assert.equal(w.router.currentRoute.value.path, '/login');
    state.denied = false; state.failure = true;
    await assert.rejects(w.router.push('/items/44'), /Network unavailable/);
    assert.match(w.document.body.textContent, /could not be loaded/);
  } finally { dom.window.close(); }
});
