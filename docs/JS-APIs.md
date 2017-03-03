# The JS APIs

As most of our stack is made of Javascript — and you will be using it quite a lot — we have built a big set of Javascript APIs which enable you to interact with the different parts of our system, while speeding up the development as they help you with some basic functionality like other similar tools.

Please note: the JS APIs are more of a **SDK** rather than a **framework**. You are mostly free to choose how to build your components and themes and which framework to use (or not).

## Dependencies (packages)

To list out all the available packages in our system, use the `list-assets` command of the CLI:

```
$ fliplet list-assets

• fliplet-core: 1.0
  -- category: first-party
  -- dependencies: jquery
  -- includes: fliplet-core.bundle.js, fliplet-core.bundle.css

• jquery: 3.0.0 2.2.4
    -- category: vendor
    -- includes: jquery.js

...
```

### First-party packages

The different parts of our SDK are split into different packages which includes one or more functionalities. To use them, you will need to import them as dependencies in your components (or themes).

Here's an example to give you a quick idea of how it works:

*1. I declare I want to use the package named `fliplet-media` in my component dependencies.*

*2. I can then use the JS APIs provided by the package, like `Fliplet.Media.Files.upload()` to upload a file.*

Our [API Documentation](API-Documentation.md) and open-source components will give you plenty of examples about the available methods to use.

Note: dependencies can include other dependencies (e.g. `fliplet-core` also includes `jquery`).

[Read more on dependencies and assets →](Dependencies-and-assets)
{: .buttons}

### Third-party packages

Our dependencies also include common Javascript libraries such as jQuery, lodash, tinymce and many others. We recommend to use them if available (rather than bundling up your own version) to ensure minimum footprint when the apps are built.

## Promises

Our SDK uses [Javascript promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) for all asynchronous code. Check the following example:

```js
// Fetch the pages of my app
Fliplet.Pages.get().then(function (pages) {

});
```

Make sure you're familiar with promises before diving into building components.

---

When you're ready, move to the next section of the documentation to start building your first component.

[Build a component →](Building-components.md)
{: .buttons}