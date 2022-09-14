# App

## Public URLs

### Get the public URL of the current app

Use the `Fliplet.App.getPublicSlug()` method to get the public URL of the current app. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar"
var url = Fliplet.App.getPublicSlug();
```

---

### Get the public URL of a specific screen for the current app

Use the `Fliplet.App.getPublicSlugForPage()` method to get the public URL of a specific screen (given its ID) for the current app. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar/screen-name-1"
var url = Fliplet.App.getPublicSlugForPage(1);
```

You can optionally provide options to be added to the query parameters of the URL, e.g.:

```js
var url = Fliplet.App.getPublicSlugForPage(1, { disableTracking: true, dataSourceEntryId: 123 });
```

---

## Locales

### Get the list of locales supported by the current app

```js
// Gets the list of locales defined for the current app as set by the Studio user
var locales = Fliplet.App.Locales.get();
```

---

## Settings

### Get the current app settings

```js
var settings = Fliplet.App.Settings.getAll();
```

---

### Get a single settings from the current app

```js
var settingValue = Fliplet.App.Settings.get('foo');
```

---

### Save or update some settings of the current app

```js
Fliplet.App.Settings.set({ foo: 'bar', hello: 'world' }).then(function () {
  // optional promise callback to be called when the APIs have saved the data
});
```

---

### Deletes a list of settings from the app

```js
Fliplet.App.Settings.unset(['foo', 'hello']).then(function () {
  // optional promise callback to be called when the APIs have deleted the data
});
```

---

## Logs

### Get the logs for an app

```js
Fliplet.App.Logs.get({
  where: { type: 'jobs' }
}).then(function (logs) {
  // logs<Array>
});
```

---

### Create a log for an app

```js
Fliplet.App.Logs.create({
  foo: "bar"
}).then(function (log) {
  // log<Object>
});
```

---

## Tokens

### Get the Tokens for an app

```js
Fliplet.App.Tokens.get(options).then(function (tokens) {
  // tokens<Array>
});
```

---

## Preview mode

### Check if your app is running in preview mode

Use the following snippet to check if your app is running inside Fliplet Viewer (or Fliplet Studio) or it's the production version from the App Store / Play Store / Web apps.

```js
var isPreview = Fliplet.App.isPreview(true);
```

---

## Device orientation

### Lock the device orientation

```js
Fliplet.App.Orientation.lock(orientation)
```

* `orientation` (String) `portrait` or `landscape`. If called with no parameters, the app orientation from the settings will be used.

---

### Unlock the device orientation

```js
Fliplet.App.Orientation.unlock()
```

The orientation unlock is temporary. When the following events occur, the orientation will be re-locked according to the original app setting, which would always be **portrait** on smartphones.

1. App orientation is locked when exiting from the in-app browser.
1. App orientation is locked when exiting from a full screen video playback.

To ensure a page doesn't force the orientation re-lock, add the following code to the screen HTML instead of using `Fliplet.App.Orientation.unlock()`.

```html
<script>Fliplet.Env.get('appSettings').orientation = 'all'</script>
```

**Note** Landscape mode in smartphones are not officially supported by Fliplet and may have layout issues due to the shortened screen height and "notches" on devices such as the iPhone X.

---

## About this app overlay

### Open the _About this app_ overlay

You can open the _About this app_ overlay, which gives you access to app information and check for app updates.

```js
Fliplet.App.About.open().then(function () {
  console.log('Overlay is opened');
});
````

This supports `beforeAboutAppOpen` and `afterAboutAppOpen` hooks that lets you configure custom behaviors when user opens the _About this app_ overlay.

```js
Fliplet.Hooks.on('beforeAboutAppOpen', function (options) {
  // @param options (Object) { html, showOnInit, closeAnywhere, entranceAnim, exitAnim, size, classes }

  // Change the About this app overlay content
  options.html = 'Hello world!';
});
```

```js
Fliplet.Hooks.on('afterAboutAppOpen', function (overlay) {
  // @param overlay (Object) An Overlay object which supports several functions such as overlay.close()

  // Hide any <h2></h2> found in the overlay
  $(overlay.overlay).find('h2').hide();

  // Add event listener to a custom button added to the overlay
  $(overlay.overlay).find('.custom-button').on('click', function () {
    console.log('User clicked on custom button');
  });
});
```