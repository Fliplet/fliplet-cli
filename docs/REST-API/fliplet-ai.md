---
title: Fliplet app AI REST API
description: "Make app-scoped Fliplet AI requests for text, images, transcription and embeddings using the format required by the selected model."
type: api-reference
tags: [rest-api, ai]
v3_relevant: true
deprecated: false
---
# Fliplet app AI REST API

Use these app-scoped endpoints to generate text or images, transcribe audio and create embeddings through Fliplet. Requests use a Fliplet token and the selected provider's payload format; a customer provider key is not required.

<a id="authentication-and-app-access"></a>

## Before your first request

Use the API host for the app's region: `https://api.fliplet.com` (EU), `https://us.api.fliplet.com` (US) or `https://ca.api.fliplet.com` (CA). Follow [REST authentication](/REST-API/authenticate) to obtain and scope a token. Send the raw token in `Auth-token` and request JSON with `Accept: application/json`.

For an app API token created in Studio, use the published app's `productionAppId`, available through the [Apps reference](/REST-API/fliplet-apps). This token does not authorize AI calls to the working draft. Creating and managing the token requires app editor or publisher access; the token itself has app-scoped runtime access. An unrelated or inaccessible app returns `404`. Do not include a `development` parameter: app AI routes reject it with `400`, regardless of its value.

