---
title: Fliplet.Socket
description: Real-time WebSocket connection to the Fliplet API with auto-authentication, server URL discovery, and dev/prod transport fallback via the fliplet-socket package.
type: api-reference
tags: [js-api, socket, websocket, realtime, events]
v3_relevant: true
deprecated: false
---
# `Fliplet.Socket`

Open a real-time, bidirectional connection to the Fliplet API via the `fliplet-socket` package. The package exposes a single global, `Fliplet.Socket`, which returns a [Socket.IO v2](https://socket.io/) client wired up to the correct API server, with the user's auth token already plumbed through and the right transport selected for the current environment.

Use `Fliplet.Socket` whenever an app needs real-time updates: live dashboards, presence, chat, push-style notifications, or any cross-client event broadcast.

## Install

Add the `fliplet-socket` dependency to your screen or app resources. The package provides the `Fliplet.Socket` global and bundles its own `socket.io-client` (no extra dependencies needed).

## Why use `Fliplet.Socket` vs. raw WebSocket

It's tempting to reach for `new WebSocket(...)` or import a fresh `socket.io-client` build. Don't — `Fliplet.Socket` solves three problems you'd otherwise have to solve yourself, and it solves them correctly for every Fliplet environment (dev, staging, EU, US, on-prem):

1. **Server URL discovery.** The Fliplet API host changes per region and per environment. `Fliplet.Socket` reads `Fliplet.Env.get('apiUrl')` so the same code runs unmodified against `api.fliplet.test`, `api.fliplet.com`, and any regional API. A hand-rolled `new WebSocket('wss://api.fliplet.com/...')` will break the moment the app is shipped to a different region.
2. **Auto-authentication.** Pass `{ login: true }` and the socket calls `Fliplet.User.getAuthToken()` and emits the `login` handshake on every connect. The user is automatically joined to a private `user-${id}` room on the server, so server-side code can target a single user with `io.to('user-' + userId).emit(...)` without any client-side wiring.
3. **Dev/prod transport selection.** In development Fliplet sits behind a Classic Load Balancer that does not support WebSocket frames. `Fliplet.Socket` detects this via `Fliplet.Env.get('environment')` and falls back to long-polling automatically; in production it uses `websocket`. A raw WebSocket would silently fail to connect on local dev environments.

A single shared connection is also reused across the page — calling `Fliplet.Socket()` multiple times returns the same socket, so two widgets on the same screen don't open two physical connections.

## `Fliplet.Socket(options)`

(Returns a [Socket.IO Socket](https://socket.io/docs/v2/client-api/#Socket))

Get (and lazily create) the shared socket connection.

### Usage

```js
// Anonymous connection — no login handshake
var socket = Fliplet.Socket();

// Authenticated connection — joins user-${id} room on the server
var socket = Fliplet.Socket({ login: true });
```

* **options** (Object) Optional configuration map.
  * **login** (Boolean) When `true`, emits the `login` event with the current user's auth token after every `connect`. The server responds with `loginSuccess` (and `socket.loggedIn` becomes `true`) or `loginError`. **Default** `false`.
  * **transports** (Array&lt;String&gt;) Override the transports list. Provide `['websocket']` to force WebSocket, `['polling']` to force long-polling, or `['polling', 'websocket']` to allow upgrade. **Default** `['polling']` in development, `['websocket']` in all other environments.

The socket is a singleton: the first call creates it, subsequent calls return the same instance regardless of the options passed.

## `Fliplet.Socket.disconnect()`

Disconnect the shared socket and clear the cached instance. The next call to `Fliplet.Socket()` will open a new connection.

```js
Fliplet.Socket.disconnect();
```

`Fliplet.Socket` automatically calls `disconnect()` on the window's `unload` event, so most apps never need to call this directly. Call it manually when you want to forcibly drop a connection — for example, after the user logs out of an embedded app.

## `socket.to(room).emit(event, data)`

Send an event to every client in a named room via the server. This is a thin wrapper that emits a `forward` event the server then re-broadcasts.

```js
var socket = Fliplet.Socket({ login: true });

socket.to('project-42').emit('comment-added', {
  text: 'Looks good!',
  author: 'Alice'
});
```

* **room** (String, required) The room to broadcast to. Throws if missing.
* **event** (String) The event name remote clients will listen for.
* **data** (any) JSON-serialisable payload.

To put a client into a room so it receives forwarded events, emit the built-in `join` event:

```js
socket.emit('join', 'project-42');
socket.on('comment-added', function(payload) {
  // Triggered when any client in the room calls socket.to('project-42').emit('comment-added', ...)
});
```

## Built-in events

The Fliplet API socket server understands the following events.

### Outbound (client → server)

| Event | Payload | Description |
|---|---|---|
| `login` | `authToken` (String) | Authenticate the connection. Emitted automatically when the socket is created with `{ login: true }`. |
| `logout` | — | Leave the authenticated user's rooms. Connection stays open. |
| `join` | `room` (String) | Add this socket to a named room. |
| `forward` | `{ room, event, data }` | Broadcast an event to every socket in `room`. Use `socket.to(room).emit(event, data)` instead — it's the supported shape. |

### Inbound (server → client)

| Event | Payload | Description |
|---|---|---|
| `connect` | — | The socket has connected. If `{ login: true }` was passed, the auth handshake is sent immediately after this event. |
| `loginSuccess` | — | Auth handshake succeeded. The server has joined this socket to `user-${userId}` and to a room named after the auth token. `socket.loggedIn` is now `true`. |
| `loginError` | `{ status, message }` | Auth handshake failed (missing token, unknown region, or no matching session). |
| `forwardError` | `{ status, message }` | A `forward` was emitted without a `room`. |
| `disconnect` | reason (String) | The socket has disconnected. Socket.IO will attempt to reconnect automatically. |

Beyond these, you can listen for any custom event your server-side or app-action code emits.

## Vue 3 example: live presence indicator

Subscribe in `onMounted`, unsubscribe in `onUnmounted` so the screen doesn't accumulate handlers across navigations.

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const onlineUsers = ref([]);
let socket;

function handlePresence(payload) {
  onlineUsers.value = payload.users;
}

onMounted(() => {
  socket = Fliplet.Socket({ login: true });

  socket.emit('join', 'office-floor-3');
  socket.on('presence:update', handlePresence);
});

onUnmounted(() => {
  if (!socket) return;

  socket.off('presence:update', handlePresence);
  // Don't call socket.disconnect() — other widgets on the screen may share the connection.
});
</script>

<template>
  <ul>
    <li v-for="user in onlineUsers" :key="user.id">{{ user.name }}</li>
  </ul>
</template>
```

A few rules worth highlighting:

* **Always remove your listener in `onUnmounted`** with `socket.off(event, handler)`. Forgetting this is the #1 cause of "the same toast fires three times after I navigate back".
* **Don't call `Fliplet.Socket.disconnect()` on screen unmount.** The socket is shared. Disconnect only when the user is really leaving the app or logging out.
* **Check `socket.connected` before emitting** if your code can run before the first `connect` resolves. Socket.IO buffers emits while disconnected, so this is rarely needed — but it's the safe option for high-rate emits.

## Vue 3 example: send and receive chat messages

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const messages = ref([]);
const draft = ref('');
const room = 'chat-room-7';
let socket;

function onMessage(msg) {
  messages.value.push(msg);
}

function send() {
  if (!draft.value.trim()) return;

  socket.to(room).emit('chat:message', {
    text: draft.value,
    sentAt: Date.now()
  });
  draft.value = '';
}

onMounted(() => {
  socket = Fliplet.Socket({ login: true });
  socket.emit('join', room);
  socket.on('chat:message', onMessage);
});

onUnmounted(() => {
  socket.off('chat:message', onMessage);
});
</script>

<template>
  <div>
    <ul><li v-for="(m, i) in messages" :key="i">{{ m.text }}</li></ul>
    <input v-model="draft" @keyup.enter="send" />
  </div>
</template>
```

## Vue 3 example: connection state

`Fliplet.Socket` is a Socket.IO socket, so the standard `connect` / `disconnect` / `reconnect` events are available for surfacing online/offline state to the user.

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const status = ref('connecting');
let socket;

const onConnect = () => { status.value = 'online'; };
const onDisconnect = () => { status.value = 'offline'; };
const onReconnect = () => { status.value = 'online'; };

onMounted(() => {
  socket = Fliplet.Socket({ login: true });
  socket.on('connect', onConnect);
  socket.on('disconnect', onDisconnect);
  socket.on('reconnect', onReconnect);

  if (socket.connected) status.value = 'online';
});

onUnmounted(() => {
  socket.off('connect', onConnect);
  socket.off('disconnect', onDisconnect);
  socket.off('reconnect', onReconnect);
});
</script>

<template>
  <span :class="`status status--${status}`">{{ status }}</span>
</template>
```

## Common patterns

* **Targeting one user from a server-side App Action.** When a client connects with `{ login: true }`, the server places it in a room named `user-${userId}`. Server-side code can push to that user with `io.to('user-' + userId).emit('notification', payload)` — no client-side `join` required.
* **Targeting one device/session.** The server also joins the socket to a room named after the auth token, so a server emit to `io.to(authToken).emit(...)` reaches that single device even if the user is logged in elsewhere.
* **Broadcasting between two clients.** Have both clients `socket.emit('join', 'shared-room')`, then either side can `socket.to('shared-room').emit('event', data)` to reach the other.
* **Cleaning up after logout.** Emit `socket.emit('logout')` to leave the user's rooms without dropping the socket. Follow with `Fliplet.Socket.disconnect()` if you also want to close the underlying connection.

## Notes

* Built on Socket.IO v2.1.1. The full client API is documented at [socket.io/docs/v2/client-api](https://socket.io/docs/v2/client-api/) — anything that works on a standard Socket.IO socket works here.
* The connection is lazy: importing `fliplet-socket` does **not** open a connection. The first call to `Fliplet.Socket()` does.
* `socket.upgrade` is disabled, so the socket will not silently switch transport mid-session. Choose your transport at construction.

---

[Back to Fliplet.Core](./fliplet-core.md)
{: .buttons}
