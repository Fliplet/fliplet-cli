---
title: Fliplet.App
description: "Retrieve the current app's public slug, build shareable screen URLs, and access app-level settings from JavaScript."
type: api-reference
tags: [js-api, core, app]
v3_relevant: true
deprecated: false
category: meta
capabilities: [app slug, public url, app settings, app logs, screen url, share url, preview mode, device orientation, app metadata, app config]
---
# `Fliplet.App`

Retrieve the current app's public slug, build shareable screen URLs, and access app-level settings from JavaScript.

## Public URLs

### Get the public URL of the current app

Use the `Fliplet.App.getPublicSlug()` method to get the public URL of the current app. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar"
var url = Fliplet.App.getPublicSlug();
```

---

### Get the public URL of a specific screen for the current app

Use the `Fliplet.App.getPublicSlugForPage()` method to get the public URL of a specific screen (given its ID) for the current app. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar/screen-name-1"
var url = Fliplet.App.getPublicSlugForPage(1);
```

You can optionally provide options to be added to the query parameters of the URL, e.g.:

```js
var url = Fliplet.App.getPublicSlugForPage(1, { disableTracking: true, dataSourceEntryId: 123 });
```

---

## Locales

### Get the list of locales supported by the current app

```js
// Gets the list of locales defined for the current app as set by the Studio user
var locales = Fliplet.App.Locales.get();
```

---

### Get the default locale for the current app

`Fliplet.App.Locales.getDefault()` returns the first element from `Fliplet.App.Locales.get()`, which is the locale that Fliplet Studio designates as the primary locale.

```js
var defaultLocale = Fliplet.App.Locales.getDefault();
// e.g. "en"
```

---

## Settings

| Method | Returns | Description |
|---|---|---|
| `Fliplet.App.Settings.getAll()` | `Object` | Returns all settings for the current app |
| `Fliplet.App.Settings.get(key)` | `*` | Returns the value of a single setting |
| `Fliplet.App.Settings.set(data)` | `Promise` | Saves or updates one or more settings |
| `Fliplet.App.Settings.unset(keys)` | `Promise` | Deletes one or more settings by key name |

### Get the current app settings

```js
var settings = Fliplet.App.Settings.getAll();
```

---

### Get a single settings from the current app

```js
var settingValue = Fliplet.App.Settings.get('foo');
```

---

### Save or update some settings of the current app

```js
Fliplet.App.Settings.set({ foo: 'bar', hello: 'world' }).then(function () {
  // optional promise callback to be called when the APIs have saved the data
});
```

---

### Deletes a list of settings from the app

```js
Fliplet.App.Settings.unset(['foo', 'hello']).then(function () {
  // optional promise callback to be called when the APIs have deleted the data
});
```

---

### Development-mode caveat

When `Fliplet.Env.get('development') === true` (i.e. the app is running inside Fliplet Viewer or Studio), `set()` and `unset()` skip the network call entirely and mutate `window.ENV.appSettings` directly. The returned promise resolves immediately. This means settings changes made in preview are not persisted to the server.

---

## Logs

### Get the logs for an app

```js
Fliplet.App.Logs.get({
  where: { type: 'jobs' }
}).then(function (logs) {
  // logs<Array>
});
```

---

### Create a log for an app

```js
Fliplet.App.Logs.create({
  foo: "bar"
}).then(function (log) {
  // log<Object>
});
```

---

### Create a batch of logs for an app

`Fliplet.App.Logs.createBatch(data)` posts multiple log entries in a single request and returns the created log records.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `data.logs` | `Array<{type: String, data: Object}>` | Array of log objects to create |
| `data.async` | `Boolean` | When `true`, the server processes the batch asynchronously |

**Returns:** `Promise<Array>` — the created log records.

```js
Fliplet.App.Logs.createBatch({
  logs: [
    { type: 'jobs', data: { result: 'ok' } },
    { type: 'jobs', data: { result: 'skipped' } }
  ],
  async: false
}).then(function (logs) {
  // logs<Array>
});
```

