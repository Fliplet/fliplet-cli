// Execute the published examples with deterministic browser/API doubles. No provider calls.
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const docsRoot = fileURLToPath(new URL('../../', import.meta.url));
function scripts(name) {
  return [...readFileSync(`${docsRoot}API/core/ai/${name}.md`, 'utf8').matchAll(/```js\n([\s\S]*?)```/g)].map(match => match[1]);
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const flush = () => new Promise(resolve => setImmediate(resolve));
function browser() {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      elements.set(id, {
        value: '', textContent: '', disabled: false, files: [], children: [], listeners: {},
        addEventListener(name, fn) { this.listeners[name] = fn; },
        dispatchEvent(event) { return this.listeners[event.type]?.(event); },
        appendChild(child) { this.children.push(child); }, setAttribute() {}, focus() {}
      });
    }
    return elements.get(id);
  }
  const listeners = {};
  const sandbox = {
    document: { getElementById: element, createElement: () => ({ textContent: '' }) },
    window: { isSecureContext: true, setTimeout: () => 1, clearTimeout() {}, addEventListener: (type, fn) => { listeners[type] = fn; } },
    navigator: {}, Blob, AbortController, Event, console
  };
  return { element, sandbox, listeners, context: vm.createContext(sandbox) };
}

it('chat commits both turns after success, prevents duplicate sends and retains a failed draft', async () => {
  const b = browser();
  const first = deferred();
  const requests = [];
  b.sandbox.Fliplet = { AI: { createCompletion(options) { requests.push(options); return first.promise; } } };
  vm.runInContext(scripts('chatbot')[0], b.context);
  const submit = () => b.element('ai-chat-form').listeners.submit({ preventDefault() {} });
  b.element('ai-chat-draft').value = 'Help me plan a visit';
  const pending = submit();
  await submit();
  assert.equal(requests.length, 1);
  assert.equal(b.element('ai-chat-send').disabled, true);
  first.resolve({ choices: [{ message: { content: 'Visit the museum.' } }] });
  await pending;
  assert.equal(b.element('ai-chat-draft').value, '');
  assert.equal(b.element('ai-chat-messages').children.length, 2);
  b.sandbox.Fliplet.AI.createCompletion = async options => { requests.push(options); throw Error('Offline'); };
  b.element('ai-chat-draft').value = 'What should I see there?';
  await submit();
  assert.equal(requests[1].messages.length, 3);
  assert.equal(requests[1].messages[1].role, 'assistant');
  assert.equal(b.element('ai-chat-draft').value, 'What should I see there?');
  assert.equal(b.element('ai-chat-send').disabled, false);
  b.sandbox.Fliplet.AI.createCompletion = async options => { requests.push(options); return { choices: [{ message: { content: 'See the paintings.' } }] }; };
  await submit();
  assert.equal(requests[2].messages.length, 3);
  assert.equal(b.element('ai-chat-messages').children.length, 4);
});

it('chat format alternatives extract Gemini text and Responses output without thought/tool content', async () => {
  const examples = scripts('chatbot');
  for (const [index, response, check] of [
    [1, { candidates: [{ content: { parts: [{ text: 'hidden', thought: true }, { text: 'Reply' }] } }] }, options => assert.equal(options.contents[1].role, 'model')],
    [2, { output: [{ type: 'reasoning', content: [{ type: 'output_text', text: 'hidden' }] }, { type: 'message', content: [{ type: 'output_text', text: 'Reply' }] }] }, options => assert.equal(options.useResponses, true)]
  ]) {
    let request;
    const context = vm.createContext({ Fliplet: { AI: { createCompletion: async options => { request = options; return response; } } } });
    vm.runInContext(examples[index], context);
    const result = await vm.runInContext("requestReply([{role:'user',content:'Hello'},{role:'assistant',content:'Hi'},{role:'user',content:'Continue'}])", context);
    assert.equal(result, 'Reply');
    check(request);
    assert.ok(request.model);
  }
});

