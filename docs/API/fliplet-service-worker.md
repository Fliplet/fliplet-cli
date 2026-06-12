---
title: "fliplet-service-worker"
description: "Background service worker that receives web push notifications, displays them, and marks them read — automatically registered by fliplet-core on web."
type: reference
tags: [js-api, framework, push-notifications, service-worker, web]
v3_relevant: true
deprecated: false
category: framework
capabilities: [push notifications, web push, background notifications, notification display, mark as read]
notes: "Runs in the service-worker context, not the app context. No callable JS API. Behavior is automatic once registered."
---

# `fliplet-service-worker`

`fliplet-service-worker` is the browser service worker that powers web push notifications in Fliplet apps. It runs in its own isolated service-worker context — separate from the app's JavaScript — and handles two jobs: displaying an incoming push notification and responding when the user taps one. There is no public JavaScript API to call; the service worker operates automatically once registered by `fliplet-core`.

---

## What this package does

The worker is a 99-line script (`sw.js`) with exactly two event listeners:

- **`push`** — receives an incoming push payload from the browser's push service and shows a system notification.
- **`notificationclick`** — handles a tap on that notification: closes it, optionally marks it read via the Fliplet API, and focuses or opens the target app URL.

The service worker does **not** intercept fetch requests, cache any assets, or implement offline support. It has no `fetch` event listener and does nothing to alter the network behavior of the app.

---

## How the service worker is registered

`fliplet-core` registers the service worker automatically when both of the following conditions are true:

1. `Modernizr.pushnotification` is truthy — the browser supports the Push and Notifications APIs.
2. `Fliplet.Env.get('platform') === 'web'` — the app is running as a web app, not a native iOS or Android build.

Registration happens via:

```js
navigator.serviceWorker.register('/assets/fliplet-service-worker/1.0/sw.js')
```

The service worker is registered at the root scope (`/`), so it controls all pages under the app's origin.

After registration, the browser prompts the user for notification permission. If permission is granted, `fliplet-core` calls `pushManager.subscribe()` with:

```js
{
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(Fliplet.Env.get('vapidPublicKey'))
}
```

**Studio preview mode** — when `Fliplet.Env.get('preview') === true`, the service worker is never registered. Instead, `fliplet-core` uses a `postMessage` bridge: it calls `Fliplet.Studio.emit('get-push-notification-token')` and listens for a `push-notification-token` message from the Studio frame. This allows push notification testing during development without a real service worker.

---

## Push notification handling

The `push` event listener (sw.js lines 5–35) fires whenever the browser delivers a push message.

**Parsing the payload**

The listener calls `event.data.json()` to parse the payload as JSON. On a parse failure it falls back to:

```js
{ title: 'Test notification', body: event.data.text() }
```

**Expected payload shape**

```json
{
  "title": "Message title",
  "body": "Message body text",
  "image": "https://example.com/icon.png",
  "data": { }
}
```

**Showing the notification**

The title is resolved as `data.title || data.appName || 'Notification'`. The worker then calls:

```js
self.registration.showNotification(title, {
  body: data.body,
  icon: data.image,
  data: data
})
```

The `data` object is passed through to the notification so that the `notificationclick` handler can read it later.

**Badge support** — The source contains a TODO comment for `navigator.setAppBadge`. Badge support is not implemented.

---

## Notification click handling

The `notificationclick` event listener (sw.js lines 37–98) fires when the user taps a displayed notification.

**Reading the action**

The handler reads from `event.notification.data`:

```js
var data = event.notification.data;
var customData = data.custom && data.custom.customData || data.customData || {};
var action = customData.action || data.action;
```

**Closing the notification**

`event.notification.close()` is called unconditionally so the notification dismisses regardless of what happens next.

**Marking as read**

If `action !== 'screen'`, the handler POSTs to the Fliplet API to mark the notification read:

```
POST {baseUrl}v1/apps/{appId}/notifications/mark-as-read?appId={appId}
Content-Type: application/json
credentials: include
mode: cors

{ "entries": [appNotificationId] }
```

The fetch uses cookie-based authentication (`credentials: 'include'`). Any error is swallowed silently via `.catch(console.error)` — the notification is still dismissed.

When `action === 'screen'`, the mark-as-read POST is skipped. The app context handles it instead via URL query parameters (see [Communicating with the app context](#communicating-with-the-app-context)).

**Focusing or opening the app window**

If `data.url` is present, the handler searches all open window clients:

```js
clients.matchAll({ type: 'window', includeUncontrolled: true })
```

It focuses the first client whose URL starts with the target URL. If no matching client is found, it calls `clients.openWindow(urlToOpen)` to open a new tab.

If `data.url` is absent, the handler returns after closing the notification and (where applicable) sending the mark-as-read request.

---

## Communicating with the app context

The service worker sends no `postMessage` to the app. The only handoff mechanism is URL query parameters appended to `data.url` before the window is opened or focused:

| Parameter | Description |
|---|---|
| `appNotificationId` | ID of the notification entry |
| `appNotificationAction` | The action value from the payload |
| `appNotificationTargetPage` | The target screen slug |

`fliplet-core`'s `navigate.js` reads these parameters on startup (lines 179–188) and stores them in `Fliplet.Storage` for the app to consume.

---

## Debugging

Use Chrome DevTools to inspect the service worker:

- **Application → Service Workers** — verify the worker is registered, check its status, and send a test push event.
- **Application → Push Messaging** — trigger a test push payload without a real server.
- **Network tab** — filter by `mark-as-read` to confirm the POST fires after a notification tap.
- **Lighthouse** — the PWA audit will flag if the service worker is missing or failing to register.

In preview mode inside Fliplet Studio the service worker is never active; use the Studio push notification test panel instead.

---

## Limitations

- No offline caching and no `fetch` event interception — this service worker does not make the app work offline.
- The mark-as-read POST uses cookie authentication. It silently fails if the session cookie has expired or if third-party cookies are blocked.
- When `action === 'screen'`, the mark-as-read POST is intentionally skipped; the app is responsible for reading `appNotificationId` from the URL and calling the API itself.
- The service worker is registered at the root scope (`/`). Any other service worker registered at the same scope on the same origin will replace it on activation.
- The script path contains no content hash. Updates rely on the standard browser service worker lifecycle: the browser byte-compares `sw.js` on each load and triggers an update install when the file changes.
- Badge support (`navigator.setAppBadge` / `navigator.clearAppBadge`) is stubbed in TODO comments but not implemented.
- The service worker is never registered in Studio preview mode — the preview frame uses a `postMessage` bridge instead.

---

## See also

- [`fliplet-core`](fliplet-core) — the runtime that registers this service worker and manages the push subscription lifecycle.
- [Push notification subscriptions](core/app#push-notification-subscriptions) — `Fliplet.App.Subscriptions` methods for subscribing and unsubscribing a device.
- [`Fliplet.App.PushNotifications.send`](core/app#push-notifications) — the sender-side API for dispatching push notifications from app code.
