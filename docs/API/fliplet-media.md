# Media JS APIs

The `fliplet-media` package contains the following namespaces:

- [Folders](#folders)
- [Files](#files)
- [Authentication](#authentication)
- [Storage](#download-files-to-devices-beta)

---

## Folders

### Get the list of folders belonging to an organization or an app

```js
// By default, belonging to the current app.
// If not set, to the current organization
Fliplet.Media.Folders().then(function (folders) {});

// Belonging to an organization
Fliplet.Media.Folders({ organizationId: 1 }).then(function (folders) {});

// Belonging to an app
Fliplet.Media.Folders({ appid: 1 }).then(function (folders) {});
```

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

### Get images to offline cache
Size options see [GM Resize docs](http://aheckmann.github.io/gm/docs.html#resize)
files attribute on the param is an array of objects containing `name` and any other data you find useful.
```js
Fliplet.Media.Files.getCachedImages({
  folderId: 456,
  files: [{ name: 'John.jpg' }, { name: 'Alice.jpg' }],
  size: '80x80>',
  onProgress: function onProgress (file, data) {
    /*
    file = { name: 'John.jpg' }
    data = {
      id: 1,
      name: 'John.jpg',
      fileName: '1-80x80>-John.jpg',
      path: 'url-to-your-file'
      updatedAt: '2016-12-14T12:14:24.019Z'
    }
    */

    // this is the best place to update the src of your img tags
    // since the function will be called every time an image has been
    // downloaded to the device storage
  }
}).then(function onFinish (images) {
  /*
  images [
    {
      file: { name: 'John.jpg'},
      data: {
        id: 1,
        name: 'John.jpg',
        fileName: '1-80x80>-John.jpg',
        path: 'url-to-your-file'
        updatedAt: '2016-12-14T12:14:24.019Z'
      }
    }
  ]
  */
});
```

---

## Authentication

Media files might require an auth token to be accessed if your organization has encryption enabled. We have a little helper available to do the heavy lifting for you, just pass any media file url or even a string with many URLs in it and they'll get patched automatically:

```js
// Authenticate a URL by passing the mediaFile URL
var authenticatedUrl = Fliplet.Media.authenticate(mediaFile.url);

// Authenticate all URLs found in a String
var authenticatedHtml = Fliplet.Media.authenticate('<img src="https://api.fliplet.com/v1/media/files/123/contents/Foo.jpg" />');
```

Please note that using the above requires the `fliplet-media` dependency on the app's screen to be available.

If you're using Handlebars to print out your URLs, you might want to create your own Handlebars helper in your screen custom code as follows:

```js
Handlebars.registerHelper('addAuthentication', function(str) {
  return new Handlebars.SafeString(Fliplet.Media.authenticate(str));
});
```

And then use it in your directory templates like:

{% raw %}
```handlebars
<img src="{{{addAuthentication someFileUrl}}}" />

<p>{{{addAuthentication someContent}}}</p>
```
{% endraw %}

---

## Download files to devices (beta)

<p class="warning"><strong>BETA FEATURE:</strong> Please note that this feature is currently only available in beta and its specifications may be subject to change before releasing it.</p>

Note: this feature is currently in beta and does require apps with [version 3.9.6 or newer](https://developers.fliplet.com/Native-framework-changelog.html#version-396-april-30-2019) in order to work.

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

[Back to API documentation](../API-Documentation.md)
{: .buttons}