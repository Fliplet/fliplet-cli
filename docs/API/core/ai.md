# AI (Artificial Intelligence)

<p class="warning">These features are still in beta and are subject to change before they are released to all apps and customers.</p>

The Fliplet AI JS API is built on top of the [OpenAI API](https://openai.com/docs/api-reference/) to provide developers with an easy way to build AI-powered applications.

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
  - [`ask()`](#ask)
  - [Streaming with `ask()`](#streaming-with-ask)
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

In addition to OpenAI models, the Fliplet AI JS API now supports direct proxy integration with Google's Gemini models. To use a Gemini model, specify `aiProvider: 'gemini'` and the `model` ID (e.g., `'gemini-1.5-flash'`) in your `Fliplet.AI.createCompletion(options)` request.

This will route your request directly to the Gemini API, allowing you to leverage its full capabilities, including function calling. When using the Gemini provider, your payload must conform to the Gemini API's request body structure. For instance, instead of `messages`, you will use the `contents` property, and you can include other Gemini-specific parameters like `tools`.

For more detailed information about Google's Gemini models, their capabilities, and the latest model IDs, please refer to the official Gemini API documentation: [https://ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models).

**Example using Gemini for `Fliplet.AI.createCompletion()`:**

```javascript
// Example of a call to the Gemini API via Fliplet's proxy
Fliplet.AI.createCompletion({
  // For a list of available models, see: https://ai.google.dev/gemini-api/docs/models
  model: 'gemini-2.5-flash',
  aiProvider: 'gemini',
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

The instance object returned from `Fliplet.AI()` exposes the following methods.

**Instance Method Summary:**

| Method   | Description                                      | Parameters                                        | Returns         |
|----------|--------------------------------------------------|---------------------------------------------------|-----------------|
| ask()  | Sends a message to the AI model in the current conversation. | message (String), roleOrOptions (String or AskOptions) | Promise<Object> |

### ask()

`instance.ask(message: String, roleOrOptions?: String or AskOptions): Promise<AskResponseObject>`

The `ask` instance function sends a message to the AI model within the context of the current conversation.

**Parameters:**

| Parameter        | Type                        | Optional | Default Value | Description                                                                                                                               |
|------------------|-----------------------------|----------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| message        | String                    | No       |               | The text message prompt to send to the AI.                                                                                                |
| roleOrOptions  | String or AskOptions   | Yes      | 'user'      | Can be a String specifying the author's role ('user', 'system', 'assistant') or an AskOptions object. Defaults to 'user' role. |

**`AskOptions` Object Properties:**

| Parameter | Type      | Optional | Default Value | Description                                                                      |
|-----------|-----------|----------|---------------|----------------------------------------------------------------------------------|
| role    | String  | Yes      | 'user'      | The role of the author of this message ('user', 'system', 'assistant').     |
| stream  | Boolean | Yes      | false       | If true, enables streaming for this specific ask call. See [Streaming with ask()](#streaming-with-ask). |

**Returns:**

A `Promise` that resolves to an `AskResponseObject`.

**`AskResponseObject` Structure (Non-Streaming):**

The response object typically contains the AI's reply. The primary content of the AI's response is usually found in `response.choices[0].message.content`. Refer to the OpenAI documentation for the detailed structure of the [chat completion object](https://platform.openai.com/docs/api-reference/chat/object).

**Example (Non-Streaming):**

```javascript
/**
 * @typedef {Object} AskOptions
 * @property {string} [role='user'] - The role of the author.
 * @property {boolean} [stream=false] - Whether to stream the response.
 */

/**
 * @typedef {Object} MessageObject
 * @property {string} role - The role of the message author (e.g., 'user', 'assistant', 'system').
 * @property {string} content - The content of the message.
 */

/**
 * @typedef {Object} ChoiceObject
 * @property {number} index - The index of the choice.
 * @property {MessageObject} message - The message object.
 * @property {string} finish_reason - The reason the model stopped generating tokens.
 */

/**
 * @typedef {Object} UsageObject
 * @property {number} prompt_tokens - Tokens in the prompt.
 * @property {number} completion_tokens - Tokens in the completion.
 * @property {number} total_tokens - Total tokens.
 */

/**
 * @typedef {Object} AskResponseObject
 * @property {string} id - Unique ID for the completion.
 * @property {string} object - Object type.
 * @property {number} created - Timestamp of creation.
 * @property {string} model - Model used.
 * @property {ChoiceObject[]} choices - Array of completion choices.
 * @property {UsageObject} usage - Token usage statistics.
 */

async function getSimpleAnswer() {
  try {
    const conversation = Fliplet.AI();
    console.log('Input message:', 'What are the top trends for 2023?');
    const response = await conversation.ask('What are the top trends for 2023?');
    console.log('AI Response Object:', response);
    if (response.choices && response.choices.length > 0) {
      console.log('AI Answer:', response.choices[0].message.content);
    }
  } catch (error) {
    console.error('Error asking AI:', error);
  }
}

getSimpleAnswer();
```

### Streaming with `ask()`

To stream the response from an `ask()` call, you can either:
1.  Initialize the `Fliplet.AI` instance with `stream: true`.
2.  Pass `stream: true` within the `AskOptions` object to a specific `ask()` call.

When streaming is enabled for an `ask()` call, the method returns a special streamable object with `.stream()`, `.then()`, and `.catch()` methods.

`instance.ask(message, { stream: true }).stream(onChunkCallback).then(onCompleteCallback).catch(onErrorCallback)`

**Callbacks:**

*   `onChunkCallback(data: StreamChunkObject)`: A function called multiple times as partial message deltas are received.
    *   **`StreamChunkObject` Structure:** The `delta` object within each chunk contains the new piece of information. For content, this is `delta.content`. The first chunk might contain `delta.role`. The `finish_reason` will be non-null in the final chunk. Refer to OpenAI documentation for the [chat completion chunk object](https://platform.openai.com/docs/api-reference/chat/streaming#object) structure.
*   `onCompleteCallback(finalResponse?: AskResponseObject)`: Called once all messages (chunks) are received. The `finalResponse` argument may contain the fully assembled message or usage statistics, depending on the API's implementation.
*   `onErrorCallback(error: Error)`: Called if an error occurs during the streaming process.

**Example (Streaming with `ask()`):**

```javascript
const aiInstance = Fliplet.AI({ temperature: 1 }); // Or Fliplet.AI({ temperature: 1, stream: true });

console.log('Input message for streaming:', 'Give me a 20-word sentence about space.');

aiInstance.ask('Give me a 20-word sentence about space.', { stream: true })
  .stream(function onChunk(chunk) {
    // Log the raw chunk or process chunk.choices[0].delta.content
    console.log('Stream Chunk:', chunk);
    if (chunk.choices && chunk.choices[0].delta && chunk.choices[0].delta.content) {
      // Append chunk.choices[0].delta.content to your UI or a variable
      // For this example, we just log it:
      // process.stdout.write(chunk.choices[0].delta.content); // For Node.js like environment
    }
  })
  .then(function onComplete(finalResponse) {
    console.log('\nStream Complete. Final response object (if available):', finalResponse);
    // finalResponse might be the full assembled message or just a confirmation
    // depending on the exact API design for streaming completion.
  })
  .catch(function onError(error) {
    console.error('\nStream Error:', error);
  });
```
**Note on `stream: true` in constructor vs. `ask` options:**
If `Fliplet.AI({ stream: true })` is used, all subsequent `ask()` calls on that instance will default to streaming and return the streamable object. You can potentially override this for a specific call by passing `{ stream: false }` if the API supports it, though this behavior should be verified. The example above uses `{ stream: true }` in the `ask` options for clarity.

---

## Multi-turn conversation (chat)

A multi-turn conversation involves maintaining the context of previous messages. Chat models take a series of messages as input and return a model-generated message as output. The `Fliplet.AI()` instance manages this conversation history automatically.

**Conversation Message Structure:**

Each message in the conversation history (accessible via `conversation.messages`) is an object:

```javascript
{
  role: 'user' | 'assistant' | 'system', // The role of the message author
  content: 'The text of the message.'    // The content of the message
}
```

**Example Scenario:**

```javascript
async function runConversation() {
  // Create a conversation instance
  // The temperature option controls "creativity"
  const conversation = Fliplet.AI({ temperature: 1 });
  console.log('Initial AI Instance:', conversation);

  try {
    // Set the system's behavior
    console.log('System instruction:', 'You are a helpful tech consultant.');
    const firstResponse = await conversation.ask('You are a helpful tech consultant.', 'system');
    console.log('AI response to system instruction:', firstResponse.choices[0].message.content);

    // Send a user message
    console.log('User question 1:', 'What are the top tech trends for 2024?');
    const secondResponse = await conversation.ask('What are the top tech trends for 2024?');
    console.log('AI answer 1:', secondResponse.choices[0].message.content);

    // Send a follow-up user message
    console.log('User question 2:', 'Write a longer summary for the first trend you mentioned.');
    const thirdResponse = await conversation.ask('Write a longer summary for the first trend you mentioned.');
    console.log('AI answer 2:', thirdResponse.choices[0].message.content);

    // Access the conversation transcript
    console.log('\nConversation Transcript:');
    conversation.messages.forEach(function (message, index) {
      console.log(`Message ${index + 1}: Role: ${message.role}, Content: "${message.content}"`);
    });
    // Example of what conversation.messages might look like:
    // [
    //   { role: 'system', content: 'You are a helpful tech consultant.' },
    //   { role: 'assistant', content: "Okay, I'm ready to help with your tech questions!" },
    //   { role: 'user', content: 'What are the top tech trends for 2024?' },
    //   { role: 'assistant', content: 'Some top trends include AI advancements, cybersecurity focus, and sustainable tech...' },
    //   { role: 'user', content: 'Write a longer summary for the first trend you mentioned.' },
    //   { role: 'assistant', content: 'Certainly, regarding AI advancements in 2024, we are seeing...' }
    // ]


  } catch (error) {
    console.error('Error during conversation:', error);
  }
}

runConversation();
```

**Key Concepts:**

*   **System Message:** Sets the assistant's behavior (e.g., "You are a helpful tech consultant."). Typically the first message.
*   **User Messages:** Instructions or questions from the end-user or developer.
*   **Assistant Messages:** Prior responses from the AI, stored to maintain context.
*   **Context Management:** The `conversation` instance automatically includes relevant history. If a conversation exceeds the model's token limit, it needs to be managed (e.g., summarized or truncated by the developer, though `Fliplet.AI` might have internal handling for this).

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

2.  **Low-level `Fliplet.AI.createCompletion()`:** For direct access to OpenAI completion parameters without implicit conversation management. See [Static API Methods](#static-api-methods).

---

## Static API Methods

These methods are called directly on the `Fliplet.AI` namespace (e.g., `Fliplet.AI.createCompletion()`) and are generally used for single-turn tasks or when more control over the OpenAI API parameters is required without instance-based conversation history.

**Static Method Summary:**

| Method                  | Description                                                                    | Key Parameters (see details below)            | Returns         |
|-------------------------|--------------------------------------------------------------------------------|-----------------------------------------------|-----------------|
| createCompletion()    | Creates a text completion based on a prompt or a series of messages.           | options (Object)                            | Promise<Object> |
| generateImage()       | Generates an image from a text prompt.                                         | options (Object)                            | Promise<Object> |
| transcribeAudio()     | Transcribes an audio file.                                                     | file (File), options (Object, optional) | Promise<Object> |
| createEmbedding()     | Creates an embedding vector for input text.                                    | options (Object)                            | Promise<Object> |

### `Fliplet.AI.createCompletion()`

`Fliplet.AI.createCompletion(options: CompletionOptions): Promise<CompletionResponseObject>`

This low-level method provides direct access to OpenAI's completion capabilities, supporting both traditional prompt-based completions (e.g., with `text-davinci-003`) and chat-based completions (e.g., with `gpt-3.5-turbo`).

**`CompletionOptions` Object Properties:**

You can use most parameters available in the [OpenAI Completions API reference](https://platform.openai.com/docs/api-reference/completions/create) (for `prompt`-based calls) or the [OpenAI Chat Completions API reference](https://platform.openai.com/docs/api-reference/chat/create) (for `messages`-based calls).

**Key `CompletionOptions` include:**

| Parameter     | Type                        | Optional | Default        | Description                                                                                                                                                                                             |
|---------------|-----------------------------|----------|----------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| model       | String                    | Yes      | See below      | ID of the model to use. For chat models (using messages), defaults to 'gpt-3.5-turbo'. For older completion models (using prompt), a model like 'text-davinci-003' must be specified.           |
| messages    | Array<MessageObject>      | Yes      | undefined    | An array of message objects (see [Conversation Message Structure](#conversation-message-structure)) for chat-based completions. Use this for models like gpt-3.5-turbo.                                |
| prompt      | String or Array<String> | Yes      | undefined    | The prompt(s) to generate completions for. Use this for older completion models like text-davinci-003.                                                                                                |
| temperature | Number                    | Yes      | 1 (OpenAI)   | Sampling temperature (0-2).                                                                                                                                                                               |
| stream      | Boolean                   | Yes      | false        | If true, enables streaming. See [Streaming with createCompletion()](#streaming-with-createcompletion).                                                                                                |
| ...           | ...                         | Yes      | ...            | Other valid OpenAI completion parameters (e.g., `top_p`, `n`, `stop`, `presence_penalty`, `frequency_penalty`).                                                                                           |

**Important:**
*   You must provide *either* `messages` (for chat models) *or* `prompt` (for older text completion models), but not both.
*   If `model` is not provided when using `messages`, it defaults to `'gpt-3.5-turbo'`.

**Returns:**

A `Promise` that resolves to a `CompletionResponseObject`. The structure depends on whether it's a chat completion or a standard completion, generally following OpenAI's response format. Refer to the OpenAI documentation for the detailed structure of the [completion object](https://platform.openai.com/docs/api-reference/completions/object) or [chat completion object](https://platform.openai.com/docs/api-reference/chat/object).


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

To stream responses from `Fliplet.AI.createCompletion()`, set the `stream: true` property in the `options` object. This returns a special streamable object with `.stream()`, `.then()`, and `.catch()` methods, similar to [Streaming with `ask()`](#streaming-with-ask).

`Fliplet.AI.createCompletion({ ...options, stream: true }).stream(onChunkCallback).then(onCompleteCallback).catch(onErrorCallback)`

**Callbacks:**

*   `onChunkCallback(data: StreamChunkObject)`: Called for each partial message delta. The `StreamChunkObject` structure is similar to that described in [Streaming with `ask()`](#streaming-with-ask) (for chat models) or specific to the model if it's a non-chat streaming model. Refer to OpenAI documentation for the [chat completion chunk object](https://platform.openai.com/docs/api-reference/chat/streaming#object) or other model-specific streaming objects.
*   `onCompleteCallback(finalResponse?: CompletionResponseObject)`: Called when all chunks are received.
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
| model          | String | Yes      | dall-e-2    | The model to use for image generation (e.g. dall-e-2, dall-e-3). dall-e-3 currently only supports n=1. |
| quality        | String | Yes      | standard    | For dall-e-3 model, the quality of the image. 'standard' or 'hd'.                                       |
| style          | String | Yes      | vivid       | For dall-e-3 model, the style of the generated images. 'vivid' or 'natural'.                            |
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
 * @property {string} [model='dall-e-2'] - Model to use.
 * @property {'standard'|'hd'} [quality='standard'] - For dall-e-3, image quality.
 * @property {'vivid'|'natural'} [style='vivid'] - For dall-e-3, image style.
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
      model: "dall-e-3" // Example using DALL-E 3
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

`Fliplet.AI.transcribeAudio(file: File, options?: TranscribeAudioOptions): Promise<TranscriptionResponseObject>`

Transcribes an audio file into text.

**Parameters:**

| Parameter | Type                        | Optional | Default Value | Description                                                                                                                                                                                                                               |
|-----------|-----------------------------|----------|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| file    | File                      | No       |               | The audio File object to transcribe. Supported formats: flac, mp3, mp4, mpeg, mpga, m4a, ogg, wav, webm.                                                                                                             |
| options | TranscribeAudioOptions    | Yes      | {}          | An optional object containing additional parameters for the transcription. See [OpenAI Audio Transcription API](https://platform.openai.com/docs/api-reference/audio/createTranscription) for available options. |

**`TranscribeAudioOptions` Object Properties (Common):**

| Parameter     | Type     | Optional | Default Value    | Description                                                                                                                                          |
|---------------|----------|----------|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------|
| model       | String | Yes      | 'whisper-1'    | ID of the model to use (e.g., 'whisper-1').                                                                                                          |
| prompt      | String | Yes      |                  | An optional text to guide the model's style or continue a previous audio segment.                                                                    |
| response_format | String | Yes  | 'json'         | The format of the transcript output (e.g., 'json', 'text', 'srt', 'verbose_json', 'vtt'). Fliplet's wrapper might default or standardize this. |
| language    | String | Yes      |                  | The language of the input audio in [ISO-639-1 format](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) (e.g., 'en', 'es').                   |
| temperature | Number | Yes      | 0              | Sampling temperature (0-1). Higher values increase randomness.                                                                                         |

**Returns:**

A `Promise` that resolves to a `TranscriptionResponseObject`. The primary content is usually the transcribed text. Refer to the OpenAI documentation for the [transcription object](https://platform.openai.com/docs/api-reference/audio/object) structure, which varies based on the chosen `response_format`.


**Example:**

```javascript
/**
 * @typedef {Object} TranscribeAudioOptions
 * @property {string} [model='whisper-1']
 * @property {string} [prompt]
 * @property {string} [response_format='json']
 * @property {string} [language]
 * @property {number} [temperature=0]
 * // ... other OpenAI transcription options
 */

/**
 * @typedef {Object} TranscriptionResponseObject
 * @property {string} text - The transcribed text.
 * // Potentially other fields for verbose formats
 */

async function transcribeSampleAudio() {
  try {
    // Creating a dummy File object for browser environments.
    // In a real scenario, this would come from an <input type="file"> or other source.
    const arrayBuffer = new Uint8Array([/* some dummy audio data */]).buffer;
    const filename = 'test_audio.mp3';
    const mimeType = 'audio/mp3';
    const audioFile = new File([arrayBuffer], filename, { type: mimeType });

    if (audioFile.size === 0) {
        console.warn("Dummy audio file is empty. Transcription will likely fail or return empty. This is for demonstration structure.");
    }
    
    const transcriptionOptions = {
        language: 'en', // Optional: specify language
        response_format: 'json' // Optional: specify format
    };

    console.log('Input File for transcribeAudio:', audioFile.name, 'Options:', transcriptionOptions);
    // This example will likely not work without actual audio data and backend integration.
    // It demonstrates the API call structure.
    const result = await Fliplet.AI.transcribeAudio(audioFile, transcriptionOptions);
    console.log('transcribeAudio Response:', result);
    if (result && result.text) {
      console.log('Transcription:', result.text);
    }
  } catch (error) {
    console.error('Error transcribing audio:', error);
    // Common errors: Invalid file format, file too large, network issue.
  }
}
// transcribeSampleAudio(); // Call this if you have a way to provide a real audio file
console.info("transcribeSampleAudio() example is commented out as it requires a real audio File object.");

// Simple File creation example:
// const myBlob = new Blob(["dummy content for a text file"], { type: "text/plain" });
// const myFile = new File([myBlob], "example.txt", { type: "text/plain" });
// For audio, the Blob would contain actual audio data.
```

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