it('stream cancellation preserves the draft and leaves partial output out of history', async () => {
  const b = browser();
  const completion = deferred();
  let chunk;
  const request = completion.promise;
  request.stream = fn => { chunk = fn; return request; };
  request.cancel = async () => ({ cancelled: true });
  b.sandbox.Fliplet = { AI: { createCompletion: () => request } };
  const examples = scripts('chatbot');
  vm.runInContext(examples[0] + '\n' + examples[3], b.context);
  b.element('ai-chat-draft').value = 'A streamed reply';
  const pending = b.element('ai-chat-form').listeners.submit({ preventDefault() {} });
  chunk({ choices: [{ delta: { content: 'Partial' } }] });
  b.element('ai-chat-stop').listeners.click();
  completion.resolve({ cancelled: true });
  await pending;
  assert.equal(b.element('ai-chat-draft').value, 'A streamed reply');
  assert.equal(b.element('ai-chat-messages').children.length, 0);
  assert.match(b.element('ai-chat-partial').textContent, /Interrupted/);
});

function audioBrowser() {
  const b = browser();
  const tracks = [{ stopped: false, stop() { this.stopped = true; } }];
  const recorders = [];
  b.sandbox.navigator.mediaDevices = { getUserMedia: async () => ({ getTracks: () => tracks }) };
  class Recorder {
    static isTypeSupported() { return true; }
    constructor(stream, options) { this.mimeType = options?.mimeType || 'audio/webm'; this.state = 'inactive'; this.listeners = {}; recorders.push(this); }
    addEventListener(name, fn) { this.listeners[name] = fn; }
    start() { this.state = 'recording'; }
    stop() {
      this.state = 'inactive';
      // The final audio chunk is delivered only after stop was requested.
      this.listeners.dataavailable({ data: new Blob(['final words'], { type: this.mimeType }) });
      this.listeners.stop();
    }
  }
  b.sandbox.MediaRecorder = b.sandbox.window.MediaRecorder = Recorder;
  b.sandbox.Fliplet = { AI: { transcribeAudio: async () => ({ text: 'Transcript' }) } };
  vm.runInContext(scripts('audio-transcription')[0], b.context);
  return { ...b, tracks, recorders };
}

it('recording includes the final chunk and releases the microphone before sending audio', async () => {
  const b = audioBrowser();
  let uploaded;
  b.sandbox.Fliplet.AI.transcribeAudio = async audio => {
    assert.ok(b.tracks[0].stopped);
    uploaded = await audio.text();
    return { text: 'Final words' };
  };
  b.element('dictation-record').listeners.click();
  await flush();
  b.element('dictation-record').listeners.click();
  await flush();
  assert.equal(uploaded, 'final words');
  assert.equal(b.element('dictation-transcript').value, 'Final words');
  b.element('dictation-notes').value = 'Existing typed notes';
  b.element('dictation-insert').listeners.click();
  assert.equal(b.element('dictation-notes').value, 'Existing typed notes\nFinal words');
});

it('audio failure retains the file for retry and preserves notes', async () => {
  const b = audioBrowser();
  let calls = 0;
  b.sandbox.Fliplet.AI.transcribeAudio = async () => { calls++; if (calls === 1) throw Error('Offline'); return { text: 'Retried transcript' }; };
  b.element('dictation-notes').value = 'Typed draft';
  b.element('dictation-file').files = [new Blob(['audio'], { type: 'audio/webm' })];
  b.element('dictation-file').listeners.change();
  b.element('dictation-upload').listeners.click();
  await flush();
  assert.equal(b.element('dictation-retry').disabled, false);
  assert.equal(b.element('dictation-notes').value, 'Typed draft');
  b.element('dictation-retry').listeners.click();
  await flush();
  assert.equal(calls, 2);
  assert.equal(b.element('dictation-transcript').value, 'Retried transcript');
});

it('cancelled audio ignores late success, blocks overlap and preserves existing transcript text', async () => {
  const b = audioBrowser();
  const response = deferred();
  let calls = 0;
  b.sandbox.Fliplet.AI.transcribeAudio = () => { calls++; return response.promise; };
  b.element('dictation-transcript').value = 'Existing transcript';
  b.element('dictation-file').files = [new Blob(['audio'], { type: 'audio/webm' })];
  b.element('dictation-file').listeners.change();
  b.element('dictation-upload').listeners.click();
  b.element('dictation-cancel').listeners.click();
  b.element('dictation-upload').listeners.click();
  assert.equal(calls, 1);
  response.resolve({ text: 'Late result' });
  await flush();
  assert.equal(b.element('dictation-transcript').value, 'Existing transcript');
  assert.equal(b.element('dictation-record').disabled, false);
});

