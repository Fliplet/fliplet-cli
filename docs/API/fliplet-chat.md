---
title: Fliplet.Chat
description: Build chat, group conversations, and public channels in a Fliplet app via the fliplet-chat package, which exposes Fliplet.Chat, Fliplet.Chat.connect, and Fliplet.Chat.init.
type: api-reference
tags: [js-api, chat, messaging, realtime, conversations]
v3_relevant: true
deprecated: false
---
# `Fliplet.Chat`

Build chat features (one-to-one conversations, group chats, and public channels) on top of Fliplet Data Sources via the `fliplet-chat` package. The package exposes `Fliplet.Chat`, `Fliplet.Chat.connect()`, `Fliplet.Chat.init()`, `Fliplet.Chat.get()`, and `Fliplet.Chat.subscribe()`.

The chat is a thin wrapper over the Fliplet Data Sources APIs: each conversation is backed by a data source, messages are entries in that data source, and the contacts list is a data source you nominate when you connect. All methods return Promises.

## Install

Add the `fliplet-chat` dependency to your screen or app resources. In V3 apps, add it via Studio's library picker — required dependencies (`fliplet-datasources`, `fliplet-utils`) are pulled in automatically.

When using the chat instance from screens that aren't the chat screen itself, prefer `Fliplet.Chat.init()` (reads settings from the chat widget on the page) or `Fliplet.Chat.get()` (resolves once another screen has called `connect()`).

---

## Fliplet.Chat.connect()

(Returns **`Promise<Chat>`**)

Connects to a chat backend and returns the chat instance you use for everything else. This is the entry point for the rest of the public API.

### Usage

```js
const chat = await Fliplet.Chat.connect({
  dataSourceId: 123,             // required — the Contacts data source ID
  primaryKey: 'email',           // optional — column to identify users
  encryptMessages: true,         // optional — AES-encrypt message bodies at rest
  pushNotifications: true,       // optional — subscribe device for push
  crossLogin: false,             // optional — share session across screens
  crossLoginDataSourceId: 456,   // optional — separate cross-login DS
  crossLoginEmailKey: 'fl-chat-auth-email',
  crossLoginContactsKey: 'fl-chat-source-id'
});
```

* **connectionOptions** (Object)
  * **dataSourceId** (Number, required) The ID of the contacts data source. Each row is a user; messages reference users by their ID in this data source.
  * **primaryKey** (String) Optional column name used to identify users (e.g. `'email'`). When set, the chat uses the encrypted `flUserId`/`flUserToken` flow instead of the legacy random-token flow.
  * **encryptMessages** (Boolean) When `true`, message bodies sent via `chat.message()` and `chat.updateMessage()` are AES-encrypted before being stored. Default `false`.
  * **pushNotifications** (Boolean) When `true`, the device is subscribed for push notifications and new conversations are wired with a `push-message` hook. Default `false`.
  * **crossLogin** / **crossLoginDataSourceId** / **crossLoginEmailKey** / **crossLoginContactsKey** Cross-login options used in conjunction with `Fliplet.Chat.subscribe()` for screens that need push without rendering the chat UI.

The promise resolves with the chat instance; subsequent calls to `Fliplet.Chat.get()` will resolve with the same instance.

---

## Fliplet.Chat.init()

(Returns **`Promise<Chat>`**)

Bootstraps the chat from the chat widget's exported settings on the current screen, then logs the current Fliplet user in automatically using the configured `primaryKey`. Use this when you want the chat to follow the user across screens without re-passing the data source ID.

```js
const chat = await Fliplet.Chat.init();
// chat is connected, encryption + push are enabled by default,
// and the current Fliplet user is already logged in.
```

* **options** (Object) Optional overrides merged on top of the widget's exported settings. Defaults applied when the widget is found: `encryptMessages: true`, `pushNotifications: true`.

The promise rejects if no chat widget is exported on the screen, or if the chat widget hasn't been upgraded to use a `primaryKey`.

