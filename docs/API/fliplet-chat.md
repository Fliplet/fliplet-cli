---
title: Fliplet.Chat
description: "Chat API for one-to-one chats, group chats and public channels. V2 apps use a Chat component; V3 apps connect with a login data source."
type: api-reference
tags: [js-api, chat, messaging, realtime, conversations]
v3_relevant: true
deprecated: false
category: communications
capabilities: [chat, conversation, group chat, public channel, direct message, dm, im, messaging, real-time chat, contacts, chat room, typing indicator, message history]
notes: "V3 apps: call Fliplet.Chat.connect({ dataSourceId }) with a data source that has a login, then await chat.login({}). The user must be signed in to it. Don't pass primaryKey. No push notifications in V3. Message encryption is not access control."
---
# `Fliplet.Chat`

Build chat features (one-to-one conversations, group chats, and public channels) on top of Fliplet Data Sources via the `fliplet-chat` package. The package exposes `Fliplet.Chat`, `Fliplet.Chat.connect()`, `Fliplet.Chat.init()`, `Fliplet.Chat.get()`, and `Fliplet.Chat.subscribe()`.

The chat is a thin wrapper over the Fliplet Data Sources APIs: each conversation is backed by a data source, messages are entries in that data source, and the contacts list is a data source you nominate when you connect. All methods return Promises.

For model-generated replies, use the [AI chatbot guide](/API/core/ai/chatbot). `Fliplet.Chat` manages messaging between participants.

## Install

Add the `fliplet-chat` dependency to your screen or app resources; required dependencies (`fliplet-datasources`, `fliplet-utils`) are pulled in automatically. V2 apps add a Chat component to a screen, and the chat reads its settings from that component. V3 apps can't add components, so they call `Fliplet.Chat.connect({ dataSourceId })` and then `chat.login({})` instead. This needs a data source with a login set up, and the user must be signed in to that data source. See [Security and identity](#security-and-identity) for what the server does in each case.

When using the chat instance from screens that aren't the chat screen itself, prefer `Fliplet.Chat.init()` (reads settings from the chat widget on the page, so it needs the Chat component) or `Fliplet.Chat.get()` (resolves once another screen has called `connect()`).

---

## Security and identity

The server decides who the chat user is and which conversations that user can see. The app does not.

* **Identity.** The chat user is the contacts data source login the user is signed in with, worked out on the server. A chat token sent by the app counts only when it belongs to the user's own login session. A token from another session is ignored: the request is handled as if it came from someone who isn't in the conversation.
* **The login value must be unique.** A user is identified by their value of the login column. If two rows of the contacts data source hold the same value (for example, a second sign-up with an email that already exists), neither row is recognised as a chat user, so that user can't start or see conversations until the duplicate is resolved. A contact with no value of the login column has no chat identity and is left out of the contacts list.
* **Private conversations.** Only participants can read or change a private conversation. This applies to the chat API and to the Fliplet Data Sources API. To anyone else the conversation looks as if it doesn't exist. Editors and publishers of the app, admins of the app's organization and Fliplet admins can also see the app's conversations. Public channels stay open to everyone, as before.
* **Creating conversations.** A user can only create a private conversation they are a participant of. `chat.create()` always adds the current user, so it isn't affected.
* **Changing participants.** A participant can add people to a conversation they stay in. A user can only remove themselves (leave); removing someone else is refused. Mute and unmute only apply to the current user. A refused change comes back as an error (403 with a message), and the `participants.add()`, `participants.remove()`, `notifications.mute()` and `notifications.unmute()` promises reject, leaving the local conversation unchanged. Editors, publishers and admins of the app are not restricted.
* **Hooks.** App users can only create conversations with push-notification hooks. Creating one with any other hook is refused with an error (403). Hook changes they send when updating a conversation are ignored.
* **Integration and task tokens.** A token can read a conversation data source only if it has an explicit role on that data source. Otherwise the conversation looks as if it doesn't exist.
* **Invite codes.** Only participants can see a conversation's invite code. Anyone who has the code can still join with `chat.conversations.join()`.
* **Encryption is not access control.** `encryptMessages: true` stores message text encrypted, but every copy of the app can decrypt it. Don't use it to keep messages private. The server's access checks do that.
* **Legacy mode (no `primaryKey`).** Chats that don't use a `primaryKey` keep working, but only for users signed in to the contacts data source: the chat token must belong to the row they are signed in with. For app users, a contact's `flUserId` can't be changed or cleared once it is set, and can't be given to a second row. Reads of the contacts data source don't return other users' `flUserToken`.

