# Media JS APIs

The `fliplet-media` package contains the following namespaces:

- [Folders](#folders)
- [Files](#files)
- [Authentication](#authentication)
- [Storage](#download-files-to-devices-beta)

---

## Folders

### Get the list of folders and files for your organization or a specific app

```js
// By default, this gets all top-level folders and files for the current app
Fliplet.Media.Folders.get().then(function (response) {
  // response.folders
  // response.files
});

// Get a list of all top-level folders and files for an organisation by its ID
Fliplet.Media.Folders.get({ organizationId: 1 }).then(function (response) {});

// Get a list of all top-level folders and files for an app by its ID
Fliplet.Media.Folders.get({ appId: 2 }).then(function (response) {});

// Get a list of files and subfolders for a specific folder by its ID
Fliplet.Media.Folders.get({ folderId: 3 }).then(function (response) {});
```

Sample response for the above methods:

```json
{
  "files": [
    {
      "appId": null,
      "contentType": "image/jpeg",
      "createdAt": "2019-01-07T16:58:43.609Z",
      "id": 1,
      "isEncrypted": true,
      "mediaFolderId": null,
      "name": "Foo.jpg",
      "organizationId": 123,
      "path": "apps/1/2895a2611b753a74f2ae5097411579e4223-234-2632.jpg",
      "size": [ 640, 480 ],
      "thumbnail": "https://path/to/thumbnail.jpg",
      "updatedAt": "2019-01-07T16:58:43.619Z",
      "url": "https://path/to/secure-file.jpg",
      "userId": 1
    },
  ],
  "folders": [
    {
      "appId": null,
      "createdAt": "2019-01-08T17:06:03.377Z",
      "deletedAt": null,
      "id": 1,
      "name": "My folder",
      "organizationId": 2,
      "parentId": null,
      "updatedAt": "2019-01-08T17:06:03.377Z"
    }
  ]
}
```

Note: `parentId` on a folder indicates whether this folder is a subfolder of another folder. If you want to query for all subfolders of a folder, provide the `folderId` parameter to the above JS APIs with the required ID.

### Create a new folder

```js
// Create a folder belonging to the current app
Fliplet.Media.Folders.create({ name: 'foo' }).then(function (folder) { });
```

### Delete a folder

```js
// Delete a folder given its id
Fliplet.Media.Folders.delete(1).then(function onComplete() { });
```

## Files

### Upload one or more files

Files can be added using the standard HTML APIs for [FormData](https://developer.mozilla.org/en/docs/Web/API/FormData).

```js
Fliplet.Media.Files.upload({
  data: FormData,
  folderId: 1 // optional folderId
}).then(function (files) {

});
```

### Delete a file

```js
// Delete a file given its id
Fliplet.Media.Files.delete(2).then(function onComplete() { });
```

---

## Search folders and files

Use the `search()` method fo find folders and files in your app or organisation or a specific folder.

<p class="warning"><strong>BETA FEATURE:</strong> Please note that this feature is currently only available in beta and its specifications may be subject to change before releasing it.</p>

- You can search by `name`
- You can filter results by `appId`, `organizationId` or `folderId`
- Results will include a `type` (`folder` or `file`)
- Results will include `app` and `organisation` properties with `{ id, name }` when available
- Results will include a `parentFolder` with `{ id, name }` which recursively include any folder up to their app or organisation folder

```js
// search by file name
Fliplet.Media.Folders.search({ name: 'foo' })

// search by app
Fliplet.Media.Folders.search({ appId: 123 })

// search by organization
Fliplet.Media.Folders.search({ organizationId: 456 })

// search by folder
Fliplet.Media.Folders.search({ folderId: 789 })
```

Sample response:

```json
[
  {
    "appId": null,
    "contentType": "image/jpeg",
    "createdAt": "2019-06-07T14:39:04.194Z",
    "dataSourceEntryId": null,
    "dataTrackingId": null,
    "deletedAt": null,
    "id": 267,
    "isEncrypted": true,
    "isOrganizationMedia": false,
    "masterMediaFileId": null,
    "mediaFolderId": 54,
    "name": "Foo bar.jpg",
    "organization": {
      "id": 11,
      "name": "Otro company"
    },
    "organizationId": 11,
    "parentFolder": {
      "app": {
        "id": 147,
        "name": "Hello world"
      },
      "id": 54,
      "name": "Subfolder in app",
      "parentFolder": {
        "app": {
          "id": 147,
          "name": "Hello world"
        },
        "id": 53,
        "name": "Folder in app"
      }
    },
    "size": [ 4400, 2750 ],
    "thumbnail": "https://path/to/thumbnail/54/05bbf86878931661858c42441db0c2ce614-439-6054-t.jpg",
    "type": "file",
    "updatedAt": "2019-06-07T14:39:04.202Z",
    "url": "https://api.fliplet.com/v1/media/files/123/contents/hello-world.jpg",
    "userId": 245
  }
]
```

---

## Authentication

### Authenticate encrypted files

Media files might require an auth token to be accessed if your organization has encryption enabled. We have a little helper available to do the heavy lifting for you, just pass any media file url or even a string with many URLs in it and they'll get patched automatically:

```js
// Authenticate a URL by passing the mediaFile URL
var authenticatedUrl = Fliplet.Media.authenticate(mediaFile.url);

// Authenticate all URLs found in a String
var authenticatedHtml = Fliplet.Media.authenticate('<img src="https://api.fliplet.com/v1/media/files/123/contents/Foo.jpg" />');
```

If you're using Handlebars to print out your URLs, you can use our built-in `auth` helper:

{% raw %}
```handlebars
<img src="{{{auth someFileUrl}}}" />
```
{% endraw %}

You can also create your own helper if you need more control:

```js
Handlebars.registerHelper('addAuthentication', function(str) {
  return new Handlebars.SafeString(Fliplet.Media.authenticate(str));
});
```

And then use it in your directory templates like:

{% raw %}
```handlebars
<img src="{{{addAuthentication someFileUrl}}}" />

<p>The authenticated URL is {{{addAuthentication someContent}}}</p>
```
{% endraw %}

---

## Download files to devices

<p class="warning"><strong>BETA FEATURE:</strong> Please note that this feature is currently only available in beta and documentation provided below may be limited. Apps support this feature from <a href="https://developers.fliplet.com/Native-framework-changelog.html#version-396-april-30-2019">version 3.9.6</a> and newer.</p>

As per most or Fliplet JS APIs, all the following methods **return a promise**. There is experimental support on Chrome (for webapps) and full support is only available on native platforms (iOS and Android).

### Get the list of files downloaded on the device, including files being downloaded

```js
// Get an array of downloaded filed and files pending to be downloaded
Fliplet.Media.Files.Storage.get().then(function (files) {
  // Each file has status (downloaded or downloading), size, downloadedAt,
  // name and url (the original http(s) url used to download the file)
});

// Get downloaded files only
Fliplet.Media.Files.Storage.getDownloaded();

// Search for a downloaded file by url. "file" is undefined when not found
Fliplet.Media.Files.Storage.getDownloaded(url).then(function (file) {});

// Search for downloaded files by providing a filter identity sent to lodash "filter"
Fliplet.Media.Files.Storage.getDownloaded({ size: 100 }).then(function (files) {});

// Get downloading (pending) files only
Fliplet.Media.Files.Storage.getDownloading();
```

---

### Download a file

```js
// Downloads a file (this gets added to a queue and will be downloaded in background)
Fliplet.Media.Files.Storage.download(remoteUrl);

// You can also add to the download queue an array of files
Fliplet.Media.Files.Storage.download([url1, url2, url3]);
```

---

### Resume pending operations

```js
// Call this in your screen JS after registering hooks
Fliplet.Media.Files.Storage.ready();
```

---

### Return most appropriate URL to a file

```js
Fliplet.Media.Files.Storage.resolve(url).then(function (fileUrl) {
  // fileUrl can be used to play an audio, display an image, etc
});
```


---

### Get the raw FileEntry for a local file

```js
// requires the fileName from any "file.name"
Fliplet.Media.Files.Storage.getFile(fileName).then(function (file) {

});
```

---

### Deletes one or more files

```js
// Deletes a file. Requires the "file.name" or "file.url"
Fliplet.Media.Files.Storage.delete(fileName)

// Deletes an array of files
Fliplet.Media.Files.Storage.delete([fileName1, fileName2, fileURL3])

// Deletes all files
Fliplet.Media.Files.Storage.deleteAll()
```

### Cancels one or more pending downloads

```js
// Cancels the download a file. Requires the file URL
Fliplet.Media.Files.Storage.cancelDownload(fileURL)

// Cancels the download of more files at once
Fliplet.Media.Files.Storage.cancelDownload([fileURL1, fileURL2, fileURL3])
```

### Hooks

```js
Fliplet.Hooks.on('mediaFileDownloadCompleted', function (file) {

  // Resolve URL
  Fliplet.Media.Files.Storage.resolve(file).then(function (url) {
    // Add audio player
    $('body').append('<div data-title="Offline file" data-audio-url="' + url + '"></div>');

    // Init player so file can be played
    Fliplet.Media.Audio.Player.init()
  });
});

Fliplet.Hooks.on('mediaFileDownloadFailed', function (error) {
 console.error('error downloading file', this, 'with error', error);
});

Fliplet.Hooks.on('mediaFileDownloadCanceled', function (fileData) {
 console.error('canceled a download', fileData);
});

Fliplet.Hooks.on('mediaFileDownloadProgress', function (file) {
 console.debug('progress', file.progress.loaded, 'of', file.progress.total);
});
```

---

[Back to JS API documentation](../API-Documentation.md)
{: .buttons}