---

## Releases

### Get the releases for the current app

`Fliplet.App.Releases.get()` returns the releases array from the current app record. It delegates to `Fliplet.App.get()`, which fetches `GET /v1/apps/:appId` on first call and caches the result for the lifetime of the page.

**Returns:** `Promise<Array>` — the app's releases.

```js
Fliplet.App.Releases.get().then(function (releases) {
  // releases<Array>
  console.log(releases);
});
```

---

## Analytics

The `Fliplet.App.Analytics` namespace tracks page views and custom events. All data is sent to the app logs endpoint and is subject to the global tracking toggle (`Fliplet.Analytics.isTrackingEnabled()`). Calls made inside an App Actions runtime (where `user.type === 'taskToken'`) are silently skipped.

### Session management

```js
// Initialise (or resume) the current analytics session.
// Returns a Promise<String> containing the session UUID.
// Sessions expire after 30 minutes of inactivity.
Fliplet.App.Analytics.Session.init().then(function (sessionId) {
  console.log(sessionId);
});

// Reset the current session so the next track() call starts a new one.
Fliplet.App.Analytics.Session.reset();
```

---

### User tracking opt-in / opt-out

When user tracking is disabled, the user's email address is not attached to analytics events. The setting is in-memory only and resets on page load.

```js
Fliplet.App.Analytics.enableUserTracking();
Fliplet.App.Analytics.disableUserTracking();

Fliplet.App.Analytics.isUserTrackingEnabled().then(function (enabled) {
  // enabled<Boolean>
});
```

---

### Track a page view or event

`track(type, data, options)` is the low-level tracking method. Use the convenience helpers `pageView()` and `event()` in most cases.

**Parameters:**

| Name | Type | Description |
|---|---|---|
| `type` | `String` | Must be `'pageView'` or `'event'` |
| `data` | `Object` | Payload attached to the log entry. The runtime enriches it with `_platform`, `_os`, `_analyticsSessionId`, `_pageId`, `_pageTitle`, and `_deviceTrackingId`. |
| `options.enqueue` | `Boolean` | When `true`, the event is placed directly in the offline queue without attempting an immediate network send. |

```js
Fliplet.App.Analytics.track('event', {
  category: 'button',
  action: 'click',
  label: 'Submit'
});
```

---

### Track an event

```js
Fliplet.App.Analytics.event({
  category: 'video',
  action: 'play',
  label: 'Intro video'
});
```

---

### Track a page view

```js
// Object form
Fliplet.App.Analytics.pageView({ _pageTitle: 'Home' });

// String shorthand — automatically wrapped as { _pageTitle: data }
Fliplet.App.Analytics.pageView('Home');
```

---

### Retrieve analytics logs

`get(query, options)` delegates to `Fliplet.App.Logs.get` and pre-filters to analytics log types only.

```js
Fliplet.App.Analytics.get({
  where: { 'data._pageTitle': 'Home' }
}).then(function (logs) {
  // logs<Array>
});
```

---

### Count analytics events

```js
Fliplet.App.Analytics.count({
  where: { type: { $like: '%pageView%' } }
}).then(function (total) {
  // total<Number>
});
```

---

### Aggregate analytics data

`Fliplet.App.Analytics.Aggregate.get(options)` posts a grouping/sum specification to `POST /v1/apps/:appId/analytics` and returns the first value from the response object. Pass `includeCount: true` to receive the full response instead.

If `options.authToken` is provided it is forwarded as the `Auth-token` request header and then deleted from the payload before the request is sent.

```js
Fliplet.App.Analytics.Aggregate.get({
  groupBy: '_pageTitle',
  sum: 'count',
  includeCount: true
}).then(function (response) {
  console.log(response);
});
```

`Aggregate.count(options)` wraps `Aggregate.get` with `count: true`. The `options.column` field is required.

