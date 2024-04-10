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

## Initialization

The `Fliplet.AI()` function is used to initialize an instance of the AI APIs. It optionally supports the [OpenAI completion attributes](https://platform.openai.com/docs/api-reference/chat/create) as first argument. These include:

- `model`: ID of the model to use. See the [model endpoint compatibility](https://platform.openai.com/docs/models/model-endpoint-compatibility) table for details on which models work with. This defaults to `gpt-3.5-turbo`.
- `temperature`: (Number, defaults to `1`) What sampling temperature to use, between 0 and 2. Higher values like 0.8 will make the output more random, while lower values like 0.2 will make it more focused and deterministic.
- `n`: (Number) How many chat completion choices to generate for each input message. Defaults to `1`.
- `stop`: (String or Array) Up to 4 sequences where the API will stop generating further tokens, e.g. `["\n"]`
- `max_tokens`: (Number) The maximum number of tokens to generate in the chat completion. The total length of input tokens and generated tokens is limited by the model's context length.
- `stream`: (Boolean, Defaults to false) If set, partial message deltas will be sent, like in ChatGPT. Tokens will be sent as data-only server-sent events as they become available.

Here's how you can create a new instance of the AI APIs:

```js
const conversation = Fliplet.AI({
  temperature: 0.8
});
```

## Instance methods

The instance object returned from `Fliplet.AI()` exposes the following methods.

### `ask()`

The `ask` instance function takes a prompt (text message) as first argument and the optional `role` of the author as second parameter. The role values are:

- `user` (default when not supplied)
- `system`
- `assistant`

The `ask` function [response format](https://platform.openai.com/docs/guides/chat/response-format) follows the [OpenAI documentation](https://platform.openai.com/docs/guides/chat/response-format).

```js
const response = await Fliplet.AI().ask('What are the top trends for 2023?');
```

### `Streaming response`

User can stream the response by passing `stream: true` as optional second parameter.

```js
Fliplet.AI({temperature: 1,stream: true}).ask('Give me 20 word sentence').stream(function onChunk(data) {
    console.log(data) // Callback function to receive partial message deltas like in ChatGPT as they become available
}).then(function onComplete(){
  console.log('done') // Called once all messages are received
}).catch(function reject(error){
  console.log(error)
});
```
When user passes `stream: true` as parameter user can use `stream()` method as shown in above code example. It takes callback function as a parameter which will be called when partial message deltas received from OpenAI API.

---

## Multi-turn conversation (chat)

A multi-turn conversation is about keeping the context of previous messages sent for the conversation instance. Chat models take a series of messages as input, and return a model-generated message as output.

Although the chat format is designed to make multi-turn conversations easy, it’s just as useful for single-turn tasks without any conversations.

An example scenario looks as follows:

```js
// Create a conversation instance
// The temperature option controls how "creative" or unpredictable the chatbot's responses will be.
const conversation = Fliplet.AI({ temperature: 1 });

// Create a chat completion and wait for the result from the AI
const firstResponse = await conversation.ask('You are a helpful tech consultant.', 'system');

// Send a follow up message for this conversation
const secondResponse = await conversation.ask('What are the top trends for 2023?');

// Send a follow up message for this conversation
const thirdResponse = await conversation.ask('Write a longer summary for the first trend.');

// You can also access a transcript of the whole conversation
// via the "conversation.messages"
conversation.messages.forEach(function (message) {
  // Each message has "role" and "content"
});
```

The first message is sent to the "system" role, which likely means that the chatbot will respond with some kind of introduction or greeting. The second and third messages are not sent to any specific role, so they can be interpreted as follow-up questions or statements in an ongoing conversation.

Typically, a conversation is formatted with a system message first, followed by alternating user and assistant messages.

The system message helps set the behavior of the assistant. In the example above, the assistant was instructed with "You are a helpful tech consultant".

The user messages help instruct the assistant. They can be generated by the end users of an application, or set by a developer as an instruction.

The assistant messages help store prior responses. They can also be written by a developer to help give examples of desired behavior.

Including the conversation history via the `conversation` instance generated by the `Fliplet.AI()` function helps when user instructions refer to prior messages. In the example above, the user’s final question of "Write a longer summary for the first trend" only makes sense in the context of the prior messages about the tech trends for 2023. Because the models have no memory of past requests, all relevant information must be supplied via the conversation. If a conversation cannot fit within the model’s token limit, it will need to be shortened in some way.

---

## Single-turn tasks

If you're looking into interacting with the AI model in single-turn tasks where context isn't shared between requests, you have two options:

1. Use the high-level `Fliplet.AI().ask(message)` JS API
2. Use the low-level `Fliplet.AI.createCompletion({ messages })` JS API

Here's an example of how two individual tasks would be layed out using the first JS API:

```js
const firstResult = Fliplet.AI().ask('Act as a JS developer. Write a function to multiply two numbers.');

const secondResult = Fliplet.AI({ temperature: 2 }).ask('Act as a marketer. Write a welcome email for users that signed up to my website.');
```

As each `Fliplet.AI()` generates its own conversation, doing multiple calls will create separate contexts which don't have a shared conversation history. A less concise example than the above would be:

```js
const firstConversation = Fliplet.AI();
const secondConversation = Fliplet.AI({ temperature: 2 });

await firstConversation.ask('Act as a JS developer', 'system');
await secondConversation.ask('Act as a marketer', 'system');

const result = await firstConversation.ask('Write a function to multiply two numbers');
const result2 = await secondConversation.ask('Write a welcome email for users that signed up to my website');
```

### Manually construct a completion request

When you need access to the [full range of completions options provided by OpenAI](https://platform.openai.com/docs/api-reference/completions/create), use the low-level `createCompletion` JS API:

```js
const result = await Fliplet.AI.createCompletion({
  model: 'text-davinci-003',
  prompt: 'Say this is a test',
  max_tokens: 7,
  temperature: 0
});
```

This code uses the OpenAI API through the `Fliplet.AI` namespace to generate text completion using an AI model. The `result` variable in the example holds the response from the AI model.

The `Fliplet.AI.createCompletion()` method takes several arguments to customize the text completion. In this case, it is passed an object with the following properties:

- `model`: Indicates which AI model to use for text generation, in this case "text-davinci-003". This model is one of several language prediction models developed by OpenAI.
- `prompt`: Specifies the text prompt to generate completion for. In this case, the prompt is "Say this is a test".
- `max_tokens`: Controls how many tokens (words or characters) the AI should generate in response to the prompt. Here, it is set to 7.
- `temperature`: Controls the "creativity" or randomness of the generated text. A higher temperature value produces more unpredictable responses. Here, the temperature is set to 0, which means the AI will always choose the most likely next token.


Likewise, you can use the [chat completions OpenAI API](https://platform.openai.com/docs/api-reference/chat/create) with the same JS API by providing the `messages` attribute instead of `prompt`:

```js
const result = await Fliplet.AI.createCompletion({
  model: 'gpt-3.5-turbo', // this is the default when the model is not provided
  messages: [{ role: 'user', content: 'Hello!' }]
});
```

In this case, it is passed an object with two properties:

- `model`: Specifies the name of the AI model to use for generating text. If no model is specified, the default model used is 'gpt-3.5-turbo'.
- `messages`: An array of objects representing the conversation messages between participants. In this case, there is only one message from the user with content "Hello!" and role "user".

The GPT-3.5 Turbo model is one of several language prediction models developed by OpenAI, which generates human-like responses to prompts or message inputs. Here, the model will use the input message "Hello!" to generate a text completion response based on its trained knowledge about conversational English.

User can stream the response by passing `stream: true` property

```js
Fliplet.AI.createCompletion({
    model: 'gpt-4-0125-preview',
    messages: [{ role: 'user', content: 'Write me a poem' }],
    stream: true
  }).stream(function onChunk(data) {
    console.log(data) // Callback function to receive partial message deltas like in ChatGPT as they become available
  }).then(function onComplete(){
    console.log('done') // Called once all messages are received
  }).catch(function reject(error){
    console.log(error)
  });
```

When user passes `stream: true` as parameter user can use `stream()` method as shown in above code example. It takes callback function as a parameter which will be called when partial message deltas received from OpenAI API.

### Generate images

The image generations JS API allows you to create an original image given a text prompt.

```js
const result = await Fliplet.AI.generateImage({
  prompt: "a white siamese cat",
  n: 1,
  size: "256x256",
  response_format: "url"
});
```
This code uses the [create image OpenAI API](https://platform.openai.com/docs/api-reference/images/create) through the `Fliplet.AI` namespace to generate image. The result variable in the example holds the response from the AI model.

The `Fliplet.AI.generateImage()` method takes several arguments. In this case, it is passed an object with the following properties:

- `prompt`: A text description of the desired image(s). The maximum length is 1000 characters. In this case, the prompt is "a white siamese cat".
- `n`: The number of images to generate. Must be between 1 and 10.
- `size`: The size of the generated images. Must be one of 256x256, 512x512, or 1024x1024.
- `response_format`: The format in which the generated images are returned. Must be one of url or b64_json.

### Create transcription

The transcriptions JS API takes as input the audio file you want to transcribe and the desired output file format for the transcription of the audio.

```js
const file = new File([arrayBuffer], filename, { type: mimeType }); // see MDN for more detail
const result = await Fliplet.AI.transcribeAudio(file);
```
This code uses the [create transcription OpenAI API](https://platform.openai.com/docs/api-reference/audio/createTranscription) through the `Fliplet.AI` namespace to create transcription from audio file. The result variable in the example holds the response from the AI model.

The `Fliplet.AI.transcribeAudio()` method takes `File` object as an input, user can provide audio file as an `File` object and method with provide transcription for the provided file. Supported file formats are  `flac`, `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `ogg`, `wav`, or `webm`.

### Create embeddings

The embeddings JS API creates an embedding vector representing the input text

```js
const result = await Fliplet.AI.createEmbedding({
  input: "The food was delicious and the waiter..."
});
```
This code uses the [create embeddings OpenAI API](https://platform.openai.com/docs/api-reference/embeddings/create) through the `Fliplet.AI` namespace to create embeddings from the given input. The result variable in the example holds the response from the AI model.

The `Fliplet.AI.createEmbedding()` method takes several arguments. In this case, it is passed an object with the following properties:

- `input`: Input text to embed, encoded as a string or array of tokens. To embed multiple inputs in a single request, pass an array of strings or array of token arrays. Each input must not exceed the max input tokens for the model (8191 tokens for text-embedding-ada-002) and cannot be an empty string

## Rate limiting

The rate limiting for the AI JS API namespace is enforced based on the pricing plan selected. The following table provides an overview of the rate limits for each pricing plan, including the maximum number of requests allowed per day and per minute.

**Enterprise Plans (Enterprise, Bronze, Silver, Gold, Platinum)**
- Per Day: 10,000 requests
- Per Minute: 100 requests

**Private and Private+ Plans**
- Per Day: 10,000 requests
- Per Minute: 100 requests

**Public Plan**
- Per Day: 1,000 requests
- Per Minute: 100 requests

**Free Plan**
- Per Day: 100 requests
- Per Minute: 10 requests

---

## Examples

### Generate a form from the user's prompt

```js
Fliplet.Widget.getSchema("com.fliplet.form-builder").then(async function (schema) {
  const message = `I want you to act as a JSON code generator. Below within ### you will find the a JSON schema of a Form Builder widget. This is the schema that defines the structure of the JSON code that is used to generate the form. The schema is as follows:
  ###
  ${JSON.stringify(schema)}
  ###

  Do not provide any explanations.

  Generate the JSON code for the following form:

  I want a form for a user to accept terms and conditions. The user should type their name and age. 18 is the minimum age required to submit the form. Add some sample content before the "I agree" and "do not agree" options to accept. Display a nice message to the user once the form is submitted.
  `;

  const chat = Fliplet.AI();

  const result = await chat.ask(message);

  // Print the output
  console.log(JSON.parse(result));
});
```

---

### Generate a data source from the user's prompt

```js
Fliplet.Widget.getSchema("com.fliplet.data-sources").then(async function (schema) {
  const message = `I want you to act as a JSON code generator. Below within ### you will find the a JSON schema of a Data Source. This is the schema that defines the structure of the JSON code that is used to generate the Data Source. The schema is as follows:
  ###
  ${JSON.stringify(schema)}
  ###

  Do not provide any explanations.

  Generate the JSON code for the following data source:

  I want a data source for a list of people. Each person should have the following fields:
  - Name
  - Age
  - Email

  Add 5 sample records to the data source. The data source should be called "People".
  `;

  const chat = Fliplet.AI();

  const result = await chat.ask(message);

  // Print the output
  console.log(JSON.parse(result));

  // Create the data source
  return Fliplet.DataSources.create(_.extend({
    appId: Fliplet.Env.get('appId'),
    organizationId: Fliplet.Env.get('organizationId')
  }, JSON.parse(result)));
});
```