# Screens

### Get the list of screens in the current app

```js
Fliplet.Pages.get().then(function (appPages) {
  appPages.forEach((page) => {
    // page.id, page.title, page.masterPageId
  });
});
```

### Get the public URL of the current screen

Use the `Fliplet.Page.getPublicSlug()` method to get the public URL of the current screen. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. "https://apps.fliplet.test/foo-bar/my-screen-abc"
const url = Fliplet.Page.getPublicSlug();
```

---

### Get the public URL of any screen in your app

Use the `Fliplet.App.getPublicSlugForPage()` method to get the public URL of a screen, given its page **ID**. Note that this only works if you have enabled shareable URLs via Fliplet Studio under the App Settings.

```js
// e.g. https://apps.fliplet.com/sample-app/company-info-abcd
const url = Fliplet.App.getPublicSlugForPage(12345);
```