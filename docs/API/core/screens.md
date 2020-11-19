# Screens

### Get the list of screens in the current app

```js
Fliplet.Pages.get().then(function (appPages) {

});
```

### Get the public URL of the current screen

Use the `Fliplet.Page.getPublicSlug()` method to get the public URL of the current screen. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar/my-screen-abc"
var url = Fliplet.Page.getPublicSlug();
```