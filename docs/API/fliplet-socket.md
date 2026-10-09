---
title: Fliplet.Socket
description: Real-time connection to the Fliplet API for sending events between devices that have an app open, through shared rooms, via the fliplet-socket package.
type: api-reference
tags: [js-api, socket, websocket, realtime, events]
v3_relevant: true
deprecated: false
category: communications
capabilities: [websocket, socket, real-time, realtime, live updates, presence, broadcast, room, event stream, live data, socket.io]
---
# `Fliplet.Socket`

Open a real-time, two-way connection to the Fliplet API with the `fliplet-socket` package. The package exposes a single global, `Fliplet.Socket`, which returns a [Socket.IO v2](https://socket.io/) client connected to the correct API server with the right transport for the current environment. Devices exchange events by joining a named room and sending events to it.

Use `Fliplet.Socket` when devices that have the app open need to see each other's changes straight away: presence, live dashboards, live polls or simple chat. A device only receives events sent while it is connected and in the room. Nothing is stored.

## What `Fliplet.Socket` does not do

* **It does not store events.** A device that is offline, closed or in the background misses every event sent during that time. Save anything people must see later to a data source, and use [push notifications](./fliplet-notifications) to reach people who don't have the app open.
* **It does not make rooms private.** Any connection can join any room and send events to it, whether or not it has logged in. Never send personal or sensitive data through a room, and treat every incoming event as untrusted input.
* **It does not log in app users.** The `login` option only works for Fliplet Studio accounts. See the `login` option under `Fliplet.Socket(options)` below.
* **It does not let server-side app code send events.** App Actions and other server-side app code can't emit socket events. Events in your rooms come from connected devices.
* **It does not remove a socket from a room.** There is no `leave` event. See "Leaving a room" below.

## Install

Add the `fliplet-socket` dependency to your screen or app resources. The package provides the `Fliplet.Socket` global and bundles its own `socket.io-client` (no extra dependencies needed).

If the dependency is declared lazy, which is common in V3 apps, load it before calling `Fliplet.Socket()`:

```js
await Fliplet.require.lazy.chain('fliplet-socket');
```

An eager dependency is ready once Fliplet has initialized. See [`Fliplet.require`](./core/require) for both loading modes.

## Why use `Fliplet.Socket` vs. raw WebSocket

It's tempting to reach for `new WebSocket(...)` or import a fresh `socket.io-client` build. Don't — `Fliplet.Socket` solves three problems you'd otherwise have to solve yourself, and it solves them correctly for every Fliplet environment (dev, staging, EU, US, on-prem):

1. **Server URL discovery.** The Fliplet API host changes per region and per environment. `Fliplet.Socket` reads `Fliplet.Env.get('apiUrl')` so the same code runs unmodified against `api.fliplet.test`, `api.fliplet.com`, and any regional API. A hand-rolled `new WebSocket('wss://api.fliplet.com/...')` will break the moment the app is shipped to a different region.
2. **Reconnection.** Socket.IO reconnects by itself after a network drop, and holds events you send while offline until the connection returns. You still need to rejoin your rooms after each reconnect — see "Joining rooms" below.
3. **Dev/prod transport selection.** In development Fliplet sits behind a Classic Load Balancer that does not support WebSocket frames. `Fliplet.Socket` detects this via `Fliplet.Env.get('environment')` and falls back to long-polling automatically; in production it uses `websocket`. A raw WebSocket would silently fail to connect on local dev environments.

A single shared connection is also reused across the page — calling `Fliplet.Socket()` multiple times returns the same socket, so two widgets on the same screen don't open two physical connections.

## `Fliplet.Socket(options)`

(Returns a [Socket.IO Socket](https://socket.io/docs/v2/client-api/#Socket))

Get (and lazily create) the shared socket connection.

### Usage

```js
// Shared connection for the screen. Use this form for app features.
var socket = Fliplet.Socket();
```

* **options** (Object) Optional configuration map.
  * **login** (Boolean) When `true`, the socket sends a `login` event with `Fliplet.User.getAuthToken()` every time it connects, including after a reconnect. The server accepts only sessions that belong to a Fliplet Studio account, such as a Studio user previewing the app. It then adds the socket to a room named `user-<id>` and to a room named after the auth token, and replies with `loginSuccess` (`socket.loggedIn` becomes `true`). Anonymous visitors and people who sign in to the app, for example with a data source login, get `loginError` instead. Rooms and `socket.to(room).emit()` work without logging in, so leave this off for app features. **Default** `false`.
  * **transports** (Array&lt;String&gt;) Override the transports list. Provide `['websocket']` to force WebSocket, `['polling']` to force long-polling, or `['polling', 'websocket']` to allow upgrade. **Default** `['polling']` in development, `['websocket']` in all other environments.

The socket is a singleton: the first call creates it, subsequent calls return the same instance regardless of the options passed.

## `Fliplet.Socket.disconnect()`

Disconnect the shared socket and clear the cached instance. The next call to `Fliplet.Socket()` will open a new connection.

```js
Fliplet.Socket.disconnect();
```

A socket closed this way does not reconnect, and listeners registered on it stop firing. To keep listening, call `Fliplet.Socket()` again, register your listeners on the new socket and join your rooms again.

`Fliplet.Socket` automatically calls `disconnect()` on the window's `unload` event, so most apps never need to call this directly. Call it manually when you want to forcibly drop a connection — for example, after the user logs out of an embedded app.

## Joining rooms

A socket receives a room's events only after it joins the room. Join with the built-in `join` event, and join again every time the socket connects:

```js
var socket = Fliplet.Socket();

// Room names are shared by every app on the server, so include your app ID
var room = 'comments-' + Fliplet.Env.get('appId') + '-task-42';

function joinRoom() {
  socket.emit('join', room);
}

// The server forgets a socket's rooms when the connection drops.
// "connect" fires on the first connection and again after every reconnect.
socket.on('connect', joinRoom);

if (socket.connected) {
  joinRoom();
}

socket.on('comment-added', function(comment) {
  // comment is the data another device sent, e.g. { text: 'Looks good!', author: 'Alice' }
});
```

* **Rejoin after every reconnect.** After a network drop, Socket.IO reconnects, but the server treats it as a new connection that is in no rooms. Joining only once means the socket silently stops receiving after the first drop.
* **Include your app ID in room names.** Room names are not scoped to an app, so two apps that use `'chat'` share one room. Fliplet uses rooms whose names start with `user-`, `app-` and `organization-` for its own events. Don't use those prefixes.
* **`join` has no reply.** The server does not confirm a join or report an error.

### Leaving a room

There is no `leave` event: a socket stays in a room until it disconnects. To stop reacting to a room's events, remove your listeners with `socket.off(event, handler)`. To leave every room on the server, call `Fliplet.Socket.disconnect()`, then call `Fliplet.Socket()` again and join the rooms you still need.

## `socket.to(room).emit(event, data)`

Send an event to every socket in a room, through the server. This is a thin wrapper that emits a `forward` event the server then re-broadcasts.

```js
var socket = Fliplet.Socket();
var room = 'comments-' + Fliplet.Env.get('appId') + '-task-42';

socket.to(room).emit('comment-added', {
  text: 'Looks good!',
  author: 'Alice'
});
```

* **room** (String, required) The room to broadcast to. Throws if missing.
* **event** (String) The event name remote clients will listen for.
* **data** (any) JSON-serializable payload.

* **The sender receives its own event** if it has joined the room. To tell your own events apart, include an ID in the payload, as the chat example below does.
* **The sender doesn't have to join the room** to send to it.
* **Sending while offline:** Socket.IO holds the event and sends it when the connection returns, as long as the app stays open. Devices in the room receive it only once it has been sent.

## Built-in events

The Fliplet API socket server understands the following events.

### Outbound (client → server)

| Event | Payload | Description |
|---|---|---|
| `login` | `authToken` (String) | Log in with a Fliplet Studio session. Sent automatically on every connect when the socket is created with `{ login: true }`. |
| `logout` | — | Leave the logged-in user's rooms. The connection stays open. A socket created with `{ login: true }` logs in again on its next reconnect. |
| `join` | `room` (String) | Add this socket to a named room. No reply. Send it again after every reconnect. |
| `forward` | `{ room, event, data }` | Broadcast an event to every socket in `room`. Use `socket.to(room).emit(event, data)` instead — it's the supported shape. |

There is no `leave` event.

### Inbound (server → client)

| Event | Payload | Description |
|---|---|---|
| `connect` | — | The socket has connected. Fires on the first connection and after every reconnect, so join your rooms here. If `{ login: true }` was passed, the login is sent immediately after this event. |
| `loginSuccess` | — | Login succeeded. The server has added this socket to `user-<id>` and to a room named after the auth token. `socket.loggedIn` is now `true`. |
| `loginError` | `{ status, message }` | Login failed: no auth token (`400`), unknown region (`404`), no session belonging to a Fliplet Studio account (`404`, `User not found`), or a Studio account whose email was not verified within 24 hours of signing up (`401`). |
| `forwardError` | `{ status, message }` | A `forward` was emitted without a `room`. |
| `disconnect` | reason (String) | The socket has disconnected and `socket.loggedIn` is `false`. Socket.IO reconnects automatically unless `Fliplet.Socket.disconnect()` closed it. |

Beyond these, listen for the custom events that devices send to your rooms with `socket.to(room).emit()`.

## Using `Fliplet.Socket` with Vue

The examples below are plain component objects that run in V3 apps without a build step. They read `Vue` from the global set by `Fliplet.require.lazy('vue')`, use a `setup()` function instead of `<script setup>`, and don't use `import`. See [Vue in V3 apps](./v3/frameworks/vue) for loading and mounting components.

Two rules apply to every Vue component that uses the socket:

* **Keep the socket in a plain variable,** such as `let socket` inside `setup()`. Don't put it in `ref()`, `reactive()` or an Options API `data()` property. Vue wraps reactive values in a proxy, so the stored value is not the same object as the socket, and identity checks such as `this.socket === socket` are always `false`. If you use the Options API and need the socket on the component, store `Vue.markRaw(Fliplet.Socket())`.
* **Remove every listener when the component unmounts** with `socket.off(event, handler)`, and don't call `Fliplet.Socket.disconnect()` there. The socket is shared with other code on the screen, and leftover listeners make the same event fire several times after navigating back.

### Vue example: who is here

Shows everyone who has the screen open. Devices that close the app never say goodbye, so each device announces itself every 15 seconds and drops anyone it hasn't heard from in 45 seconds.

{% raw %}
```js
const { ref, computed, onMounted, onUnmounted } = Vue;

const WhoIsHere = {
  props: {
    // Display name of the person using this device, e.g. 'Alice'
    name: { type: String, required: true }
  },
  template: `
    <ul>
      <li v-for="person in people" :key="person.deviceId">{{ person.name }}</li>
    </ul>
  `,
  setup(props) {
    const room = 'presence-' + Fliplet.Env.get('appId') + '-home';
    const deviceId = Fliplet.guid();
    const seen = ref({}); // { [deviceId]: { deviceId, name, seenAt } }
    const people = computed(() => Object.values(seen.value));
    let socket; // plain variable: never store the socket in ref() or reactive()
    let heartbeat;

    function announce() {
      socket.to(room).emit('presence:here', { deviceId: deviceId, name: props.name });
    }

    function joinRoom() {
      socket.emit('join', room);
      announce();
    }

    function onHere(person) {
      if (!person || !person.deviceId) return;

      const isNew = !seen.value[person.deviceId];

      // The sender also receives its own events, so this list includes this device
      seen.value = { ...seen.value, [person.deviceId]: { ...person, seenAt: Date.now() } };

      // Answer newcomers so they see this device straight away
      if (isNew && person.deviceId !== deviceId) announce();
    }

    function onLeft(person) {
      if (!person || !seen.value[person.deviceId]) return;

      const next = { ...seen.value };
      delete next[person.deviceId];
      seen.value = next;
    }

    onMounted(() => {
      socket = Fliplet.Socket();
      socket.on('connect', joinRoom); // runs again after every reconnect
      socket.on('presence:here', onHere);
      socket.on('presence:left', onLeft);

      if (socket.connected) joinRoom();

      heartbeat = setInterval(() => {
        announce();

        const cutoff = Date.now() - 45000;
        seen.value = Object.fromEntries(
          Object.entries(seen.value).filter(([, person]) => person.seenAt > cutoff)
        );
      }, 15000);
    });

    onUnmounted(() => {
      clearInterval(heartbeat);
      socket.to(room).emit('presence:left', { deviceId: deviceId });
      socket.off('connect', joinRoom);
      socket.off('presence:here', onHere);
      socket.off('presence:left', onLeft);
    });

    return { people };
  }
};
```
{% endraw %}

### Vue example: send and receive chat messages

Messages appear when the server delivers them, including your own, so every device shows them in the same order.

{% raw %}
```js
const { ref, onMounted, onUnmounted } = Vue;

const ChatRoom = {
  props: {
    // Display name of the person using this device, e.g. 'Alice'
    author: { type: String, required: true }
  },
  template: `
    <div>
      <ul>
        <li v-for="message in messages" :key="message.id">
          <strong>{{ message.author }}</strong>: {{ message.text }}
        </li>
      </ul>
      <input v-model="draft" @keyup.enter="send" placeholder="Write a message" />
    </div>
  `,
  setup(props) {
    const room = 'chat-' + Fliplet.Env.get('appId') + '-general';
    const messages = ref([]);
    const draft = ref('');
    let socket; // plain variable: never store the socket in ref() or reactive()

    function joinRoom() {
      socket.emit('join', room);
    }

    function onMessage(message) {
      // Anyone can send to a room, so check the shape before showing it
      if (!message || typeof message.text !== 'string' || !message.id) return;

      messages.value.push(message);
    }

    function send() {
      const text = draft.value.trim();

      if (!text) return;

      // Not added to the list here: the server sends it back to this device too
      socket.to(room).emit('chat:message', {
        id: Fliplet.guid(),
        text: text,
        author: props.author,
        sentAt: Date.now()
      });
      draft.value = '';
    }

    onMounted(() => {
      socket = Fliplet.Socket();
      socket.on('connect', joinRoom); // runs again after every reconnect
      socket.on('chat:message', onMessage);

      if (socket.connected) joinRoom();
    });

    onUnmounted(() => {
      socket.off('connect', joinRoom);
      socket.off('chat:message', onMessage);
    });

    return { messages, draft, send };
  }
};
```
{% endraw %}

### Vue example: connection state

`Fliplet.Socket` is a Socket.IO socket, so the standard `connect` and `disconnect` events show whether the device is online. `connect` also fires after every reconnect.

{% raw %}
```js
const { ref, onMounted, onUnmounted } = Vue;

const ConnectionStatus = {
  template: `<span :class="'status status--' + status">{{ status }}</span>`,
  setup() {
    const status = ref('connecting');
    let socket; // plain variable: never store the socket in ref() or reactive()

    const onConnect = () => { status.value = 'online'; };
    const onDisconnect = () => { status.value = 'offline'; };

    onMounted(() => {
      socket = Fliplet.Socket();
      socket.on('connect', onConnect);
      socket.on('disconnect', onDisconnect);

      if (socket.connected) status.value = 'online';
    });

    onUnmounted(() => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    });

    return { status };
  }
};
```
{% endraw %}

## Native apps

`Fliplet.Socket` works the same way in native apps, but phones lose their connection far more often than browsers do:

* **Starting offline.** The package is included in the native app build, so the app starts without a connection. The socket connects once the network is available, and `connect` fires.
* **Network changes and backgrounding.** The connection drops when the device switches networks, and the operating system can pause the app while it is in the background. Socket.IO reconnects when the app is active again. A `connect` handler that joins your rooms, as shown in "Joining rooms", keeps the app receiving.
* **Events sent while away are lost.** A device in the background or offline does not receive events sent during that time, and they are not delivered later. Use [push notifications](./fliplet-notifications) for anything the user must see.
* **Devices that disappear.** A device that closes the app or loses signal stays in its rooms until the server notices, which can take about 70 seconds. If you show who is online, use a heartbeat as in the "who is here" example.

## Common patterns

* **Broadcasting between devices.** Have every device join the same room with a `connect` handler, then any device can call `socket.to(room).emit('event', data)` to reach all of them.
* **Recognizing your own events.** The sender receives its own events, so include an ID such as `Fliplet.guid()` or a device ID in the payload, and compare it when the event arrives.
* **Tools for Studio users.** For a tool used only by Fliplet Studio users, such as an internal admin screen previewed in Studio, `Fliplet.Socket({ login: true })` logs the socket in as that user. App users can't log in, so don't build app features on it.
* **Cleaning up after logout.** Emit `socket.emit('logout')` to leave the user's rooms without dropping the socket. A socket created with `{ login: true }` logs in again on its next reconnect, so call `Fliplet.Socket.disconnect()` as well to stop for good.

## Notes

* Built on Socket.IO v2.1.1. The full client API is documented at [socket.io/docs/v2/client-api](https://socket.io/docs/v2/client-api/) — anything that works on a standard Socket.IO socket works here.
* The connection is lazy: importing `fliplet-socket` does **not** open a connection. The first call to `Fliplet.Socket()` does.
* `socket.upgrade` is disabled, so the socket will not silently switch transport mid-session. Choose your transport at construction.

---

[Back to Fliplet.Core](./fliplet-core)
{: .buttons}
