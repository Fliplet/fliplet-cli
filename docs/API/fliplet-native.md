---
title: "`Fliplet.Native`"
description: "Cordova-bridge APIs for native Fliplet apps — app management, updates, downloads, locale, notifications, status bar, and lifecycle interactions."
type: api-reference
tags: [js-api, native, cordova, ios, android]
v3_relevant: true
deprecated: false
category: native
capabilities: [native bridge, cordova, ios, android, app updates, app management, status bar, push notifications, downloads, file system, screen orientation, local notifications, deep links, organization switch]
notes: "Native-wrapper-only. Feature-detect via Fliplet.Env.get('platform') === 'native' before calling. Calls are no-ops or throw on web."
---

# `Fliplet.Native`

`Fliplet.Native` is the Cordova-bridge layer that powers Fliplet apps running inside the native iOS and Android wrappers. It bootstraps the on-device app store, coordinates over-the-air (OTA) updates and asset downloads, handles deep-linked local notifications, applies the device locale, and exposes lifecycle hooks (long-press-to-exit, status bar styling, framework version). Every method on this page assumes the Cordova runtime is present — code that runs in both web and native builds must feature-detect before calling in.

<p class="warning"><strong>Native-wrapper-only.</strong> All <code>Fliplet.Native</code> APIs require the Cordova bridge and are only meaningful inside a native build. Always feature-detect via <code>Fliplet.Env.get('platform') === 'native'</code> before calling.</p>

```js
// Standard feature-detect before touching any Fliplet.Native API
if (Fliplet.Env.get('platform') === 'native') {
  Fliplet.Native.StatusBar.hide();
}
```

---

## Package overview

`Fliplet.Native` is split across nine sub-namespaces. The seven smaller ones are documented inline on this page. The two largest — `Downloads` and `Maintenance` — each have a dedicated reference.