---

## Fliplet.Chat.get()

(Returns **`Promise<Chat>`**)

Returns a promise that resolves with the chat instance once any screen has called `Fliplet.Chat.connect()` or `Fliplet.Chat.init()`. Useful for screens that depend on the chat instance but don't own its setup.

```js
const chat = await Fliplet.Chat.get();
const conversations = await chat.conversations();
```

---

## Fliplet.Chat.subscribe()

(Returns **`Promise<Chat>`**)

Connects to the chat in push-only mode using cross-login keys stored in app storage (`fl-chat-auth-email` and `fl-chat-source-id`). Use this on screens that should subscribe a user for push notifications without rendering the chat UI.

```js
// In your screen's custom code:
Fliplet.Chat.subscribe()
  .then((chat) => {
    // user is logged in and subscribed for push
  })
  .catch((err) => {
    // missing widget, missing storage keys, or push disabled
  });
```

The promise rejects if the screen has no Push Notifications widget, or if the cross-login keys aren't set in `Fliplet.App.Storage`.

---

## chat.login()

(Returns **`Promise<DataSourceEntry>`**)

Logs a user into the chat by matching against the contacts data source. After login, the user's `flUserId` and `flUserToken` are generated (or read) and cached.

```js
// Log in by primary key (when configured)
await chat.login({ email: 'jane@example.org' });

// Offline-first login: try cache, fall back to network
await chat.login({ email: 'jane@example.org' }, { offline: true });
```

* **query** (Object) `where`-style query against the contacts data source.
* **options** (Object)
  * **offline** (Boolean) When `true`, attempts a cache-only login first; falls back to online login when the device is online.

The promise rejects with `{ code: 404 }` if no contact matches, or `{ code: 400 }` if the device is offline and no cached user exists.

---

## chat.logout()

(Returns **`Promise`**)

Clears the user's token in the contacts data source and stops polling.

```js
await chat.logout();
```

---

## chat.conversations()

(Returns **`Promise<Conversation[]>`**)

Fetches the conversations the logged-in user participates in, ordered by `updatedAt` descending. Each returned conversation is decorated with instance helpers (`participants`, `notifications`, `messages`, `getInviteCode`, `getEncryptionKey`).

```js
const conversations = await chat.conversations();

conversations.forEach((c) => {
  console.log(c.id, c.name, c.definition.participants);
});
```

* **options** (Object)
  * **offline** (Boolean) When `true`, returns the cached conversations list instead of hitting the network.

### chat.conversations.join()

(Returns **`Promise<Conversation>`**)

Joins a private conversation using an invite code shared by an existing participant.

```js
const conversation = await chat.conversations.join('abc123');
```

---

## chat.create()

(Returns **`Promise<Conversation>`**)

Creates a new conversation, or returns the existing conversation if one already exists with the same set of participants. The returned object is decorated with the same instance helpers as conversations returned by `chat.conversations()`.

```js
const conversation = await chat.create({
  participants: [42, 57],          // contact IDs in the contacts data source
  name: 'Project Phoenix',         // optional
  group: { public: false },        // optional — pass to mark as group
  metadata: { topic: 'launch' },   // optional — arbitrary object
  allowInvite: true                // optional — enables invite codes
});

// `isNew` tells you whether a conversation was created or matched an existing one.
console.log(conversation.isNew);
```

* **options** (Object)
  * **participants** (Array, required) IDs of the participants in the contacts data source. The current user is added automatically.
  * **name** (String) Optional conversation name; defaults to a generated GUID.
  * **group** (Object) Pass any object (typically `{ public: false }`) to mark the conversation as a group chat.
  * **metadata** (Object) Arbitrary metadata stored on the conversation definition.
  * **allowInvite** (Boolean) When `true`, an invite code is generated and retrievable via `conversation.getInviteCode()`.

---

## chat.contacts()

