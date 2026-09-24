---
title: Fliplet.AI
description: "Build AI features with `Fliplet.AI` — chat, completions, streaming, image generation, transcription, and embeddings via OpenAI or Google Gemini proxies."
type: api-reference
tags: [js-api, core]
v3_relevant: true
deprecated: false
category: automation
capabilities: [ai, llm, openai, gemini, gpt, chatbot, chat completion, image generation, dall-e, transcription, whisper, embeddings, streaming completion, vision, multimodal, ai assistant]
---
# `Fliplet.AI`

Build AI features with `Fliplet.AI` — chat, completions, streaming, image generation, transcription, and embeddings via OpenAI (GPT, o-series) or Google Gemini proxies.

`Fliplet.AI` is available in Fliplet apps without a customer-supplied OpenAI or Gemini API key. For a multi-turn chatbot, keep both user and assistant messages in app state and pass them to `Fliplet.AI.createCompletion({ messages })`. The `Fliplet.AI().ask()` instance currently keeps only the messages passed to `ask()`; it does not append model replies to its history.

These APIs empower your apps with OpenAI models such as `GPT 3.5` to do things like:

- Draft an email or other piece of writing
- Write JavaScript or JSON code
- Answer questions about a set of documents
- Create conversational agents
- Give your apps a natural language interface
- Tutor in a range of subjects
- Translate app screens and much more

---

## Table of Contents

