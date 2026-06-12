---
title: "fliplet-error-tracking"
description: "Auto-loading runtime that captures JavaScript exceptions and unhandled promise rejections and batches them to Fliplet.App.Logs."
type: reference
tags: [js-api, observability, error-tracking, debugging, runtime]
v3_relevant: true
deprecated: false
category: observability
capabilities: [error tracking, error capture, exception monitoring, unhandled rejection, promise error, debugging, observability, crash reporting, app logs]
---
# `fliplet-error-tracking`

`fliplet-error-tracking` is an auto-loading IIFE that installs three global error hooks and silently batches captured errors to `Fliplet.App.Logs.createBatch()`. It ships as part of the Fliplet runtime middleware and requires no configuration — adding it to your app dependencies is sufficient for it to work.

---

## What you get for free

The script runs as a self-executing function the moment the browser parses it, which is before any app JavaScript runs. It registers three hooks (`window.onerror`, `unhandledrejection`, and a `Promise.prototype.then` wrapper), buffers captured errors in memory, and flushes the buffer to `Fliplet.App.Logs.createBatch()` every 5 seconds. An idempotency guard (`window.__FLIPLET_ERROR_TRACKING = true`) is set before any hooks are installed, so loading the script twice is safe and the second load exits immediately.

---

## What gets captured

### `window.onerror`

Chains with any `window.onerror` handler already registered before the script loads. The original handler is stored and called after `pushError` so third-party error trackers are not displaced. Each error contributes:

- `message` — from `error.message` when an `Error` object is provided, otherwise the string `msg` argument
- `source` — the script URL where the error occurred
- `line`, `col` — line and column numbers
- `stack` — the full stack trace from the `Error` object (truncated to 4096 chars at flush time)

### `window.addEventListener('unhandledrejection', ...)`

Listeners added via `addEventListener` stack rather than replace, so this hook coexists with any existing rejection listeners. For each event:

- `message` — `reason.message` when `reason` is an `Error`; otherwise `String(reason)` or the literal `"Unhandled promise rejection"` when `reason` is falsy
- `stack` — `reason.stack` when `reason` is an `Error`; otherwise absent
- `source`, `line`, `col` — always `null` for promise rejections (the browser does not expose a source location here)

### `Promise.prototype.then` wrapper

Frameworks such as Vue and vue-router intercept promise rejections internally before the browser's unhandled-rejection machinery fires, which means `unhandledrejection` never triggers for those errors. The wrapper catches synchronous exceptions thrown inside `onFulfilled` and `onRejected` callbacks at the point of throw, calls `pushError`, then re-throws so the framework's own error path is unaffected.

The flush pipeline calls `Fliplet.App.Logs.createBatch()` using a saved reference to the native `Promise.prototype.then` (`origThen`, captured before any wrapping). This means the flush promise chain bypasses the wrapper entirely, preventing a flush-handler exception from re-entering `pushError` and creating a recursive loop.

---

## Error payload

Each entry in the `logs` array sent to `Fliplet.App.Logs.createBatch()` has this shape:

```json
{
  "type": "app.error.live",
  "data": {
    "message": "Cannot read properties of undefined",
    "source": "https://example.com/app/js/main.js",
    "line": 42,
    "col": 7,
    "stack": "TypeError: Cannot read properties of undefined\n    at ...",
    "count": 3,
    "userAgent": "Mozilla/5.0 ...",
    "pageUrl": "https://example.com/app",
    "timestamp": 1700000000000,
    "pageId": 1234,
    "platform": "web"
  }
}
```

Field details:

| Field | Type | Notes |
|---|---|---|
| `type` | string | `app.error.live` in production; `app.error.preview` when `Fliplet.Env.get('mode') === 'preview'`. Resolved at capture time; falls back to `app.error.live` if `Fliplet.Env` is not yet available |
| `message` | string | Error message |
| `source` | string \| null | Script URL, or `null` for promise rejections |
| `line` | number \| null | Line number, or `null` for promise rejections |
| `col` | number \| null | Column number, or `null` for promise rejections |
| `stack` | string | Stack trace, truncated to 4096 characters |
| `count` | number | Number of times this unique error occurred in the session; repeated occurrences increment this field rather than creating new buffer entries |
| `userAgent` | string | `navigator.userAgent` at capture time |
| `pageUrl` | string | `location.origin + location.pathname` — query string and fragment are stripped to avoid capturing auth tokens, reset codes, or email addresses that apps may place in the URL |
| `timestamp` | number | Unix milliseconds at capture time |
| `pageId` | number \| null | `Fliplet.Env.get('pageId')`, or `null` if not yet available |
| `platform` | string \| null | `Fliplet.Env.get('platform')`, or `null` if not yet available |
| `droppedCount` | number | Present only on the **first** log in a batch when prior errors were silently dropped due to buffer overflow. Records how many distinct errors were lost |

The batch envelope sent to the API is:

```json
{
  "logs": [...],
  "async": true
}
```

---

## Buffering and deduplication

| Constant | Value | Meaning |
|---|---|---|
| `BUFFER_MAX` | 50 | Maximum number of unique error fingerprints held in memory at once |
| `SESSION_MAX` | 500 | Maximum total error occurrences (unique + repeats) accepted per page session |
| `FLUSH_MS` | 5000 ms | Normal flush interval |
| `CORE_POLL_MS` | 1000 ms | Retry interval when `Fliplet.App.Logs.createBatch` is not yet available |
| `BACKOFF_BASE_MS` | 5000 ms | Initial backoff delay after a retryable flush failure |
| `BACKOFF_MAX_MS` | 300000 ms (5 min) | Maximum backoff delay (exponential, doubles each retry, capped here) |

**Fingerprinting.** Each error is fingerprinted as `message + NUL + source + NUL + line + NUL + col`. The NUL separator prevents collisions when a message itself contains the separator character. Repeat occurrences of the same fingerprint increment the existing entry's `count` field and do not add to the buffer.

**Buffer overflow.** When the buffer already holds 50 distinct fingerprints and a new distinct error arrives, the error is dropped and `droppedCount` is incremented. The `droppedCount` value is included in the `data` of the first log entry in the next flush so it is not lost.

**Session exhaustion.** When `sessionErrorCount` reaches 500, `pushError` becomes a no-op for the remainder of the page session and `window.__FLIPLET_ERROR_TRACKING_EXHAUSTED = true` is set.

**Backoff.** Retryable conditions are: network error (HTTP status 0 or absent), HTTP 429, and any HTTP 5xx. On a retryable failure the batch is re-enqueued into the buffer and the next flush is delayed by an exponentially increasing interval starting at 5 seconds and capped at 5 minutes. Non-retryable 4xx responses are logged once to `console.warn` and the batch is dropped.

---

## Page unload behavior

`visibilitychange` (when `document.visibilityState === 'hidden'`) and `pagehide` both trigger a synchronous beacon flush. The beacon is built locally — it does not call `Fliplet.App.Logs.createBatch()` — because `fliplet-core` may still be initializing at unload time. The beacon POST target is:

```
{apiUrl}v1/apps/{appId}/logs/create/batch
```

The body is a JSON `Blob` with `Content-Type: application/json` sent via `navigator.sendBeacon`. If `appId` is unavailable or `navigator.sendBeacon` is not supported, the beacon is silently skipped. The buffer and fingerprint map are cleared after a successful `sendBeacon` call.

---

## Where errors go (`Fliplet.App.Logs`)

Captured errors are written through `Fliplet.App.Logs.createBatch()`, which POSTs the batch envelope to:

```
POST v1/apps/:appId/logs/create/batch
```

This is the same API method available to app code. See [`Fliplet.App.Logs`](core/app) for the full method reference.

---

## Configuration

There are no configuration flags, window variables, or runtime toggles. The script is auto-loaded by platform middleware; app developers have no action to take.

The only way to suppress all hooks is to set `window.__FLIPLET_ERROR_TRACKING = true` before the script is parsed. The idempotency guard at the top of the IIFE detects this and exits without installing any hooks. This is an escape hatch for environments that have their own error tracking pipeline and want to prevent double-capture; it is not a documented feature.

---

## See also

- [`Fliplet.App.Logs`](core/app) — the batch logging API that receives captured errors
- [`Fliplet.parseError`](core/error) — companion utility for formatting errors into a consistent message string
