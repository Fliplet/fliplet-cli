---
title: Fliplet app AI REST API
description: "Make app-scoped Fliplet AI requests for text, images, transcription, embeddings and Decisions using the format required by the selected model."
type: api-reference
tags: [rest-api, ai]
v3_relevant: true
deprecated: false
---
# Fliplet app AI REST API

Use these app-scoped endpoints to generate text or images, transcribe audio and create embeddings through Fliplet. Requests use a Fliplet token and the selected provider's payload format; a customer provider key is not required.

These endpoints run models through Fliplet’s server API and require an internet connection. They do not provide an on-device model or offline inference.

## Contents

- [Before your first request](#before-your-first-request)
- [Operations](#operations)
- [Completions](#completions)
- [Images](#images)
- [Audio transcription](#audio-transcription)
- [Embeddings](#embeddings)
- [Decisions](#decisions)
- [Errors, limits and retries](#errors-limits-and-retries)
- [Streaming boundary](#streaming-boundary)
- [Related documentation](#related-documentation)

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
| [Decisions](#decisions) | `POST /v1/apps/:app/ai/decisions` | JSON in the OpenAI Decisions format |

`:app` is the authorized app ID. Examples use EU; substitute the app's regional host. The environment variables below must be set to your own authorized token and app ID. Keep credentials in the external integration's secure configuration.

## Completions

`POST /v1/apps/:app/ai/completions`

Use exactly one input format with an explicit compatible `model`. Non-streaming success returns the provider JSON directly, without a Fliplet response wrapper.

This endpoint does not return an SSE stream. With `stream: true`, HTTP acknowledges the request and Fliplet sockets deliver the generated content; see the [streaming boundary](#streaming-boundary). The external examples below use non-streaming requests.

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

## Decisions

`POST /v1/apps/:app/ai/decisions`

**Availability:** REST only. There is no `Fliplet.AI` JavaScript wrapper for it.

Decisions evaluates shared evidence and returns typed answers: probabilities for predicates, a selected value for choices, and a level-weighted score for rubrics. Fliplet forwards the request body to [OpenAI Decisions](https://developers.openai.com/api/docs/guides/decisions) unchanged and returns OpenAI's success JSON unchanged, without a Fliplet wrapper.

### Request

Use the authentication and app ID rules in [Before your first request](#before-your-first-request), with `Content-Type: application/json`.

| Field | Required | Notes |
| --- | --- | --- |
| `model` | Yes | Must be `gpt-6-luna`. Fliplet rejects a missing or different model with `400` and has no fallback. |
| `input` | Yes | Shared evidence: a string, or user messages containing text and inline base64 image data URLs. OpenAI rejects non-user roles, tools, audio, files and hosted image URLs. |
| `questions` | Yes | Array of questions, each with `type`, `instructions` and `name`. |

Question types:

- `predicate`: estimates the probability that a condition is true.
- `choice`: picks one value from `choices`. Each entry has `value` (string or boolean) and optional `description`.
- `score`: rates the input against ordered `levels`. Each entry has `label` and optional `description`.

Other OpenAI parameters, such as `safety_identifier`, are forwarded as sent. Fliplet does not validate the Decisions schema; OpenAI does, and its validation errors are returned to you (see [Decisions errors](#decisions-errors)). A `safety_identifier` you send is passed to OpenAI only. It does not affect Fliplet authorization, attribution or billing.

```bash
curl --fail-with-body "https://api.fliplet.com/v1/apps/${FLIPLET_APP_ID}/ai/decisions" \
  -H "Auth-token: ${FLIPLET_API_TOKEN}" \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{
    "model": "gpt-6-luna",
    "input": "Customer writes: I was charged twice for my October invoice and need the duplicate refunded.",
    "questions": [
      { "type": "predicate", "name": "is_billing_issue", "instructions": "Is this message about billing or payments?" },
      { "type": "choice", "name": "team", "instructions": "Which team should handle this?", "choices": [
        { "value": "billing" }, { "value": "technical" }, { "value": "sales" } ] },
      { "type": "choice", "name": "needs_refund", "instructions": "Does the customer ask for money back?", "choices": [
        { "value": true }, { "value": false } ] },
      { "type": "score", "name": "urgency", "instructions": "How urgent is this request?", "levels": [
        { "label": "low" }, { "label": "medium" }, { "label": "high" } ] }
    ]
  }'
```

### Response

Success returns OpenAI's JSON. `answers` has one entry per question, in request order. Each entry has its `type` and `name` (`null` when the question had no name). The example below is illustrative:

```json
{
  "model": "gpt-6-luna",
  "answers": [
    { "type": "predicate", "name": "is_billing_issue", "probability": 0.97 },
    { "type": "choice", "name": "team", "choice": "billing", "confidence": 0.94,
      "probabilities": [
        { "value": "billing", "probability": 0.94 },
        { "value": "technical", "probability": 0.04 },
        { "value": "sales", "probability": 0.02 } ] },
    { "type": "choice", "name": "needs_refund", "choice": true, "confidence": 0.91,
      "probabilities": [ { "value": true, "probability": 0.91 }, { "value": false, "probability": 0.09 } ] },
    { "type": "score", "name": "urgency", "score": 1.3, "confidence": 0.58,
      "probabilities": [
        { "label": "low", "value": 0, "probability": 0.12 },
        { "label": "medium", "value": 1, "probability": 0.46 },
        { "label": "high", "value": 2, "probability": 0.42 } ] }
  ],
  "usage": {
    "input_tokens": 182,
    "input_tokens_details": { "cached_tokens": 0, "cache_write_tokens": 0 },
    "output_tokens": 0,
    "output_tokens_details": { "reasoning_tokens": 0 },
    "total_tokens": 182
  }
}
```

How to read the answers:

- **Choice:** `choice` keeps the original type of the value, so a boolean choice returns `true` or `false`, not a string.
- **Score:** `score` is the probability-weighted average of the level indexes (`0` for the first level). It can be a fraction, so `1.3` falls between `medium` and `high`. Use `probabilities` when you need the distribution rather than a single number.
- **Refusal:** an answer with `type: "refusal"` means the model declined that question. Other questions in the same response can still have normal answers, so check each answer's `type`. A refusal is not a negative or "safe" result. Treat it as no answer.

### Credits

Decisions is charged on input tokens only (`usage.input_tokens`), once per successful call. Requests that fail or time out are not charged. A credit check runs before the request is sent to OpenAI, and returns `402` if the app's organization lacks enough credits. Every caller, including Fliplet staff and Studio sessions, uses runtime credits; request headers do not change this. Decisions pricing is provisional: it isn't final yet and isn't a published rate.

<a id="decisions-errors"></a>

### Errors and limits

| Status | `type` | Meaning |
| --- | --- | --- |
| `400` | `entity.parse.failed` | The body is not valid JSON. Nothing was sent to OpenAI. |
| `400` | `unsupported_model` | `model` is missing or is not `gpt-6-luna`. Nothing was sent to OpenAI. |
| `400` or other `4xx` | `provider_invalid_request` | OpenAI rejected the request. `message` explains why, and `payload` contains OpenAI's `code` and `param`. Correct the request before retrying. |
| `402` | — | Not enough credits; the body has `error: "insufficient_credits"` instead of `type`. Nothing was sent to OpenAI. |
| `413` | `payload_too_large` | The request body is over 10 MB (counted in bytes, including chunked uploads). Nothing was sent to OpenAI. |
| `429` | — | Fliplet's app AI rate limit was reached. |
| `502` | `provider_unavailable` | OpenAI is unavailable, rate-limited Fliplet, or the service is misconfigured. Retry later. |
| `502` | `provider_malformed_response` | OpenAI's response was missing its answers. Do not treat this as a result. |
| `504` | `provider_timeout` | OpenAI didn't respond within 60 seconds. |

Fliplet never retries a Decisions request automatically. A `504` doesn't mean OpenAI stopped processing, and retrying sends a new request that is charged separately if it succeeds. Retry `502` and `504` after a delay, and don't retry `4xx` errors without changing the request.

Fliplet logs metadata for each call: outcome, status, token counts, timing and question count. It does not log the evidence you send or the answers returned. Your app's regional Fliplet host doesn't determine where OpenAI processes the request.

## Errors, limits and retries

Use `Accept: application/json`. The AI handlers' JSON errors include `message` and may include `type` or `payload`; authentication middleware can return a different envelope. A provider failure is normally returned as HTTP `400`, even when its embedded code describes a provider-specific limit or failure. Decisions uses its own statuses; see [Decisions errors](#decisions-errors).

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