- [Initialization](#initialization)
- [Using Gemini Models](#using-gemini-models)
- [Instance Methods](#instance-methods)
- [Multi-turn conversation (chat)](#multi-turn-conversation-chat)
- [Single-turn tasks](#single-turn-tasks)
- [Static API Methods](#static-api-methods)
  - [`Fliplet.AI.createCompletion()`](#flipletaicreatecompletion)
  - [Using the Responses API](#using-the-responses-api)
  - [Streaming with `createCompletion()`](#streaming-with-createcompletion)
  - [`Fliplet.AI.generateImage()`](#flipletaigenerateimage)
  - [`Fliplet.AI.transcribeAudio()`](#flipletaitranscribeaudio)
  - [`Fliplet.AI.createEmbedding()`](#flipletaicreateembedding)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)

---

## Initialization

The `Fliplet.AI(options?: AIInstanceOptions)` function is used to initialize an instance of the AI APIs.

It optionally accepts an `options` object as its first argument, which can contain any of the [OpenAI chat completion attributes](https://platform.openai.com/docs/api-reference/chat/create).

**`AIInstanceOptions` Object Properties:**

| Parameter     | Type           | Optional | Default Value     | Description                                                                                                                                                           |
|---------------|----------------|----------|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| model       | String       | Yes      | 'gpt-3.5-turbo' | ID of the model to use. See the [model endpoint compatibility](https://platform.openai.com/docs/models/model-endpoint-compatibility) table for details.           |
| temperature | Number       | Yes      | 1               | What sampling temperature to use, between 0 and 2. Higher values (e.g., 0.8) make output more random; lower values (e.g., 0.2) make it more focused and deterministic. |
| n           | Number       | Yes      | 1               | How many chat completion choices to generate for each input message.                                                                                                    |
| stop        | String or Array | Yes      | null            | Up to 4 sequences where the API will stop generating further tokens (e.g., ["\n"]).                                                                             |
| stream      | Boolean      | Yes      | false           | If true, partial message deltas will be sent like in ChatGPT. Tokens are sent as data-only server-sent events as they become available.                             |

**Example:**

```javascript
/**
 * @typedef {Object} AIInstanceOptions
 * @property {string} [model='gpt-3.5-turbo'] - ID of the model to use.
 * @property {number} [temperature=1] - Sampling temperature (0-2).
 * @property {number} [n=1] - Number of chat completion choices.
 * @property {string|string[]} [stop] - Sequences to stop generation.
 * @property {boolean} [stream=false] - Whether to stream partial message deltas.
 */

/**
 * Initializes a new AI conversation instance.
 * @param {AIInstanceOptions} [options] - Configuration options for the AI instance.
 * @returns {AIInstance} An instance of the AI API.
 */
const conversation = Fliplet.AI({
  temperature: 0.8,
  model: 'gpt-4'
});

console.log('AI Instance Created:', conversation);
```

---

## Using Gemini Models

To use Gemini, provide a supported Gemini `model` ID (for example, `'gemini-2.5-flash'`) to `Fliplet.AI.createCompletion(options)`.

This will route your request directly to the Gemini API, allowing you to leverage its full capabilities, including function calling. When using the Gemini provider, your payload must conform to the Gemini API's request body structure. For instance, instead of `messages`, you will use the `contents` property, and you can include other Gemini-specific parameters like `tools`.

For more detailed information about Google's Gemini models, their capabilities, and the latest model IDs, please refer to the official Gemini API documentation: [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models).

**Example using Gemini for `Fliplet.AI.createCompletion()`:**

```javascript
// Example of a call to the Gemini API via Fliplet's proxy
Fliplet.AI.createCompletion({
  // For a list of available models, see: https://ai.google.dev/gemini-api/docs/models
  model: 'gemini-2.5-flash',
  contents: [
    { role: 'user', parts: [{ text: 'What is the weather in London' }] }
  ],
  'tools': [
    {
      'functionDeclarations': [
        {
          'name': 'get_current_temperature',
          'description': 'Gets the current temperature for a given location.',
          'parameters': {
            'type': 'object',
            'properties': {
              'location': {
                'type': 'string',
                'description': 'The city name, e.g. San Francisco'
              }
            },
            'required': ['location']
          }
        }
      ]
    }
  ]
}).then(function(result) {
  // The result will be the direct response from the Gemini API
  console.log(JSON.stringify(result, null, 2));
});
```

When using Gemini models, ensure that all parameters are compatible with how the Fliplet AI JS API integrates with Gemini. The `Fliplet.AI()` instance for multi-turn conversations is primarily designed for OpenAI models and may not support direct proxying to Gemini with a custom payload structure. For Gemini, using the static `Fliplet.AI.createCompletion()` method is recommended.

---

## Instance Methods

`Fliplet.AI(options)` returns an instance with `ask(message, role?, modelOverride?)` and a `messages` array. `role` is a string such as `'user'` or `'system'`; `modelOverride` is an optional model ID. Each `ask()` call appends the submitted message to `messages`, then sends those messages to the completion API. The instance does **not** append the model's reply. Use `Fliplet.AI.createCompletion()` with app-managed history for a chatbot.

```javascript
const conversation = Fliplet.AI({ model: 'gpt-4o-mini' });
const response = await conversation.ask('Summarize this note.');
const answer = response.choices[0].message.content;
```

For streaming on an instance, set `stream: true` in the **constructor**: `Fliplet.AI({ model: 'gpt-4o-mini', stream: true }).ask(message).stream(onChunk)`. This requires the `fliplet-socket` dependency. The second argument to `ask()` is a role string, not an options object; `ask(message, { stream: true })` does not enable streaming.

---

## Multi-turn conversation (chat)

Keep `{ role, content }` messages, including model replies, in app state. Send the relevant history on each turn. This lets follow-up questions refer to earlier answers. Persist the messages only if the app needs conversations to survive reloads, and apply the app's normal access rules to stored content.

```javascript
const history = [{ role: 'system', content: 'You are a helpful assistant.' }];

async function sendMessage(userText) {
  const next = [...history, { role: 'user', content: userText }];
  const result = await Fliplet.AI.createCompletion({
    model: 'gpt-4o-mini',
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

---

## Single-turn tasks

For single-turn tasks where conversation history is not needed between requests, you have two main options:

1.  **New `Fliplet.AI()` instance per task:** Each `Fliplet.AI()` creates a separate conversation.
    ```javascript
    // Task 1
    const result1 = await Fliplet.AI().ask('Act as a JS developer. Write a function to multiply two numbers.');
    console.log('Task 1 Result:', result1.choices[0].message.content);

    // Task 2 (different context)
    const result2 = await Fliplet.AI({ temperature: 0.5 }).ask('Act as a marketer. Write a welcome email.');
    console.log('Task 2 Result:', result2.choices[0].message.content);
    ```

2.  **`Fliplet.AI.createCompletion()`:** For direct access to model-specific completion parameters with explicit message history. See [Static API Methods](#static-api-methods).

---

## Static API Methods

These methods are called directly on the `Fliplet.AI` namespace (e.g., `Fliplet.AI.createCompletion()`). Use `createCompletion()` for both single-turn tasks and multi-turn chat when the app manages message history.

**Static Method Summary:**

| Method                  | Description                                                                    | Key Parameters (see details below)            | Returns         |
|-------------------------|--------------------------------------------------------------------------------|-----------------------------------------------|-----------------|
| createCompletion()    | Creates a text completion from an OpenAI `prompt`, OpenAI `messages`, or Gemini `contents`. | options (Object)                            | Promise<Object> |
| generateImage()       | Generates an image from a text prompt.                                         | options (Object)                            | Promise<Object> |
| transcribeAudio()     | Transcribes browser-recorded or uploaded audio.                                | audio (Blob or File), options (Object, optional) | `Promise<TranscriptionResponseObject>` |
| createEmbedding()     | Creates an embedding vector for input text.                                    | options (Object)                            | Promise<Object> |

### `Fliplet.AI.createCompletion()`

`Fliplet.AI.createCompletion(options: CompletionOptions): Promise<Object>`

This low-level method sends the payload shape required by the selected model. It supports OpenAI prompt completions, OpenAI chat messages, and Gemini `contents` requests.

**`CompletionOptions` Object Properties:**

For OpenAI requests, use parameters from the [OpenAI Completions API reference](https://platform.openai.com/docs/api-reference/completions/create) with `prompt` or the [OpenAI Chat Completions API reference](https://platform.openai.com/docs/api-reference/chat/create) with `messages`. For Gemini requests, use the Gemini `contents` format shown in [Using Gemini Models](#using-gemini-models).

**Key `CompletionOptions` include:**

| Parameter     | Type                        | Optional | Default        | Description                                                                                                                                                                                             |
|---------------|-----------------------------|----------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| model       | String                    | Yes      | See below      | Supported model ID. OpenAI chat requests default to `gpt-3.5-turbo` when `messages` is present. Prompt and Gemini requests should specify a model.           |
| messages    | `Array<MessageObject>`      | Yes      | undefined    | OpenAI chat messages. See [Multi-turn conversation (chat)](#multi-turn-conversation-chat).                                |
| prompt      | `String` or `Array<String>` | Yes      | undefined    | OpenAI prompt-completion input. Use this for models such as `text-davinci-003`.                                                                                                |
| contents    | `Array<GeminiContent>` | Yes | undefined | Gemini request contents. See [Using Gemini Models](#using-gemini-models). |
| temperature | Number                    | Yes      | Model dependent   | Sampling temperature when supported by the selected model.                                                                                                                                                                               |
| stream      | Boolean                   | Yes      | false        | If true, enables streaming when supported by the selected model. See [Streaming with createCompletion()](#streaming-with-createcompletion).                                                                                                |
| ...           | ...                         | Yes      | ...            | Other parameters supported by the selected model's request format.                                                                                           |

**Important:**
*   For OpenAI models, provide `messages` for chat requests or `prompt` for prompt-completion requests. Do not provide both.
*   For Gemini models, provide `contents` in Gemini's request format instead of OpenAI `messages` or `prompt`.
*   OpenAI prompt, OpenAI chat, and Gemini requests return their respective model-family response shapes. The Gemini `contents` example above returns a Gemini response, while OpenAI chat responses use `choices[0].message.content` and prompt-completion responses use `choices[0].text`.
*   If `model` is not provided when using OpenAI `messages`, it defaults to `'gpt-3.5-turbo'`.

**Returns:**

A `Promise` whose response shape depends on the selected model and payload. OpenAI prompt requests follow the [completion object](https://platform.openai.com/docs/api-reference/completions/object) shape, OpenAI chat requests follow the [chat completion object](https://platform.openai.com/docs/api-reference/chat/object) shape, and Gemini `contents` requests return Gemini's response shape.


**Example (Chat Completion):**

```javascript
/**
 * @typedef {Object} MessageObject
 * @property {string} role - e.g., 'user', 'system'.
 * @property {string} content - Message content.
 */

/**
 * @typedef {Object} CompletionOptionsChat
 * @property {string} [model='gpt-3.5-turbo'] - Model ID.
 * @property {MessageObject[]} messages - Array of message objects.
 * @property {number} [temperature=1]
 * @property {boolean} [stream=false]
 * // ... other OpenAI chat parameters
 */

/**
 * @typedef {Object} CompletionOptionsPrompt
 * @property {string} model - Model ID (e.g., 'text-davinci-003'). Required.
 * @property {string|string[]} prompt - Prompt string(s).
 * @property {number} [temperature=1]
 * @property {boolean} [stream=false]
 * // ... other OpenAI completion parameters
 */

async function runChatCompletion() {
  try {
    const params = {
      // model: 'gpt-3.5-turbo', // Defaults to 'gpt-3.5-turbo' if messages is present
      messages: [{ role: 'user', content: 'Hello, AI!' }],
      temperature: 0.7
    };
    console.log('Input for createCompletion (chat):', params);
    const result = await Fliplet.AI.createCompletion(params);
    console.log('createCompletion Response (chat):', result);
    if (result.choices && result.choices.length > 0) {
      console.log('AI Reply:', result.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error in createCompletion (chat):', error);
  }
}
runChatCompletion();
```

**Example (Prompt-based Completion):**

```javascript
async function runPromptCompletion() {
  try {
    const params = {
      model: 'text-davinci-003', // Required for prompt-based
      prompt: 'Say this is a test for text-davinci-003.',
      temperature: 0
    };
    console.log('Input for createCompletion (prompt):', params);
    const result = await Fliplet.AI.createCompletion(params);
    console.log('createCompletion Response (prompt):', result);
    if (result.choices && result.choices.length > 0) {
      console.log('AI Reply:', result.choices[0].text);
    }
  } catch (error) {
    console.error('Error in createCompletion (prompt):', error);
  }
}
runPromptCompletion();
```

### Using the Responses API

The `Fliplet.AI.createCompletion()` method supports OpenAI's newer [Responses API](https://platform.openai.com/docs/api-reference/responses) via the `useResponses` parameter. The Responses API combines the strengths of the Chat Completions and Assistants APIs into a single streamlined interface, offering native integration for web search, file search, and other built-in tools.

**`useResponses` Parameter:**

| Parameter     | Type    | Optional | Default | Description                                                                                                                                                           |
|---------------|---------|----------|---------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| useResponses | Boolean | Yes      | false | When set to `true`, uses OpenAI's newer Responses API format instead of the traditional Chat Completions format. This provides access to advanced features like built-in tools and stateful conversations. |

**Important Notes:**

- When `useResponses: true`, the method uses the Responses API format
- You are responsible for formatting requests and handling responses according to the Responses API specification
- **Request parameters must conform to the Responses API specification**, which differs from Chat Completions:
  - Responses API uses `input` (string or array) instead of `messages` array
  - Responses API uses `text.format` for structured outputs instead of `response_format`
  - Responses API uses `reasoning.effort` instead of `reasoning_effort`
  - Function calling API shape is different in both request and response
- **Response structure follows the Responses API format**, which differs from Chat Completions:
  - Returns `output` instead of a `choices` array
  - Returns a typed response object with its own `id`
  - Stream events are distinct, typed events (e.g., `response.created`, `response.output_text.delta`)
- The Responses API includes built-in tools like web search and file search
- Supports stateful conversations via `previous_response_id` parameter
- For detailed information, refer to:
  - [OpenAI Responses API documentation](https://platform.openai.com/docs/api-reference/responses/create)
  - [Responses vs. Chat Completions comparison](https://platform.openai.com/docs/guides/responses-vs-chat-completions)

**Example (Using Responses Endpoint):**

```javascript
async function useResponsesEndpoint() {
  try {
    const params = {
      model: 'gpt-4o',
      input: 'Explain the concept of quantum computing in simple terms.', // Use 'input' instead of 'messages'
      temperature: 0.7,
      useResponses: true // Route to /v1/responses endpoint
    };
    console.log('Input for createCompletion (responses endpoint):', params);
    const result = await Fliplet.AI.createCompletion(params);
    console.log('createCompletion Response (responses endpoint):', result);
    // Handle response according to Responses API format
    // Response structure: result.output instead of result.choices[0].message.content
    if (result.output) {
      console.log('AI Reply:', result.output);
    }
  } catch (error) {
    console.error('Error in createCompletion (responses endpoint):', error);
  }
}
useResponsesEndpoint();
```

**Example (Using Responses Endpoint with Array Input):**

```javascript
async function useResponsesEndpointWithMessages() {
  try {
    const params = {
      model: 'gpt-4o',
      // Input can also be an array of messages for conversation context
      input: [
        { role: 'system', content: 'You are a helpful assistant specializing in quantum physics.' },
        { role: 'user', content: 'Explain the concept of quantum computing in simple terms.' }
      ],
      temperature: 0.7,
      useResponses: true
    };
    console.log('Input for createCompletion (responses endpoint with array):', params);
    const result = await Fliplet.AI.createCompletion(params);
    console.log('createCompletion Response (responses endpoint):', result);
    if (result.output) {
      console.log('AI Reply:', result.output);
    }
  } catch (error) {
    console.error('Error in createCompletion (responses endpoint):', error);
  }
}
useResponsesEndpointWithMessages();
```

**Example (Default Chat Completions Endpoint):**

```javascript
async function useChatCompletionsEndpoint() {
  try {
    const params = {
      model: 'gpt-4',
      messages: [{ role: 'user', content: 'Explain the concept of quantum computing in simple terms.' }],
      temperature: 0.7,
      useResponses: false // Or omit this parameter - defaults to /v1/chat/completions
    };
    console.log('Input for createCompletion (chat completions endpoint):', params);
    const result = await Fliplet.AI.createCompletion(params);
    console.log('createCompletion Response (chat completions endpoint):', result);
    if (result.choices && result.choices.length > 0) {
      console.log('AI Reply:', result.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error in createCompletion (chat completions endpoint):', error);
  }
}
useChatCompletionsEndpoint();
```

### Streaming with `createCompletion()`

To stream responses from `Fliplet.AI.createCompletion()`, set the `stream: true` property in the `options` object. This requires the `fliplet-socket` dependency and returns a streamable object with `.stream()`, `.then()`, and `.catch()` methods. Collect the chunks yourself; the completion callback does not provide an assembled reply.

`Fliplet.AI.createCompletion({ ...options, stream: true }).stream(onChunkCallback).then(onCompleteCallback).catch(onErrorCallback)`

**Callbacks:**

*   `onChunkCallback(data: StreamChunkObject)`: Called for each partial message delta. For chat models, read `chunk.choices[0].delta.content` when present. Refer to OpenAI documentation for the [chat completion chunk object](https://platform.openai.com/docs/api-reference/chat/streaming#object) or other model-specific streaming objects.
*   `onCompleteCallback(finalResponse?: Object)`: Called when all chunks are received. Its shape depends on the selected model.
*   `onErrorCallback(error: Error)`: Called on error.

**Example (Streaming with `createCompletion` for a chat model):**

```javascript
const completionParams = {
  model: 'gpt-4-0125-preview', // or any chat model
  messages: [{ role: 'user', content: 'Write me a short poem about coding.' }],
  stream: true,
  temperature: 0.8
};

console.log('Input for streaming createCompletion:', completionParams);

Fliplet.AI.createCompletion(completionParams)
  .stream(function onChunk(chunk) {
    console.log('Stream Chunk:', chunk); // Raw chunk
    if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
      // process.stdout.write(chunk.choices[0].delta.content); // For Node.js like environment
    }
  })
  .then(function onComplete(finalResponse) {
    console.log('\nStream Complete. Final response object (if available):', finalResponse);
  })
  .catch(function onError(error) {
    console.error('\nStream Error:', error);
  });
```

### `Fliplet.AI.generateImage()`

`Fliplet.AI.generateImage(options: GenerateImageOptions): Promise<ImageResponseObject>`

Generates an original image based on a text prompt using OpenAI's image generation models.

**`GenerateImageOptions` Object Properties:**
(Based on [OpenAI Create Image API](https://platform.openai.com/docs/api-reference/images/create))

| Parameter        | Type     | Optional | Default Value | Description                                                                                                |
|------------------|----------|----------|---------------|------------------------------------------------------------------------------------------------------------|
| prompt         | String | No       |               | A text description of the desired image(s). Maximum length 1000 characters.                                |
| n              | Number | Yes      | 1           | The number of images to generate. Must be between 1 and 10.                                                |
| size           | String | Yes      | '1024x1024' | The size of the generated images. Must be one of '256x256', '512x512', or '1024x1024'.                 |
| response_format| String | Yes      | 'url'       | The format in which the generated images are returned. Must be one of 'url' or 'b64_json'.               |
| model          | String | Yes      | gpt-image-1.5 | The model to use for image generation (e.g. gpt-image-1.5, dall-e-3). |
| quality        | String | Yes      | standard    | The quality of the image. 'standard' or 'hd'.                                       |
| style          | String | Yes      | vivid       | The style of the generated images. 'vivid' or 'natural'.                            |
| user           | String | Yes      |               | A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.       |


**Returns:**

A `Promise` that resolves to an `ImageResponseObject`. Refer to the OpenAI documentation for the [image object](https://platform.openai.com/docs/api-reference/images/object) structure.


**Example:**

```javascript
/**
 * @typedef {Object} GenerateImageOptions
 * @property {string} prompt - Text description of the image.
 * @property {number} [n=1] - Number of images (1-10).
 * @property {'256x256'|'512x512'|'1024x1024'} [size='1024x1024'] - Image size.
 * @property {'url'|'b64_json'} [response_format='url'] - Response format.
 * @property {string} [model='gpt-image-1.5'] - Model to use.
 * @property {'standard'|'hd'} [quality='standard'] - Image quality.
 * @property {'vivid'|'natural'} [style='vivid'] - Image style.
 * @property {string} [user] - End-user identifier.
 */

/**
 * @typedef {Object} ImageData
 * @property {string} [url] - URL of the image if response_format is 'url'.
 * @property {string} [b64_json] - Base64 JSON string if response_format is 'b64_json'.
 */

/**
 * @typedef {Object} ImageResponseObject
 * @property {number} created - Timestamp.
 * @property {ImageData[]} data - Array of image data objects.
 */

async function generateAnImage() {
  try {
    const params = {
      prompt: "A futuristic cityscape at sunset, digital art",
      n: 1,
      size: "1024x1024",
      response_format: "url", // or 'b64_json'
      model: "gpt-image-1.5"
    };
    console.log('Input for generateImage:', params);
    const result = await Fliplet.AI.generateImage(params);
    console.log('generateImage Response:', result);
    if (result.data && result.data.length > 0) {
      if (params.response_format === 'url') {
        console.log('Image URL:', result.data[0].url);
      } else {
        console.log('Image B64 JSON starts with:', result.data[0].b64_json.substring(0, 30) + '...');
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
  }
}
generateAnImage();
```

### `Fliplet.AI.transcribeAudio()`

`Fliplet.AI.transcribeAudio(audio: Blob | File, options?: TranscribeAudioOptions): Promise<TranscriptionResponseObject>`

Transcribes an uploaded `File` or the `Blob` produced by a browser `MediaRecorder`. The API posts to the current app only; it does not expose the organization-scoped Studio route.

**Parameters:**

| Parameter | Type | Optional | Default value | Description |
|-----------|------|----------|---------------|-------------|
| audio | Blob or File | No | — | Audio with a supported MIME type. A named `File` remains supported. |
| options | TranscribeAudioOptions | Yes | `{}` | Upload metadata, cancellation, and the operation deadline. |

**`TranscribeAudioOptions` properties:**

| Property | Type | Optional | Default value | Description |
|----------|------|----------|---------------|-------------|
| filename | String | Yes | The `File.name`, then a MIME-derived name | Non-blank multipart filename. It overrides a `File` name. |
| signal | AbortSignal | Yes | — | Cancels the browser-side request. |
| timeout | Number | Yes | `120000` | Caller’s maximum wait deadline in milliseconds. It covers readiness, automatic authentication refresh, upload, retry, and waiting for a response. See [Errors and limits](#errors-and-limits) for provider-handoff semantics. |
| model | String | Yes | `gpt-4o-mini-transcribe` | One of `gpt-4o-mini-transcribe`, `gpt-4o-transcribe`, or `whisper-1`. |

An own optional property with the value `undefined` behaves as if it were omitted. This applies to `filename`, `signal`, `timeout`, and `model`. `null` and other invalid values reject with `TypeError`.

The server accepts these base MIME types: `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav`, and `audio/ogg`. MIME parameters are accepted because the server validates the base MIME type: for example, `audio/webm;codecs=opus` is valid. The maximum audio-file size is 25 MiB (`25 × 1024 × 1024` bytes), inclusive. A file one byte larger returns HTTP `413`.

When `filename` is omitted, the wrapper uses the `File` name when one exists. For a plain `Blob`, it derives `audio.webm`, `audio.mp4`, `audio.mp3`, `audio.wav`, or `audio.ogg` from those base MIME types. It falls back to `audio.webm` for an empty or unsupported MIME type, but the MIME type remains authoritative and the server returns `415` for unsupported audio.

The `model` option selects a supported transcription model. Model selection affects AI credit usage: `gpt-4o-transcribe` uses more credits for the same audio duration than the default `gpt-4o-mini-transcribe` and `whisper-1`. `prompt`, `language`, `response_format`, `temperature`, and other provider-specific transcription options are not supported by this method and are not sent to the transcription provider.

**Returns:**

A `Promise` that resolves to exactly a `TranscriptionResponseObject` with the transcript in `text`.

```javascript
/**
 * @typedef {Object} TranscriptionResponseObject
 * @property {string} text - The transcribed text.
 */
```

### Browser recording example

Add these controls to an app screen, then add the script below. The app owns the recording UI, device choice, duration, and where to insert the returned text; `Fliplet.AI` only uploads audio for transcription.

```html
<button id="dictation-record" type="button">Start recording</button>
<button id="dictation-cancel" type="button" disabled>Cancel</button>
<p id="dictation-status" role="status"></p>
<pre id="dictation-transcript"></pre>
```

```javascript
const recordButton = document.getElementById('dictation-record');
const cancelButton = document.getElementById('dictation-cancel');
const statusElement = document.getElementById('dictation-status');
const transcriptElement = document.getElementById('dictation-transcript');
const allowedMimeTypes = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
const recorderMimeTypes = [
  'audio/webm;codecs=opus',
  'audio/mp4;codecs=mp4a.40.2',
  'audio/mp4'
];
const filenameByMimeType = {
  'audio/webm': 'dictation.webm',
  'audio/mp4': 'dictation.mp4',
  'audio/mpeg': 'dictation.mp3',
  'audio/wav': 'dictation.wav',
  'audio/ogg': 'dictation.ogg'
};
const maxRecordingMs = 5 * 60 * 1000; // Example UI cap; choose a duration appropriate to the app.

let stream;
let recorder;
let chunks = [];
let phase = 'idle';
let cancelled = false;
let stopPromise;
let recordingTimer;
let abortController;

function baseMimeType(mimeType) {
  return (mimeType || '').split(';', 1)[0].trim().toLowerCase();
}

function setStatus(message) {
  statusElement.textContent = message;
}

function clearRecordingTimer() {
  window.clearTimeout(recordingTimer);
  recordingTimer = undefined;
}

function releaseMicrophone() {
  if (stream) {
    stream.getTracks().forEach(function(track) {
      track.stop();
    });
  }

  stream = undefined;
}

function updateControls() {
  recordButton.disabled = phase !== 'idle' && phase !== 'recording';
  recordButton.textContent = phase === 'recording' ? 'Stop and transcribe' : 'Start recording';
  cancelButton.disabled = phase === 'idle';
}

function recorderOptions() {
  if (!MediaRecorder.isTypeSupported) {
    return undefined;
  }

  const mimeType = recorderMimeTypes.find(function(candidate) {
    return MediaRecorder.isTypeSupported(candidate);
  });

  return mimeType ? { mimeType: mimeType } : undefined;
}

function recordedBlob() {
  const mimeType = baseMimeType(recorder.mimeType || (chunks[0] && chunks[0].type));

  return new Blob(chunks, { type: mimeType });
}

function stopRecorder() {
  if (stopPromise) {
    return stopPromise;
  }

  if (!recorder) {
    return Promise.reject(new Error('There is no recorder to stop.'));
  }

  if (recorder.state === 'inactive') {
    return Promise.resolve(recordedBlob());
  }

  stopPromise = new Promise(function(resolve, reject) {
    recorder.addEventListener('stop', function() {
      resolve(recordedBlob());
    }, { once: true });
    recorder.addEventListener('error', function(event) {
      reject(event.error || new Error('The recorder failed.'));
    }, { once: true });
    recorder.stop(); // Flushes the final dataavailable chunk before stop.
  });

  return stopPromise;
}

function reset() {
  clearRecordingTimer();
  releaseMicrophone();
  recorder = undefined;
  chunks = [];
  stopPromise = undefined;
  abortController = undefined;
  phase = 'idle';
  updateControls();
}

function showError(error) {
  if (error.name === 'NotAllowedError') {
    setStatus('Microphone permission was denied.');
  } else if (error.name === 'NotFoundError') {
    setStatus('No microphone is available.');
  } else if (error.name === 'NotReadableError') {
    setStatus('The microphone is already in use or cannot be read.');
  } else if (error.name === 'AbortError') {
    setStatus('Transcription cancelled.');
  } else if (error.name === 'TimeoutError') {
    setStatus('Transcription timed out after two minutes.');
  } else if (error.name === 'TypeError') {
    setStatus('Invalid audio or transcription options.');
  } else if (error.status === 400) {
    setStatus('The audio upload was invalid.');
  } else if (error.status === 401 || error.status === 403) {
    setStatus('You are not allowed to transcribe audio in this app.');
  } else if (error.status === 402) {
    setStatus('This organization has insufficient AI credits.');
  } else if (error.status === 413) {
    setStatus('The audio file is larger than 25 MiB.');
  } else if (error.status === 415) {
    setStatus('This browser produced an unsupported audio format.');
  } else if (error.status === 429) {
    setStatus('Too many transcription requests. Wait and try again.');
  } else if (error.message) {
    setStatus(error.message);
  } else {
    setStatus('The transcription request failed. Check the connection and try again.');
  }
}

async function startRecording() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !window.MediaRecorder) {
    setStatus('This browser cannot record audio.');
    return;
  }

  cancelled = false;
  phase = 'preparing';
  transcriptElement.textContent = '';
  setStatus('Requesting microphone permission…');
  updateControls();

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (cancelled) {
      setStatus('Recording cancelled.');
      reset();
      return;
    }

    const options = recorderOptions();

    // If no preferred MIME type is supported, let the browser choose one.
    recorder = options ? new MediaRecorder(stream, options) : new MediaRecorder(stream);
    chunks = [];
    recorder.addEventListener('dataavailable', function(event) {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    });
    recorder.addEventListener('error', function(event) {
      // stopRecorder() owns errors once stopping starts. During active
      // recording there is no stop promise to clean up the microphone.
      if (phase === 'recording') {
        showError(event.error || new Error('The recorder failed.'));
        reset();
      }
    });
    recorder.start();
    phase = 'recording';
    recordingTimer = window.setTimeout(stopAndTranscribe, maxRecordingMs);
    setStatus('Recording. It will stop after five minutes.');
  } catch (error) {
    showError(error);
    reset();
  }

  updateControls();
}

async function stopAndTranscribe() {
  if (phase !== 'recording') {
    return;
  }

  phase = 'stopping';
  clearRecordingTimer();
  updateControls();

  try {
    const audio = await stopRecorder();

    // The completed Blob no longer needs the microphone. Do not hold it open
    // while a transcription request can take up to two minutes.
    releaseMicrophone();

    if (cancelled) {
      setStatus('Recording cancelled.');
      return;
    }

    const mimeType = baseMimeType(audio.type);
    if (!allowedMimeTypes.includes(mimeType)) {
      throw new Error('The recorder produced an unsupported MIME type: ' + (mimeType || 'none'));
    }

    phase = 'transcribing';
    abortController = typeof AbortController === 'function' ? new AbortController() : undefined;
    const options = {
      filename: filenameByMimeType[mimeType],
      model: 'gpt-4o-mini-transcribe', // The default transcription model.
      timeout: 120000
    };

    if (abortController) {
      options.signal = abortController.signal;
    }

    setStatus('Transcribing…');
    updateControls();
    const result = await Fliplet.AI.transcribeAudio(audio, options);

    // A browser without AbortController cannot stop the upload. Ignore its late result.
    if (!cancelled) {
      transcriptElement.textContent = result.text;
      setStatus('Transcription complete.');
    }
  } catch (error) {
    if (cancelled && error.name === 'AbortError') {
      setStatus('Transcription cancelled.');
    } else {
      showError(error);
    }
  } finally {
    reset();
  }
}

async function cancelDictation() {
  cancelled = true;
  clearRecordingTimer();

  if (phase === 'preparing') {
    setStatus('Cancelling microphone request…');
    return;
  }

  if (phase === 'recording' || phase === 'stopping') {
    setStatus('Cancelling recording…');

    if (phase === 'recording') {
      stopAndTranscribe();
    }

    return;
  }

  if (phase === 'transcribing') {
    if (abortController) {
      abortController.abort();
      setStatus('Cancelling transcription…');
    } else {
      setStatus('Upload cannot be aborted in this browser; its result will be ignored.');
    }
  }
}

recordButton.addEventListener('click', function() {
  if (phase === 'recording') {
    stopAndTranscribe();
  } else if (phase === 'idle') {
    startRecording();
  }
});
cancelButton.addEventListener('click', cancelDictation);
updateControls();
```

The example intentionally does not copy Studio's dictation UI or controller. Before provider handoff, cancellation stops processing, so no provider call or charge occurs. After handoff, cancellation stops the caller waiting for a result. Fliplet lets the provider request continue; if it completes successfully, usage is metered and the organization may be charged.

### Errors and limits

Invalid `audio`, `options`, `filename`, `signal`, `timeout`, or `model` values reject with `TypeError` before a request begins. A caller cancellation rejects with `name: 'AbortError'` and `code: 'ABORT_ERR'`. The client deadline rejects with `name: 'TimeoutError'` and `code: 'ETIMEDOUT'`.

The 120-second timeout has the same provider-handoff boundary as cancellation. Before handoff, it stops processing. After handoff, it stops the caller waiting while Fliplet lets an already-started provider request continue. If that request completes successfully, usage is metered and the organization may be charged.

The server can also return HTTP `400` (invalid request), `401` (not authenticated), `402` (insufficient AI credits), `403` (not permitted), `413` (audio exceeds 25 MiB), `415` (unsupported MIME type), or `429` (rate limited). Treat other failures as transport or server errors and allow the user to retry.

### `Fliplet.AI.createEmbedding()`

`Fliplet.AI.createEmbedding(options: CreateEmbeddingOptions): Promise<EmbeddingResponseObject>`

Creates an embedding vector (a list of floating-point numbers) representing the input text. Embeddings are useful for tasks like semantic search, clustering, and classification.

**`CreateEmbeddingOptions` Object Properties:**
(Based on [OpenAI Create Embeddings API](https://platform.openai.com/docs/api-reference/embeddings/create))

| Parameter | Type                        | Optional | Default Value             | Description                                                                                                                                                                                              |
|-----------|-----------------------------|----------|---------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| input   | String or Array<String> | No       |                           | Input text to embed, encoded as a string or an array of strings (for multiple inputs in one request). Each input must not exceed the model's max input tokens (e.g., 8191 for text-embedding-ada-002). |
| model   | String                    | No       | 'text-embedding-ada-002' (usually) | ID of the embedding model to use (e.g., 'text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'). **Must be specified.**                                                                    |
| encoding_format | String          | Yes      | 'float'                  | The format to return the embeddings in. Can be float or base64.                                                                                                                                      |
| dimensions | Number                 | Yes      | Model dependent           | The number of dimensions the resulting output embedding should have. Only supported in text-embedding-3 and later models.                                                                             |
| user    | String                    | Yes      |                           | A unique identifier representing your end-user.                                                                                                                                                        |

**Returns:**

A `Promise` that resolves to an `EmbeddingResponseObject`. Refer to the OpenAI documentation for the [embedding object](https://platform.openai.com/docs/api-reference/embeddings/object) structure.


**Example:**

```javascript
/**
 * @typedef {Object} CreateEmbeddingOptions
 * @property {string|string[]} input - Text or array of texts to embed.
 * @property {string} model - Embedding model ID (e.g., 'text-embedding-ada-002').
 * @property {'float'|'base64'} [encoding_format='float'] - Embedding return format.
 * @property {number} [dimensions] - Output embedding dimensions (for newer models).
 * @property {string} [user] - End-user identifier.
 */

/**
 * @typedef {Object} EmbeddingData
 * @property {string} object - Usually "embedding".
 * @property {number[]} embedding - The embedding vector if encoding_format is 'float'.
 * @property {string} embedding - The embedding vector if encoding_format is 'base64'.
 * @property {number} index - Index of the input.
 */

/**
 * @typedef {Object} EmbeddingUsage
 * @property {number} prompt_tokens - Tokens in the input.
 * @property {number} total_tokens - Total tokens.
 */

/**
 * @typedef {Object} EmbeddingResponseObject
 * @property {string} object - Usually "list".
 * @property {EmbeddingData[]} data - Array of embedding data objects.
 * @property {string} model - Model used.
 * @property {EmbeddingUsage} usage - Token usage.
 */

async function generateEmbedding() {
  try {
    const params = {
      input: "The food was delicious and the waiter was very attentive.",
      model: "text-embedding-ada-002" // Example: ensure you use a valid, available model
      // encoding_format: 'float', // Default
    };
    console.log('Input for createEmbedding:', params);
    const result = await Fliplet.AI.createEmbedding(params);
    console.log('createEmbedding Response:', result);
    if (result.data && result.data.length > 0) {
      console.log('Embedding vector (first 3 values):', result.data[0].embedding.slice(0, 3));
      console.log('Embedding dimensions:', result.data[0].embedding.length);
    }
  } catch (error) {
    console.error('Error creating embedding:', error);
  }
}
generateEmbedding();
```

---

## Rate Limiting

Rate limits for the Fliplet AI JS API are based on your Fliplet pricing plan. Exceeding these limits will result in errors.

| Plan Category                                  | Per Day Limit | Per Minute Limit |
|------------------------------------------------|---------------|------------------|
| **Enterprise Plans** (Enterprise, Bronze, Silver, Gold, Platinum) | 10,000 requests | 100 requests     |
| **Private and Private+ Plans**                 | 10,000 requests | 100 requests     |
| **Public Plan**                                | 1,000 requests  | 100 requests     |
| **Free Plan**                                  | 100 requests    | 10 requests      |

**Note:**
*   These limits apply to the overall usage of the AI APIs under your account/organization.
*   When a rate limit is exceeded, the API will typically return an error response (e.g., HTTP status code 429 Too Many Requests). Check the specific error message for details.

---

## Error Handling

All API methods (`ask()`, `createCompletion()`, etc.) return Promises. Errors can be caught using `.catch()` on the Promise or with `try...catch` blocks if using `async/await`.

**Common Error Scenarios:**

*   **API Errors:** Issues from the OpenAI backend (e.g., model overload, invalid request parameters not caught by client-side validation). The error object should contain details.
*   **Rate Limit Errors:** As described above, often an HTTP 429 error.
*   **Network Errors:** Connectivity issues between the client and the server.
*   **Input Validation Errors:** If required parameters are missing or invalid (though some may be caught by client-side checks within the Fliplet API wrapper itself).
*   **Authentication/Authorization Errors:** If the API key is invalid or lacks permissions (usually handled by Fliplet's infrastructure).

**Example of Basic Error Handling:**

```javascript
async function performAIAction() {
  const conversation = Fliplet.AI();
  try {
    console.log('Attempting AI action...');
    const response = await conversation.ask("This is a test prompt.");
    console.log("AI Action Succeeded:", response.choices[0].message.content);
  } catch (error) {
    console.error("AI Action Failed. Error Object:", error);
    // You can inspect error.message, error.response, error.statusCode etc.
    // depending on how Fliplet structures errors from the AI service.
    // e.g. if (error.response && error.response.status === 429) { console.error("Rate limit exceeded."); }
  }
}

performAIAction();
```
It is recommended to implement robust error handling in your application, providing appropriate feedback to users.
