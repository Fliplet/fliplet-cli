# The JS APIs

As most of our stack is made of Javascript — and you will be using it quite a lot — we have built a big set of Javascript APIs which enable you to interact with the different parts of our system, while speeding up the development as they help you with some basic functionality like other similar tools.

Please note: the JS APIs are more of a **SDK** rather than a **framework**. You are mostly free to choose how to build your components and themes and which framework to use (or not).

---

## How to use them

Our JS APIs can be used when developing components and themes, but also when writing custom code for your screens in Fliplet Studio.

### 1. Fliplet CLI

Please refer to the specific `json` file in order to add dependencies to components, themes and menus.

### 2. Fliplet Studio

Adding our dependencies to apps screens only takes a few seconds. Just browse to the screen you want to add the package to, then click on the **Developer options** and add the **package name** in the **screen dependencies** section as shown:

![Dependencies](https://d2ppvlu71ri8gs.cloudfront.net/items/1D122h0u091N0W0p363j/Screen%20Shot%202017-04-27%20at%2019.04.19.png)

Then, click the save button and you're good to go! You can now use the methods that the package is exposing.

**Note: Don't forget to separate different packages by a comma.**

---

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

You can also get them as a [JSON](https://api.fliplet.com/v1/widgets/assets) hitting our [API endpoint](https://api.fliplet.com/v1/widgets/assets).

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