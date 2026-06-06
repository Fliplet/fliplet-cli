---
title: "`Fliplet.Native.Downloads`"
description: "Native asset download orchestrator for Fliplet apps — manages app-bundle downloads with concurrency, retries, incremental updates, and progress tracking."
type: api-reference
tags: [js-api, native, cordova, downloads, ios, android, app-bundle]
v3_relevant: true
deprecated: false
exclude_from_v3_catalog: true
---

# `Fliplet.Native.Downloads`

`Fliplet.Native.Downloads` is the asset-delivery engine that powers over-the-air (OTA) updates inside a Fliplet native app. It queues every file the app needs, hands transfers to the Cordova `BackgroundTransfer` plugin, persists queue state in a PV (persistent value) so a download can resume after a cold start, applies incremental DataSource diffs without re-downloading, and reports progress, retries, and errors back to the surrounding `Fliplet.Native.Updates` flow. The queue is keyed by app ID, so a single device can hold partial download state for multiple Fliplet apps at once.

> **Native wrapper only.** Every method on this page requires the Fliplet native runtime (Cordova `BackgroundTransfer`, `cordova.file`, and `PV` are all required). Feature-detect before calling:
>
> ```js
> if (Fliplet.Env.get('platform') !== 'native') {
>   return;
> }
> ```

## What this namespace does

The boot sequence in `Fliplet.Native.init()` calls `Fliplet.Native.Downloads.init()` once on app start. From that point the namespace owns three responsibilities: maintaining the per-app download queue in the `apps_downloads` PV, running the queue with bounded concurrency through `BackgroundTransfer`, and handing finished bundles to `Fliplet.Native.Maintenance` for copy/unzip into the app's data directory. Application code rarely calls anything other than `cancelAppDownloads`, `getPercentageDownloadAsync`, and `getAppErrorSummary` directly — the rest is wired up by `Fliplet.Native.Updates.checkForUpdates()`.

## Initialization and queue

### `init()`

Resolves the platform-specific Cordova file paths, initializes the `download_manager_config` and `apps_downloads` PVs, and automatically resumes any download that was in flight when the previous session ended. Called once by `Fliplet.Native.init()`; app code does not need to call it.

```js
Fliplet.Native.Downloads.init().then(function () {
  console.log('Downloads namespace ready');
});
```

