---
title: "`Fliplet.Native.Maintenance`"
description: "File-system abstraction layer for Cordova: read, write, copy, move, delete, unzip, directory ops. The plumbing under Fliplet.Native.Downloads and Fliplet.Native.Updates."
type: api-reference
tags: [js-api, native, cordova, file-system, ios, android]
v3_relevant: true
deprecated: false
exclude_from_v3_catalog: true
---

# `Fliplet.Native.Maintenance`

`Fliplet.Native.Maintenance` is the file-system abstraction layer that wraps the
Cordova File plugin (`cordova-plugin-file`), the `cordova-plugin-zip` archive
plugin, and `cordova-plugin-file-opener2` behind a Promise-based JavaScript
API. It exposes the read/write/copy/delete/unzip primitives that
`Fliplet.Native.Downloads`, `Fliplet.Native.Updates`, and
`Fliplet.Native.AppManagement` compose into the higher-level download,
update, and bundle-copy flows. Most app code does not call Maintenance
directly — it is the plumbing layer.

## Feature detection

The namespace exists only inside the native Fliplet shell (iOS and Android
Cordova builds). Feature-detect before calling any method:

```js
if (Fliplet.Native && Fliplet.Native.Maintenance) {
  // Native shell — Maintenance is available
  Fliplet.Native.Maintenance.readFileContent('apps/123/manifest.json');
}
```

Outside the native shell — web preview, Studio canvas, mobile browser —
`Fliplet.Native.Maintenance` is `undefined`. Every method returns a Promise
that depends on `cordova.file.*` path constants and `window.resolveLocalFileSystemURL`,
neither of which exists in a browser context.

## What this namespace does

Maintenance owns three responsibilities: (1) resolving the platform-specific
roots (`FlipletDataDir/`, `appTempFiles/`, `www/`) on first use via
`setupFilePaths()` so callers do not have to know whether they are on iOS or
Android; (2) wrapping the imperative, callback-style Cordova File API into
Promise-returning helpers; and (3) providing the launch hand-off the Cordova
shell calls (`init`, `launchStartPage`) when the app first opens. It is used
internally by `Fliplet.Native.Downloads` (to stage and persist downloaded app
bundles), `Fliplet.Native.Updates` (to swap files when an update is
applied), and `Fliplet.Native.AppManagement` (to register the local app list).

## Reading files

### `readFileContent(fileName)`

Reads a file via `FileReader.readAsText()` and resolves with the text content.

| Argument | Type | Description |
|---|---|---|
| `fileName` | `String` | Full URL to the file (`cdvfile://`, `file://`, or an absolute path produced by `getFlipletDataFolder()` etc.). |

Returns a `Promise<String>` that resolves with the file's text content, or
rejects if the file cannot be resolved or read.

```js
var dataDir = Fliplet.Native.Maintenance.getFlipletDataFolder();

Fliplet.Native.Maintenance.readFileContent(dataDir + '123/manifest.json')
  .then(function(content) {
    var manifest = JSON.parse(content);

    console.log('App version:', manifest.version);
  });
```

### `readDirectoryFiles(directoryToRead)`

Lists the immediate entries of a directory using the Cordova
`DirectoryReader`.

| Argument | Type | Description |
|---|---|---|
| `directoryToRead` | `String` | Full URL to the directory. |

Returns a `Promise<Array<Entry>>` resolved with Cordova `FileEntry` /
`DirectoryEntry` objects. Each entry has `name`, `fullPath`, `nativeURL`,
`isDirectory`, and `isFile`.

```js
var dataDir = Fliplet.Native.Maintenance.getFlipletDataFolder();

Fliplet.Native.Maintenance.readDirectoryFiles(dataDir + '123/')
  .then(function(entries) {
    entries.forEach(function(entry) {
      console.log(entry.isDirectory ? 'dir:' : 'file:', entry.name);
    });
  });
```

## Writing files

### `writeFile(fileName, data, options)`

Writes data into a file inside the Fliplet data folder. The data is
JSON-serialized and wrapped in a `Blob` before being written.

| Argument | Type | Description |
|---|---|---|
| `fileName` | `String` | File path **relative to `FlipletDataDir/`**. The file must already exist — `writeFile` calls `getFile` with `{ create: false }`. |
| `data` | `Object` | Data to write. Serialized with `JSON.stringify` before writing. |
| `options` | `Object` | Required. |
| `options.mimeType` | `String` | Required. Used as the `Blob` type. Rejects immediately if omitted. |

Returns a `Promise` that resolves when the write completes, or rejects with
the `FileError` from Cordova.

```js
Fliplet.Native.Maintenance.writeFile(
  '123/manifest.json',
  { version: '2.1.0', updatedAt: Date.now() },
  { mimeType: 'application/json' }
);
```

## Copying and moving

### `copyFile(options)`

Copies a single Cordova `FileEntry` into a destination `DirectoryEntry`.