(Returns **`Promise<Contact[]>`**)

Fetches users from the contacts data source.

```js
const contacts = await chat.contacts();
const offlineContacts = await chat.contacts({ offline: true });
```

* **options** (Object)
  * **offline** (Boolean) When `true`, returns the cached contacts list.
  * Any other option supported by `connection.find()` (e.g. `where`, `limit`).

---

## chat.message()

(Returns **`Promise`**)

Posts a new message to a conversation. The current user is set as `fromUserId` automatically, and the message is added to their `readBy` list. After the message is inserted, `chat.poll()` runs to publish the message to all `chat.stream()` listeners.

```js
await chat.message(conversation.id, {
  body: 'Hello team!',
  conversationId: conversation.id
});

// Send a message with a file attachment
await chat.message(conversation.id, {
  body: 'See attached',
  file: ['https://example.org/uploads/spec.pdf']
});
```

* **conversationId** (Number) The conversation's data source ID.
* **message** (Object) The message payload. `body` is the most common field; `file` is an array of file URLs for attachments. Custom fields are stored as-is on the message entry.

If `encryptMessages` was set on `connect()`, the `body` is AES-encrypted before being inserted.

---

## chat.updateMessage()

(Returns **`Promise<DataSourceEntry>`**)

Updates an existing message — typically used for edits.

```js
await chat.updateMessage(conversation.id, message.id, {
  body: 'Updated message body',
  isEdited: true
});
```

* **conversationId** (Number) The conversation ID.
* **messageId** (Number) The message entry ID.
* **data** (Object) Fields to update. If `encryptMessages` was set on `connect()`, the `body` is encrypted before saving.

---

## chat.messages()

(Returns **`Promise<Message[]>`**)

Manually fetches messages, sorted oldest-to-newest. Use this for "load older messages" interactions; for live updates, use `chat.stream()` instead.

```js
// Latest 50 messages across all conversations
const recent = await chat.messages({ limit: 50 });

// Messages for a specific conversation
const messages = await chat.messages({
  conversations: [conversation.id],
  limit: 100
});

// Messages matching a custom where clause
const fromUser = await chat.messages({
  where: { data: { $contains: { fromUserId: 'id-abc-123' } } }
});
```

* **options** (Object)
  * **where** (Object) Optional MongoDB-style filter applied to message entries.
  * **limit** (Number) Page size. Defaults to the batch size returned by `chat.getBatchSize()` (`200`).
  * **conversations** (Array) Optional list of conversation (data source) IDs to scope the fetch to.

---

## chat.markMessagesAsRead()

(Returns **`Promise`**)

Marks an array of messages as read by the current user. Already-read messages are filtered out automatically; if nothing needs marking, the promise resolves immediately.

```js
await chat.markMessagesAsRead(visibleMessages);
```

* **messages** (Array) Messages from `chat.stream()` or `chat.messages()`. Each must include `id` and `data.readBy`.

---

## chat.unread

Helpers for the unread badge.

```js
// Full list of unread messages for the current user
const { entries } = await chat.unread.get();

// Just the count (cheaper than .get().length)
const count = await chat.unread.count();
```

---

## chat.stream()

(Returns **`Promise`**)

Subscribes a callback to new messages. The callback fires once per message as messages arrive. Internally `stream()` triggers polling on a 20-second cadence (with exponential backoff when the conversation is quiet).

```vue
<script setup>
import { onMounted, onUnmounted, ref } from 'vue';

const messages = ref([]);
let chat;

onMounted(async () => {
  chat = await Fliplet.Chat.connect({
    dataSourceId: Fliplet.Env.get('appSettings').contactsDataSourceId,
    primaryKey: 'email',
    encryptMessages: true
  });

  await chat.login({ email: Fliplet.Env.get('user').email });

  await chat.stream((message) => {
    if (message.isDeleted) {
      messages.value = messages.value.filter((m) => m.id !== message.id);
      return;
    }

    if (message.isUpdate) {
      const idx = messages.value.findIndex((m) => m.id === message.id);
      if (idx !== -1) messages.value.splice(idx, 1, message);
      return;
    }

    messages.value.push(message);
  });
});

onUnmounted(() => {
  if (chat) chat.logout();
});
</script>
```

