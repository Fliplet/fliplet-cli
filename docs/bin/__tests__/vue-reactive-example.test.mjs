// Execute the canonical Vue example against the browser compiler/runtime and a real DOM.
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const require = createRequire(import.meta.url);
const docsRoot = fileURLToPath(new URL('../../', import.meta.url));
const vueSource = readFileSync(require.resolve('vue/dist/vue.global.prod.js'), 'utf8');
const guide = readFileSync(`${docsRoot}API/v3/frameworks/vue.md`, 'utf8');
const example = guide.split('## Updating reactive state asynchronously')[1]?.match(/```js\n([\s\S]*?)```/)?.[1];

function mount(source = example) {
  assert.ok(source, 'Canonical Vue guide must contain the runnable asynchronous example');
  const dom = new JSDOM('<div id="async-results"></div>', { runScripts: 'outside-only' });
  const window = dom.window;
  const timers = new Map();
  window.setTimeout = (callback, delay) => { timers.set(delay, callback); return delay; };
  window.eval(vueSource);
  // Preserve the exact published setup, exposing its component only to the test harness.
  window.eval(source + '\nwindow.testResultsScreen = resultsScreen;');
  return { dom, window, screen: window.testResultsScreen, timers, item: () => window.document.querySelector('li') };
}

it('Vue guide renders separated asynchronous updates before completion in the same reactive item', async () => {
  const b = mount();
  await b.window.Vue.nextTick(); // Flush insertion before any callback so it cannot hide raw writes.
  const item = b.item();
  assert.equal(item.querySelector('p').textContent, '');
  assert.equal(item.querySelector('small').textContent, 'pending');
  assert.equal(b.window.Vue.isReactive(b.screen.results[0]), true);
  b.timers.get(100)();
  await b.window.Vue.nextTick();
  assert.equal(item.querySelector('p').textContent, 'First update. ');
  assert.equal(item.querySelector('small').textContent, 'pending');
  b.timers.get(200)();
  await b.window.Vue.nextTick();
  assert.equal(item.querySelector('p').textContent, 'First update. Second update.');
  assert.equal(item.querySelector('small').textContent, 'pending');
  b.timers.get(300)();
  await Promise.resolve(); await b.window.Vue.nextTick();
  assert.equal(item.querySelector('small').textContent, 'complete');
  assert.equal(b.item(), item);
  assert.equal(b.window.document.querySelectorAll('li').length, 1);
  b.dom.window.close();
});

it('raw-object regression control stays stale after nextTick until another render masks the failure', async () => {
  // The exact reviewed defect: return the original object retained by the callback.
  const mutated = example.replace('return this.results[this.results.length - 1];', 'return rawResult;');
  assert.notEqual(mutated, example, 'Regression control must change the published proxy return');
  const b = mount(mutated);
  await b.window.Vue.nextTick();
  const item = b.item();
  b.timers.get(100)(); await b.window.Vue.nextTick();
  b.timers.get(200)(); await b.window.Vue.nextTick();
  assert.equal(b.screen.results[0].text, 'First update. Second update.');
  assert.equal(item.querySelector('p').textContent, ''); // Model state alone is not rendered proof.
  b.timers.get(300)(); await Promise.resolve(); await b.window.Vue.nextTick();
  assert.equal(item.querySelector('small').textContent, 'pending');
  b.screen.$forceUpdate(); await b.window.Vue.nextTick();
  assert.equal(item.querySelector('p').textContent, 'First update. Second update.');
  assert.equal(item.querySelector('small').textContent, 'complete');
  b.dom.window.close();
});

it('asynchronous error finalizes the existing reactive item as interrupted', async () => {
  const b = mount(); await b.window.Vue.nextTick();
  let sendText, fail;
  const source = new Promise((resolve, reject) => { fail = reject; });
  const operation = b.screen.beginUpdates(onText => { sendText = onText; return source; });
  await b.window.Vue.nextTick();
  const item = b.window.document.querySelectorAll('li')[1];
  sendText('Partial result'); await b.window.Vue.nextTick();
  assert.equal(item.querySelector('p').textContent, 'Partial result');
  assert.equal(item.querySelector('small').textContent, 'pending');
  fail(new Error('Connection lost'));
  await operation; await b.window.Vue.nextTick();
  assert.equal(item.querySelector('small').textContent, 'interrupted');
  assert.equal(b.window.document.querySelectorAll('li')[1], item);
  b.dom.window.close();
});