On Android, init also lowers the concurrent-download cap from 8 to 5 (see [Concurrency and platform differences](#concurrency-and-platform-differences)).

### `startDownloads(appId, hasIncrementalUpdates)`

Walks the queued asset list for `appId` and dispatches transfers up to the concurrency cap. Each asset is treated as one of:

- `action: 'download'` (or no `action`) — queued for transfer if it has not already been marked `downloaded`.
- `action: 'delete'` — slated for removal once the rest of the bundle finishes.

If every asset in the queue is a `delete` and the update is not incremental, the assets are removed and the queue entry is cleared without any network activity. If `hasIncrementalUpdates` is true and the asset list is empty, the namespace synthesises a "forceComplete" event so the post-download copy and PV-update steps still run — that is how a pure DataSource diff finalizes.

```js
Fliplet.Native.Downloads.startDownloads(12345, false).then(function () {
  console.log('All transfers settled');
});
```

`startDownloads` is called automatically from `init()` on resume and from `Fliplet.Native.Updates.checkForUpdates()` after the bundle manifest is fetched.

### `addAppDownload(app, hasIncrementalUpdates)`

Adds (or replaces) an app entry in the `apps_downloads` PV. The `app` object must contain at least `id` and `assets`; pass `hasIncrementalUpdates: true` to keep the entry even when `assets` is empty. Returns a Promise that resolves once the PV is persisted.

```js
Fliplet.Native.Downloads.addAppDownload({
  id: 12345,
  version: 42,
  assets: [
    { url: 'https://api.fliplet.com/v1/widgets/.../file.js', path: 'widgets/abc/file.js' }
  ],
  startingPageId: 67890
}, false);
```

This is normally called by the Updates module; calling it directly is appropriate when you are wiring a custom update path.

## Queue inspection

### `getAppDownloads(appId)`

Returns a Promise that **resolves with no value when an entry exists** for `appId` in the queue, and **rejects with no value when none does**. Use it as a presence check rather than a getter — the queue contents are not exposed by this method.

```js
Fliplet.Native.Downloads.getAppDownloads(12345)
  .then(function () { console.log('App 12345 is downloading'); })
  .catch(function () { console.log('App 12345 is not in the queue'); });
```

### `getAllAppsDownloads()`

Synchronous. Returns the raw queue array from the `apps_downloads` PV. Each entry is the full app object that was passed to `addAppDownload`, with each asset annotated with `status` (`'downloaded'` once finished) and `nrOfDownloads` (count of completed assets).

```js
var queue = Fliplet.Native.Downloads.getAllAppsDownloads();
queue.forEach(function (app) {
  console.log(app.id, app.nrOfDownloads, '/', app.assets.length);
});
```

### `setAppsDownloads(apps)`

Synchronous. Overwrites the entire queue with `apps` and persists the PV. Used internally to restore state; calling it directly is a power-user escape hatch — incorrect input will desynchronise the queue from the BackgroundTransfer state.

### `cancelAppDownloads(appId)`

Cancels every in-flight BackgroundTransfer promise tied to `appId`, removes the queue entry, and resets the internal counters (`filesCurrentlyDownloading`, `downloadQueue`, `legacyDownload`, `progress`). Returns a Promise that resolves once the cancellation has propagated.

```js
Fliplet.Native.Downloads.cancelAppDownloads(12345).then(function () {
  console.log('Downloads canceled');
});
```

This is the method to call from a "Cancel update" button in your UI.

## Progress

### `getPercentageDownload(appId)`

Synchronous. Returns a number 0–99 representing the current progress for `appId`:

- If `appId` is not in the queue but is already a local app, returns `100`.
- If `appId` is not in the queue and not installed locally, returns `-1` (the `DOWNLOAD_CANCEL` sentinel).
- For legacy (V1) zip-based downloads, returns the byte-level `progress` variable updated by the BackgroundTransfer progress callback.
- For V2+ asset-based downloads, returns `nrOfDownloads / assetsToDownload.length * 99`. The cap at 99 reserves the last percent for the post-download copy/unzip step.

```js
var pct = Fliplet.Native.Downloads.getPercentageDownload(12345);
$('.progress-bar').css('width', pct + '%');
```

### `getPercentageDownloadAsync(appId)`

Returns a Promise that resolves with the same value as `getPercentageDownload(appId)` **unless** the app has accumulated severe download errors — in which case it resolves with `-1` (the `DOWNLOAD_CANCEL` sentinel) so the UI can switch to an error state. Use this in any code path where the UI should react to error conditions; use the sync variant only for tight render loops.

```js
Fliplet.Native.Downloads.getPercentageDownloadAsync(12345).then(function (pct) {
  if (pct === -1) {
    showErrorState();
    return;
  }
  updateProgressBar(pct);
});
```

### `getNrOfDownloads(appId)`

Synchronous. Returns the number of assets queued for download (excluding `action: 'delete'` entries) for `appId`, or `0` if the app is not in the queue.

```js
var total = Fliplet.Native.Downloads.getNrOfDownloads(12345);
console.log('Downloading ' + total + ' files');
```

## Single file operations

These three methods are independent of the per-app queue and operate on the Cordova filesystem directly. They are the right primitives for screens that need to fetch or read a single asset outside the OTA update pipeline.

### `downloadFile(options)`

Downloads a single file via `BackgroundTransfer.BackgroundDownloader` and writes it into the app's downloads folder (or a subfolder of it). Returns a Promise that resolves with the BackgroundTransfer result object once the file is on disk.

| Option | Type | Description |
|---|---|---|
| `fileName` | string | Local file name to create. |
| `fileUrl` | string | Remote URL to download from. |
| `dir` | string | *Optional.* Subfolder under the downloads folder. Created if absent. |
| `onProgress` | function | *Optional.* Called with the BackgroundTransfer progress object on every update. |
| `onStart` | function | *Optional.* Called with the download Promise as soon as the transfer starts. Defining this opts the call out of the namespace's internal completion queue — the caller owns the promise. |

```js
Fliplet.Native.Downloads.downloadFile({
  fileName: 'manual.pdf',
  fileUrl: 'https://example.com/manual.pdf',
  dir: 'docs',
  onProgress: function (event) {
    console.log(event.bytesReceived, '/', event.totalBytesToReceive);
  }
}).then(function (result) {
  console.log('Saved to', result.fileData.savedFilePath);
});
```

### `getFile(options)`

Reads a previously downloaded file from the app's downloads folder. Returns a Promise that resolves with the Cordova `FileEntry`.

| Option | Type | Description |
|---|---|---|
| `fileName` | string | Local file name to read. |
| `dir` | string | *Optional.* Subfolder under the downloads folder. |

```js
Fliplet.Native.Downloads.getFile({ fileName: 'manual.pdf', dir: 'docs' })
  .then(function (fileEntry) {
    console.log(fileEntry.toURL());
  });
```

### `getTempDownloadPath()`

Synchronous. Returns the full string path of the temporary download directory (`<downloadsFolder>/appTempFiles/`). Use it when you need to construct a path for `Fliplet.Native.Maintenance` calls that operate on in-flight downloads.

```js
var tempPath = Fliplet.Native.Downloads.getTempDownloadPath();
```

## Error handling

The namespace records every failed transfer into a per-app summary, persisted in `Fliplet.Storage` under the `downloadsErrorSummary` key. Two methods expose it:

### `getErrorMessage(appId)`

Returns a Promise that resolves with the **first** error entry recorded for `appId` (or `undefined` if no errors have been recorded). Each entry is the raw BackgroundTransfer error object — `error.fileData.savedFilePath` identifies the file that failed.

```js
Fliplet.Native.Downloads.getErrorMessage(12345).then(function (error) {
  if (error) {
    console.error('First failure:', error.fileData.savedFilePath);
  }
});
```

### `getAppErrorSummary(appId)`

Returns a Promise that resolves with the full summary object `{ appId, summary: [error, error, ...] }` or `undefined` if nothing has been recorded.

```js
Fliplet.Native.Downloads.getAppErrorSummary(12345).then(function (errorSummary) {
  if (errorSummary) {
    console.log('Total failures:', errorSummary.summary.length);
    errorSummary.summary.forEach(function (e) {
      console.error(e.fileData.savedFilePath, e.fileData.reason);
    });
  }
});
```

### Non-severe error policy

Not every failed file aborts the update. The namespace classifies an error as **non-severe** when every entry in the summary fails on one of:

- A path containing `entries.json` (bundled DataSource — falls back to online).
- A common image extension (`png`, `jpg`, `jpeg`, `gif`, `svg`, `webp`, and many others — see `COMMON_IMG_EXT` in the source).

If the summary is non-severe, `getPercentageDownloadAsync` still reports real progress and the update completes successfully. If it contains anything else (a missing JS file, a missing HTML page, etc.), the update is treated as failed and `getPercentageDownloadAsync` resolves with `-1`.

### Retry policy

When `BackgroundTransfer` reports a failure, the namespace retries the same file up to **4 times** for these reason codes:

| Reason | Meaning |
|---|---|
| `502` | No reason given |
| `1000` | `ERROR_UNKNOWN` |
| `1004` | `ERROR_HTTP_DATA_ERROR` |
| `1008` | `ERROR_CANNOT_RESUME` |
| `-1001` | Request timed out |
| `-1003` | Server hostname not found |
| `-1005` | Network connection lost |
| `-1200` | SSL handshake error |

`404` is treated as "system will deal with it" (no retry, classified by the non-severe filter above). `1006` (`ERROR_INSUFFICIENT_SPACE`) immediately rejects with a "storage full" message — no retry, no recovery. Any other reason code skips retry and is recorded in the error summary.

## Concurrency and platform differences

| Platform | Concurrent downloads | Downloads folder | Local data folder |
|---|---|---|---|
| iOS | 8 | `cordova.file.dataDirectory` | `cordova.file.dataDirectory` |
| Android | 5 | `cordova.file.externalDataDirectory` | `cordova.file.applicationStorageDirectory + 'files/'` |
| Windows | 8 | `cordova.file.dataDirectory` | `cordova.file.dataDirectory` |

Android caps concurrency lower because the platform throttles parallel `BackgroundTransfer` operations more aggressively and excessive parallelism causes spurious failures. The cap is read once at `init()` time.

The temp download path is always `<downloadsFolder>/appTempFiles/<appId>/`. Files land there first, then `Fliplet.Native.Maintenance` copies (or unzips, for legacy bundles) them into the per-app folder under the local data folder.

## Hooks

The namespace fires two `Fliplet.Hooks` events on completion. Register handlers via `Fliplet.Hooks.on()` from anywhere in your app code (global JS is the natural place).

### `updateCompleted`

Fired once every queued asset for an app has been downloaded, copied, and the queue entry has been cleared.

```js
Fliplet.Hooks.on('updateCompleted', function (data) {
  console.log('Update finished for app', data.appId);
});
```

### `updateFailed`

Fired when the download flow rejects with a severe error.

```js
Fliplet.Hooks.on('updateFailed', function (data) {
  console.error('Update failed for app', data.appId, data.error);
});
```

Both hooks also trigger a `Fliplet.App.Logs` entry (`update.success` or `update.failed`) so the failure is visible in Studio's app activity log without any extra wiring.

A DOM-level event is also dispatched on `document`: `flDownloadFinished<appId>` (no payload) on success, and `flEventNativeDownloadFailed` (with `event.detail.appId`) on each failed file. These are lower-level than the hooks and are used by the built-in update overlay UI; new code should prefer the hooks.

## See also

- [`Fliplet.Native`](../fliplet-native) — the parent namespace and boot sequence.
- [`Fliplet.Native.Maintenance`](./maintenance) — filesystem primitives that Downloads delegates to for copy, unzip, and delete.
- [`Fliplet.Native.Updates`](../fliplet-native#updates) — the OTA update flow that drives the Downloads queue.
