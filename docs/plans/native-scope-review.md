# fliplet-native scope review

**Purpose:** plan the consolidated documentation for `fliplet-native` before
authoring. Reviewer signs off on (a) the per-sub-module recommendations and
(b) the file-grouping shape; then authoring proceeds.

---

## Summary

  - Total sub-modules surveyed: 13
  - "Document fully" recommendations: 9
  - "Keep but skip docs" recommendations: 2
  - "Delete from source" recommendations: 0
  - 4 already excluded per V3-relevance call (AppData / Authentication / Config / Templates)
  - Top-level bootstrap (`native.js`) documented as "Native (top)" entry point section

---

## Per-sub-module review

### 1. Native (top-level bootstrap)

**Source signal**
  - File: `native.js` — 7.6 KB
  - Last git-touched: 2026-04-13
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native` (root object; no sub-namespace)
  - Public methods:
    - `Fliplet.Native.init()` — orchestrates the full native boot sequence (storage restore → AppManagement → Maintenance → Downloads → Locale → Updates → Interaction); called automatically via `Fliplet.Navigator.onPluginsReady()`
    - `Fliplet.Native.getFrameworkVersion()` — reads the bundled `framework-data.json` and caches the version string in `Fliplet.Storage`
  - Platform conditionals: Android-specific resize listener injected at boot; boot sequence skipped on non-native (guard via `window.ENV.platform === 'native'`)

**V3-relevance:** yes — `native.js` is the V3-native bootstrap entry point; the V3 guard (`window.ENV.engine === 'v3'`) is explicit in the source

**Recommendation:** `document fully` — explain that `Fliplet.Native.init()` is called automatically and that `getFrameworkVersion()` is the only method app code would ever call directly

**Estimated doc length:** ~30 lines

---

### 2. AppManagement (`app-management.js`)

**Source signal**
  - File: `app-management.js` — 16.7 KB
  - Last git-touched: 2026-05-13
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native.AppManagement`
  - Public methods (17, 1 deprecated):
    - `init()` — initialises the PV-backed local apps store
    - `getLocalApps()` — resolves with the device-stored app list
    - `getLocalAppsSync()` — synchronous variant; returns array directly
    - `setLocalApps(apps)` — persists a new app array to PV storage
    - `getServerApps()` — fetches the authorized app list from `v1/apps`
    - `getFullApps()` — merges server and local lists, annotating each with `local` and `delete` flags
    - `addLocalApp(app)` — upserts an app entry into local storage
    - `removeLocalApp(app)` — cancels downloads, deletes files, and removes the app from local storage
    - `getAppData(appId)` — synchronous lookup of a locally stored app by ID
    - `setAppFullData(appData)` — fetches full bundle data for an app and updates local storage
    - `removeAppAssets(options)` — removes specific asset paths from a locally stored app record
    - `getAppIcon(app)` — resolves the local filesystem icon path for an app
    - `doesAppIconExist(app, fileList)` — helper that checks directory entries for an icon file
    - `removeAppStorage(appId)` — clears all Fliplet.Storage namespaces tied to an app ID
    - `refreshAppList()` — *deprecated* (FV 1.0 era); stubs remain in source
    - `removeLocalAppData(appId)` — *deprecated*; mutates in-memory array without persistence
  - Platform conditionals: `getAppIcon` skips on Windows (`Modernizr.windows`); directory API is Cordova-only

**V3-relevance:** yes — actively maintained; called during V3 native boot

**Recommendation:** `document fully` — surface the methods that component authors or maintenance scripts legitimately call (`getLocalApps`, `getLocalAppsSync`, `removeLocalApp`, `removeAppStorage`, `getAppData`); mark deprecated pair as deprecated

**Estimated doc length:** ~70 lines

---

### 3. Interaction (`app-interaction.js`)

**Source signal**
  - File: `app-interaction.js` — 5.9 KB
  - Last git-touched: 2022-03-24
  - Classification: **dormant** (4+ years)

**Public surface**
  - Namespace: `Fliplet.Native.Interaction` (the file sets `Fliplet.Native.Interaction`, not `.AppInteraction`)
  - Public methods (2):
    - `init(portalSpecific)` — attaches pointer/touch listeners that detect a long-press (500 ms tap-and-hold), then shows a native `confirm` dialog offering "Check for updates", "Exit", or "Cancel"; called by `native.js` only when `Fliplet.App.isPreview(true)`
    - `returnToBookshelf()` — programmatically triggers the same exit dialog
  - Platform conditionals: no explicit iOS/Android conditional; relies on `Fliplet.Navigate.exitApp()` which is native-only

