import { it } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
const page = readFileSync(new URL('../../API/core/ai.md', import.meta.url), 'utf8');
const code = [...page.matchAll(/```js\n([\s\S]*?)```/g)].map(m => m[1]).find(s => s.includes('async function streamResponseResult'));
function example(result, failure) {
  const calls = [], text = [];
  const request = failure ? Promise.reject(failure) : Promise.resolve(result);
  request.stream = fn => { fn({ type: 'response.reasoning_text.delta', delta: 'hidden' }); fn({ type: 'response.output_text.delta', delta: 'Visible' }); return request; };
  const ctx = vm.createContext({ Fliplet: { AI: { createCompletion(payload, controls) { calls.push({ payload, controls }); return request; } } } });
  vm.runInContext(code, ctx);
  return { run: ctx.streamResponseResult('Hello', chunk => text.push(chunk)), calls, text };
}
it('Responses reference uses explicit model, client-only controls and native terminal output', async () => {
  const native = { status: 'completed', output: [{ type: 'function_call', call_id: 'c1' }], usage: { input_tokens: 10 }, opaque: 'preserve' };
  const terminal = { status: 'completed', guid: 'g1', response: native };
  const e = example(terminal);
  assert.equal(await e.run, terminal);
  assert.deepEqual(e.text, ['Visible']);
  assert.equal(e.calls[0].payload.model, 'gpt-6.1-sol');
  assert.equal(e.calls[0].payload.useResponses, true);
  assert.equal(e.calls[0].payload.returnResult, undefined);
  assert.equal(e.calls[0].controls.returnResult, true);
  assert.equal(e.calls.length, 1);
});
it('reference retains typed incomplete/cancelled outcomes and never retries unsupported loaded SDKs', async () => {
  for (const status of ['incomplete', 'cancelled']) {
    const terminal = { status, guid: 'g1', response: { status } };
    assert.equal(await example(terminal).run, terminal);
  }
  for (const value of [undefined, {}, { status: 'completed' }, { status: 'completed', response: { status: 'incomplete', output: [] } }]) {
    const e = example(value); await assert.rejects(e.run); assert.equal(e.calls.length, 1);
  }
});
it('reference preserves structured provider failures without a generation retry', async () => {
  const failure = { code: 'rate_limit', message: 'Try later' };
  const e = example(undefined, failure);
  await assert.rejects(e.run, err => err === failure); assert.equal(e.calls.length, 1);
});