### Which column identifies users

The server says which column identifies chat users, and `connect()` always uses its answer:

* in a V2 app with a Chat component, the component's `primaryKey` (or none, if the component has none);
* in a V2 app with no Chat component, the `primaryKey` passed to `connect()` when it is the data source's login column and the user is signed in to that data source; otherwise none, so the chat runs in legacy mode;
* in a V3 app, the login column of the contacts data source. V3 apps never run in legacy mode.

In a V3 app, or a V2 app with a Chat component, a `primaryKey` passed to `connect()` is replaced by the server's value, so leave it out. In a V2 app with no Chat component, pass the data source's login column as the `primaryKey` to keep the chat out of legacy mode; any other value is ignored and the chat falls back to legacy mode. The one exception for apps with a Chat component is connecting to a different data source from the one the component uses (for example, for cross-login): then the options you pass are kept.

### V2 apps

Apps with a Chat component behave as before. The component's settings choose the contacts data source and the `primaryKey`. If you call `connect()` yourself, pass the same `dataSourceId` as the component; `Fliplet.Chat.init()` does this for you. A V2 app with no Chat component runs in legacy mode, unless you pass the data source's login column as the `primaryKey` to `connect()` and the user is signed in to that data source.

### V3 apps

V3 apps can use `Fliplet.Chat` with a login data source:

```js
// The user must already be signed in to this data source.
const chat = await Fliplet.Chat.connect({ dataSourceId: 123 });

// The server says who is signed in; pass an empty object.
await chat.login({});

const conversations = await chat.conversations();
```

* The data source must have a login set up, and the user must be signed in to it. Otherwise `connect()` rejects with the error "You have not logged in on this app."
* The chat user comes from the data source's login column, which is the email column used for sign-in. If the data source has no login column, `connect()` rejects with "The chat contacts data source has no login column, so the chat can't identify its users."
* `chat.contacts()` lists only the rows the data source's select access rules let the user read, without the fields those rules leave out. Each contact has the login column and, when the data source has them, the columns named Name (or Full Name), First Name, Last Name, Avatar and Title.
* Push notifications for new messages are not sent in V3 apps, so `pushNotifications` has no effect. They still work in V2 apps with a Chat component.
* Offline, `connect()` uses the settings it got the last time it connected on this device. If there are none, it rejects with "You need internet connection to log in" rather than falling back to legacy mode.

---

## Fliplet.Chat.connect()

(Returns **`Promise<Chat>`**)

Connects to a chat backend and returns the chat instance you use for everything else. This is the entry point for the rest of the public API. It works with or without a Chat component, so V3 apps use it directly.

### Usage

