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

---

### Read the list of screen layouts in the system

```js
Fliplet.API.request({
  url: 'v1/layouts'
}).then(function (response) {
  //
});
```

### Programmatically create a screen

You can create one or multiple app screens at the same time with the following snippet.

```js
Fliplet.API.request({
  url: 'v1/apps/123/pages',
  method: 'POST',
  data: {
    pages: [
      {
        title: 'Foo',
        order: 2, // this number should be the "number of app pages + 1" if you want this at the end of the list
        layoutId: 378155 // This is the ID of the layout to use, e.g. blank screen
      }
    ]
  }
}).then(function (response) {
  // response.pages
})
```