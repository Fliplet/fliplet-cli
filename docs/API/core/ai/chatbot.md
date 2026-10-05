---
title: Build an AI chatbot
description: "Build a model-generated conversation with explicit model selection, message history, streaming and recoverable errors."
type: how-to
tags: [js-api, ai, chatbot]
v3_relevant: true
deprecated: false
---
# Build an AI chatbot

Build a conversation in which an AI model generates replies using `Fliplet.AI`. Your app controls the conversation history, pending state and how replies appear.

## Contents

- [Before you start](#before-you-start)
- [Build a conversation](#build-a-conversation)
- [Choose the request format](#choose-the-request-format)
- [Stream a reply](#stream-a-reply)
- [Optional storage and app data](#optional-storage-and-app-data)
- [Verify and troubleshoot](#verify-and-troubleshoot)

## Before you start

`Fliplet.AI` is preloaded in Fliplet apps. Requests need valid Fliplet access and available AI credits; you do not need a separate provider key for this integration. See the [JavaScript reference](/API/core/ai) for the method contracts and access requirements.

Choose and specify a compatible [text model](/API/core/ai/models#openai-text-models). The IDs in this guide are illustrative selections, not a recommendation for every chatbot. If the user requests a supported model, preserve that choice and use its request format. For conversations between people, use [Fliplet.Chat](/API/fliplet-chat).

## Build a conversation

Add the HTML to your app screen and run the JavaScript after the controls exist. This framework-agnostic example uses OpenAI Chat Completions. It prevents overlapping sends, renders replies as text and keeps the draft on failure. History is kept in memory for this screen visit.

```html
<ol id="ai-chat-messages" aria-label="Conversation"></ol>
<form id="ai-chat-form">
  <label for="ai-chat-draft">Your message</label>
  <textarea id="ai-chat-draft" required></textarea>
  <button id="ai-chat-send" type="submit">Send</button>
</form>
<p id="ai-chat-status" role="status"></p>
```

```js
const form = document.getElementById('ai-chat-form');
const draft = document.getElementById('ai-chat-draft');
const sendButton = document.getElementById('ai-chat-send');
const conversation = document.getElementById('ai-chat-messages');
const status = document.getElementById('ai-chat-status');
const model = 'gpt-6.1-sol'; // Explicit example selection; check the model catalog for your task.
const history = [];
let pending = false;

function renderMessage(label, text) {
  const item = document.createElement('li');
  item.textContent = label + ': ' + text;
  conversation.appendChild(item);
}

async function requestReply(messages) {
  const result = await Fliplet.AI.createCompletion({ model: model, messages: messages });
  const message = result && result.choices && result.choices[0] && result.choices[0].message;
  const text = message && message.content;
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('No text reply was returned. Try again or review the model response.');
  }
  return text;
}

form.addEventListener('submit', async function(event) {
  event.preventDefault();
  if (pending || !draft.value.trim()) return;

  const userMessage = { role: 'user', content: draft.value.trim() };
  // Commit both turns only after success, so retry does not duplicate a failed turn.
  const messages = history.concat([userMessage]);
  pending = true;
  draft.disabled = true;
  sendButton.disabled = true;
  form.setAttribute('aria-busy', 'true');
  status.textContent = 'Waiting for a reply...';

  try {
    const reply = await requestReply(messages);
    history.push(userMessage, { role: 'assistant', content: reply });
    renderMessage('You', userMessage.content);
    renderMessage('Assistant', reply);
    draft.value = '';
    status.textContent = 'Reply received.';
  } catch (error) {
    status.textContent = (error && error.message) || 'Request failed. Your draft is ready to retry.';
  } finally {
    pending = false;
    draft.disabled = false;
    sendButton.disabled = false;
    form.setAttribute('aria-busy', 'false');
    draft.focus();
  }
});
```

<span id="conversation-history"></span>

Send a message, then ask a question about the reply. The second request includes the successful user and assistant turns. [`ask()`](/API/core/ai#initialization-and-ask) only records submitted messages; it does not append the model's replies. Use app-managed history for this conversation behavior.

For a long conversation, select the relevant prior turns or summarize them before submitting another request. Preserve the meaning and ordering needed for the follow-up. Model context limits still apply. Keep stored history associated with its selected model and format, and review it before changing providers or adding multimodal content or tools.

## Choose the request format

Use the format supported by your selected model. The example above uses `messages` and reads `choices[0].message.content`. Gemini uses `contents`; OpenAI Responses uses `input` with `useResponses: true`. Do not send a Chat Completions message array unchanged to every provider.

For plain-text conversations, you can replace `requestReply` in the complete example with one of the functions below. They convert this guide's app-managed `{ role, content }` history to the selected format. These conversions are for text turns only; images, tool calls and tool results require the full provider-specific structures in the reference.

### Gemini conversation

This function supplies an explicit Gemini model and uses `user` and `model` roles. See [Gemini request and response formats](/API/core/ai#using-gemini-models) and the [Gemini model catalog](/API/core/ai/models#gemini-text-models).

```js
async function requestReply(messages) {
  const result = await Fliplet.AI.createCompletion({
    model: 'gemini-3.5-flash', // Explicit example selection.
    contents: messages.map(function(message) {
      return {
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      };
    })
  });
  const candidate = result && result.candidates && result.candidates[0];
  const parts = candidate && candidate.content && candidate.content.parts;
  const text = (parts || []).filter(function(part) {
    return typeof part.text === 'string' && !part.thought;
  }).map(function(part) { return part.text; }).join('');
  if (!text.trim()) throw new Error('No text reply was returned. Your draft is ready to retry.');
  return text;
}
```

### OpenAI Responses conversation

This function resends the successful text turns as `input`. It extracts output text from message items rather than displaying the entire output object. See the [Responses contract](/API/core/ai#using-the-responses-api) and [compatible models](/API/core/ai/models#openai-text-models).

```js
async function requestReply(messages) {
  const result = await Fliplet.AI.createCompletion({
    model: 'gpt-6.1-sol', // Explicit example selection supporting Responses.
    useResponses: true,
    input: messages.map(function(message) {
      return { role: message.role, content: message.content };
    })
  });
  const text = ((result && result.output) || []).filter(function(item) {
    return item.type === 'message';
  }).flatMap(function(item) { return item.content || []; }).filter(function(part) {
    return part.type === 'output_text' && typeof part.text === 'string';
  }).map(function(part) { return part.text; }).join('');
  if (!text.trim()) throw new Error('No text reply was returned. Your draft is ready to retry.');
  return text;
}
```

## Stream a reply

Add the `fliplet-socket` dependency to the screen or app resources before enabling streaming. See [dependencies and assets](/Dependencies-and-assets) and the [streaming contract](/API/core/ai#streaming-with-createcompletion). Fliplet delivers chunks through its socket transport; the normal completion callback does not contain an assembled reply.

For the Chat Completions example, add these controls and replace `requestReply` with the code below. Partial text is shown separately and is added to conversation history only after successful completion. Cancellation and errors keep the draft ready to retry.

```html
<button id="ai-chat-stop" type="button" disabled>Stop reply</button>
<pre id="ai-chat-partial" aria-label="Reply in progress"></pre>
```

```js
const stopButton = document.getElementById('ai-chat-stop');
const partial = document.getElementById('ai-chat-partial');
let activeRequest;
let interrupted = false;

stopButton.addEventListener('click', function() {
  if (!activeRequest || interrupted) return;
  interrupted = true;
  stopButton.disabled = true;
  status.textContent = 'Stopping reply...';
  activeRequest.cancel().catch(function() {
    status.textContent = 'Could not confirm cancellation. Waiting for the stream to finish.';
  });
});

async function requestReply(messages) {
  let reply = '';
  interrupted = false;
  partial.textContent = '';
  try {
    const request = Fliplet.AI.createCompletion({ model: model, messages: messages, stream: true });
    activeRequest = request;
    stopButton.disabled = false;
    const completion = await request.stream(function(chunk) {
      const delta = chunk && chunk.choices && chunk.choices[0] && chunk.choices[0].delta;
      if (!interrupted && delta && typeof delta.content === 'string') {
        reply += delta.content;
        partial.textContent = reply;
      }
    });
    if (interrupted || (completion && completion.cancelled)) {
      throw new Error('Reply stopped. Your draft is ready to retry.');
    }
    if (!reply.trim()) throw new Error('No text reply was returned. Your draft is ready to retry.');
    partial.textContent = '';
    return reply;
  } catch (error) {
    if (partial.textContent) partial.textContent += '\n[Interrupted; not added to history]';
    throw error;
  } finally {
    activeRequest = undefined;
    stopButton.disabled = true;
  }
}
```

Keep the send guard active until the stream settles. A cancellation request is asynchronous and may race with completion. Do not treat partial output as a successful assistant turn. If your screen has a disposal or navigation hook, cancel its active request there and suppress callbacks after disposal. Cancellation does not undo output already generated or guarantee that no credits were used.

Gemini stream chunks contain `candidates[0].content.parts`; collect the text parts and omit thought parts when present. Responses streaming uses event objects such as `response.output_text.delta` with a `delta` string. Adapt the chunk handler to that format; the non-streaming response extraction above does not process stream events.

## Optional storage and app data

Add persistence only if the feature needs it. [App storage](/API/core/storage) can retain a conversation on this device or browser. It does not provide server-enforced ownership or isolation between people using the same app on a shared device. Choose a retention policy, handle save failures and clear or separate history when the active user changes.

For shared or private server storage, use [Data Sources](/API/fliplet-datasources) with [access rules](/Data-source-security) that enforce the intended owner and operations. Establish identity through the app's genuine login flow and designated login data source; writable `Fliplet.Session.set()` fields do not establish authenticated ownership. If the app supports multiple logins, bind the rule to the intended login source and verify which account is active. Do not add a login or conversation data source to a chatbot that only needs temporary public conversation state.

The model does not automatically read app records. Query only records the current user is authorized to read, then include the smallest relevant context in the request. Treat record text as data, avoid sending unnecessary private fields and check authorization again when performing actions based on a reply. Uploading or storing private attachments also needs the [media API](/API/fliplet-media) and its permissions; data-source login bindings are not media access rules.

## Verify and troubleshoot

Check the requested behavior in your app:

- Send a first message and confirm a visible text reply from the selected model.
- Ask a follow-up that refers to the reply and inspect the request for both user and assistant history.
- Try rapid submits and confirm only one request is pending.
- Simulate an error or empty reply and confirm the draft survives and a retry adds the turn once.
- For streaming, check partial text, normal completion, Stop reply and a stream error. Interrupted text must not become a successful history turn.
- If storage is requested, reload, switch users and test owner and unrelated-user access, including expired or absent login.

For access, credits and rate-limit errors, use the [error reference](/API/core/ai#shared-access-and-errors). A request that returns tool calls, a refusal or no text needs behavior appropriate to that response; this text-only example treats it as a recoverable failure. Do not automatically retry credit or permission errors. Allow an explicit retry after the issue is resolved.
