// Execute the published examples with deterministic browser/API doubles. No provider calls.
import { it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { marked } from 'marked';
import createDOMPurify from 'dompurify';

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

function chatBrowser() {
  const source = readFileSync(`${docsRoot}API/core/ai/chatbot.md`, 'utf8');
  const html = source.match(/```html\n([\s\S]*?)```/)[1];
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://app.example/' });
  const window = dom.window;
  window.marked = marked;
  window.DOMPurify = createDOMPurify(window);
  window.Fliplet = { require: { lazy: async () => {} }, AI: {} };
  return {
    dom, window, context: dom.getInternalVMContext(),
    element: id => window.document.getElementById(id),
    submit(text) {
      if (text !== undefined) this.element('ai-chat-draft').value = text;
      this.element('ai-chat-form').dispatchEvent(new window.Event('submit', { cancelable: true }));
    }
  };
}
function streamRequest() {
  const completion = deferred();
  const request = completion.promise;
  let handler;
  let cancelCalls = 0;
  request.stream = fn => { handler = fn; return request; };
  request.cancel = async () => { cancelCalls++; return { cancelled: true }; };
  return {
    request, ...completion,
    chunk: text => handler({ choices: [{ delta: { content: text } }] }),
    emit: chunk => handler(chunk),
    get cancelCalls() { return cancelCalls; }
  };
}
async function startChat(b, request = streamRequest()) {
  b.window.Fliplet.AI.createCompletion = () => request.request;
  vm.runInContext(scripts('chatbot')[0], b.context);
  b.submit('Help me plan a visit');
  await flush();
  return request;
}

it('interactive example shows delayed chunks before completion and finalizes the same formatted message', async () => {
  const b = chatBrowser();
  const first = streamRequest();
  const requests = [];
  b.window.Fliplet.AI.createCompletion = options => { requests.push(options); return first.request; };
  vm.runInContext(scripts('chatbot')[0], b.context);
  b.submit('Help me plan a visit');
  assert.equal(b.element('ai-chat-messages').children[0].textContent, 'YouHelp me plan a visit');
  await flush();
  b.submit();
  assert.equal(requests.length, 1);
  first.chunk('Start with **the');
  const bubble = b.element('ai-chat-messages').children[1];
  assert.match(bubble.textContent, /Start with/);
  assert.equal(b.element('ai-chat-send').disabled, true);
  await flush(); // Completion is still unresolved.
  first.chunk(' museum**.\n\n- See the paintings.');
  assert.equal(bubble.querySelector('strong + div strong').textContent, 'the museum');
  assert.equal(bubble.querySelector('li').textContent, 'See the paintings.');
  first.resolve();
  await flush();
  assert.equal(b.element('ai-chat-messages').children[1], bubble);
  assert.equal(b.element('ai-chat-messages').children.length, 2);
  assert.equal(b.element('ai-chat-draft').value, '');
  const second = streamRequest();
  b.window.Fliplet.AI.createCompletion = options => { requests.push(options); return second.request; };
  b.submit('What else?');
  await flush();
  assert.equal(requests[1].messages[1].content, 'Start with **the museum**.\n\n- See the paintings.');
  assert.equal(requests[1].messages.length, 3);
  second.chunk('Try the gardens.'); second.resolve(); await flush();
  assert.equal(b.element('ai-chat-messages').children.length, 4);
  b.dom.window.close();
});

it('real parser/sanitizer renders Markdown and keeps hostile HTML and link targets inert', async () => {
  const b = chatBrowser();
  const request = await startChat(b);
  request.chunk('Paragraph with *emphasis*.\n\n```js\nconst message = "<script>";\n```\n\n[Guide](https://example.com/guide) [Bad](javascript:alert(1)) [Data](data:text/html,x)\n\n<img src=x onerror=alert(1)><script>alert(1)</script><svg onload=alert(1)></svg><p onclick="alert(1)">Safe text</p>');
  const body = b.element('ai-chat-messages').children[1].children[1];
  assert.equal(body.querySelector('em').textContent, 'emphasis');
  assert.match(body.querySelector('pre code').textContent, /<script>/);
  assert.equal(body.querySelector('a').href, 'https://example.com/guide');
  assert.equal(body.querySelectorAll('a[href]').length, 1);
  assert.equal(body.querySelectorAll('script,img,svg,[onclick],[onerror],[onload]').length, 0);
  request.resolve(); await flush(); b.window.close();
});

it('stopped partial replies stay out of history; unchanged retry reuses the turn and commits once', async () => {
  const b = chatBrowser();
  const first = await startChat(b);
  first.chunk('Partial **text');
  b.element('ai-chat-stop').click();
  assert.equal(first.cancelCalls, 1);
  b.submit();
  first.chunk(' late text');
  assert.doesNotMatch(b.element('ai-chat-messages').textContent, /late text/);
  first.resolve({ cancelled: true }); await flush();
  assert.match(b.element('ai-chat-messages').textContent, /Interrupted/);
  assert.equal(b.element('ai-chat-draft').value, 'Help me plan a visit');
  const retry = streamRequest(); let options;
  b.window.Fliplet.AI.createCompletion = next => { options = next; return retry.request; };
  b.submit(); await flush();
  assert.equal(options.messages.length, 1);
  assert.equal(b.element('ai-chat-messages').children.length, 2);
  retry.chunk('Complete reply'); retry.resolve(); await flush();
  assert.doesNotMatch(b.element('ai-chat-messages').textContent, /Partial|Interrupted/);
  const followup = streamRequest();
  b.window.Fliplet.AI.createCompletion = next => { options = next; return followup.request; };
  b.submit('Continue'); await flush();
  assert.equal(options.messages.length, 3);
  assert.equal(options.messages[1].content, 'Complete reply');
  followup.resolve(); await flush(); b.window.close();
});

it('error and empty completion keep the draft and do not create successful history', async () => {
  for (const failure of ['error', 'empty']) {
    const b = chatBrowser(); const first = await startChat(b);
    if (failure === 'error') { first.chunk('Incomplete'); first.reject({ message: 'Offline' }); }
    else first.resolve();
    await flush();
    assert.equal(b.element('ai-chat-draft').value, 'Help me plan a visit');
    assert.equal(b.element('ai-chat-send').disabled, false);
    assert.match(b.element('ai-chat-status').textContent, /retry/);
    const retry = streamRequest(); let options;
    b.window.Fliplet.AI.createCompletion = next => { options = next; return retry.request; };
    b.submit(); await flush(); assert.equal(options.messages.length, 1);
    retry.chunk('Recovered'); retry.resolve(); await flush(); b.window.close();
  }
});

it('dependency failure is visible, preserves input and supports an explicit retry', async () => {
  const b = chatBrowser(); let calls = 0;
  b.window.Fliplet.require.lazy = async () => { throw Error('Formatting dependency offline'); };
  b.window.Fliplet.AI.createCompletion = () => { calls++; throw Error('Must not request'); };
  vm.runInContext(scripts('chatbot')[0], b.context);
  b.submit('Preserve this draft'); await flush();
  assert.equal(calls, 0);
  assert.match(b.element('ai-chat-status').textContent, /offline.*retry/);
  assert.equal(b.element('ai-chat-draft').value, 'Preserve this draft');
  b.window.Fliplet.require.lazy = async () => {};
  const request = streamRequest(); b.window.Fliplet.AI.createCompletion = () => request.request;
  b.submit(); await flush(); request.chunk('Recovered'); request.resolve(); await flush();
  assert.equal(b.element('ai-chat-messages').children.length, 2);
  b.window.close();
});

it('renderer failure cancels without injecting unsafe output; disposal ignores late callbacks', async () => {
  const b = chatBrowser(); const request = await startChat(b);
  b.window.marked = { parse() { throw Error('Parser failed'); } };
  request.chunk('<img onerror=alert(1)>');
  assert.equal(request.cancelCalls, 1);
  assert.equal(b.element('ai-chat-messages').querySelectorAll('img').length, 0);
  request.resolve(); await flush(); assert.match(b.element('ai-chat-status').textContent, /formatting failed/);
  b.window.close();
  const c = chatBrowser(); const ongoing = await startChat(c);
  ongoing.chunk('Before disposal');
  vm.runInContext('disposeAIChat()', c.context);
  const before = c.element('ai-chat-messages').innerHTML;
  ongoing.chunk('After disposal'); ongoing.resolve(); await flush();
  assert.equal(c.element('ai-chat-messages').innerHTML, before);
  assert.equal(ongoing.cancelCalls, 1);
  c.window.close();
});

it('updates preserve a reader scrolled away from the bottom and avoid per-chunk live announcements', async () => {
  const b = chatBrowser(); const request = await startChat(b);
  const list = b.element('ai-chat-messages');
  Object.defineProperties(list, { scrollHeight: { value: 1000 }, clientHeight: { value: 200 } });
  list.scrollTop = 120;
  request.chunk('Visible reply'); assert.equal(list.scrollTop, 120);
  list.scrollTop = 800; request.chunk(' continuation'); assert.equal(list.scrollTop, 1000);
  assert.equal(list.getAttribute('aria-live'), 'off');
  assert.equal(b.element('ai-chat-status').getAttribute('role'), 'status');
  request.resolve(); await flush(); b.window.close();
});

it('stream format adapters select text deltas only and preserve the chosen model/history', async () => {
  for (const [index, chunks, check] of [
    [1, [{ candidates: [{ content: { parts: [{ text: 'secret', thought: true }, { text: 'Reply' }] } }] }], options => assert.equal(options.contents[1].role, 'model')],
    [2, [{ type: 'response.reasoning_text.delta', delta: 'secret' }, { type: 'response.output_text.delta', delta: 'Reply' }], options => assert.equal(options.useResponses, true)]
  ]) {
    let options; const request = streamRequest(); const text = [];
    const context = vm.createContext({ Fliplet: { AI: { createCompletion: next => { options = next; return request.request; } } }, text });
    vm.runInContext(scripts('chatbot')[index], context);
    vm.runInContext("requestReply('chosen-model', [{role:'user',content:'Hello'},{role:'assistant',content:'Hi'}], delta => text.push(delta))", context);
    chunks.forEach(request.emit);
    assert.deepEqual(text, ['Reply']); assert.equal(options.model, 'chosen-model'); check(options);
    request.resolve();
  }
});

it('buffered alternative keeps pending state, disables Stop and uses the same final rendering', async () => {
  const b = chatBrowser(); const result = deferred();
  b.window.Fliplet.AI.createCompletion = () => result.promise;
  vm.runInContext(scripts('chatbot')[0] + '\n' + scripts('chatbot')[3], b.context);
  b.submit('A buffered reply'); await flush();
  assert.equal(b.element('ai-chat-stop').disabled, true);
  assert.match(b.element('ai-chat-status').textContent, /Waiting/);
  result.resolve({ choices: [{ message: { content: '**Complete** reply' } }] }); await flush();
  assert.equal(b.element('ai-chat-messages').children[1].querySelector('div strong').textContent, 'Complete');
  assert.equal(b.element('ai-chat-draft').value, ''); b.window.close();
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
