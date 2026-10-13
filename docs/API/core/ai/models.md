---
title: AI models available through Fliplet
description: "Choose compatible AI model IDs, compare verified provider facts and understand Fliplet fallbacks, pinning and retirement notices."
type: reference
tags: [js-api, rest-api, ai, models]
v3_relevant: true
deprecated: false
---
# AI models available through Fliplet

Choose an explicitly specified model for text, images, transcription or embeddings through Fliplet. Find configured model IDs, selection facts, fallback defaults and retirement notices here. See the [JavaScript reference](/API/core/ai) for method contracts.

Use a compatible model requested by the user. Otherwise select for the task, budget and required request format. Fallbacks are omission behavior and do not select the latest or most suitable model.

## Contents

- [OpenAI text](#openai-text-models)
- [Gemini text](#gemini-text-models)
- [Images](#image-models)
- [Transcription](#transcription-models)
- [Embeddings](#embedding-models)
- [Pinning and changes](#pinning-and-changes)
- [Fallback defaults](#fallback-defaults)
- [Deprecated and retired models](#deprecated-and-retired-models)

## Model catalog

The tables list model IDs configured by Fliplet. Deprecated and retired entries appear in [Deprecated and retired models](#deprecated-and-retired-models). Configuration and provider routing do not guarantee that a model remains available from its provider, or that every model supports every request format. Check the linked provider reference for endpoint compatibility and parameters before using a model.

### OpenAI text models

OpenAI text models use [createCompletion()](/API/core/ai#flipletaicreatecompletion) or [POST /v1/apps/:app/ai/completions](/REST-API/fliplet-ai#completions). Chat Completions uses `messages`; Responses uses `input` and `useResponses: true`. Models marked Responses require that format. Other models must use a format supported by their individual [OpenAI model reference](https://developers.openai.com/api/docs/models).

Numbered GPT models are ordered by version (highest first), then Astra, Sol, Terra and Luna within a version, and Pro, normal, Mini and Nano within a model family. This order helps you find models; it does not determine which is most suitable for your task. The 4o family is listed separately.

| Model ID | Availability or request-format note |
| --- | --- |
| `gpt-6.1-sol` | Chat Completions or Responses. |
| `gpt-6-astra` | Chat Completions or Responses. |
| `gpt-6-sol` | Chat Completions or Responses. |
| `gpt-6-luna` | Chat Completions or Responses. |
| `gpt-5.6-sol` | Chat Completions or Responses. |
| `gpt-5.6-terra` | Chat Completions or Responses. |
| `gpt-5.6-luna` | Chat Completions or Responses. |
| `gpt-5.5-pro` | Responses format; provider does not support streaming. |
| `gpt-5.5` | Chat Completions or Responses. |
| `gpt-5.4-pro` | Responses format. |
| `gpt-5.4` | Chat Completions or Responses. |
| `gpt-5.4-mini` | Chat Completions or Responses. |
| `gpt-5.2-pro` | Responses format. |
| `gpt-5.2` | Chat Completions or Responses. |
| `gpt-4.1` | Chat Completions or Responses. |
| `gpt-4.1-mini` | Chat Completions or Responses. |

#### GPT-4o family

| Model ID | Availability or request-format note |
| --- | --- |
| `gpt-4o` | Chat Completions or Responses. |
| `gpt-4o-mini` | Chat Completions or Responses. |

#### OpenAI capability and cost facts

Provider selection facts for text-only requests:

- OpenAI positions [GPT-6 Astra](https://developers.openai.com/api/docs/models/gpt-6-astra) for complex reasoning and coding; Standard text input/output rates are $10/$50 per million tokens.
- [GPT-6.1 Sol](https://developers.openai.com/api/docs/models/gpt-6.1-sol) balances capability and cost; Standard text input/output rates are $2/$10 per million tokens. Chat Completions supports text generation without tool calling; use Responses for tools.
- [GPT-6 Luna](https://developers.openai.com/api/docs/models/gpt-6-luna) targets focused, high-volume workloads; Standard text input/output rates are $0.10/$0.50 per million tokens. For Chat Completions function calling, the provider requires `reasoning_effort: 'none'`; Responses uses its own reasoning settings.

These three models accept text and image input and produce text output. Their provider context window is 1,050,000 tokens; prompts above 272,000 input tokens have different pricing. The 272,000-token warning in Fliplet Chat Completions does not truncate or reject input. The rates above describe provider costs, not Fliplet charges, and exclude caching, regional premiums and tools. They are facts for a selection decision, not comparative benchmark results. See [OpenAI pricing](https://developers.openai.com/api/docs/pricing) for conditions. Capability and cost comparisons for other configured models are not summarized here; preserve a supported user pin and verify the model-specific reference before changing it.

### Gemini text models

Gemini text models use [createCompletion({ model, contents })](/API/core/ai#using-gemini-models) or the [app REST completion endpoint](/REST-API/fliplet-ai#completions) with `contents`. Use the [Gemini model reference](https://ai.google.dev/gemini-api/docs/models) for payloads and capabilities.

| Model ID | Availability note |
| --- | --- |
| `gemini-3.5-flash` | See provider model reference. |
| `gemini-3.1-flash-lite` | Earliest announced shutdown May 7, 2027; check provider notice before migration. |
| `gemini-2.5-pro` | Provider restricts access to accounts with prior active usage. |
| `gemini-2.5-flash` | Provider restricts access to accounts with prior active usage. |
| `gemini-2.5-flash-lite` | Provider restricts access to accounts with prior active usage. |

For lightweight extraction and high-frequency text tasks, Google describes [Gemini 3.1 Flash-Lite](https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite) as a low-latency, cost-effective model with text, image, video, audio and PDF inputs and text output. [Gemini 3.5 Flash](https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash) supports multi-step reasoning and coding workflows. These are provider capabilities; a required upload, tool execution or media flow still needs a verified Fliplet integration. See [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing) for provider costs.

See the [Gemini changelog](https://ai.google.dev/gemini-api/docs/changelog) and [Gemini deprecations](https://ai.google.dev/gemini-api/docs/deprecations) for retirement and access restrictions.

### Image models

OpenAI image models use [generateImage()](/API/core/ai#flipletaigenerateimage) or [POST /v1/apps/:app/ai/image](/REST-API/fliplet-ai#images). Gemini image IDs are also configured, but use `createCompletion()` with Gemini `contents` and `generationConfig`, as shown in the [Fliplet Gemini image example](/API/core/ai#gemini-image-generation) and [provider image reference](https://ai.google.dev/gemini-api/docs/image-generation). Read image data from `candidates[0].content.parts` entries with `inlineData`. OpenAI image response handling does not apply.

| Model ID | Availability note |
| --- | --- |
| `gpt-image-2` | OpenAI image model. |
| `gemini-3.1-flash-image` | See provider image reference. |
| `gemini-3-pro-image` | See provider image reference. |

`dall-e-2` and `dall-e-3` are legacy IDs. Fliplet replaces either ID with `gpt-image-2`, so specifying a DALL-E ID does not pin the requested model.

### Transcription models

[transcribeAudio()](/API/core/ai#flipletaitranscribeaudio) and [POST /v1/apps/:app/ai/audio](/REST-API/fliplet-ai#audio-transcription) accept only the three IDs below. Newer provider transcription IDs are not accepted by these Fliplet methods until Fliplet adds support.

| Model ID | Availability note |
| --- | --- |
| `gpt-4o-mini-transcribe` | Deprecated; retirement scheduled for February 26, 2027. |
| `gpt-4o-transcribe` | Deprecated; retirement scheduled for February 26, 2027. |
| `whisper-1` | Deprecated; retirement scheduled for February 26, 2027. |

All three accepted transcription models have announced retirement dates. Provider replacements are not yet accepted by Fliplet's transcription allowlist. See [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations) and test the app's [upload/recording workflow](/API/core/ai/audio-transcription) before changing its model.

### Embedding models

Embedding models use [createEmbedding()](/API/core/ai#flipletaicreateembedding) or [POST /v1/apps/:app/ai/embeddings](/REST-API/fliplet-ai#embeddings). See the [OpenAI embedding reference](https://developers.openai.com/api/docs/guides/embeddings) for input limits and dimensions.

- `text-embedding-3-small`
- `text-embedding-3-large`
- `text-embedding-ada-002`

OpenAI Standard embedding rates are $0.02 per million input tokens for [text-embedding-3-small](https://developers.openai.com/api/docs/models/text-embedding-3-small) and $0.13 for [text-embedding-3-large](https://developers.openai.com/api/docs/models/text-embedding-3-large). These are provider rates, not Fliplet charges. Their default vector dimensions are 1,536 and 3,072 respectively; `dimensions` can reduce the output length.

Keep the same embedding model and dimensions when comparing stored vectors with new queries. Changing models can require regenerating stored embeddings.

## Pinning and changes

An explicit alias such as `gpt-6.1-sol` pins the requested ID; the provider can change the version behind it. A compatible dated snapshot pins a version where the provider offers one, but remains subject to retirement. Configuration or successful routing does not guarantee current provider access. The exported JavaScript `AVAILABLE_MODELS` metadata is older descriptive information, not an enforced allowlist or this catalog.

Fliplet remaps `dall-e-2` and `dall-e-3` to `gpt-image-2`, so those legacy image IDs do not pin the requested model. Keep model, payload and response handling aligned when migrating a [chatbot](/API/core/ai/chatbot). For embeddings, regenerate stored vectors when the new model or dimensions require it. Check current provider notices and retest the feature before changing an existing supported pin.

## Fallback defaults

These defaults apply only when `model` is omitted. They are not recommendations for new features.

The following defaults reflect the JavaScript wrapper and REST handlers. JavaScript inserts its own completion fallback before making the REST request, so that request does not inherit the REST completion default.

| Operation | JavaScript fallback when `model` is omitted | Direct app REST fallback when `model` is omitted |
|---|---|---|
| Chat: `Fliplet.AI()` / `ask()` and `createCompletion({ messages })`; `POST /v1/apps/:app/ai/completions` | `gpt-3.5-turbo` | `gpt-4o-mini` |
| Responses: `createCompletion({ input, useResponses: true })`; same REST endpoint | `gpt-3.5-turbo` (incompatible with Responses; specify a compatible model) | `gpt-4o-mini` |
| Legacy non-streaming prompt: `createCompletion({ prompt })`; same REST endpoint | `gpt-3.5-turbo` (not a legacy prompt model) | `gpt-3.5-turbo-instruct` (retired) |
| Images: `generateImage()`; `POST /v1/apps/:app/ai/image` | `gpt-image-2` through the REST handler | `gpt-image-2` |
| Audio transcription: `transcribeAudio()`; `POST /v1/apps/:app/ai/audio` | `gpt-4o-mini-transcribe` through the REST handler | `gpt-4o-mini-transcribe` |
| Embeddings: `createEmbedding()`; `POST /v1/apps/:app/ai/embeddings` | `text-embedding-ada-002` through the REST handler | `text-embedding-ada-002` |

Gemini requests require an explicit Gemini model ID and a Gemini payload. OpenAI retired `gpt-3.5-turbo-instruct` on September 28, 2026; new text features use `messages` or Responses `input` instead of the legacy `prompt` format. `gpt-3.5-turbo` is scheduled for retirement on October 23, 2026. See [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations).

## Deprecated and retired models

These IDs remain listed in Fliplet configuration or historical JavaScript metadata; their presence does not establish provider availability. Do not select them for new features. Check the provider notices for affected IDs and retirement dates. Transcription IDs remain in their category because they are the only IDs accepted by Fliplet, with deprecation clearly marked.

### Deprecated OpenAI text models

| Model ID | Availability or request-format note |
| --- | --- |
| `gpt-5.4-nano` | Deprecated; retirement April 1, 2027. Chat Completions or Responses. |
| `gpt-5.3-codex` | Deprecated; retirement April 1, 2027. Responses format. |
| `gpt-5.1` | Deprecated; retirement April 1, 2027. Chat Completions or Responses. |
| `gpt-5-pro` | Responses format. Deprecated; see the snapshot retirement notice below. |
| `gpt-5` | Chat Completions or Responses. Deprecated; see the snapshot retirement notice below. |
| `gpt-5-mini` | Chat Completions or Responses. Deprecated; see the snapshot retirement notice below. |
| `gpt-5-nano` | Chat Completions or Responses. Deprecated; see the snapshot retirement notice below. |

OpenAI announced deprecation of GPT-5.1, GPT-5.3-Codex and GPT-5.4-Nano on October 1, 2026. GPT-5, GPT-5 Mini, GPT-5 Nano and GPT-5 Pro are also deprecated. The affected dated snapshots of GPT-5, GPT-5 Mini, GPT-5 Nano and GPT-5 Pro are scheduled for retirement on December 11, 2026; check the [OpenAI deprecation list](https://developers.openai.com/api/docs/deprecations) for exact affected IDs.

### Historical Gemini text models

| Model ID | Availability note |
| --- | --- |
| `gemini-2.0-flash-thinking` | Historical configuration entry; no current provider model with this ID. Do not select. |
| `gemini-2.0-flash` | Legacy 2.0 family retired June 1, 2026; do not select. |
| `gemini-1.5-pro` | Retired September 29, 2025; do not select. |
| `gemini-1.5-flash-8b` | Retired September 29, 2025; do not select. |
| `gemini-1.5-flash` | Retired September 29, 2025; do not select. |

### Retired image models

| Model ID | Availability note |
| --- | --- |
| `gemini-2.5-flash-image` | Retired October 2, 2026; do not select. |

### Historical IDs and additional provider models

The JavaScript `AVAILABLE_MODELS` metadata is not a complete availability catalog or a validation list. In addition to IDs above, it retains `gpt-3.5-turbo`, `text-davinci-003`, `gpt-4`, `gpt-4-turbo`, `o1`, `o1-mini`, `o3` and `o3-mini`. Do not infer availability from that metadata. `text-davinci-003` and `o1-mini` are retired. `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo`, `o1` and `o3-mini` are scheduled for retirement on October 23, 2026. `o3` is deprecated; its `o3-2025-04-16` snapshot is scheduled for retirement on December 11, 2026.

The completion proxy also routes additional model IDs and provider snapshots that are not listed in the catalog above. Successful routing alone does not establish current provider access or endpoint compatibility. New features should start from the configured catalog above and use current provider documentation to confirm compatibility.

## Related documentation

- [Fliplet.AI JavaScript reference](/API/core/ai)
- [Build an AI chatbot](/API/core/ai/chatbot)
- [Record or upload audio](/API/core/ai/audio-transcription)
- [App AI REST API](/REST-API/fliplet-ai)