```js
const chat = await Fliplet.Chat.connect({
  dataSourceId: 123,             // required — the Contacts data source ID
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
  * **primaryKey** (String) Leave this out. The server says which column identifies users and its value replaces this one (see [Which column identifies users](#which-column-identifies-users)). With a primary key the chat uses the encrypted `flUserId`/`flUserToken` flow; without one it uses the legacy random-token flow.
  * **encryptMessages** (Boolean) When `true`, message bodies sent via `chat.message()` and `chat.updateMessage()` are AES-encrypted before being stored. Default `false`. This is not access control (see [Security and identity](#security-and-identity)).
  * **pushNotifications** (Boolean) When `true`, the device is subscribed for push notifications and new conversations are wired with a `push-message` hook. Default `false`. No effect in V3 apps.
  * **crossLogin** / **crossLoginDataSourceId** / **crossLoginEmailKey** / **crossLoginContactsKey** Cross-login options used in conjunction with `Fliplet.Chat.subscribe()` for screens that need push without rendering the chat UI.

`connect()` asks the server for the chat settings first. If the server can't identify the user (for example, a V3 app user who isn't signed in), the promise rejects with the server's error. Offline, it uses the settings from the last online connect on this device, then the settings of the app's Chat component (V2). If neither exists, it rejects with "You need internet connection to log in".

The promise resolves with the chat instance; subsequent calls to `Fliplet.Chat.get()` will resolve with the same instance.

---

## Fliplet.Chat.init()

(Returns **`Promise<Chat>`**)

Bootstraps the chat from the chat widget's exported settings on the current screen (V2 apps with a Chat component; V3 apps use `Fliplet.Chat.connect()` instead), then logs the current Fliplet user in automatically using the configured `primaryKey`. Use this when you want the chat to follow the user across screens without re-passing the data source ID.

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

Logs the user into the chat. After login, the user's `flUserId` and `flUserToken` are generated (or read) and cached.

* **With a primary key** (V3 apps, and V2 apps whose Chat component has a `primaryKey`): the server says which contact is signed in to the contacts data source. The query is ignored, so pass `{}`. If the server can't identify the user (for example, they aren't signed in), the promise rejects with the server's error.
* **Legacy mode** (no primary key): the query is matched against the contacts data source.

```js
// With a primary key (V3 apps, and V2 apps whose Chat component has one)
await chat.login({});

// Legacy mode: find the contact with a query
await chat.login({ email: 'jane@example.org' });
```

* **query** (Object, required) Pass `{}` when the chat has a primary key. In legacy mode, a `where`-style query against the contacts data source. Calling `chat.login()` with no object rejects with "Authentication details are required".
* **options** (Object)
  * **offline** (Boolean) Kept for older code. Offline, the chat always uses the user cached by the last login on this device; online, it always checks with the server.

In legacy mode the promise rejects with `{ code: 404 }` if no contact matches. Offline, it rejects with `{ code: 400 }` if no cached user exists.

---

## chat.logout()

(Returns **`Promise`**)

Stops polling and forgets the user in this chat instance. In legacy mode it also clears the user's token in the contacts data source. With a primary key it doesn't write to the data source. It doesn't sign the user out of the data source login.

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

Creates a new conversation, or returns an existing one. An existing conversation is reused only when all of these are true:

* it is private and has no invite code;
* it has exactly the same people as the request (the current user included);
* nobody outside that set has left it.

Otherwise a new conversation is created. For example, a one-to-one that the other person has left is not reused. The returned object is decorated with the same instance helpers as conversations returned by `chat.conversations()`.

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
  * **allowInvite** (Boolean) When `true`, an invite code is generated and retrievable via `conversation.getInviteCode()`. Only participants can see it.

---

## chat.contacts()

(Returns **`Promise<Contact[]>`**)

Fetches users from the contacts data source.

```js
const contacts = await chat.contacts();
const offlineContacts = await chat.contacts({ offline: true });
```

* **With a primary key**, the server returns the list. Each contact has only the chat's columns: the primary key and the name, avatar and title columns. In V3 apps the list holds only the rows the data source's select access rules let the user read. In V2 apps with a Chat component it holds every row. Options other than `offline` are ignored.
* **In legacy mode**, the list is read from the data source, and other users' `flUserToken` is never included.

* **options** (Object)
  * **offline** (Boolean) When `true`, returns the cached contacts list.
  * In legacy mode only, any other option supported by `connection.find()` (e.g. `where`, `limit`).

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
  // The ID of the contacts data source the user is signed in to
  chat = await Fliplet.Chat.connect({ dataSourceId: 123 });

  await chat.login({});

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
await conversation.participants.remove([contactId1]); // app users can only remove themselves
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

[Back to API documentation](../API-Documentation)
{: .buttons}
