# Media JS APIs

The `fliplet-media` package contains the following namespaces:

- [Folders](#folders)
- [Files](#files)
- [Authentication](#authentication)

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

[Back to API documentation](../API-Documentation.md)
{: .buttons}