**V3-relevance:** yes — the long-press-to-exit gesture is still shipped in preview builds; `native.js` calls `Interaction.init(true)` in the boot sequence

**Recommendation:** `document fully` — the dormancy reflects stable, not dead, code; the public surface is small but the behavior (long-press escape hatch) is non-obvious and worth documenting for developers who want to disable or extend it

**Estimated doc length:** ~25 lines

---

### 4. Updates (`app-updates.js`)

**Source signal**
  - File: `app-updates.js` — 35.5 KB
  - Last git-touched: 2026-04-13
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native.Updates`
  - Public methods (3):
    - `init()` — reads last-update timestamp from storage, resumes any in-progress download UI, then either fires an immediate update check (first run or notification-triggered) or sets a 30-second polling timer
    - `checkForUpdates(appId, manual, lastUpdateType, notificationData, force)` — queries `v1/apps/:id/bundle/update`, coordinates the update UI (silent / visible / forced overlays), manages incremental DataSource diffs, delegates file queuing to `Downloads`, and handles notification deep-link navigation
    - `createUpdateTimer()` — re-arms the 30-second background update timer
  - Platform conditionals: uses `cordova.plugins.insomnia` to prevent screen sleep during downloads (graceful fallback if plugin absent)

**V3-relevance:** yes — actively maintained; integral to the V3 native OTA update pipeline

**Recommendation:** `document fully` — `checkForUpdates` is the one method developers call directly (e.g. from a "Check for updates" button); the init and timer methods are framework-internal but should be noted

**Estimated doc length:** ~50 lines

---

### 5. Downloads (`downloads.js`)

**Source signal**
  - File: `downloads.js` — 54.5 KB
  - Last git-touched: 2025-10-24
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native.Downloads`
  - Public methods (13):
    - `init()` — resolves Cordova filesystem paths (differs iOS vs Android), restores PV-backed download queue, resumes any in-progress downloads
    - `startDownloads(appId, hasIncrementalUpdates)` — processes the queued asset list for an app, dispatching up to 8 concurrent file transfers (5 on Android)
    - `addAppDownload(app, hasIncrementalUpdates)` — adds an app's asset manifest to the download queue PV
    - `cancelAppDownloads(appId)` — aborts all active transfers for an app and clears its queue entry
    - `getAppDownloads(appId)` — resolves if an app has active downloads, rejects otherwise
    - `getAllAppsDownloads()` — returns the full downloads PV array synchronously
    - `setAppsDownloads(apps)` — overwrites the downloads PV (internal use)
    - `getTempDownloadPath()` — returns the filesystem temp directory path string
    - `downloadFile(options)` — low-level single-file transfer via Cordova `FileTransfer`
    - `getFile(options)` — reads a file from the app's local folder
    - `getNrOfDownloads(appId)` — returns count of assets queued for an app
    - `getPercentageDownload(appId)` / `getPercentageDownloadAsync(appId)` — sync and async variants of download-progress percentage
    - `downloadCoverImages(options)` — downloads app cover/icon images with a progress callback
    - `getErrorMessage(appId)` / `getAppErrorSummary(appId)` — retrieves the stored download-error summary for an app
  - Platform conditionals: Android uses `externalDataDirectory` and `applicationStorageDirectory`; iOS uses `dataDirectory`; concurrent-download cap lowered to 5 on Android

**V3-relevance:** yes — the primary asset-delivery engine for V3 native OTA updates

**Recommendation:** `document fully` — large surface; `cancelAppDownloads`, `getPercentageDownloadAsync`, and `getAppErrorSummary` are the methods most likely called by app code; the rest are internal coordination

**Estimated doc length:** ~80 lines

---

### 6. Locale (`locale.js`)

**Source signal**
  - File: `locale.js` — 3.3 KB
  - Last git-touched: 2022-08-23
  - Classification: **dormant** (3.5+ years)

