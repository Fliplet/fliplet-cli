# External libraries

Define a `dependencies` array to include libraries in your interfaces. These can include:

- [Fliplet approved libraries](Fliplet-approved-libraries.md)
- Any 3rd party Javascript and CSS library

## Include Fliplet approved libraries

Simply list out the names of the libraries you want to use:

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>',
  configuration: {
    dependencies: ['moment'],
    fields: []
  }
});
```

## Include 3rd-party libraries

Define an object with `url` and `type` for each 3rd-party library you want to include:

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>',
  dependencies: ['fliplet-media'],
  configuration: {
    title: 'Dolor sit amet',
    dependencies: [
      { url: 'https://unpkg.com/mithril/mithril.js', type: 'js' },
      { url: 'https://meyerweb.com/eric/tools/css/reset/reset.css', type: 'css' }
    ],
    fields: []
  }
});
```