| Property | Type | Description |
|---|---|---|
| `options.file` | `FileEntry` | The file to copy (as returned by `readDirectoryFiles` or `resolveLocalFileSystemURL`). |
| `options.destinationFolder` | `DirectoryEntry` | Target directory. |
| `options.fromAppBundle` | `Boolean` | When `true`, copies directly via `file.copyTo`. When `false`, the file is first staged through the temp download dir and then copied. |

Returns a `Promise` resolved when the copy completes.

### `copyFileListIntoDirectory(options)`

Copies a list of files into a destination directory in parallel, ordering
them by depth so parent directories are created before their children.

| Property | Type | Description |
|---|---|---|
| `options.fileList` | `Array<FileEntry>` | Files to copy. |
| `options.destinationFolder` | `DirectoryEntry` | Destination directory. |
| `options.fromAppBundle` | `Boolean` | Pass-through flag forwarded to each `copyFile` call. |

Returns a `Promise` resolved when every copy completes.

```js
Fliplet.Native.Maintenance.readDirectoryFiles(sourceUrl)
  .then(function(fileList) {
    return Fliplet.Native.Maintenance.copyFileListIntoDirectory({
      fileList: fileList,
      destinationFolder: targetDirEntry,
      fromAppBundle: true
    });
  });
```

### `copyFileBasedOnFullPaths(options)`

Convenience wrapper around `copyFile` for callers that hold absolute paths
instead of resolved Cordova entries. It resolves both paths, then delegates
to `copyFile` with `fromAppBundle: true`.

| Property | Type | Description |
|---|---|---|
| `options.filePath` | `String` | Full URL of the source file. |
| `options.destinationFolderPath` | `String` | Full URL of the destination directory. |

Returns a `Promise` resolved when the copy completes. Rejects if either
path is empty or fails to resolve.

```js
Fliplet.Native.Maintenance.copyFileBasedOnFullPaths({
  filePath: 'cdvfile://localhost/persistent/appTempFiles/123/manifest.json',
  destinationFolderPath: 'cdvfile://localhost/persistent/FlipletDataDir/123/'
});
```

## Removing

### `deleteFiles(options)`

Recursively deletes one or more app directories underneath a parent data
folder. This is the bulk-delete path used when an app is uninstalled.

| Property | Type | Description |
|---|---|---|
| `options.list` | `Array<Number>` | App IDs whose directories should be removed. Each ID is `.toString()`-converted to a folder name. |
| `options.dataFolder` | `String` | Parent folder URL — typically `getFlipletDataFolder()`. |

Returns a `Promise` that resolves when every directory is removed. Rejects
with `{ code: 9, message }` if any individual `removeRecursively` fails.

```js
Fliplet.Native.Maintenance.deleteFiles({
  list: [123, 456],
  dataFolder: Fliplet.Native.Maintenance.getFlipletDataFolder()
});
```

### `deleteListOfFiles(options)`

Removes a list of individual files inside a single app's folder. Files that
do not exist are silently skipped (resolved as success) — the operation is
idempotent.

| Property | Type | Description |
|---|---|---|
| `options.appId` | `Number` | App ID — used to scope removal to `FlipletDataDir/<appId>/`. |
| `options.assets` | `Array<{ path: String }>` | Files to remove, each described by a `path` relative to the app folder. |

Returns a `Promise` resolved with the original `options` once all files
finish processing.

```js
Fliplet.Native.Maintenance.deleteListOfFiles({
  appId: 123,
  assets: [
    { path: 'pages/old-screen.html' },
    { path: 'assets/legacy-bundle.js' }
  ]
});
```

## Directory operations

### `createDirectoryForApp(appID)`

Creates `FlipletDataDir/<appID>/` if it does not exist. No-op on Windows
(returns `Promise.resolve()` immediately).

| Argument | Type | Description |
|---|---|---|
| `appID` | `Number \| String` | App ID. Converted to string for the directory name. |

Returns a `Promise<DirectoryEntry>` resolved with the directory entry.

### `getFlipletDataFolder()`

Returns the full URL of the Fliplet data folder
(`<documentsFolder>FlipletDataDir/`), where downloaded apps are stored. Calls
`setupFilePaths()` synchronously the first time.

```js
var dataDir = Fliplet.Native.Maintenance.getFlipletDataFolder();
// e.g. 'cdvfile://localhost/persistent/FlipletDataDir/'
```

### `getFlipletWWWFolder()`

Returns the full URL of the Cordova `www/` directory inside the application
bundle — where the shell's bundled JS, CSS, and HTML live.

### `getFlipletTempFolder()`

Returns the full URL of the temporary download folder
(`<documentsFolder>appTempFiles/`), where new app bundles are staged before
being copied into `FlipletDataDir/`.

## Existence checks

### `checkIfFileExists(fileUrl)`

Checks whether a file exists **relative to `FlipletDataDir/`**. Resolves if
the file is found, rejects otherwise. If `flipletDataFolder` has not yet
been initialized, `setupFilePaths()` is called automatically — safe to call
before `Fliplet.Native.init()` resolves.

