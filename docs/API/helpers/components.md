# Distribute helpers as components

Helpers can be distributed as components through a simple process to repackage them using our widgets framework.

## 1. Install the basic software

Install the [Fliplet CLI](/Quickstart.html) on your computer before continuing with the rest.

---

## 2. Generate the component boilerplate

Once you have installed the [Fliplet CLI](/Quickstart.html), open the shell of your computer and run the `fliplet create-widget <package> <name> --helper` command described below to create the initial structure of the component in a new directory with the same name as the `<name>` in the input.

The command requires two inputs:

- **Package name**: the unique "reverse domain name" to be used for your component, e.g. `com.example.decision-tree`
- **Component name**: the user-friendly name of your component, e.g. `Decision tree`

```bash
fliplet create-widget "com.fliplet.decision-tree" "Decision tree" --helper
```

Upon running the command above, you should receive an output similar to this:

```
Creating new widget Decision tree to C:\Users\John\decision-tree using helper boilerplate
Component has been successfully created.
```

---

## 3. Configure the component

Before you start copying the helper code into the component, open the `widget.json` file you find in the created folder and configure the component by reviewing and tweaking the following properties:

- **`references`**
  - This array property should list all [references](/components/Definition.html#references) between the fields used in your helper and Fliplet entities, such as a **Data Source ID**, a **Screen ID** or a **Media File ID**. Furthermore, **views should be listed here as well** using the `richContent` reference type.

    [References](/components/Definition.html#references) use the following structure: `<propertyName>:<referenceType>`

    The following example assumes that you have a **view** field stored under the `content` property, a **dataSourceId** stored under the `contactsDataSource` property and a target action configured using the link provider, which has a **page** reference under `goTo`:

    ```json
    widget.json

    {
      "references": [
        "content:richContent",
        "contactsDataSource:dataSource",
        "goTo.page:page"
      ]
    }
    ```

- **`dependencies` and `assets`**
  - Under the `interface` and `build` top-level keys you'll find these two properties to be used to define first-party `dependencies` (Fliplet JS APIs or libraries) and `assets` defined by your helper codebase. See [dependencies and assets](/Dependencies-and-assets) and [component definition](/components/Definition.html#interface) for more information.

---

## 4. Copy the interface configuration

Copy all contents of the `configuration` property of your helper JS code and paste it into the `js/interface.js`` file of the component folder in the contents of the `Fliplet.Widget.generateInterface` function you will find in the boilerplate:

```js
// ---- js/interface.js

Fliplet.Widget.generateInterface({
  fields: [
    // ...
  ]
});
```

---

## 5. Update lookup functions

Your interface configuration above should also be updated if you're using the following functions:

- `Fliplet.Helper.find()`
- `Fliplet.Helper.findOne()`

These two functions are asynchronous when running in the widget framework, so they must be updated to wait for the promise to fetch the data:

```js
// Helper framework syntax
// !!! THIS DOES NOT WORK IN THE WIDGET FRAMEWORK !!!
Fliplet.Helper.find({ name: 'question' });

// New syntax used when the helper is packaged as a widget
Fliplet.Helper.find({ name: 'question' }).then(function (helpers) {

});
```

Likewise, you can use two new functions when you need to discover other widget instances on the screen:

- `Fliplet.Widget.find()`
- `Fliplet.Widget.findOne()`

```js
Fliplet.Widget.find({ package: 'com.fliplet.primary-button' }).then(function (widgetInstances) {

});
```

---

## 6. Copy the helper definition code

Grab all contents of your helper JS code and paste it in the `js/build.js` file of the component folder in the contents of the `Fliplet.Widget.instance` function you will find in the boilerplate.

**Make sure to omit the `configuration` key**, as you should have pasted those contents in the interface configuration at the step above.

```js
// ---- js/build.js

Fliplet.Widget.instance({
  name: 'decision-tree',
  displayName: 'Decision tree',
  render: {
    // ...
  }
});
```

As you may have guessed, your helper code only needs changing the base function name from `Fliplet.Helper` to `Fliplet.Widget.instance`, so it's just a simple copy and paste of the helper code you have.

---

## 7. Add any relevant CSS

If you have CSS code to add to your helper, simply copy those declarations in the `css/build.css` file of the project folder.

---

## 8. Replace the default icon

Fliplet components are displayed in the components list with a unique icon for each component. The default icon added by the boilerplate can be found in `img/icon.png`. You should be replacing this to your transparent PNG icon representing the component before publishing it on Studio.

---

## 9. Publish your component to Fliplet Studio

Publishing the component is as simple as running the `fliplet publish` CLI command after having [logged in](/Publishing.html) with your Studio account.

Please refer to our [publishing](/Publishing.html) documentation to publish your component on Fliplet Studio.
