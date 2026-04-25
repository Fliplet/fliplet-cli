---
title: "Helper configuration interface: external libraries"
description: "Include Fliplet-approved or third-party JavaScript and CSS libraries in a Helper's configuration interface via the `dependencies` array."
type: api-reference
tags: [js-api, helpers, interface, libraries]
v3_relevant: true
deprecated: false
---
# Helper configuration interface: external libraries

Include [Fliplet-approved](/Fliplet-approved-libraries.html) or third-party JavaScript and CSS libraries in a Helper's configuration interface via the `dependencies` array.

## Include Fliplet approved libraries

Simply list out the names of the libraries you want to use:

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    template: '<p class="welcome">Hi {! fields.name !}, how are you?</p>'
  },
  configuration: {
    dependencies: ['moment'],
    fields: []
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
    dependencies: ['fliplet-media']
  },
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