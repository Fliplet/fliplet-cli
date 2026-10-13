---
title: Fliplet.AI
description: "Generate text and images, transcribe audio and create embeddings with Fliplet.AI. Covers request formats, streaming, models and limits."
type: api-reference
tags: [js-api, core]
v3_relevant: true
deprecated: false
category: automation
capabilities: [ai, llm, openai, gemini, gpt, chatbot, chat completion, image generation, dall-e, transcription, whisper, embeddings, streaming completion, vision, multimodal, ai assistant]
---
# `Fliplet.AI`

Generate text and images, transcribe audio and create embeddings through Fliplet. `Fliplet.AI` is preloaded in apps and uses Fliplet access and AI credits without a customer-supplied OpenAI or Gemini key.

`Fliplet.AI` runs models through Fliplet’s server API and requires an internet connection. It does not provide an on-device model or offline inference.

## Table of contents

- [AI methods](#ai-methods)
- [AI models](#ai-models)
- [First request](#first-request)
- [API reference](#api-reference)
  - [Initialization](#initialization)
  - [Instance methods](#instance-methods)
  - [Completions](#flipletaicreatecompletion)
  - [Streaming](#streaming-with-createcompletion)
  - [Images](#flipletaigenerateimage)
  - [Transcription](#flipletaitranscribeaudio)
  - [Embeddings](#flipletaicreateembedding)
- [Rate limiting](#rate-limiting)
- [Error handling](#error-handling)
- [Usage examples](#usage-examples)
- [Model catalog](#model-catalog)
- [Fallback defaults](#fallback-defaults)
- [Deprecated and retired models](#deprecated-and-retired-models)
- [Related guides](#related-guides)

<a id="choose-a-method"></a>

## AI methods

| Feature | Method | Model category |
| --- | --- | --- |
| Generated text, summaries or an AI chatbot | [createCompletion()](#flipletaicreatecompletion); [ask()](#instance-methods) for a single text request | [OpenAI text](/API/core/ai/models#openai-text-models) or [Gemini text](/API/core/ai/models#gemini-text-models) |
| OpenAI image generation | [generateImage()](#flipletaigenerateimage) | [Images](/API/core/ai/models#image-models) |
| Gemini image generation | [createCompletion() with Gemini contents](#gemini-image-generation) | [Images](/API/core/ai/models#image-models) |
| Audio transcription | [transcribeAudio()](#flipletaitranscribeaudio) | [Transcription](/API/core/ai/models#transcription-models) |
| Text vectors for semantic search | [createEmbedding()](#flipletaicreateembedding) | [Embeddings](/API/core/ai/models#embedding-models) |

For messages between people, use [Fliplet.Chat](/API/fliplet-chat). The [chatbot guide](/API/core/ai/chatbot) covers app-managed conversation history and UI behavior.

<a id="model-selection-and-fallback-defaults"></a>

<a id="choose-a-model"></a>

## AI models

Specify a compatible `model` ID from [AI models available through Fliplet](/API/core/ai/models). Honor a supported user-selected model; otherwise choose for the task's capabilities and cost constraints. Catalog order and example IDs are not a suitability ranking. Omitting `model` uses a [fallback](#fallback-defaults), including incompatible fallbacks for some text formats.

An alias pins the requested ID, while the provider can change the version behind it. A compatible dated snapshot can pin a version but remains subject to retirement. Fliplet remaps the [legacy image IDs](#image-models).

App JavaScript uses the current app and its Fliplet authentication context. An external integration needs its own Fliplet token and the correct regional API URL and app ID; see the [app AI REST reference](/REST-API/fliplet-ai). Native availability does not grant access to private app data: fetch only authorized records and include only the context needed for the request.

## First request

This single-turn example uses Chat Completions with an explicitly selected illustrative model. Replace the model only with one compatible with the same format, or adapt the request and response handling together.

```javascript
async function summarizeNote(note) {
  try {
    const result = await Fliplet.AI.createCompletion({
      model: 'gpt-6.1-sol',
      messages: [{ role: 'user', content: 'Summarize this note in one sentence: ' + note }]
    });
    const answer = result && result.choices && result.choices[0] &&
      result.choices[0].message && result.choices[0].message.content;

    if (typeof answer !== 'string' || !answer.trim()) {
      throw new Error('No text reply was returned.');
    }

    return answer;
  } catch (error) {
    console.error('Could not summarize the note:', error);
    throw error; // The caller can retain the draft and show a retry control.
  }
}

summarizeNote('The workshop starts at 9 AM. Bring a laptop.').then(console.log).catch(function() {});
```

## API reference

<a id="initialization-and-ask"></a>

### Initialization

`Fliplet.AI(options?: Object): AIInstance`

Creates an instance for OpenAI Chat Completions. The wrapper supplies only the completion model fallback; it does not insert `temperature`, `n` or `stop` defaults. Their supported values and defaults depend on the model and [Chat Completions schema](https://platform.openai.com/docs/api-reference/chat/create).

| Option | Type | Behavior |
| --- | --- | --- |
| model | String, optional | Select explicitly. Omission uses the [JavaScript completion fallback](#fallback-defaults). |
| temperature | Number, optional | Sampling setting where the chosen model supports it. |
| n | Number, optional | Number of choices where supported by the chosen model. |
| stop | String or Array of Strings, optional | Stop sequences where supported by the chosen model. |
| stream | Boolean, optional | `true` enables [Fliplet socket streaming](#streaming-with-createcompletion). Omission uses a non-streaming request. |

```javascript
const conversation = Fliplet.AI({ model: 'gpt-6.1-sol' });
```

### Instance methods

`conversation.ask(message: String, role?: String, modelOverride?: String)`

Appends the submitted message to `conversation.messages` and sends that array as Chat Completions `messages`. `role` defaults to `'user'`; `modelOverride` applies to that call. Non-string `message` throws synchronously. A failed request still leaves the submitted message in the instance's array.

The instance does not append model replies. For a chatbot with follow-up questions, manage relevant user and assistant messages through `createCompletion()`; see [conversation history](/API/core/ai/chatbot#conversation-history).

```javascript
async function askOnce() {
  try {
    const conversation = Fliplet.AI({ model: 'gpt-6.1-sol' });
    const result = await conversation.ask('Suggest a title for a workshop on teamwork.');
    const text = result && result.choices && result.choices[0] &&
      result.choices[0].message && result.choices[0].message.content;
    if (typeof text !== 'string' || !text.trim()) throw new Error('No text reply was returned.');
    console.log(text);
  } catch (error) {
    console.error('The title request failed:', error);
  }
}
askOnce();
```

For streaming, set `stream: true` in the constructor and attach `.stream(onChunk)` to the returned request. The second `ask()` argument is a role string, not an options object. Use static `createCompletion()` for Responses or Gemini input.

### Static API methods

| Method | Input | Result |
| --- | --- | --- |
| [createCompletion()](#flipletaicreatecompletion) | Model-specific text request | Provider response, or a streamable Promise |
| [generateImage()](#flipletaigenerateimage) | Image model and prompt | Image response with base64 data |
| [transcribeAudio()](#flipletaitranscribeaudio) | Blob/File and upload options | `{ text: String }` |
| [createEmbedding()](#flipletaicreateembedding) | Text and embedding model | `{ data: [{ embedding, index, object }], model, object, usage }` |

### `Fliplet.AI.createCompletion()`

`Fliplet.AI.createCompletion(options: Object): Promise`

Send the payload required by the selected model. The return value depends on `stream`:

| Mode | Returned request | Resolved value |
| --- | --- | --- |
| Buffered (`stream` omitted or `false`) | Promise | The provider response object for the selected format. |
| Streaming (`stream: true`) | Promise with `.stream(onChunk)`, `.cancel()` and `.guid` | `undefined` on normal completion, or `{ cancelled: true }` on cancellation. Accumulate reply text from callbacks; see the [streaming contract](#streaming-with-createcompletion). |

| Field | Type | Required or behavior |
| --- | --- | --- |
| model | String | Technically optional; explicitly select a compatible [text model](/API/core/ai/models#openai-text-models). |
| messages | Array of message objects | Chat Completions input. |
| input | String or Array of input items | Responses input; also set `useResponses: true`. |
| useResponses | Boolean | `true` chooses OpenAI Responses. Omit for Gemini. |
| contents | Array of Gemini content objects | Gemini input, with an explicit Gemini model. |
| stream | Boolean | `true` chooses streaming; omit or use `false` for a buffered response. |
| prompt | String or Array of Strings | Legacy non-streaming OpenAI completion format. Its [REST fallback is retired](#fallback-defaults); use messages or Responses for new work. |

Use one input format per request. A truthy `prompt` selects the legacy route on a non-streaming call, even if other input fields are also present.

#### Chat Completions

Use `messages: [{ role, content }]` and read `choices[0].message.content` for a plain text reply. Include relevant user and assistant replies when the task needs conversation history. Other response content, including refusal or tool calls, requires handling appropriate to the requested feature; an absent text reply is not a successful text result.

The [first request](#first-request) is a complete Chat Completions example. See [OpenAI's Chat Completions reference](https://platform.openai.com/docs/api-reference/chat/create) for message content, supported roles and model-specific fields.

#### Using the Responses API

Set `useResponses: true` and provide `input`. The returned JSON contains typed `output` items, not a `choices` array. Extract text from message content with `type: 'output_text'`; other output items can contain reasoning, tool calls or refusals.

```javascript
async function summarizeWithResponses() {
  try {
    const result = await Fliplet.AI.createCompletion({
      model: 'gpt-6.1-sol',
      useResponses: true,
      input: 'Summarize the purpose of a project kickoff meeting in one sentence.'
    });
    const text = (result && result.output || []).filter(function(item) {
      return item.type === 'message';
    }).flatMap(function(item) {
      return item.content || [];
    }).filter(function(part) {
      return part.type === 'output_text' && typeof part.text === 'string';
    }).map(function(part) {
      return part.text;
    }).join('\n');

    if (!text.trim()) throw new Error('No text reply was returned.');
    console.log(text);
  } catch (error) {
    console.error('The Responses request failed:', error);
  }
}
summarizeWithResponses();
```

For app-managed conversation context, `input` can also be an array such as `[{ role: 'user', content: 'Hello' }, { role: 'assistant', content: 'Hello! How can I help?' }, { role: 'user', content: 'Suggest a meeting agenda.' }]`. Preserve model-required tool items when using tools. Do not assume every Responses provider feature, including retrieval, background execution or provider-stored conversations, has a matching Fliplet integration. See the [Responses schema](https://platform.openai.com/docs/api-reference/responses/create) and [chatbot guide](/API/core/ai/chatbot).

#### Using Gemini models

Use `createCompletion({ model, contents })`. `contents` uses `{ role, parts }`; for a text request, each part is `{ text }`. Read `candidates[0].content.parts` and collect its text parts.

```javascript
async function summarizeWithGemini() {
  try {
    const result = await Fliplet.AI.createCompletion({
      model: 'gemini-3.5-flash',
      contents: [{ role: 'user', parts: [{ text: 'Summarize the purpose of a project kickoff meeting.' }] }]
    });
    const candidate = result && result.candidates && result.candidates[0];
    const text = (candidate && candidate.content && candidate.content.parts || [])
      .filter(function(part) { return typeof part.text === 'string' && !part.thought; })
      .map(function(part) { return part.text; }).join('\n');

    if (!text.trim()) throw new Error('No text reply was returned.');
    console.log(text);
  } catch (error) {
    console.error('The Gemini request failed:', error);
  }
}
summarizeWithGemini();
```

Use `role: 'model'` for Gemini replies in conversation history. `generationConfig`, `systemInstruction` and `tools` use the [Gemini generateContent schema](https://ai.google.dev/api/generate-content). Declaring a function does not execute it: the app must validate and authorize the requested operation, run it and send its result in Gemini's format.

#### Additional request parameters

Provider fields belong to the same options object, but depend on the model and endpoint.

| Format | Examples of provider fields |
| --- | --- |
| Chat Completions | `temperature`, `max_completion_tokens`, `response_format`, `reasoning_effort`, `tools` |
| Responses | `max_output_tokens`, `text.format`, `reasoning.effort`, `tools` |
| Gemini | `generationConfig`, `systemInstruction`, `tools` |

Fliplet consumes `useResponses` for OpenAI routing and `stream` for Gemini routing. For streaming Chat Completions it adds `stream_options.include_usage: true`. Responses calls receive a compaction setting when the caller does not supply `context_management`. This does not maintain the app's displayed conversation history. Keep the relevant history and apply provider context limits; Fliplet's Chat Completions token warning does not enforce an app input cap or automatically trim messages.

### Streaming with `createCompletion()`

#### Dependency and transport

Streaming requires the `fliplet-socket` dependency on the app or screen. If it is missing, `createCompletion()` throws synchronously. Fliplet sends the completion request over HTTP and delivers provider chunks through Fliplet sockets; the browser does not receive an SSE response from the app endpoint.

#### Chunk payloads

Register `.stream(onChunk)` immediately. The callback receives nonterminal payloads, including keepalive events. Ignore chunks without the expected content. Build the displayed reply in app state:

| Request format | Text in a callback payload |
| --- | --- |
| Chat Completions | `chunk.choices[0].delta.content`, when present |
| Responses | `chunk.delta` when `chunk.type === 'response.output_text.delta'` |
| Gemini | Text parts of `chunk.candidates[0].content.parts` |

#### Completion and cancellation

Normal completion resolves the Promise with `undefined`. Cancellation resolves it with `{ cancelled: true }` after the socket cancellation event. The completion callback does not receive the assembled answer, including for Responses. Errors reject with the socket error payload, which need not be an `Error` instance.

To cancel, retain the request and call `await request.cancel()`, or use `Fliplet.AI.cancel(request.guid)`. Cancellation asks Fliplet to abort the active provider stream. A cancellation acknowledgement may report that the signal was broadcast; it is not proof that no generation or charge occurred. Keep partial text visibly interrupted and handle failure/retry in the app. The [chatbot guide](/API/core/ai/chatbot#build-a-conversation) covers progressive display, safe formatting and UI state.

#### Console streaming example

This plain JavaScript example uses Chat Completions and logs accumulated text as chunks arrive. It demonstrates the API lifecycle; it has no on-screen renderer. Load `fliplet-socket` and run after Fliplet is ready.

For an on-screen reply, use the [chatbot rendering workflow](/API/core/ai/chatbot#build-a-conversation). Framework callbacks must update the state used by their renderer; Vue apps should follow [asynchronous reactive-state updates](/API/v3/frameworks/vue#updating-reactive-state-asynchronously).

```javascript
async function streamReply() {
  let text = '';
  try {
    const request = Fliplet.AI.createCompletion({
      model: 'gpt-6.1-sol',
      messages: [{ role: 'user', content: 'Write a short welcome message for workshop participants.' }],
      stream: true
    });
    request.stream(function(chunk) {
      const choice = chunk && chunk.choices && chunk.choices[0];
      const delta = choice && choice.delta && choice.delta.content;
      if (typeof delta === 'string') {
        text += delta;
        console.log(text); // Incremental console output, before the request settles.
      }
    });
    const completion = await request;
    if (completion && completion.cancelled) return;
    if (!text.trim()) throw new Error('No text reply was returned.');
    console.log('Completed reply:', text);
  } catch (error) {
    console.error('Streaming failed:', error);
  }
}
streamReply();
```

The console shows growing text while the request is pending, then logs the completed accumulated reply. `await request` supplies completion status, not that text.

### `Fliplet.AI.generateImage()`

`Fliplet.AI.generateImage(options: Object): Promise<ImageResponseObject>`

Generate OpenAI images from `prompt` with an explicit [image model](/API/core/ai/models#image-models). The response has `created` and `data`; GPT image data contains `b64_json`. It is not a hosted image URL.

| Field | Type | Behavior |
| --- | --- | --- |
| prompt | String, required | Image description. |
| model | String, optional | Select explicitly; see [fallback/remapping](#fallback-defaults). |
| n | Number, optional | Number of images, subject to model limits. |
| size | String, optional | Model-supported size; the example uses `1024x1024`. |
| quality | String, optional | Model-supported quality, such as `low`, `medium`, `high` or `auto` for GPT images. |
| output_format | String, optional | `png`, `jpeg` or `webp` where supported. |
| user | String, optional | Provider end-user identifier; does not establish Fliplet authorization. |

The wrapper does not insert image option defaults. Fliplet removes `response_format` and `style` for GPT image models. Provider defaults and constraints apply to the other fields. See the [OpenAI image schema](https://platform.openai.com/docs/api-reference/images/create).

```javascript
async function displayGeneratedImage() {
  try {
    const result = await Fliplet.AI.generateImage({
      model: 'gpt-image-2',
      prompt: 'An illustration of a workshop room with people collaborating at tables',
      n: 1,
      size: '1024x1024',
      output_format: 'png'
    });
    const imageData = result && result.data && result.data[0] && result.data[0].b64_json;
    if (typeof imageData !== 'string' || !imageData) throw new Error('No image was returned.');
    const image = document.createElement('img');
    image.alt = 'Generated workshop illustration';
    image.src = 'data:image/png;base64,' + imageData;
    document.body.appendChild(image);
  } catch (error) {
    console.error('Image generation failed:', error);
  }
}
displayGeneratedImage();
```

Store the image through the [media API](/API/fliplet-media) only if it needs to persist. The app owns storage authorization and the conversion from base64 data to an upload.

#### Gemini image generation

For configured Gemini image models, use `createCompletion()` with `contents` and Gemini `generationConfig`, rather than treating the OpenAI image options as interchangeable. The response contains image parts with `inlineData.mimeType` and base64 `inlineData.data`. Text parts may appear before the image.

```javascript
async function displayGeminiImage() {
  try {
    const result = await Fliplet.AI.createCompletion({
      model: 'gemini-3.1-flash-image',
      contents: [{ role: 'user', parts: [{ text: 'Draw a workshop room with people collaborating.' }] }],
      generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
    });
    const candidate = result && result.candidates && result.candidates[0];
    const parts = candidate && candidate.content && candidate.content.parts || [];
    const imagePart = parts.find(function(part) { return part.inlineData && part.inlineData.data; });
    if (!imagePart) throw new Error('No image was returned.');
    const image = document.createElement('img');
    image.alt = 'Generated workshop illustration';
    image.src = 'data:' + imagePart.inlineData.mimeType + ';base64,' + imagePart.inlineData.data;
    document.body.appendChild(image);
  } catch (error) {
    console.error('Gemini image generation failed:', error);
  }
}
displayGeminiImage();
```

See [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation) for supported models and generation options. Fliplet's `generateImage()` Gemini adapter uses a different request transformation; current Gemini image compatibility through that method has not been established.

### `Fliplet.AI.transcribeAudio()`

`Fliplet.AI.transcribeAudio(audio: Blob | File, options?: Object): Promise<{ text: String }>`

Uploads an existing Blob/File to the current app and returns exactly `{ text }`. The app owns file selection, recording and transcript insertion; see [record or upload audio](/API/core/ai/audio-transcription).

| Option | Type | Behavior |
| --- | --- | --- |
| filename | String, optional | Nonblank multipart filename. Overrides `File.name`; otherwise the wrapper uses the file name or a MIME-derived name. |
| model | String, optional | Only `gpt-4o-mini-transcribe`, `gpt-4o-transcribe` or `whisper-1` are accepted. See [transcription models](/API/core/ai/models#transcription-models). |
| signal | AbortSignal, optional | Cancels the caller's request. |
| timeout | Number, optional | Finite positive deadline in milliseconds. Default `120000`; covers readiness, auth refresh, upload, retry and waiting for the response. |

Own optional properties with `undefined` are omitted; `null` and other invalid values reject with `TypeError`. `prompt`, `language`, `response_format`, `temperature` and other provider options are not forwarded by this method.

Accepted base MIME types are `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav` and `audio/ogg`. Codec suffixes such as `audio/webm;codecs=opus` are accepted. Audio size is at most 25 MiB (`25 * 1024 * 1024` bytes), inclusive. The server checks size and MIME type. Blob fallback filenames are `audio.webm`, `audio.mp4`, `audio.mp3`, `audio.wav` and `audio.ogg`; an unsupported or empty MIME type gets `audio.webm` as its filename but is still rejected by the server.

```javascript
async function transcribeFile(file) {
  try {
    const result = await Fliplet.AI.transcribeAudio(file, { model: 'gpt-4o-mini-transcribe' });
    if (!result.text.trim()) throw new Error('No transcript was returned.');
    return result.text;
  } catch (error) {
    console.error('Transcription failed:', error);
    throw error;
  }
}
// Pass the File from an input[type=file] change handler; keep it for retry.
```

#### Errors and limits

Invalid audio/options/filename/signal/timeout/model values reject with `TypeError` before the request. Caller cancellation rejects with `name: 'AbortError'`, `code: 'ABORT_ERR'`; the deadline rejects with `name: 'TimeoutError'`, `code: 'ETIMEDOUT'`.

Before provider handoff, cancellation or timeout stops processing without a provider call. After handoff, it stops the caller waiting; an already-started provider request continues and successful usage may be charged. This behavior differs from completion-stream cancellation.

The server can return `400` for missing/invalid audio or an unsupported transcription model, `413` for audio over 25 MiB or `415` for an unsupported MIME type. Authentication, permission, credit and rate-limit failures can return `401`, `403`, `402` or `429`. Keep the file and allow retry; see [audio cancellation and retry](/API/core/ai/audio-transcription#cancellation-timeout-and-retry).

### `Fliplet.AI.createEmbedding()`

`Fliplet.AI.createEmbedding(options: Object): Promise<EmbeddingResponseObject>`

Returns text vectors for semantic search, clustering or classification. Specify a compatible [embedding model](/API/core/ai/models#embedding-models).

| Field | Type | Behavior |
| --- | --- | --- |
| input | String or Array of Strings, required | Text to embed. Provider token limits apply per input and request. |
| model | String, optional | Select explicitly; see [fallbacks](#fallback-defaults). |
| encoding_format | String, optional | `'float'` for numeric vectors or `'base64'` for encoded vectors. Provider default is `'float'`. |
| dimensions | Number, optional | Output dimensions for models supporting this field, including `text-embedding-3` models. |
| user | String, optional | Provider end-user identifier; does not establish Fliplet authorization. |

The response contains `object`, `data`, `model` and `usage`. Each data item contains `object`, `index` and `embedding: number[] | string`, according to `encoding_format`. `usage` contains `prompt_tokens` and `total_tokens`. See the [OpenAI embedding schema](https://platform.openai.com/docs/api-reference/embeddings/create).

```javascript
async function embedNote() {
  try {
    const result = await Fliplet.AI.createEmbedding({
      model: 'text-embedding-3-small',
      input: 'The workshop starts at 9 AM. Bring a laptop.',
      encoding_format: 'float'
    });
    const vector = result && result.data && result.data[0] && result.data[0].embedding;
    if (!Array.isArray(vector) || !vector.length) throw new Error('No numeric vector was returned.');
    console.log(vector);
  } catch (error) {
    console.error('Embedding failed:', error);
  }
}
embedNote();
```

Use the same model and dimensions for stored records and search queries. A model change can require regenerating stored vectors; see [embedding compatibility](/API/core/ai/models#embedding-models).

## Rate limiting

AI requests are subject to app AI rate limits and credit availability. Additional plan limits below apply to apps using the V2 engine. V3 apps use V3 credit metering and bypass these per-plan caps; the shared app AI rate limit still applies.

| V2 plan | Requests per day | Requests per minute |
| --- | --- | --- |
| Free | 100 | 10 |
| Public and Private | 1,000 | 100 |
| Public+, Private+, Enterprise, Bronze, Silver, Gold and Platinum | 10,000 | 100 |

Plan quotas are counted for the app, using its master app ID where applicable. Actual limits may be overridden by the organization's plan configuration. An exhausted limit returns `429`; insufficient AI credit capacity returns `402`.

<a id="shared-access-and-errors"></a>

## Error handling

Catch asynchronous failures with `try...catch` or `.catch()`. Completion setup can also throw synchronously, including a missing streaming dependency or invalid `ask()` message. Provider request failures may return `400` even when the underlying provider error has another code. Preserve the error payload for diagnosis; do not assume every failure has the same JavaScript shape.

Show a useful error and retain the user's input. Validate the expected response shape before treating a request as successful. Retry transient connection or rate-limit failures with a delay; correct invalid payloads, unavailable models, access or credit problems before retrying. A timed-out request is not proof that no provider work or charge occurred.

## Usage examples

The text examples below select a model explicitly. See the API reference for [image generation](#flipletaigenerateimage), [audio recording and transcription](#flipletaitranscribeaudio), and [embeddings](#flipletaicreateembedding).

### Multi-turn conversation (chat)

This buffered example illustrates request history. For an interactive UI with progressive replies and safe formatting, use the [chatbot guide](/API/core/ai/chatbot#build-a-conversation).

Keep `{ role, content }` messages, including model replies, in app state. Send the relevant history on each turn. This lets follow-up questions refer to earlier answers. Persist the messages only if the app needs conversations to survive reloads, and apply the app's normal access rules to stored content.

```javascript
const history = [{ role: 'system', content: 'You are a helpful assistant.' }];

async function sendMessage(userText) {
  const next = [...history, { role: 'user', content: userText }];
  const result = await Fliplet.AI.createCompletion({
    model: 'gpt-6.1-sol',
    messages: next
  });
  const answer = result && result.choices && result.choices[0] &&
    result.choices[0].message && result.choices[0].message.content;

  if (typeof answer !== 'string' || !answer.trim()) {
    throw new Error('The assistant did not return a reply.');
  }

  history.push({ role: 'user', content: userText });
  history.push({ role: 'assistant', content: answer });
  return answer;
}
```

Handle loading, errors, and an empty response in the app UI. Keep the user's draft for retry if the call fails. If the conversation grows beyond the model's context limit, trim or summarize older messages deliberately; the API does not manage that history for the app.

### Single-turn tasks

For single-turn tasks where conversation history is not needed between requests, you have two main options:

1.  **New `Fliplet.AI()` instance per task:** Each `Fliplet.AI()` creates a separate conversation.
    ```javascript
    // Task 1
    const result1 = await Fliplet.AI({ model: 'gpt-6.1-sol' }).ask('Act as a JS developer. Write a function to multiply two numbers.');
    const text1 = result1 && result1.choices && result1.choices[0] && result1.choices[0].message && result1.choices[0].message.content;
    if (typeof text1 !== 'string' || !text1.trim()) throw new Error('No text reply was returned.');
    console.log('Task 1 Result:', text1);

    // Task 2 (different context)
    const result2 = await Fliplet.AI({ model: 'gpt-6.1-sol' }).ask('Act as a marketer. Write a welcome email.');
    const text2 = result2 && result2.choices && result2.choices[0] && result2.choices[0].message && result2.choices[0].message.content;
    if (typeof text2 !== 'string' || !text2.trim()) throw new Error('No text reply was returned.');
    console.log('Task 2 Result:', text2);
    ```

2.  **`Fliplet.AI.createCompletion()`:** For direct access to model-specific completion parameters with explicit message history. See [static API methods](#static-api-methods).


### Browser recording example

For microphone capture, final audio chunks, cleanup and transcription, use the complete [recording and upload example](/API/core/ai/audio-transcription#complete-recording-and-upload-example). The [method reference](#flipletaitranscribeaudio) shows the call for an existing Blob or File.

## Model catalog

[AI models available through Fliplet](/API/core/ai/models) owns the configured IDs, compatibility, provider facts and retirement notices. Select a model compatible with the method and request format.

### OpenAI text models

See [OpenAI text models](/API/core/ai/models#openai-text-models) for IDs and request-format compatibility.

#### GPT-4o family

The [OpenAI catalog](/API/core/ai/models#gpt-4o-family) includes the GPT-4o family.

### Gemini text models

See [Gemini text models](/API/core/ai/models#gemini-text-models). These use Gemini `contents` and response handling.

### Image models

See [image models and legacy ID remapping](/API/core/ai/models#image-models), including the different OpenAI and Gemini method paths.

### Transcription models

See [accepted transcription models](/API/core/ai/models#transcription-models) and their availability notices.

### Embedding models

See [embedding models and vector compatibility](/API/core/ai/models#embedding-models).

## Fallback defaults

Omitting `model` uses a fallback, not a suitability recommendation. The [fallback table](/API/core/ai/models#fallback-defaults) gives the JavaScript and direct REST values; JavaScript completions insert their own fallback before calling REST.

## Deprecated and retired models

See [deprecated and retired models](/API/core/ai/models#deprecated-and-retired-models) before selecting or migrating a model. A historical configuration entry does not establish provider availability.

### Deprecated OpenAI text models

See [OpenAI retirement notices](/API/core/ai/models#deprecated-openai-text-models).

### Historical Gemini text models

See [historical Gemini IDs](/API/core/ai/models#historical-gemini-text-models).

### Retired image models

See [retired image IDs](/API/core/ai/models#retired-image-models).

### Historical IDs and additional provider models

See [JavaScript metadata and additional provider IDs](/API/core/ai/models#historical-ids-and-additional-provider-models). Exported metadata and successful proxy routing do not establish provider availability.

## Related guides

- [AI models available through Fliplet](/API/core/ai/models): configured IDs, provider facts, fallback defaults and retirement notices.
- [Build an AI chatbot](/API/core/ai/chatbot): conversation state, send/retry controls and streaming.
- [Record or upload audio](/API/core/ai/audio-transcription): file selection, microphone capture and transcript insertion.
- [App AI REST API](/REST-API/fliplet-ai): external requests and authentication.