```js
Fliplet.App.Analytics.Aggregate.count({
  column: '_pageTitle'
}).then(function (result) {
  console.log(result);
});
```

---

### Offline queue behaviour

When a non-429 network error occurs, the event is pushed to `Fliplet.App.Storage` under the key `flAnalyticsQueue` and replayed in FIFO order the next time a tracking call succeeds. Pass `options.enqueue = true` to bypass the send attempt entirely and write directly to the queue (useful when you know the device is offline).

---

## Tokens

### Get the Tokens for an app

```js
Fliplet.App.Tokens.get(options).then(function (tokens) {
  // tokens<Array>
});
```

---

## Push notification subscriptions

### Get the push notification subscriptions for the current app

`Fliplet.App.Subscriptions.get()` returns the list of device push subscriptions registered for the current app.

**Returns:** `Promise<Array>` — the app's push notification subscriptions.

```js
Fliplet.App.Subscriptions.get().then(function (subscriptions) {
  // subscriptions<Array>
  console.log(subscriptions);
});
```

<p class="info">This method covers the <strong>read</strong> side of push subscriptions. Sending push notifications is handled by a separate server-side API.</p>

---

## Preview mode

### Check if your app is running in preview mode

Use the following snippet to check if your app is running inside Fliplet Viewer (or Fliplet Studio) or it's the production version from the App Store / Play Store / Web apps.

```js
var isPreview = Fliplet.App.isPreview(true);
```

---

## Device orientation

### Lock the device orientation

```js
Fliplet.App.Orientation.lock(orientation)
```

* `orientation` (String) `portrait` or `landscape`. If called with no parameters, the app orientation from the settings will be used.

**Notes:**
- Devices where either the screen width or height is less than 640 px are treated as phones and always forced to `'portrait'`, regardless of the value passed to `lock()`.
- Passing `'all'` to `lock()` delegates to `unlock()` internally — it does not lock to a specific orientation, it releases any existing lock.

<p class="warning">This feature is only available on <strong>native apps</strong>. Web apps will simply ignore this setting.</p>

---

### Unlock the device orientation

```js
Fliplet.App.Orientation.unlock()
```

The orientation unlock is temporary. When the following events occur, the orientation will be re-locked according to the original app setting, which would always be **portrait** on **native apps only**.

<p class="warning">This feature is only available on <strong>native apps</strong>. Web apps will simply ignore this setting.</p>

1. App orientation is locked when exiting from the in-app browser.
1. App orientation is locked when exiting from a full screen video playback.

To ensure a page doesn't force the orientation re-lock, add the following code to the screen HTML instead of using `Fliplet.App.Orientation.unlock()`.

```html
<script>Fliplet.Env.get('appSettings').orientation = 'all'</script>
```

**Note** Landscape mode in smartphones is not officially supported by Fliplet and may have layout issues due to the shortened screen height and "notches" on devices such as the iPhone X.

---

## About this app overlay

### Open the _About this app_ overlay

You can open the _About this app_ overlay, which gives you access to app information and check for app updates.

```js
Fliplet.App.About.open().then(function () {
  console.log('Overlay is opened');
});
````

This supports `beforeAboutAppOpen` and `afterAboutAppOpen` hooks that lets you configure custom behaviors when user opens the _About this app_ overlay.

```js
Fliplet.Hooks.on('beforeAboutAppOpen', function (options) {
  // @param options (Object) { html, showOnInit, closeAnywhere, entranceAnim, exitAnim, size, classes }

  // Change the About this app overlay content
  options.html = 'Hello world!';
});
```

```js
Fliplet.Hooks.on('afterAboutAppOpen', function (overlay) {
  // @param overlay (Object) An Overlay object which supports several functions such as overlay.close()

  // Hide any <h2></h2> found in the overlay
  $(overlay.overlay).find('h2').hide();

  // Add event listener to a custom button added to the overlay
  $(overlay.overlay).find('.custom-button').on('click', function () {
    console.log('User clicked on custom button');
  });
});
```