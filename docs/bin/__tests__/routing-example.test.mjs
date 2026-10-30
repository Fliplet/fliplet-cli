import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
const docPath = new URL('../../API/v3/routing.md', import.meta.url);
const example = readFileSync(docPath, 'utf8').split('### Svelte')[1]?.match(/```js\n([\s\S]*?)```/)?.[1];
const flush = () => new Promise(setImmediate);
function setup({ native = false, path = '/' } = {}) {
  const pending = [], mounted = [], errors = [], navigations = [];
  const location = { pathname: '/app' + path, hash: native ? '#' + path : '' };
  const context = {
    Fliplet: { Router: {
      getRouteManifest: () => ({ defaultRoute: '/home' }), getBasePath: () => '/app/', isNative: () => native,
      resolveRoute: target => new Promise((resolve, reject) => pending.push({ target, resolve, reject }))
    } }, location,
    history: { pushState(_state, _title, target) { location.pathname = target; navigations.push(target); } },
    window: { addEventListener() {} }, mountScreen: content => mounted.push(content), showError: error => errors.push(error)
  };
  vm.runInNewContext(example, context);
  return { pending, mounted, errors, navigations, context, move(path) { if (native) location.hash = '#' + path; else location.pathname = '/app' + path; context.render(path); } };
}
for (const native of [false, true]) {
  it(`Svelte example mounts default route at ${native ? 'native' : 'web'} root`, async () => {
    const b = setup({ native }); assert.equal(b.pending[0].target, '/home');
    b.pending[0].resolve({ allowed: true, content: 'Home' }); await flush(); assert.deepEqual(b.mounted, ['Home']);
  });
}
it('Svelte example ignores a stale result after navigating away and back', async () => {
  const b = setup({ path: '/home' }); b.move('/other'); b.move('/home');
  b.pending[2].resolve({ allowed: true, content: 'Current Home' }); await flush();
  b.pending[0].resolve({ allowed: true, content: 'Old Home' }); b.pending[1].resolve({ allowed: true, content: 'Other' }); await flush();
  assert.deepEqual(b.mounted, ['Current Home']);
});
it('Svelte example redirects a denied route without mounting it', async () => {
  const b = setup({ path: '/private' }); b.pending[0].resolve({ allowed: false, redirectTo: '/login' }); await flush();
  assert.deepEqual(b.mounted, []); assert.deepEqual(b.navigations, ['/app/login']);
});
it('Svelte example shows denial instead of redirecting to the same route again', async () => {
  const b = setup({ path: '/login' }); b.pending[0].resolve({ allowed: false, redirectTo: '/login' }); await flush();
  assert.deepEqual(b.navigations, []); assert.deepEqual(b.mounted, []); assert.equal(b.errors.length, 1);
});
it('Svelte example displays rejected access errors without mounting a screen', async () => {
  const b = setup({ path: '/private' }); b.pending[0].reject(new Error('Access denied')); await flush();
  assert.deepEqual(b.mounted, []); assert.equal(b.errors.length, 1);
});
it('Svelte example ignores a stale rejected request', async () => {
  const b = setup({ path: '/private' }); b.move('/public'); b.pending[1].resolve({ allowed: true, content: 'Public' }); await flush();
  b.pending[0].reject(new Error('Old failure')); await flush(); assert.deepEqual(b.mounted, ['Public']); assert.deepEqual(b.errors, []);
});
