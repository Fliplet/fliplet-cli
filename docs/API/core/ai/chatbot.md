---
title: Build an AI chatbot
description: "Build AI conversations with progressive replies, safe Markdown formatting, explicit models, message history and recoverable errors."
type: how-to
tags: [js-api, ai, chatbot]
v3_relevant: true
deprecated: false
---
# Build an AI chatbot

Build a conversation in which an AI model generates replies using `Fliplet.AI`. Your app controls conversation history, progressive output and how replies appear to its audience.

## Contents

- [Before you start](#before-you-start)
- [Build a conversation](#build-a-conversation)
- [Conversation history](#conversation-history)
- [Choose the request format](#choose-the-request-format)
- [Stream a reply](#stream-a-reply)
- [Non-streaming and plain-text replies](#non-streaming-and-plain-text-replies)
- [Optional storage and app data](#optional-storage-and-app-data)
- [Verify and troubleshoot](#verify-and-troubleshoot)

## Before you start

`Fliplet.AI` is preloaded in Fliplet apps. Requests need valid Fliplet access and available AI credits; you do not need a separate provider key. See the [JavaScript reference](/API/core/ai) for method contracts and access requirements.

Choose and specify a compatible [text model](/API/core/ai/models#openai-text-models). The IDs in this guide are illustrative selections, not recommendations for every chatbot. Preserve a supported model requested by the user and use its request format. For conversations between people, use [Fliplet.Chat](/API/fliplet-chat).

For interactive conversations, writing assistants and explanation panels, show text as it arrives when the selected model supports streaming. Preserve explicit plain-text or non-streaming requirements; background tasks and structured JSON need their own output handling.

For reader-facing replies, present paragraphs, lists, emphasis, code and links as readable structure suited to the audience. Safely render Markdown when present unless the user or output contract requires plain text. Do not invent a plain-text-only instruction to avoid formatting the response.

### Example resources

Reuse an existing suitable renderer in your app framework. The plain JavaScript example below uses [Marked](https://marked.js.org/) to parse Markdown and [DOMPurify](https://github.com/cure53/DOMPurify) to sanitize the result. Marked alone does not sanitize HTML. These libraries are separate app resources; Studio's own renderer is not preloaded in your app.

For a V3 screen, declare these dependencies in its app resources. The registered `fliplet-socket` package enables Fliplet socket streaming and loads at app boot because it is declared eager below. Run the example after Fliplet is ready. The two named CDN resources load on demand using `Fliplet.require.lazy()` in the example:

```json
[
  "fliplet-socket",
  { "name": "ai-chat-marked", "latest": "https://cdn.jsdelivr.net/npm/marked@18.1.0/lib/marked.umd.js", "lazy": true },
  { "name": "ai-chat-purify", "latest": "https://cdn.jsdelivr.net/npm/dompurify@3.4.16/dist/purify.min.js", "lazy": true }
]
```

For other app setups, add `fliplet-socket` through [dependencies and assets](/Dependencies-and-assets), load the two pinned library URLs before this JavaScript and replace `ensureRenderer()`'s lazy-loading calls with your setup's loader. Keep its availability check and visible failure handling. Review security updates when maintaining pinned dependencies.

## Build a conversation

Add this HTML and CSS to your screen, then run the JavaScript after the controls exist and Fliplet is ready. This vanilla JavaScript browser example uses Chat Completions and updates DOM elements directly. It displays the user's turn immediately, updates one assistant message during streaming and stores both raw text turns only after success.

When adapting it to a framework, use that framework's state and rendering mechanisms. For Vue, follow [asynchronous reactive-state updates](/API/v3/frameworks/vue#updating-reactive-state-asynchronously) so callbacks update the reactive state read by the template.

Call the returned `disposeAIChat()` from your framework's unmount or route cleanup hook. The example also handles `pagehide`, which alone does not cover SPA navigation.

```html
<ol id="ai-chat-messages" aria-label="Conversation" aria-live="off" tabindex="0"></ol>
<form id="ai-chat-form">
  <label for="ai-chat-draft">Your message</label>
  <textarea id="ai-chat-draft" required></textarea>
  <button id="ai-chat-send" type="submit">Send</button>
  <button id="ai-chat-stop" type="button" disabled>Stop reply</button>
</form>
<p id="ai-chat-status" role="status"></p>
```

```css
#ai-chat-messages { box-sizing: border-box; width: 100%; min-width: 0; max-height: 60vh; overflow-y: auto; padding: 1rem 1rem 1rem 2rem; }
#ai-chat-messages li { margin-bottom: 1rem; overflow-wrap: anywhere; }
#ai-chat-messages pre { max-width: 100%; overflow-x: auto; white-space: pre; }
#ai-chat-messages table { display: block; max-width: 100%; overflow-x: auto; }
#ai-chat-messages small { display: block; }
#ai-chat-draft { display: block; width: 100%; box-sizing: border-box; }
```

```js
function requestReply(model, messages, onText) {
  const request = Fliplet.AI.createCompletion({ model: model, messages: messages, stream: true });
  request.stream(function(chunk) {
    const choice = chunk && chunk.choices && chunk.choices[0];
    const delta = choice && choice.delta && choice.delta.content;
    if (typeof delta === 'string') onText(delta);
  });
  return request;
}

function mountAIChat() {
  const form = document.getElementById('ai-chat-form');
  const draft = document.getElementById('ai-chat-draft');
  const sendButton = document.getElementById('ai-chat-send');
  const stopButton = document.getElementById('ai-chat-stop');
  const conversation = document.getElementById('ai-chat-messages');
  const status = document.getElementById('ai-chat-status');
  const history = []; // Raw text, never rendered HTML.
  const model = 'gpt-6.1-sol'; // Explicit illustrative selection; review the catalog.
  let active;
  let failedTurn;
  let disposed = false;

  function nearBottom() {
    return conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 48;
  }
  function message(label, text) {
    const item = document.createElement('li');
    const heading = document.createElement('strong');
    const body = document.createElement('div');
    const note = document.createElement('small');
    heading.textContent = label;
    body.textContent = text;
    item.append(heading, body, note);
    conversation.appendChild(item);
    return { item: item, body: body, note: note };
  }
  function paint(run) {
    const follow = nearBottom();
    // Parse the entire accumulated text: a delimiter can arrive in a later chunk.
    const html = window.marked.parse(run.reply);
    run.assistant.body.innerHTML = window.DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'del', 'blockquote',
        'pre', 'code', 'a', 'h1', 'h2', 'h3', 'h4', 'hr', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: ['href', 'title'],
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|\/(?!\/)|#)/i
    });
    if (follow) conversation.scrollTop = conversation.scrollHeight;
  }
  async function ensureRenderer() {
    await Promise.all([
      Fliplet.require.lazy('ai-chat-marked'),
      Fliplet.require.lazy('ai-chat-purify')
    ]);
    if (!window.marked || typeof window.marked.parse !== 'function' ||
        !window.DOMPurify || !window.DOMPurify.isSupported) {
      throw new Error('Reply formatting could not load. Check your connection and retry.');
    }
  }
  function stop() {
    if (!active || active.stopped) return;
    const run = active;
    run.stopped = true;
    stopButton.disabled = true;
    status.textContent = 'Stopping reply...';
    if (run.request && typeof run.request.cancel === 'function') run.request.cancel().catch(function() {
      if (!disposed && active === run) {
        status.textContent = 'Cancellation could not be confirmed. Waiting for the request to finish.';
      }
    });
  }
  async function submit(event) {
    event.preventDefault();
    if (disposed || active || !draft.value.trim()) return;
    const text = draft.value.trim();
    const follow = nearBottom();
    // Reuse the failed display turn on an unchanged retry; history is still unchanged.
    const turn = failedTurn && failedTurn.text === text ? failedTurn : {
      text: text, user: message('You', text), assistant: message('Assistant', '')
    };
    const run = { text: text, assistant: turn.assistant, reply: '', stopped: false };
    active = run;
    failedTurn = undefined;
    run.assistant.body.textContent = '';
    run.assistant.note.textContent = 'Waiting for a reply...';
    if (follow) conversation.scrollTop = conversation.scrollHeight;
    draft.disabled = sendButton.disabled = true;
    stopButton.disabled = false;
    form.setAttribute('aria-busy', 'true');
    status.textContent = 'Waiting for a reply...';
    try {
      await ensureRenderer();
      if (disposed || run.stopped) throw new Error('Reply stopped.');
      const userMessage = { role: 'user', content: text };
      const request = requestReply(model, history.concat([userMessage]), function(delta) {
        if (disposed || active !== run || run.stopped) return;
        if (typeof delta !== 'string' || !delta) return;
        run.reply += delta;
        try {
          paint(run); // Visible before the completion Promise settles.
          run.assistant.note.textContent = 'Reply in progress...';
        } catch (error) {
          run.renderError = error;
          stop();
        }
      });
      run.request = request;
      stopButton.disabled = typeof request.cancel !== 'function';
      const completion = await request;
      if (disposed) return;
      if (run.renderError) throw new Error('Reply formatting failed. Retry after checking the renderer.');
      if (run.stopped || (completion && completion.cancelled)) throw new Error('Reply stopped.');
      if (!run.reply.trim()) throw new Error('No text reply was returned.');
      paint(run); // Final render in the same message.
      history.push(userMessage, { role: 'assistant', content: run.reply });
      run.assistant.note.textContent = '';
      draft.value = '';
      status.textContent = 'Reply received. Read it in the conversation.';
    } catch (error) {
      if (disposed) return;
      failedTurn = turn;
      run.assistant.note.textContent = run.reply
        ? 'Interrupted reply; not added to conversation history.'
        : 'No completed reply; not added to conversation history.';
      status.textContent = ((error && error.message) || 'Request failed.') + ' Your draft is ready to retry.';
    } finally {
      if (!disposed && active === run) {
        active = undefined;
        draft.disabled = sendButton.disabled = false;
        stopButton.disabled = true;
        form.setAttribute('aria-busy', 'false');
      }
    }
  }
  function dispose() {
    disposed = true;
    form.removeEventListener('submit', submit);
    stopButton.removeEventListener('click', stop);
    window.removeEventListener('pagehide', dispose);
    if (active) {
      active.stopped = true;
      if (active.request && typeof active.request.cancel === 'function') active.request.cancel().catch(function() {});
    }
  }
  form.addEventListener('submit', submit);
  stopButton.addEventListener('click', stop);
  window.addEventListener('pagehide', dispose);
  return dispose; // Call from your framework's unmount/route cleanup hook too.
}
const disposeAIChat = mountAIChat();
```

The conversation is readable without announcing every chunk to a screen reader: the separate status reports waiting, completion or failure. Updates follow the bottom while the reader is there and preserve their position when they scroll back. Adapt the controls and styles to your app's design and audience.

## Conversation history

History contains raw `{ role, content }` messages, not the HTML used for display. Failed or stopped replies remain visibly interrupted and are excluded from successful history. Retrying an unchanged draft reuses the failed display turn and adds the successful user/assistant pair once. A changed draft starts a separate display turn.

Send a message, then ask about the reply. The next request includes the successful user and assistant turns. [`ask()`](/API/core/ai#initialization-and-ask) records submitted messages but does not append model replies. For long conversations, select relevant prior turns or summarize them before the next request; model context limits still apply. Keep stored history associated with its model and format and review it before changing providers or adding multimodal content or tools.

## Choose the request format

Replace `requestReply(model, messages, onText)` in the [complete browser example](#build-a-conversation) with the appropriate adapter below and set `model` to your supported selection. These adapters convert this guide's raw text history and deliver text to the same progressive renderer. Images, tool calls and tool results require the provider-specific structures in the [reference](/API/core/ai).

### Gemini conversation

Use a [Gemini text model](/API/core/ai/models#gemini-text-models), such as `gemini-3.5-flash`. Convert assistant history to the `model` role and omit thought parts from displayed replies.

```js
function requestReply(model, messages, onText) {
  const request = Fliplet.AI.createCompletion({
    model: model,
    contents: messages.map(function(message) {
      return { role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content }] };
    }),
    stream: true
  });
  request.stream(function(chunk) {
    const candidate = chunk && chunk.candidates && chunk.candidates[0];
    const parts = candidate && candidate.content && candidate.content.parts;
    (parts || []).forEach(function(part) {
      if (typeof part.text === 'string' && !part.thought) onText(part.text);
    });
  });
  return request;
}
```

### OpenAI Responses conversation

Use a [Responses-compatible model](/API/core/ai/models#openai-text-models), such as `gpt-6.1-sol`. Deliver only output-text delta events to the display.

```js
function requestReply(model, messages, onText) {
  const request = Fliplet.AI.createCompletion({
    model: model, useResponses: true,
    input: messages.map(function(message) { return { role: message.role, content: message.content }; }),
    stream: true
  });
  request.stream(function(chunk) {
    if (chunk && chunk.type === 'response.output_text.delta' && typeof chunk.delta === 'string') {
      onText(chunk.delta);
    }
  });
  return request;
}
```

## Stream a reply

The complete example above assembles chunks and renders before completion. Fliplet delivers chunks through its socket transport; normal completion resolves without an assembled answer. See the [streaming contract](/API/core/ai#streaming-with-createcompletion) for each request format's chunks and cancellation behavior.

Reparse the accumulated raw text as it grows, then sanitize before inserting it into the DOM. An incomplete Markdown delimiter may render differently until later chunks arrive; finalize the same message when the stream ends. For large replies, batch display updates without waiting for the entire request. Keep code blocks and tables within the screen width.

Cancellation is asynchronous. Keep the send guard active until the request settles, ignore late chunks after Stop or disposal, and distinguish partial output from a successful turn. Cancellation does not undo text already generated or guarantee that no credits were used. The example preserves partial text on error and keeps the draft for explicit retry; it does not automatically retry permission or credit failures.

## Non-streaming and plain-text replies

If the user requests a supported non-streaming model, preserve that choice and show a pending state while waiting. For Chat Completions, replace `requestReply` in the [complete browser example](#build-a-conversation) with this adapter. It renders the completed reply through the same safe renderer; the Stop button stays disabled because this buffered Promise has no cancellation method.

```js
async function requestReply(model, messages, onText) {
  const result = await Fliplet.AI.createCompletion({ model: model, messages: messages });
  const choice = result && result.choices && result.choices[0];
  const text = choice && choice.message && choice.message.content;
  if (typeof text !== 'string' || !text.trim()) throw new Error('No text reply was returned.');
  onText(text);
}
```

For a Responses-only non-streaming model, send `input` with `useResponses: true` and extract message content with `type: 'output_text'` from `result.output`; see [Responses](/API/core/ai#using-the-responses-api). For Gemini, use `contents` and extract non-thought text parts from `result.candidates[0].content.parts`; see [Gemini](/API/core/ai#using-gemini-models). Preserve the guard, pending/error state and raw history when adapting either format.

For explicitly plain-text replies in the [complete browser example](#build-a-conversation), replace the parser/sanitizer lines in `paint()` with `run.assistant.body.textContent = run.reply`, set that body's `white-space: pre-wrap`, and remove only the Markdown resources and their loading. In this example, `ensureRenderer()` loads only Markdown libraries, so its call can be removed. If your adapted loader also loads streaming dependencies, retain that part: a plain-text stream still needs `fliplet-socket`. Keep streaming if appropriate. Never display model output through unsanitized `innerHTML`.

The example's eager `fliplet-socket` dependency loads at app boot and is ready after Fliplet initialization. If your app instead declares that registered package as lazy, await its full dependency chain inside `submit()`'s `try` block before calling `requestReply()`. Keep the existing error/retry handling if loading fails:

```js
await Fliplet.require.lazy.chain('fliplet-socket');
```

## Optional storage and app data

Add persistence only if the feature needs it. [App storage](/API/core/storage) can retain a conversation on this device or browser. It does not provide server-enforced ownership or isolation between people using the same app on a shared device. Choose a retention policy, handle save failures and clear or separate history when the active user changes.

For shared or private server storage, use [Data Sources](/API/fliplet-datasources) with [access rules](/Data-source-security) that enforce the intended owner and operations. Establish identity through the app's genuine login flow and designated login data source; writable `Fliplet.Session.set()` fields do not establish authenticated ownership. If the app supports multiple logins, bind the rule to the intended login source and verify which account is active. Do not add a login or conversation data source to a chatbot that only needs temporary public conversation state.

The model does not automatically read app records. Query only records the current user is authorized to read, then include the smallest relevant context in the request. Treat record text as data, avoid sending unnecessary private fields and check authorization again when performing actions based on a reply. Uploading or storing private attachments also needs the [media API](/API/fliplet-media) and its permissions; data-source login bindings are not media access rules.

## Verify and troubleshoot

Check the requested behavior in your app:

- Send a first message and confirm text appears before completion when streaming is supported; check the actual chunk and end events, not only a loading indicator.
- Ask a follow-up that refers to the reply and inspect the request for both user and assistant history.
- Try rapid submits and confirm only one request is pending.
- Simulate an error or empty reply and confirm the draft survives and a retry adds the turn once.
- Check paragraphs, lists, emphasis, code and safe links with split Markdown delimiters. Confirm unsafe HTML, event handlers and unsafe link targets remain inert; raw history must retain the original text.
- For streaming, check completion, Stop reply, stream error, renderer loading failure and navigation during a reply. Interrupted text must not become successful history; late callbacks must not update a disposed screen.
- Review the rendered screen on desktop and phone widths, including long code, scrolling back during a reply and accessible status messages.
- If storage is requested, reload, switch users and test owner and unrelated-user access, including expired or absent login.

For access, credits and rate-limit errors, use the [error reference](/API/core/ai#shared-access-and-errors). A request that returns tool calls, a refusal or no text needs behavior appropriate to that response; this text-only example treats it as a recoverable failure. Do not automatically retry credit or permission errors. Allow an explicit retry after the issue is resolved.

## Related documentation

- [Fliplet.AI JavaScript reference](/API/core/ai)
- [AI models available through Fliplet](/API/core/ai/models)
- [Record or upload audio](/API/core/ai/audio-transcription)
- [App AI REST API](/REST-API/fliplet-ai)