* **fn** (Function) Listener invoked once per message. The message is annotated with `isReadByCurrentUser`, `isUpdate` (edited), and `isDeleted` flags.
* **options** (Object)
  * **offline** (Boolean) When `true`, the listener is first invoked with cached messages from the previous session.

---

## chat.poll()

(Returns **`Promise`**)

Manually triggers a poll for new messages. Most apps don't need to call this — `chat.stream()` and `chat.message()` already poll. Use it after operations that bypass `chat.message()` (e.g. server-side inserts) or to reset the poll cursor.

```js
// Force a fresh poll from the start
await chat.poll({ reset: true });
```

* **options** (Object)
  * **reset** (Boolean) When `true`, clears the internal "newest message timestamp" cursor so the next poll re-fetches from the beginning.

---

## chat.getBatchSize()

(Returns **`Number`**)

Returns the page size used when polling for messages. Useful when implementing "has more" logic against `chat.messages()`.

```js
const batchSize = chat.getBatchSize(); // 200
```

---

## Channels

Public channels are conversations marked with `definition.group.public = true`. They live on the master app's data sources so multiple app instances can share them.

### chat.channels.create()

(Returns **`Promise<DataSource>`**)

Creates a public channel.

```js
const channel = await chat.channels.create('General');
```

### chat.channels.get()

(Returns **`Promise<DataSource[]>`**)

Lists all public channels for the master app.

```js
const channels = await chat.channels.get();
```

### chat.channels.join()

(Returns **`Promise<Conversation>`**)

Joins a public channel. The returned object is decorated with the same instance helpers as a conversation, plus `isChannel: true` and `nParticipants`.

```js
const channel = await chat.channels.join(channelId);
console.log(`Joined — ${channel.nParticipants} members`);
```

### chat.channels.delete()

(Returns **`Promise`**)

Deletes a public channel.

```js
await chat.channels.delete(channelId);
```

---

## Conversation instance methods

Conversations returned by `chat.conversations()`, `chat.create()`, `chat.conversations.join()`, and `chat.channels.join()` come decorated with the helpers below.

### conversation.participants

```js
// Get participant IDs (flUserIds) stored on the conversation definition
const ids = conversation.participants.get();

// Resolve participant IDs to full contact entries
const people = await conversation.participants.fetch();

// Add or remove participants by their contact-data-source ID
await conversation.participants.add([contactId1, contactId2]);
await conversation.participants.remove([contactId1]);
```

### conversation.notifications

Mute or unmute push notifications for the current user on this conversation.

```js
await conversation.notifications.mute();
await conversation.notifications.unmute();

// Computed flag
console.log(conversation.isMuted);
```

### conversation.messages.fetch()

(Returns **`Promise<Message[]>`**)

Fetches messages directly from the conversation's data source. The same options as `Fliplet.DataSources` `connection.find()` are accepted (e.g. `where`, `limit`, `order`).

```js
const messages = await conversation.messages.fetch({
  limit: 50,
  order: [['createdAt', 'DESC']]
});
```

### conversation.getInviteCode()

(Returns **`Promise<String>`**)

Resolves with the conversation's invite code if one exists (i.e. `allowInvite: true` was set at creation).

```js
const code = await conversation.getInviteCode();
```

The promise rejects if no invite code is set on the conversation.

### conversation.getEncryptionKey()

(Returns **`String`**)

Returns the per-conversation encryption key used when downloading attachments tagged with `hasMediaFileWithPrivateEncryptionKey`. Most apps don't need this directly; it's appended automatically by the chat when parsing messages.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