| Argument | Type | Description |
|---|---|---|
| `fileUrl` | `String` | Path relative to `FlipletDataDir/`, e.g. `'123/manifest.json'`. |

Returns a `Promise<void>`. Failures are also captured to Sentry (`Raven`)
with full environment context.

```js
Fliplet.Native.Maintenance.checkIfFileExists('123/screens/home.html')
  .then(function() {
    console.log('Screen is downloaded.');
  })
  .catch(function() {
    console.log('Screen missing — trigger a re-download.');
  });
```

### `checkValidFileFullPath(fullPath)`

Validates that a fully-qualified path resolves to an entry on the device's
file system. Unlike `checkIfFileExists`, this accepts an absolute URL —
useful for verifying paths produced outside the Fliplet data folder.

| Argument | Type | Description |
|---|---|---|
| `fullPath` | `String` | Full URL of the file. |

Returns a `Promise<Entry>` resolved with the Cordova entry, rejected if the
path is empty or unresolvable.

### `getFileMetaData(fullPath)`

Resolves with the Cordova `File` metadata object (MIME `type`, `name`,
`size`, `lastModified`) for a fully-qualified file path.

| Argument | Type | Description |
|---|---|---|
| `fullPath` | `String` | Full URL of the file. |

Returns a `Promise<File>`.

```js
Fliplet.Native.Maintenance.getFileMetaData(
  'cdvfile://localhost/persistent/FlipletDataDir/123/report.pdf'
).then(function(meta) {
  console.log(meta.type, meta.size); // 'application/pdf', 102400
});
```

## Archive operations

### `unzipFilesIntoDirectory(fileList)`

Unzips a list of zip files sequentially into `FlipletDataDir/`. Each archive
is moved into its own subdirectory (named after the zip's basename) and
unpacked there using `cordova-plugin-zip`.

| Argument | Type | Description |
|---|---|---|
| `fileList` | `Array<FileEntry>` | Cordova `FileEntry` objects pointing at the zip files. |

Returns a `Promise<void>` resolved when every archive finishes extracting.

```js
Fliplet.Native.Maintenance.readDirectoryFiles(tempFolderUrl)
  .then(function(entries) {
    var zips = entries.filter(function(e) {
      return e.isFile && /\.zip$/i.test(e.name);
    });

    return Fliplet.Native.Maintenance.unzipFilesIntoDirectory(zips);
  });
```

## Launch helpers

These methods are called by the Cordova shell's `maintenance.html` boot
sequence. They are exposed for completeness but rarely useful to app code.

### `init()`

Boots the maintenance flow: clears stale storage keys, sets up file paths,
loads the preloaded app list, and navigates to the default app's start
page. Called once by `maintenance.html` on cold start.

Returns a `Promise<void>`.

### `initWithParams()`

Lighter init: only runs `setupFilePaths()`. Used when the shell is reloaded
mid-flight and the path globals need to be re-established without the full
boot.

### `launchStartPage(launchPage)`

Resolves the default app's starting page and navigates to it. If
`launchPage` is provided it overrides the manifest's `startingPageId`.

| Argument | Type | Description |
|---|---|---|
| `launchPage` | `Number \| null` | Page ID to launch, or `null` to use the manifest default. |

Returns a `Promise<void>`.

### `nativeOpenFile(filePath)`

Opens a file in the device's default OS handler via
`cordova-plugin-file-opener2`. Used to open downloaded PDFs, documents,
images, etc. If the path is already a `cdvfile://` URL it is used as-is;
otherwise it is resolved relative to the current app's data folder.

| Argument | Type | Description |
|---|---|---|
| `filePath` | `String` | A `cdvfile://` URL, or a path relative to `FlipletDataDir/<currentAppId>/`. |

Returns a `Promise<void>`. On `ACTIVITY_NOT_FOUND` (no installed app can
handle the MIME type), surfaces a localized "unsupported file type" popup.

```js
Fliplet.Native.Maintenance.nativeOpenFile('downloads/report.pdf');
```

## App-list helpers

### `getPreloadedAppList()`

Reads `default.js` from the `www/` folder (or returns a cached copy) and
resolves with the preloaded app list shipped inside the bundle.

Returns a `Promise<Array<App>>`.

### `saveAppDataJSON()`

Reads the preloaded app list and registers each app with
`Fliplet.Native.AppManagement.addLocalApp`.

Returns a `Promise<void>`.

### `getDefaultAppID()`

Reads `fl_default_app_id` from `NativeStorage` and resolves with the value.

Returns a `Promise<String>`.

## See also

- [`../fliplet-native`](../fliplet-native) — parent namespace overview, feature
  detection, and platform support.
- [`./downloads`](./downloads) — high-level download API built on
  `copyFileListIntoDirectory`, `unzipFilesIntoDirectory`, and
  `checkIfFileExists`.
- [`../fliplet-runtime`](../fliplet-runtime) — the readiness model
  (`Fliplet()`, `Fliplet.Env.get('platform')`) used to guard native-only
  code paths.
