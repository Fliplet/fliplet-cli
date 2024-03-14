# Helper External libraries

Define a `dependencies` array in the `render` property to include libraries in your helpers. These can include:

- [Fliplet approved libraries](/Fliplet-approved-libraries.html)
- Any 3rd party Javascript and CSS library

## Include Fliplet approved libraries

Simply list out the names of the libraries you want to use:

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>',
    dependencies: ['moment']
  }
});
```

## Include 3rd-party libraries

Define an object with `url` and `type` for each 3rd-party library you want to include:

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>',
    dependencies: [
      { url: 'https://unpkg.com/mithril/mithril.js', type: 'js' },
      { url: 'https://meyerweb.com/eric/tools/css/reset/reset.css', type: 'css' }
    ]
  }
});
```

Type is required and should be either `js` or `css` depending on the content of the library you are including.