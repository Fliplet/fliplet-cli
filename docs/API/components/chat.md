# Chat JS APIs

These public JS APIs will be automatically available in your screens once a **Chat layout** component is used. You can also include these by manually adding the `fliplet-chat` dependency to your app.

## Access the chat JS API

Use the `init()` constructor to initialize the chat JS API. This will return a promise that will resolve to the chat JS API instance. You can then use the instance to access the chat JS API methods.

```js
// Initialize the chat JS API and wait for it to be ready
const chat = await Fliplet.Chat.init();
```

The chat instance has access to the following methods:

- `chat.create()` - Create a new private conversation with one or more people
- `chat.conversations()` - Get the list of conversations for the current user
- `chat.contacts()` - Get the list of contacts available to chat with
- `chat.unread.count()` - Get the number of unread messages for the current user
- `chat.unread.get()` - Get the list of unread messages for the current user

---

## Starting conversations

### Start/open a private conversation with a specific person

Add a `contactEmail` parameter when loading the chat screen to start/open a conversation with a specific contact:

```js
Fliplet.Navigate.screen(chatScreenId, {
  query: '?contactEmail=john@example.org'
});
```

---

### Start/open a group conversation with one or more people

Add a `contactConversation` parameter with the list of **Data Source Entry IDs** of the contacts to include in the group, excluding the current user:

```js
Fliplet.Navigate.screen(chatScreenId, {
  query: '?contactConversation=1,2,3,4'
});
```

### Navigate to the chat screen opening up a specific conversation

Add a `conversationId` query parameter when navigating to a chat screen to open a specific conversation:

```js
// Fetch the first conversation's ID from the chat JS API
const conversationId = _.first(await chat.conversations()).id;

// Navigate to the chat screen opening up the first conversation
Fliplet.Navigate.screen(123, { query: '?conversationId=' + conversationId });
```

---

## Hooks

### Run a hook before the conversations are displayed

Use the `beforeChatConversationsRendering` hook to modify the list of conversations before they are displayed. The hook will receive the following data:

- `data.conversations` - The list of conversations to be displayed
- `data.container` - The chat component jQuery element

```js
Fliplet.Hooks.on('beforeChatConversationsRendering', function onBeforeChatConversationsRendering(data) {
  // data.conversations
});
```

Your hook can return a promise that will resolve to the modified list of conversations. For example, the following code will remove the last two conversations from the list:

```js
Fliplet.Hooks.on('beforeChatConversationsRendering', function onBeforeChatConversationsRendering(data) {
  return { conversations: _.dropRight(data.conversations, 2) };
});
```

### Run a hook before the contacts are displayed

Use the `beforeChatContactsRendering` hook to modify the list of contacts before they are displayed. The hook will receive the following data:
- `data.contacts` - The list of contacts to be displayed
- `data.container` - The chat component jQuery element

```js
Fliplet.Hooks.on('beforeChatContactsRendering', function onBeforeChatContactsRendering(data) {
  return data;
});
```

Your hook can return a promise that will resolve to the modified list of contacts. For example, the following code will remove the last two contacts from the list:

```js
Fliplet.Hooks.on('beforeChatContactsRendering', function onBeforeChatContactsRendering(data) {
  return { contacts: _.dropRight(data.contacts, 2) };
});
```

---

#### Overwriting data to be rendered

The  `beforeChatContactsRendering` hook explained above can be useful to modify the contacts list data. In the example below we will add the url from files in the File Manager, by comparing their name to the name entered in the data source's column called "Image". The code seems complex because we are also taking into consideration that the data source column can contain urls, base64 strings and file ids:

```js
const folderId = 325;
const imageColumn = 'Image';

Fliplet.Hooks.on('beforeChatContactsRendering', function onBeforeChatContactsRendering(data) {
  return Fliplet.Media.Folders.get({ folderId: folderId }).then(function(response) {
    const allFiles = response.files;

    // Test pattern for URLS
    const urlPattern = /^https?:\/\//i;

    // Test pattern for BASE64 images
    const base64Pattern = /^data:image\/[^;]+;base64,/i;

    // Test pattern for Numbers/IDs
    const numberPattern = /^\d+$/i;

    allFiles.forEach(function(file) {
      // Add this IF statement to make the URLs to work with encrypted organizations
      if (file.isEncrypted) {
        file.url += '?auth_token=' + Fliplet.User.getAuthToken();
      }

      data.contacts.forEach(function(entry, index) {
        if (entry.data[imageColumn] && file.name.indexOf(entry.data[imageColumn]) !== -1) {
          data.contacts[index].data[imageColumn] = file.url;
          // Save new temporary key to mark the URL as edited - Required (No need for a column with the same name)
          data.contacts[index].data['imageUrlEdited'] = true;
        } else if (urlPattern.test(entry.data[imageColumn]) || base64Pattern.test(entry.data[imageColumn])) {
          // Save new temporary key to mark the URL as edited - Required (No need for a column with the same name)
          data.contacts[index].data['imageUrlEdited'] = true;
        } else if (numberPattern.test(entry.data[imageColumn])) {
          var imageId = parseInt(entry.data[imageColumn], 10);
          if (imageId === file.id) {
            data.contacts[index].data[imageColumn] = file.url;
            // Save new temporary key to mark the URL as edited - Required (No need for a column with the same name)
            data.contacts[index].data['imageUrlEdited'] = true;
          }
        }
      });
    });

    // Images that weren't converted to URLs will be left as empty
    data.contacts.forEach(function(entry, index) {
      if (!entry.data['imageUrlEdited'] && !urlPattern.test(entry.data[imageColumn]) && !base64Pattern.test(entry.data[imageColumn])) {
        data.contacts[index].data[imageColumn] = '';
      }
    });

    return data;
  });
});
```

---

## Private conversations

### Get the list of conversations for the current user

Use the `conversations()` method to get the list of conversations for the current user. This will return a promise that will resolve to the list of conversations.

```js
const conversations = await chat.conversations();
```