**Public surface**
  - Namespace: `Fliplet.Native.Locale`
  - Public methods (2):
    - `init(appId)` — reads `<appId>/strings.json` from the Cordova filesystem, loads locale metadata (`_locales`), sets `Fliplet.Env('translation')`, and calls `Fliplet.initializeLocale()`
    - `updateSessionLocale(appId, locale)` — rewrites the `_locales` array in `strings.json` on disk so the chosen locale is promoted to index 0
  - Platform conditionals: depends on `Fliplet.Native.Maintenance.readFileContent` and `.writeFile` (Cordova filesystem); not callable on web

**V3-relevance:** yes — `native.js` calls `Locale.init(currentAppId)` in the V3 boot sequence; strings.json is delivered via the OTA update pipeline

**Recommendation:** `document fully` — dormancy reflects that the strings format is stable, not that the module is unused; `updateSessionLocale` is the only method a component might call to switch the active locale at runtime

**Estimated doc length:** ~25 lines

---

### 7. Maintenance (`maintenance.js`)

**Source signal**
  - File: `maintenance.js` — 45.9 KB
  - Last git-touched: 2026-02-19
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native.Maintenance`
  - Public methods (22, 2 deprecated):
    - `init()` — full bootstrap: sets up file paths, reads preloaded app list, navigates to the default page; used by the maintenance HTML page
    - `initWithParams()` — lightweight init that only sets up file paths; called by `native.js` during normal boot
    - `getPreloadedAppList()` — reads `default.js` from the preloaded bundle to get initial app configuration
    - `createDirectoryForApp(appId)` — creates a per-app directory in the Fliplet data folder
    - `deleteFiles(options)` — removes a list of app directories from the filesystem
    - `deleteListOfFiles(options)` — removes individual asset files by path
    - `launchStartPage(app)` — navigates to an app's start page
    - `startBundleCopyProcess(options)` — orchestrates copying of preloaded bundle files to the data directory
    - `copyFileListIntoDirectory(options)` — bulk-copies an array of file entries to a destination
    - `copyFile(options)` — copies or moves a single file entry
    - `copyFileBasedOnFullPaths(src, dest)` — copies a file by resolving two native URL paths
    - `readDirectoryFiles(dir)` — reads and resolves with the entries of a directory
    - `checkIfFileExists(path)` — resolves if the file exists at a relative path under the data folder
    - `checkValidFileFullPath(path)` — resolves a full native URL path if valid
    - `getApplicationMode()` — returns `'internal'` or `'external'` (affects legacy bundle URL)
    - `nativeOpenFile(path)` — opens a file using the device's native file-opening intent
    - `getFileMetaData(path)` — returns file metadata (size, lastModified) for a given path
    - `readFileContent(filePath)` — reads and resolves with the text content of a file
    - `writeFile(relativePath, content, options)` — serializes and writes content to a file in the app folder
    - `unzipFilesIntoDirectory(options)` — unzips a downloaded bundle into the data folder
    - `getAppConfigurationFile(appId)` — reads and parses the JSON config file for an app
    - `saveAppDataJSON()` — persists the current app list to a JSON file
    - `getFlipletDataFolder()` / `getFlipletWWWFolder()` / `getFlipletTempFolder()` — return platform-specific folder path strings
    - `getDefaultAppID()` — reads `fl_default_app_id` from NativeStorage
    - `loadBundledFiles()` — *deprecated*
    - `checkIfEnoughFreeSpace()` — *deprecated and incomplete* (TODO comment; always returns true)
  - Platform conditionals: Windows (`Modernizr.windows`) skips the full init; Android vs iOS path divergence for `dataDirectory` / `applicationStorageDirectory`

**V3-relevance:** yes — the filesystem abstraction layer consumed by every other active sub-module

**Recommendation:** `document fully` — this is the most complex sub-module; the dozen path-manipulation and file-read/write methods are legitimately callable by custom components (e.g. `readFileContent`, `nativeOpenFile`, `getFileMetaData`); the maintenance-page init flow needs its own callout

**Estimated doc length:** ~100 lines

---

### 8. Notifications (`notifications.js`)

**Source signal**
  - File: `notifications.js` — 4.8 KB
  - Last git-touched: 2026-03-13
  - Classification: **active**

**Public surface**
  - Namespace: `Fliplet.Native.Notifications`
  - Public methods (2):
    - `init()` — binds `cordova.plugins.notification.local` click handler and checks `fl_pending_notification` storage for a deferred notification payload (from an org-switch reload cycle)
    - `handle(data, delay)` — processes a raw notification payload: runs `pushNotificationOpen` hook, optionally switches organization, and navigates to the target screen or triggers a `checkForUpdates` call if the screen is not yet loaded
  - Platform conditionals: silently no-ops if `cordova.plugins.notification` is undefined (web/simulator)

**V3-relevance:** yes — the sole handler for local-notification deep-links in V3 native apps

**Recommendation:** `document fully` — `handle()` is worth documenting as it can be called directly by components that generate programmatic notifications

**Estimated doc length:** ~30 lines

---

### 9. StatusBar (`status-bar.js`)

**Source signal**
  - File: `status-bar.js` — 4.3 KB
  - Last git-touched: 2026-06-01
  - Classification: **active** (just updated)

**Public surface**
  - Namespace: `Fliplet.Native.StatusBar`
  - Public methods / properties (5 + 1 init):
    - `init()` — iOS-only; ensures bar is visible, calls `StatusBar.overlaysWebView(false)` to push content below the bar, and sets color based on page background brightness via `Fliplet.Page.getStatusBarBgColor()`
    - `setColor(color)` — accepts `'light'` or `'dark'`/`'default'`; calls `StatusBar.styleLightContent()` or `StatusBar.styleDefault()`
    - `show()` — shows the native status bar
    - `hide()` — hides the native status bar
    - `isVisible()` — returns `StatusBar.isVisible` boolean
    - `notch` — exposed string property (`''` | `'left'` | `'right'`); updated on orientation change via `checkNotch()`
  - Platform conditionals: `init()` is iOS-only (`Modernizr.ios`); `setColor`/`show`/`hide`/`isVisible` guard on `typeof StatusBar === 'undefined'` and log errors on web; notch detection works on any orientation-API-supporting browser

**V3-relevance:** yes — newly active (2026-06-01 touch); `show()`, `hide()`, `setColor()` are reasonable to call from screen code

**Recommendation:** `document fully` — `show`, `hide`, `setColor`, and `isVisible` are the four methods developers might legitimately call; `notch` property is useful for layout compensation

**Estimated doc length:** ~35 lines

---

### 10. AppData / Data (`app-data.js`) — EXCLUDED

**Source signal**
  - File: `app-data.js` — 2.2 KB
  - Last git-touched: 2022-03-24
  - Classification: **dormant**

**Public surface**
  - Namespace: `Fliplet.Native.Data`
  - Methods: `init()`, `saveData(trackingData)`, `sendStoredData()`, `sendData(options)`
  - Functionality: a PV-backed queue that batches and retries POST requests to `v1/widget-instances/:id/data-tracking`

**V3-relevance:** no — dormant telemetry queue; the tracking endpoint is internal widget infrastructure; no V3 component should call this directly; superseded by server-side analytics pipelines

**Recommendation:** `keep but skip docs` — still called by `native.js` (`Fliplet.Native.Data.init()`), so not dead code, but the API surface is internal-only; no end-user documentation warranted

**Estimated doc length:** 0 lines

---

### 11. Authentication (`authentication.js`) — EXCLUDED

**Source signal**
  - File: `authentication.js` — 5.9 KB
  - Last git-touched: 2022-03-24
  - Classification: **dormant**

**Public surface**
  - Namespace: `Fliplet.Native.Authentication`
  - Methods: `loginUser`, `logoutUser`, `verifyLogin`, `getAuthToken`, `setAuthToken`, `saveUserDetails`, `getUserDetails`, `clearUserDetails`
  - Relies directly on `NativeStorage` (Cordova plugin) for all persistence

**V3-relevance:** no — superseded by `Fliplet.User` (which abstracts storage); all NativeStorage calls are legacy; V3 apps use `Fliplet.Session` / `Fliplet.User` for auth

**Recommendation:** `keep but skip docs` — `native.js` does not call this module in its boot sequence; referenced only by legacy portals; code is not reachable from modern app code, but removal requires native team sign-off

**Estimated doc length:** 0 lines

---

### 12. Config (`config.js`) — EXCLUDED

**Source signal**
  - File: `config.js` — 2.0 KB
  - Last git-touched: 2022-03-24
  - Classification: **dormant**

**Public surface**
  - Namespace: `Fliplet.Native.Config`
  - Methods: `setApplicationSchema(options)`, `getApplicationSchema()`
  - Stores two keys (`current_webservice_url_v2`, `current_application_schema_v2`) via NativeStorage

**V3-relevance:** no — stores the API endpoint schema for the legacy FV 1.0 environment switcher; V3 apps resolve their API URL from `window.ENV`; no call site in the V3 native boot sequence

**Recommendation:** `keep but skip docs` — used only by the legacy Fliplet Viewer environment switcher; no app-level documentation warranted

**Estimated doc length:** 0 lines

---

### 13. Templates (`templates.js`) — EXCLUDED

**Source signal**
  - File: `templates.js` — 3.3 KB
  - Last git-touched: 2021-12-09
  - Classification: **dormant** (oldest file in the package)

**Public surface**
  - Namespace: `Fliplet.Native.Templates`
  - Properties: `Fliplet.Native.Templates.Update` — a single HTML string containing the update-overlay markup and four `<script type="text/html">` template blocks (default, success, already-updated, fail states)

**V3-relevance:** no — the template markup is consumed internally by `app-updates.js` via `$('body').append(Fliplet.Native.Templates.Update)`; no external API; developers do not interact with this namespace

**Recommendation:** `keep but skip docs` — strictly an internal rendering dependency of Updates; required at runtime but not a public API

**Estimated doc length:** 0 lines

---

## File grouping recommendation

**Recommendation: (b) hybrid — one main doc + 2 separate files for the two largest sub-modules**

Rationale:

  - Downloads (54.5 KB source, ~80 doc lines) and Maintenance (45.9 KB source, ~100 doc lines) each have surfaces substantial enough that burying them as H2 sections in a consolidated file would make the page unwieldy (~400+ lines total) and difficult to deep-link.
  - Updates (35.5 KB source, ~50 doc lines) and AppManagement (16.7 KB source, ~70 doc lines) are mid-sized but their content is closely tied to the top-level Native and boot-sequence narrative; keeping them inline avoids the need for cross-links on the most common reader path (understanding the boot flow).
  - The four small modules (Interaction, Locale, Notifications, StatusBar, ~25–35 lines each) are most useful as H2 sections — readers land there because they saw `Fliplet.Native.StatusBar` in someone else's code and want a quick reference.

**Proposed output:**

| File | Contents |
|---|---|
| `docs/API/fliplet-native.md` | Package overview, install note, feature-detect callout, H2 sections for: Native (top), AppManagement, Updates, Interaction, Locale, Notifications, StatusBar |
| `docs/API/fliplet-native/downloads.md` | Full `Fliplet.Native.Downloads` reference (linked from main doc) |
| `docs/API/fliplet-native/maintenance.md` | Full `Fliplet.Native.Maintenance` reference (linked from main doc) |

All three files carry the standard `fliplet-native` frontmatter tag and a prominent callout:

> **Native wrapper only.** All APIs on this page are only available inside a
> Fliplet native app. Feature-detect with `Fliplet.Env.get('platform') === 'native'`
> before calling any method.

---

## Approval

For each row, the reviewer marks `[approve]` or `[modify: ...]`.

| # | Sub-module | Namespace | V3-relevant? | Recommendation | Reviewer |
|---|---|---|---|---|---|
| 1 | Native (top) | `Fliplet.Native` | yes | document fully | [approve] |
| 2 | AppManagement | `Fliplet.Native.AppManagement` | yes | document fully | [approve] |
| 3 | Interaction | `Fliplet.Native.Interaction` | yes | document fully | [approve] |
| 4 | Updates | `Fliplet.Native.Updates` | yes | document fully | [approve] |
| 5 | Downloads | `Fliplet.Native.Downloads` | yes | document fully | [approve] |
| 6 | Locale | `Fliplet.Native.Locale` | yes | document fully | [approve] |
| 7 | Maintenance | `Fliplet.Native.Maintenance` | yes | document fully | [approve] |
| 8 | Notifications | `Fliplet.Native.Notifications` | yes | document fully | [approve] |
| 9 | StatusBar | `Fliplet.Native.StatusBar` | yes | document fully | [approve] |
| 10 | AppData / Data | `Fliplet.Native.Data` | no | keep but skip docs | [approve] |
| 11 | Authentication | `Fliplet.Native.Authentication` | no | keep but skip docs | [approve] |
| 12 | Config | `Fliplet.Native.Config` | no | keep but skip docs (legacy FV only) | [approve] |
| 13 | Templates | `Fliplet.Native.Templates` | no | keep but skip docs (internal rendering) | [approve] |
| — | File grouping | hybrid (b): main + downloads.md + maintenance.md | — | — | [approve] |