Calls require app access, available AI credits and a compatible model. Explicitly select a [configured model](/API/core/ai/models); omitted models use the [direct REST fallbacks](/API/core/ai/models#fallback-defaults), which differ from JavaScript completions. Model availability also depends on the provider.

For code running inside an app, use [Fliplet.AI](/API/core/ai), which supplies the current app and authentication context.

## Operations

| Operation | Method and path | Body |
| --- | --- | --- |
| [Text or Gemini image generation](#completions) | `POST /v1/apps/:app/ai/completions` | JSON in the chosen model's format |
| [OpenAI image generation](#images) | `POST /v1/apps/:app/ai/image` | JSON with `prompt` |
| [Transcription](#audio-transcription) | `POST /v1/apps/:app/ai/audio` | Multipart form with `file` and optional `model` |
| [Embeddings](#embeddings) | `POST /v1/apps/:app/ai/embeddings` | JSON with `input` |

`:app` is the authorized app ID. Examples use EU; substitute the app's regional host. The environment variables below must be set to your own authorized token and app ID. Keep credentials in the external integration's secure configuration.

## Completions

`POST /v1/apps/:app/ai/completions`

Use exactly one input format with an explicit compatible `model`. Non-streaming success returns the provider JSON directly, without a Fliplet response wrapper.

| Format | Required fields | Plain text in the response |
| --- | --- | --- |
| OpenAI Chat Completions | `model`, `messages` | `choices[0].message.content` |
| OpenAI Responses | `model`, `input`, `useResponses: true` | `output` message items, then `content` parts with `type: 'output_text'` and `text` |
| Gemini | `model`, `contents` | `candidates[0].content.parts` text parts |

### Chat Completions example

```bash
curl --fail-with-body "https://api.fliplet.com/v1/apps/${FLIPLET_APP_ID}/ai/completions" \
  -H "Auth-token: ${FLIPLET_API_TOKEN}" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"model":"gpt-6.1-sol","messages":[{"role":"user","content":"Summarize the purpose of a project kickoff meeting in one sentence."}]}'
```

A text response includes this structure (other provider fields are omitted here):

```json
{
  "choices": [
    { "index": 0, "message": { "role": "assistant", "content": "A project kickoff aligns participants on the goals, responsibilities and next steps." } }
  ]
}
```

For conversations, send relevant user and assistant history on each call. The endpoint does not maintain the external client's displayed chat history. See the [chatbot guide](/API/core/ai/chatbot).

### Responses format

Send `input`, not `messages`, with `useResponses: true`:

```json
{
  "model": "gpt-6.1-sol",
  "useResponses": true,
  "input": "Summarize the purpose of a project kickoff meeting in one sentence."
}
```

A text response includes typed output items:

```json
{
  "output": [
    {
      "type": "message",
      "role": "assistant",
      "content": [{ "type": "output_text", "text": "A kickoff aligns participants on the project's goals and next steps." }]
    }
  ]
}
```

Collect `output_text` from message items. Do not display the entire `output` object as text. Reasoning, refusal and tool items require their own handling. See [Responses request and extraction](/API/core/ai#using-the-responses-api).

### Gemini format

Send Gemini `contents`, omit `useResponses` and use `generationConfig`, `systemInstruction` or `tools` only when compatible with the model:

```json
{
  "model": "gemini-3.5-flash",
  "contents": [{ "role": "user", "parts": [{ "text": "Summarize the purpose of a project kickoff meeting." }] }]
}
```

A text response includes:

```json
{
  "candidates": [{ "content": { "role": "model", "parts": [{ "text": "A kickoff aligns the team on goals and responsibilities." }] } }]
}
```

Configured [Gemini image models](/API/core/ai/models#image-models) also use this completion endpoint with their image-generation settings. Read image parts with `inlineData.mimeType` and base64 `inlineData.data`; see the [Gemini image example](/API/core/ai#gemini-image-generation).

### Additional options and legacy input

Provider fields use the selected endpoint's schema: [Chat Completions](https://platform.openai.com/docs/api-reference/chat/create), [Responses](https://platform.openai.com/docs/api-reference/responses/create) or [Gemini generateContent](https://ai.google.dev/api/generate-content). For example, Chat Completions uses `response_format` and `reasoning_effort`, while Responses uses `text.format` and `reasoning.effort`.

Fliplet consumes `useResponses` for OpenAI routing and `stream` for Gemini routing. For streamed Chat Completions it includes usage reporting; Responses receives a compaction setting when `context_management` is omitted. These adaptations do not imply support for every provider feature. Tool declarations require the integration to validate, authorize and execute the returned operation.

A truthy `prompt` on a non-streaming call chooses legacy prompt completions. The direct REST fallback for that format is retired; use Chat Completions or Responses for new features. See [fallback defaults](/API/core/ai/models#fallback-defaults).

## Images

`POST /v1/apps/:app/ai/image`

Send an OpenAI image `model` and `prompt`. Other model-supported fields include `n`, `size`, `quality` and `output_format`; see the [JavaScript image contract](/API/core/ai#flipletaigenerateimage) and [OpenAI schema](https://platform.openai.com/docs/api-reference/images/create).

```bash
curl --fail-with-body "https://api.fliplet.com/v1/apps/${FLIPLET_APP_ID}/ai/image" \
  -H "Auth-token: ${FLIPLET_API_TOKEN}" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"model":"gpt-image-2","prompt":"An illustration of a workshop room with people collaborating","n":1,"size":"1024x1024","output_format":"png"}'
```

Success contains `created` and `data: [{ b64_json }]`. Decode or display the base64 image using the requested MIME type. It is not a persistent hosted URL. Fliplet replaces `dall-e-2`/`dall-e-3` with `gpt-image-2` and removes `response_format`/`style` for GPT image models.

Gemini image models use the [completion payload](#gemini-format) with Gemini-specific response handling. Their current compatibility with the image adapter has not been established.

## Audio transcription

`POST /v1/apps/:app/ai/audio`

Send multipart form data with exactly one file in `file`. Optional `model` accepts only `gpt-4o-mini-transcribe`, `gpt-4o-transcribe` or `whisper-1`. Other provider transcription options, including `prompt`, `language`, `response_format` and `temperature`, are not forwarded. The filename belongs to the multipart file, not a separate JSON field.

```bash
curl --fail-with-body "https://api.fliplet.com/v1/apps/${FLIPLET_APP_ID}/ai/audio" \
  -H "Auth-token: ${FLIPLET_API_TOKEN}" \
  -H 'Accept: application/json' \
  -F 'file=@recording.webm;type=audio/webm' \
  -F 'model=gpt-4o-mini-transcribe'
```

Let the client set the multipart boundary; do not set `Content-Type: application/json`. Accepted base MIME types are `audio/webm`, `audio/mp4`, `audio/mpeg`, `audio/wav` and `audio/ogg`. Codec suffixes are accepted. Maximum audio size is 25 MiB inclusive (`25 * 1024 * 1024` bytes).

Success returns exactly:

```json
{ "text": "The workshop starts at nine in the morning." }
```

Missing `file` returns `400`; an unsupported model returns `400`; audio over the limit returns `413`; an unsupported MIME type returns `415`. The JavaScript wrapper's `timeout` and `signal` are caller controls, not REST form fields. An external client chooses its own timeout and cancellation controls. Before provider handoff a disconnected request stops processing; after handoff it stops result delivery while successful provider usage may still be charged. See [transcription errors and limits](/API/core/ai#errors-and-limits).

## Embeddings

`POST /v1/apps/:app/ai/embeddings`

Send `input` as a string or array of strings and an explicit [embedding model](/API/core/ai/models#embedding-models). Optional `encoding_format` chooses numeric (`float`) or encoded (`base64`) vectors; `dimensions` applies only to models that support it.

```bash
curl --fail-with-body "https://api.fliplet.com/v1/apps/${FLIPLET_APP_ID}/ai/embeddings" \
  -H "Auth-token: ${FLIPLET_API_TOKEN}" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"model":"text-embedding-3-small","input":"The workshop starts at 9 AM.","encoding_format":"float"}'
```

Success contains `object`, `data: [{ object, index, embedding }]`, `model` and `usage: { prompt_tokens, total_tokens }`. Numeric embeddings are arrays; base64 embeddings are strings. Keep the same model and dimensions for stored vectors and queries. Missing `input` returns `400`; provider validation supplies model and token constraints. See [embedding method details](/API/core/ai#flipletaicreateembedding).

## Errors, limits and retries

Use `Accept: application/json`. The AI handlers' JSON errors include `message` and may include `type` or `payload`; authentication middleware can return a different envelope. A provider failure is normally returned as HTTP `400`, even when its embedded code describes a provider-specific limit or failure.

```json
{ "message": "Missing audio file" }
```

Common statuses include `400` for invalid request/provider failure, `401` for invalid or missing authentication, `403` for denied access, `402` for insufficient credit capacity and `429` for rate limiting. Transcription also uses `413` and `415` as described above. Missing or invalid tokens return `401`. An app token targeting an unrelated app or a working draft returns `404` with a `message` describing unavailable access. Responses from other token types depend on their app permissions.

All operations share app AI rate limiting. V2 apps also have per-app plan quotas; V3 apps bypass those quotas and use V3 credits. See [rate limiting](/API/core/ai#rate-limiting). V3 credit metering does not mean requests are unlimited.

Retry transient transport or rate-limit failures after a delay. Correct invalid payloads, unavailable models or access/credit failures before retrying. A timeout does not prove that provider work stopped; retries can create another billable request.

## Streaming boundary

The app completion endpoint is not an OpenAI-compatible SSE endpoint. With `stream: true`, HTTP acknowledges the request; generated content and terminal events are delivered through Fliplet sockets. That HTTP acknowledgement is not a completed generation result.

Use the [JavaScript streaming API](/API/core/ai#streaming-with-createcompletion) for app streaming. This REST reference covers non-streaming external requests and does not prescribe an unverified external socket setup.

## Related documentation

- [Fliplet.AI JavaScript reference](/API/core/ai)
- [AI models and fallbacks](/API/core/ai/models)
- [Build an AI chatbot](/API/core/ai/chatbot)
- [Record or upload audio](/API/core/ai/audio-transcription)
- [REST authentication](/REST-API/authenticate)