See the [Instance methods for the conversation object](#instance-methods-for-the-conversation-object) section below for more information on the conversation object.

### Instance methods for the conversation object

The `conversations()` method returns a list of conversation objects. Each conversation object has the following methods and properties:

- `conversation.participants` - Methods to manage the participants of the conversation
- `conversation.messages` - Methods to manage the messages of the conversation
- `conversation.contacts` - Methods to manage the contacts of the conversation
- `conversation.mute()` - Mute notifications for the current user
- `conversation.unmute()` - Receive notifications for the current user
- `conversation.isMuted` - Check if the current user has muted notifications for the conversation


#### Get the list of participants

Use the `fetch()` method to get the list of participants for the conversation. This will return a promise that will resolve to the list of participants.

Each participant object has the following properties:
- `participant.id` - The Data source entry ID of the participant
- `participant.data` - The Data source entry data of the participant, containing the full name, email, etc.

```js
const participants = await conversation.participants.fetch();
```

If you only need the list of internal chat IDs of the conversation participants, you can use the `get()` method instead:

```js
const participants = conversation.participants.get();
```

#### Add new participants to the conversation

Use the `add()` method to add new participants to the conversation. This will return a promise that will resolve when the participants have been added. You can pass a single ID or an array of IDs.

```js
await conversation.participants.add(123);
```

```js
conversation.participants.add([
  1, 2, 3 // List of Data source entry ID for the participants to add
]).then(function () {
  // People have been added to the conversation
});
```

The list of contacts can be fetched using the `chat.contacts()` method:

```js
const contacts = await chat.contacts();
```

#### Remove participants from the conversation

```js
conversation.participants.remove([
  1, 2, 3 // List of Data source entry ID for the participants to remove
]).then(function () {
  // People have been removed from the conversation
});
```

#### Get the list of messages for the conversation

Use the `fetch()` method to get the list of messages for the conversation. This will return a promise that will resolve to the list of messages.

Each message object has the following properties:
- `message.id` - The Data source entry ID of the message
- `message.data` - The Data source entry data of the message, containing the message `body`, `files` and the sender in `fromUserId`
- `message.createdAt` - The timestamp when the message was sent
- `message.isReadByCurrentUser` - Whether the message has been read by the current user


```js
const messages = await conversation.messages.fetch();
```

To add a reference with the message to the sender's contact, you can use the following code:

```js
// Fetch the list of contacts for the chat
const contacts = await chat.contacts();

// Fetch the list of messages for the conversation
const messages = await conversation.messages.fetch();

// Loop through the messages and add a reference to
// the sender's contact under the `user` property
// by matching the `fromUserId` with the contact flUserId
messages.forEach(message => message.user = _.find(contacts, c => c.data.flUserId === message.data.fromUserId));
```


#### Mute notifications for a conversation for the current user

```js
// Check if a conversation is already muted
const isMuted = conversation.isMuted;

// Mute a conversation
conversation.mute().then(function () {
  // Notifications have been muted for the conversation
});
```

#### Receive notifications for a conversation for the current user

```js
conversation.unmute().then(function () {
  // Notifications have been unmuted for the conversation
});
```

---

### Create a new private conversation with one or more people

Use the `chat.create` method to create a new private conversation between multiple people.

You do not need to list the current user's entry ID in the list of participants, as that will be included automatically by the system.

```js
const conversation = await chat.create({
  name: 'Running team', // Conversation name
  participants: [1, 2, 3] // List of Data source entry ID for the participants
});
```

### Add metadata to a conversation

You can add metadata to a conversation by adding a `metadata` parameter to the `chat.create` method.

```js
const conversation = await chat.create({
  name: 'Running team',
  participants: [1, 2, 3],
  allowInvite: true,
  metadata: { guid: 'running-team' }
});
```

The metadata can be retrieved at the `definition.metadata` property on the conversation object:

```js
const guid = _.get(conversation, 'definition.metadata.guid');
```

As an example, you can use the metadata to store the ID of a record in a data source that is related to the conversation and use it to find the conversation later on:

```js
const conversations = await conversations.get();

const myConversation = _.find(conversations, c => _.get(c, 'definition.metadata.guid') === 'running-team'));
```

### Enable conversation sharing with an invite code

If you want to enable the conversation to have an invite code that can be shared with other people to join the conversation, you can use the `allowInvite: true` parameter as shown in the following example:

```js
const conversation = await chat.create({
  name: 'Running team', // Conversation name
  participants: [1, 2, 3], // List of Data source entry ID for the participants
  allowInvite: true // Allow the conversation to have an invite code
});
```

You can then get the invite code for the conversation using the `getInviteCode()` function returning a promise that will resolve to the invite code:

```js
const inviteCode = await conversation.getInviteCode();
```

Finally, any user having the code can join the conversation using the `chat.conversations.join()` method passing the invite code as a parameter:

```js
const conversation = await chat.conversations.join(inviteCode);
```

<p class="warning">Make sure the <code>inviteCode</code> is securely stored to avoid issues with unauthorized access to the conversation.</p>

---

## Public channels

### Get the list of channels available

You can get the list of public channel for a chat using the following method:

```js
const channels = await chat.channels.get();
```

### Create a channel

Channels can be created by simply running this simple snippet via custom code (or by running it in the console). Make sure to change the channel name with the actual words you want to use:

```js
const channel = await chat.channels.create('My channel name');
```

### Delete a channel

You can delete a channel by running the following snippet. Make sure to change the channel ID with the actual ID of the channel you want to delete:

```js
// Deletes a channel by its ID
await chat.channels.delete(123);
})
```

---

## Messages

### Get the count of unread messages for the current user

Use the `unread.count()` method to get the number of unread messages for the current user. This will return a promise that will resolve to the number of unread messages.

```js
const unreadCount = await chat.unread.count();
```

### Get the list of unread messages for the current user

Use the `unread.get()` method to get the list of unread messages for the current user. This will return a promise that will resolve to the list of unread messages.

```js
const unreadMessages = await chat.unread.get();
```

---

## User verification & Security

### Change the column name used for verifying user login

If the user is logged in to a data source that is different from the Chat contact list, the column name used for the user email might be different between the data sources. Use the following hook to set the email column name for the login data source.

```js
Fliplet.Hooks.on('flChatBeforeGetUserEmail', function (options) {
  // Change the column name for the user email from the login data source
  options.crossLoginColumnName = 'Authorized emails';
});
```

---

### Change the link to security screen

If the user isn't logged in, the feature will attempt to redirect users to a security screen based on the configuration set in Fliplet Studio. Use the following hook to customize how the link is configured.

```js
Fliplet.Hooks.on('flChatBeforeRedirectToLogin', function (navigate) {
  // Change the page where the user is redirected to
  navigate.page = 123;
});
```

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
