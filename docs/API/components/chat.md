# Chat JS APIs

These public JS APIs will be automatically available in your screens once a **Chat layout** component is used.

## Run a hook before the contacts are rendered

```js
Fliplet.Hooks.on('beforeChatContactsRendering', function onBeforeChatContactsRendering(data) {
  return data;
});
```

## Overwriting data to be rendered

The  `beforeChatContactsRendering` hook explained above can be useful to modify the contacts list data. In the example below we will add the url from files in the File Manager, by comparing their name to the name entered in the data source's column called "Image". The code seems complex because we are also taking into consideration that the data source column can contain urls, base64 strings and file ids:

```js
var folderId = 325;
var imageColumn = 'Image';

Fliplet.Hooks.on('beforeChatContactsRendering', function onBeforeChatContactsRendering(data) {
  return Fliplet.Media.Folders.get({ folderId: folderId }).then(function(response) {
    var allFiles = response.files;
    // Test pattern for URLS
    var urlPattern = /^https?:\/\//i;
    // Test pattern for BASE64 images
    var base64Pattern = /^data:image\/[^;]+;base64,/i;
    // Test pattern for Numbers/IDs
    var numberPattern = /^\d+$/i;

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

## Create a public chat channel

Channels can be created by simply running this simple snippet via custom code (or by running it in the console). Make sure to change the channel name with the actual words you want to use:

```js
// Creates a chat public channel
Fliplet.DataSources.create({
  appId: Fliplet.Env.get('appId'),
  type: 'conversation',
  name: 'My channel name',
  definition: { participants: [], group: { public: true } },
  bundle: false
})
```

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}