it('cancelled microphone permission releases tracks when the prompt eventually resolves', async () => {
  const b = audioBrowser();
  const permission = deferred();
  b.sandbox.navigator.mediaDevices.getUserMedia = () => permission.promise;
  b.element('dictation-record').listeners.click();
  b.element('dictation-cancel').listeners.click();
  permission.resolve({ getTracks: () => b.tracks });
  await flush();
  assert.ok(b.tracks[0].stopped);
  assert.equal(b.recorders.length, 0);
  assert.equal(b.element('dictation-record').disabled, false);
});

it('audio validation prevents empty and unsupported uploads; recorder errors recover controls', async () => {
  const b = audioBrowser();
  let calls = 0;
  b.sandbox.Fliplet.AI.transcribeAudio = async () => { calls++; return { text: 'Unexpected' }; };
  for (const audio of [new Blob([], { type: 'audio/webm' }), new Blob(['audio'], { type: 'application/pdf' }), new Blob([new Uint8Array(25 * 1024 * 1024 + 1)], { type: 'audio/webm' })]) {
    b.element('dictation-file').files = [audio];
    b.element('dictation-file').listeners.change();
    b.element('dictation-upload').listeners.click();
    await flush();
  }
  assert.equal(calls, 0);
  b.element('dictation-record').listeners.click();
  await flush();
  b.recorders[0].listeners.error({ error: Error('Recorder unavailable') });
  await flush();
  assert.ok(b.tracks[0].stopped);
  assert.equal(b.element('dictation-record').disabled, false);
});

it('empty chat replies retain the draft and normal streams commit the assembled text', async () => {
  const b = browser();
  b.sandbox.Fliplet = { AI: { createCompletion: async () => ({ choices: [{ message: { content: '' } }] }) } };
  const examples = scripts('chatbot');
  vm.runInContext(examples[0], b.context);
  b.element('ai-chat-draft').value = 'Keep this draft';
  await b.element('ai-chat-form').listeners.submit({ preventDefault() {} });
  assert.equal(b.element('ai-chat-draft').value, 'Keep this draft');
  assert.equal(b.element('ai-chat-messages').children.length, 0);
  vm.runInContext(examples[3], b.context);
  const completion = deferred();
  const request = completion.promise;
  request.stream = fn => { fn({ choices: [{ delta: { content: 'A complete reply' } }] }); return request; };
  request.cancel = async () => ({ cancelled: true });
  b.sandbox.Fliplet.AI.createCompletion = () => request;
  const pending = b.element('ai-chat-form').listeners.submit({ preventDefault() {} });
  completion.resolve(); // Normal stream completion has no assembled result object.
  await pending;
  assert.equal(b.element('ai-chat-messages').children[1].textContent, 'Assistant: A complete reply');
  assert.equal(b.element('ai-chat-draft').value, '');
});

it('microphone denial recovers and empty transcripts preserve existing text for retry', async () => {
  const b = audioBrowser();
  b.sandbox.navigator.mediaDevices.getUserMedia = async () => { throw Object.assign(Error('denied'), { name: 'NotAllowedError' }); };
  b.element('dictation-record').listeners.click();
  await flush();
  assert.match(b.element('dictation-status').textContent, /permission was denied/);
  assert.equal(b.element('dictation-record').disabled, false);
  b.element('dictation-transcript').value = 'Existing text';
  b.sandbox.Fliplet.AI.transcribeAudio = async () => ({ text: '' });
  b.element('dictation-file').files = [new Blob(['audio'], { type: 'audio/webm' })];
  b.element('dictation-file').listeners.change();
  b.element('dictation-upload').listeners.click();
  await flush();
  assert.equal(b.element('dictation-transcript').value, 'Existing text');
  assert.equal(b.element('dictation-retry').disabled, false);
});