| Namespace | Source file | Documented in |
|---|---|---|
| `Fliplet.Native` (bootstrap) | `native.js` | [Bootstrap](#bootstrap--fliplet-native) (this page) |
| `Fliplet.Native.AppManagement` | `app-management.js` | [App management](#app-management--fliplet-native-appmanagement) (this page) |
| `Fliplet.Native.Interaction` | `app-interaction.js` | [App interaction](#app-interaction--fliplet-native-interaction) (this page) |
| `Fliplet.Native.Updates` | `app-updates.js` | [Updates](#updates--fliplet-native-updates) (this page) |
| `Fliplet.Native.Locale` | `locale.js` | [Locale](#locale--fliplet-native-locale) (this page) |
| `Fliplet.Native.Notifications` | `notifications.js` | [Notifications](#notifications--fliplet-native-notifications) (this page) |
| `Fliplet.Native.StatusBar` | `status-bar.js` | [Status bar](#status-bar--fliplet-native-statusbar) (this page) |
| `Fliplet.Native.Downloads` | `downloads.js` | [`fliplet-native/downloads`](./fliplet-native/downloads) |
| `Fliplet.Native.Maintenance` | `maintenance.js` | [`fliplet-native/maintenance`](./fliplet-native/maintenance) |

---

## Bootstrap — `Fliplet.Native`

The root `Fliplet.Native` object is the boot orchestrator. It runs automatically once Cordova plugins are ready: it restores enforced and standard user details from storage, initializes `AppManagement`, `Maintenance`, `Downloads`, `Locale`, locks screen orientation, marks the screen as ready via `Fliplet.Navigator.ready()`, kicks off `Updates`, and — for preview builds — wires up the long-press-to-exit gesture via `Interaction`. On Android it also attaches a `resize` listener that scrolls the focused input into view when the soft keyboard opens, and prevents the hardware back button from navigating away.

Two public methods are exposed.

### `Fliplet.Native.init()`

Runs the full boot sequence above and returns a promise that resolves when the native layer is ready. The Fliplet native wrapper calls this automatically inside `Fliplet.Navigator.onPluginsReady()` — application code does not normally need to invoke it.

```js
Fliplet.Native.init().then(function () {
  console.log('Native layer ready');
});
```

### `Fliplet.Native.getFrameworkVersion()`

Returns a promise resolving to the version string of the bundled native framework. The version is cached in `Fliplet.Storage` under `fl_framework_version`; on a cache miss the method reads `www/framework-data.json` from the Cordova application directory and falls back to `'2.0.0'` if neither source is available.

```js
Fliplet.Native.getFrameworkVersion().then(function (version) {
  console.log('Framework version:', version);
});
```

---

## App management — `Fliplet.Native.AppManagement`

`Fliplet.Native.AppManagement` is the local app registry. It maintains a PV-backed (`local_apps`) array of every app installed on the device, syncs it with the server's `/v1/apps` list, and merges incremental bundle diffs by asset `path` (the canonical identity across syncs — URLs change every cycle because of auth tokens and cache-busters). Both v1 (legacy, by edition) and v2 apps are supported in the same store.

### `init()`

Loads the `local_apps` PV record into memory. Called by `Fliplet.Native.init()` during boot.

```js
Fliplet.Native.AppManagement.init();
```

### `getLocalApps()`

Returns a promise resolving to the array of installed apps on the device.

```js
Fliplet.Native.AppManagement.getLocalApps().then(function (apps) {
  console.log('Installed apps:', apps.length);
});
```

### `getLocalAppsSync()`

Synchronous variant of `getLocalApps()`. Returns the array directly, or `undefined` if `init()` has not yet completed.

```js
var apps = Fliplet.Native.AppManagement.getLocalAppsSync();
```

### `setLocalApps(apps)`

Replaces the local apps array and persists it to the PV store. Returns a promise.

```js
Fliplet.Native.AppManagement.setLocalApps(newApps);
```

### `getServerApps()`

Calls `GET v1/apps` and returns a promise resolving to the authorized server-side app list. As a side effect, creates a data directory for every app (including legacy `editions[]` entries) via `Fliplet.Native.Maintenance.createDirectoryForApp`. Resolves with an empty array when offline.

```js
Fliplet.Native.AppManagement.getServerApps().then(function (apps) {
  console.log('Server returned', apps.length, 'apps');
});
```

### `getFullApps()`

Returns a promise resolving to the union of server and local apps, annotated with `local` (present on device), `delete` (no longer on server), and `iconPath` (filesystem URL of the cached icon). The icon lookup is skipped on Windows.

```js
Fliplet.Native.AppManagement.getFullApps().then(function (apps) {
  apps.forEach(function (app) {
    if (app.delete) {
      // App was removed server-side
    }
  });
});
```

### `addLocalApp(app)`

Upserts an app entry into local storage. New apps are appended; existing entries are merged via the asset-diff algorithm described above. Returns a promise.

```js
Fliplet.Native.AppManagement.addLocalApp(app);
```

### `removeLocalApp(app)`

Cancels active downloads for the app, deletes its data folder, removes it from the local store, and unsubscribes the current user from its push channel. Returns a promise.

```js
Fliplet.Native.AppManagement.removeLocalApp(app);
```

### `getAppData(appId)`

Synchronous lookup of a locally stored app record by ID. Returns the object or `undefined`.

```js
var app = Fliplet.Native.AppManagement.getAppData(123);
```

### `setAppFullData(appData)`

Fetches the full bundle for an app via `getFullAppData()` and persists the merged record. Returns a promise resolving with the merged app.

### `removeAppAssets(options)`

Removes specific asset entries (by `path`) from a locally stored app record without deleting the underlying files.

- `options.appId` (Number) — App ID
- `options.assets` (Array) — assets to remove; each must include `path`

```js
Fliplet.Native.AppManagement.removeAppAssets({
  appId: 123,
  assets: [{ path: 'js/old-bundle.js' }]
});
```

### `getAppIcon(app)`

Resolves the local filesystem icon path for an app and writes it to `app.iconPath`. Skipped on Windows. Returns a promise resolving with the (possibly mutated) app.

### `doesAppIconExist(app, fileList)`

Helper used by `getAppIcon`. Reads directory entries from a `fileList` and sets `app.iconPath` to the first entry's `nativeURL` if any are found. Returns a promise resolving with the app.

### `removeAppStorage(appId)`

Clears every Fliplet storage namespace tied to an app: per-app storage (`Fliplet.App.Storage`), secure storage (`Fliplet.Security.Storage`), the queued data-source request queue, and the per-app push-permission flag. Returns a promise rejecting if `appId` is falsy.

```js
Fliplet.Native.AppManagement.removeAppStorage(123);
```

### Deprecated methods

| Method | Notes |
|---|---|
| `refreshAppList()` | FV 1.0 era; left in place for compatibility |
| `removeLocalAppData(appId)` | Mutates the in-memory array without persisting |

---

## App interaction — `Fliplet.Native.Interaction`

`Fliplet.Native.Interaction` ships the long-press escape hatch used in preview builds: a 500 ms tap-and-hold or a 30 px swipe-down from the top edge surfaces a native confirm dialog with "Check for updates", "Exit", and "Cancel" buttons. The first time a user triggers it, a one-off help dialog is shown and the choice ("Don't remind me again") is persisted in `Fliplet.Storage` under `tapAndHoldLearned`. Hosts can disable the entire mechanism by setting the `exitAppDisabled` environment flag.

> The namespace is `Fliplet.Native.Interaction` — not `Fliplet.Native.AppInteraction`.

### `init(portalSpecific)`

Wires up the pointer, touch, and pointer-cancel listeners on `document.body`. When `portalSpecific` is `true`, the "Exit" button calls `Fliplet.Navigate.exitApp()` (close the wrapper); otherwise it calls `Fliplet.Navigate.toDefault()` (return to the default app). Called automatically by `Fliplet.Native.init()` with `portalSpecific = true` when `Fliplet.App.isPreview(true)` is truthy. The listeners are not attached if the env flag `exitAppDisabled` is set to `false`.

```js
Fliplet.Native.Interaction.init(true);
```

### `returnToBookshelf()`

Programmatically triggers the same confirm dialog without waiting for a long press. Reentrant — a second call while the dialog is already open is a no-op.

```js
Fliplet.Native.Interaction.returnToBookshelf();
```

---

## Updates — `Fliplet.Native.Updates`

`Fliplet.Native.Updates` runs the OTA update pipeline. On boot it reads the last-update timestamp, checks for a pending notification-driven update, and either fires an immediate check or arms a 30-second polling timer. Updates come in three flavors:

- **`silent`** — assets are downloaded and applied in the background; the user sees no UI
- **`visible`** — a non-blocking update overlay is shown with progress
- **`forced`** — a blocking overlay that prevents app use until the update completes

Four `Fliplet.Hooks` are emitted along the way:

| Hook | When it fires |
|---|---|
| `checkForUpdates` | At the start of every update check (passes `{ appId, manual }`) |
| `updateCompleted` | After a successful asset download and apply |
| `updateFailed` | After a failed download or apply |
| `dataSourceUpdated` | When a data source is incrementally updated mid-cycle |

### `init()`

Reads `fl_last_update_time` from storage, restores any in-progress download UI, checks `fl_notification_update` for a deferred notification payload, then either runs `checkForUpdates(appId, fromNotification, null, navigationUpdate)` immediately (first run or notification-triggered) or calls `createUpdateTimer()` to schedule the next 30-second poll. Called automatically by `Fliplet.Native.init()`. Returns a promise.

```js
Fliplet.Native.Updates.init();
```

### `checkForUpdates(appId, manual, lastUpdateType, notificationData, force)`

Queries `GET v1/apps/:id/bundle/update`, coordinates the update UI for the returned release type, delegates incremental data-source diffs, queues asset downloads via `Fliplet.Native.Downloads`, and resumes notification-deep-link navigation once the update settles. Use this from a "Check for updates" button.

- `appId` (Number) — app to check
- `manual` (Boolean) — `true` to surface "no updates available" feedback to the user
- `lastUpdateType` (String, optional) — `'silent'` \| `'visible'` \| `'forced'`; used to resume an interrupted UI state
- `notificationData` (Object, optional) — payload to navigate to after the update completes
- `force` (Boolean, optional) — treat the result as a `forced` update regardless of server response

```js
Fliplet.Native.Updates.checkForUpdates(Fliplet.Env.get('appId'), true);
```

### `createUpdateTimer()`

Re-arms the 30-second background poll. Called internally after each successful check; safe to call manually to reset the timer.

```js
Fliplet.Native.Updates.createUpdateTimer();
```

---

## Locale — `Fliplet.Native.Locale`

`Fliplet.Native.Locale` loads the on-device translation file (`<appId>/strings.json`) into `Fliplet.Env('translation')` at boot and lets you switch the active locale by rewriting the file. The strings file is delivered as part of the OTA bundle. After loading, the standard `Fliplet.initializeLocale()` hook runs so the rest of the framework picks up the new strings.

### `init(appId)`

Reads `<appId>/strings.json` from the Fliplet data folder via `Fliplet.Native.Maintenance.readFileContent`. If the file contains a `_locales` array, the first entry is set as `userLocale` and the array as `userLocales` in the env. Then sets `translation` in the env, calls `Fliplet.initializeLocale()`, and returns a promise. Called automatically by `Fliplet.Native.init()` with the current app ID.

```js
Fliplet.Native.Locale.init(Fliplet.Env.get('appId'));
```

### `updateSessionLocale(appId, locale)`

Promotes the given locale to index 0 of the `_locales` array inside `strings.json` and writes the file back to disk. Subsequent boots will load that locale first.

```js
Fliplet.Native.Locale.updateSessionLocale(Fliplet.Env.get('appId'), 'fr-FR');
```

---

## Notifications — `Fliplet.Native.Notifications`

`Fliplet.Native.Notifications` is the **click handler** for local notifications — it does not send notifications. When the user taps a notification produced by `cordova.plugins.notification.local`, the handler runs the `pushNotificationOpen` hook, optionally switches Fliplet organization (when the payload includes `organizationId + region` and a `fliplet_login_component` is configured), then navigates to the target screen or external URL. The handler also coordinates a special case: if a URL action arrives with an org switch, the page reloads first and the notification is replayed from `fl_pending_notification` storage so the URL opens in the refreshed context.

> Use the standard `Fliplet.Notifications` and `Fliplet.App.Push` APIs to **send** push notifications. `Fliplet.Native.Notifications` only handles the click side.

### `init()`

Binds `cordova.plugins.notification.local.on('click', ...)` and replays any pending notification stored in `fl_pending_notification` (from an org-switch reload cycle). No-op if `cordova.plugins.notification` is undefined (web, simulator without the plugin). Called automatically by the native bootstrap.

```js
Fliplet.Native.Notifications.init();
```

### `handle(data, delay)`

Processes a raw notification payload directly. Use this to drive the same deep-link logic from a programmatic notification source.

- `data` (Object) — the `customData` payload. Recognized fields:
  - `action` (String) — `'screen'` or `'url'`
  - `page` (Number) — target page or master page ID (for `action: 'screen'`)
  - `appId` / `masterAppId` (Number) — cross-app navigation
  - `organizationId` + `region` (String) — switch organization before navigating
  - `transition` (String) — Fliplet.Navigate transition style
- `delay` (Number, optional) — milliseconds to wait before navigating (only applies to in-app screen navigation)

```js
Fliplet.Native.Notifications.handle({
  action: 'screen',
  page: 106,
  transition: 'slide.left'
}, 250);
```

---

## Status bar — `Fliplet.Native.StatusBar`

`Fliplet.Native.StatusBar` wraps the `cordova-plugin-statusbar` plugin and the iPhone X+ notch detector. The `init()` method is **iOS only** (guarded by `Modernizr.ios`); `setColor`, `show`, `hide`, and `isVisible` are safe on Android too (the underlying plugin works on both) and log an error if the plugin is missing. The `notch` property is updated automatically on orientation change for any browser with an orientation API.

### `Fliplet.Native.StatusBar.notch`

String property — `''`, `'left'`, or `'right'` — indicating the side of the screen the notch occupies in the current orientation. Updated by an `orientationchange` listener when `Modernizr.notch` is truthy. The corresponding CSS class (`notch-left` / `notch-right`) is also applied to `document.documentElement`.

```js
if (Fliplet.Native.StatusBar.notch === 'left') {
  // Pad the left edge of the layout
}
```

### `init()`

iOS only. Ensures the status bar is visible, calls `StatusBar.overlaysWebView(false)` so the webview sits below the bar instead of behind it (the native default is `true`), and picks the text color based on the brightness of `Fliplet.Page.getStatusBarBgColor()` — light text on dark backgrounds, default (dark) text on light. Called automatically by the native bootstrap.

```js
Fliplet.Native.StatusBar.init();
```

### `setColor(color)`

Sets the status bar text style. Accepts `'light'` (calls `StatusBar.styleLightContent()`) or `'dark'` / `'default'` / anything else (calls `StatusBar.styleDefault()`). Logs an error if the StatusBar plugin is unavailable.

```js
Fliplet.Native.StatusBar.setColor('light');
```

### `show()`

Shows the native status bar via `StatusBar.show()`. No-op with an error log if the plugin is unavailable.

```js
Fliplet.Native.StatusBar.show();
```

### `hide()`

Hides the native status bar via `StatusBar.hide()`. No-op with an error log if the plugin is unavailable.

```js
Fliplet.Native.StatusBar.hide();
```

### `isVisible()`

Returns the current `StatusBar.isVisible` boolean, or `false` if the plugin is unavailable.

```js
if (!Fliplet.Native.StatusBar.isVisible()) {
  Fliplet.Native.StatusBar.show();
}
```

### Brightness helper

Internally, `init()` uses a W3C brightness calculation (`(r * 299 + g * 587 + b * 114) / 1000 > 123`) on the page's status-bar background color to decide between light and dark text. The 123 threshold is the W3C contrast guideline midpoint.

---

## See also

- [`fliplet-native/downloads`](./fliplet-native/downloads) — asset download queue and progress
- [`fliplet-native/maintenance`](./fliplet-native/maintenance) — Cordova filesystem and bundle management
- [`Fliplet.App` push notification subscriptions](./core/app.md#push-notification-subscriptions) — sending and subscribing to push notifications
- [`fliplet-runtime`](./fliplet-runtime.md) — the runtime that boots before `Fliplet.Native`
