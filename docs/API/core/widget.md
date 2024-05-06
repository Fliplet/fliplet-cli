# Widget

## Core widget APIs

### Get the current widget instance id

<p class="info">This method is usually meant to be called from a widget interface, to get the widget instance id if necessary.</p>

```js
const id = Fliplet.Widget.getDefaultId();
```

### Get the current widget instance settings

<p class="info">This method is usually meant to be called from a widget interface, to get the saved settings.</p>

The returned settings also include any data passed through the `data` query parameter of the interface URL.

```js
const settings = Fliplet.Widget.getData();
```

### Get a widget instance settings by ID

You can get the settings of a specific widget instance in the current page by passing its ID:

```js
const settings = Fliplet.Widget.getData(123);
```

If the widget instance does not belong to the current page, you can fetch its settings via the JS APIs:

```js
Fliplet.API.request('v1/widget-instances/123').then(function (response) {
  // response.widgetInstance.settings
})
```

### Find widgets

```js
Fliplet.Widget.find().then(function(instances) {
  // Returns all widget instances for a page
});

Fliplet.Widget.find({ package: 'com.fiplet.image' }).then(function(instances) {
  // Returns all image widget instances for a page
});

Fliplet.Widget.findOne({ package: 'com.fiplet.image' }).then(function(instance) {
  // Returns the first image widget instance found on a page
});
```

### Find parent widgets

```js
Fliplet.Widget.findParents().then(function(widgets) {
  // Can be called directly from the widget interface to find out all the parent widget instances of the current instance
});

Fliplet.Widget.findParents({ instanceId: 1234 }).then(function(widgets) {
  // Return parent widget instances of a specific instance
});

Fliplet.Widget.findParents({ instance: 1234, filter: { package: 'com.fliplet.container' } }).then(function(widgets) {
  // Return parent widget instances of a specific instance that match the specified filter
});
```

### Get the JSON schema of a widget

You can use this method to fetch the JSON schema of a widget. The following widget packages are currently supporting this feature:

- `com.fliplet.form-builder`
- `com.fliplet.data-sources`

```js
Fliplet.Widget.getSchema("com.fliplet.form-builder").then(function (schema) {
  // Use the schema
});
```

### Create a new widget instance

First, fetch widget IDs via [our API](https://api.fliplet.com/v1/widgets?fields=id,name,package). You can also fetch the `widgetId` for a specific package name, e.g. [see specific request](https://api.fliplet.com/v1/widgets?fields=id,name,package&package=com.fliplet.dynamic-lists) for the List from Data Source component.

```js
// Create a new widget instance for a screen
Fliplet.API.request({
  url: '/v1/widget-instances',
  method: 'POST',
  data: {
    widgetId: 123, // from the list of widgets above
    pageId: 456, // target screen ID
    settings: { foo: 'bar' } // initial configuration for the widget
  }
})
```

### Fetch the HTML layout of a page

```js
Fliplet.API.request({
  url: 'v1/apps/123/pages/456?richLayout'
}).then(function (response) {
  // response.page.richLayout
})
```

### Update the HTML layout of a page

Assuming a widget instance with ID 789, this endpoint updates the whole page content with the new layout you send.

```js
Fliplet.API.request({
  url: 'v1/apps/123/pages/456/rich-layout',
  method: 'PUT',
  data: {
    richLayout: '<fl-component cid="789"></fl-component>'
  }
})
```

### Update the settings of a widget instance

You can use the following JS API to update a widget instance settings:

```js
Fliplet.API.request({
  method: 'PUT',
  url: 'v1/widget-instances/123',
  data: {
    // Include here the new settings
    foo: 'bar',
    bar: 'barbaz'
  }
}).then(function (result) {
  // data has been saved
});
```

Once a widget instance settings are updated, use this JS API to reload the widget instance being rendered on the Studio device preview frame:

```js
// Reloads widget instance 123
Fliplet.Widget.instance(123);
```

If your code is running in a different context, e.g. a widget or helper configuration interface run this code instead:

```js
Fliplet.Studio.emit('widget-save-complete', {
  data: result // use result from the save operation above
});
```

---

### Get the URL to an asset from the relative path of a widget

Depending on whether the app is rendered as a web app or on a native device, you can get the asset path for a widget instance:

```js
// Returns CDN or local file path based on platform
var url = Fliplet.Widget.getAsset(123, 'img/placeholder.jpg');

// When used on the configuration interface, you can skip the ID (same as getData and getUUID)
var url = Fliplet.Widget.getAsset('img/placeholder.jpg');
```

### Get a widget instance unique identifier

The widget instance ID might change overtime when an app is published. If you need to use an ID which won't change, you can use the `getUUID(<widgetInstanceId>)`.

```js
var uuid = Fliplet.Widget.getUUID(1);
```

## Widget APIs for Studio interface

### Emit an event to the parent widget or Fliplet Studio

```js
Fliplet.Widget.emit('foo', { bar: 1 });
```

### Display an error message in Fliplet Studio

```js
Fliplet.Widget.displayMessage({ text: 'The email is not valid' });
```

### Sets the widget interface info message in Fliplet Studio

```js
Fliplet.Widget.info('2 files selected');
```

### Toggle the wide mode on the interface

```js
// Enable the wide mode
Fliplet.Studio.emit('widget-mode-wide');

// Disable the wide mode
Fliplet.Studio.emit('widget-mode-default');
```

### Toggle the save button

```js
// Enable the button
Fliplet.Widget.toggleSaveButton(true);

// Disable the button
Fliplet.Widget.toggleSaveButton(false);
```

### Set & reset the save button label

```js
// Set the button label
Fliplet.Widget.setSaveButtonLabel('Pick');

// Reset the button label (to 'Save & Close')
Fliplet.Widget.resetSaveButtonLabel();
```

### Toggle the cancel button

```js
// Enable the button
Fliplet.Widget.toggleCancelButton(true);

// Disable the button
Fliplet.Widget.toggleCancelButton(false);
```

### Set & reset the cancel button label

```js
// Set the button label
Fliplet.Widget.setCancelButtonLabel('No thanks');

// Reset the button label (to 'Save & Close')
Fliplet.Widget.resetCancelButtonLabel();
```

### Autosize

Tells the parent widget or studio the new height of this widget.

```js
Fliplet.Widget.autosize();
```

As a rule of thumb, you are responsible of calling the above function every time the height of your widget (or provider) is changing.

## Providers

Provider widgets allow developers to reuse widget interface with a consistent UX for achieving certain tasks.

### Open a provider

```js
// Fliplet.Widget.open() returns a Promise-like object
var myProvider = Fliplet.Widget.open('com.fliplet.link', {

  // If provided, the iframe will be appended here,
  // otherwise will be displayed as a full-size iframe overlay
  selector: '#somewhere',

  // You can send data to the provider, to be used similar to a widget instance data
  data: { foo: 'bar' },

  // You can also listen for events fired from the provider
  onEvent: function (event, data) {
    if (event === 'interface-validate') {
      Fliplet.Widget.toggleSaveButton(data.isValid === true);
    }

    // return true to stop propagation up to studio or parent components
  }
});

// The returned variable from Fliplet.Widget.open() resolves when the provider is saved
myProvider.then(function (data) {
  // data will contain the result
});

// The provider is triggered to start saving data
myProvider.forwardSaveRequest();

// Trigger events to the provider
myProvider.emit('event-name');

// You can also resolve an array of providers (similar to Promise.all)
Fliplet.Widget.all([myProviderA, myProviderB, myProviderC]).then(function () {
  // results is an array with data from all providers you resolved
});
```

You can also stop the provider from being closed once resolved, by passing the `closeOnSave: false` option. You can then close it manually by calling `myProvider.close()` at any time.

### Attach an event on save request

Optionally attach an event handler to be called when the "save" button will be called in studio. Here's the typical usage of the function:

```js
Fliplet.Widget.onSaveRequest(function () {
  // Save data when the save button in studio is clicked
  return Fliplet.Widget.save({ foo: 1 });
}).then(function onSave() {
  // Closes this widget interface
  Fliplet.Widget.complete();
});
```

### Save data

Used to save JSON-structured data to the current widget instance. The `save` function is usually meant to be triggered from `onSaveRequest` described above.

```js
Fliplet.Widget.save({ foo: 1 }).then(function () {
  // Closes this widget interface
  Fliplet.Widget.complete();
});
```

### Close the interface when done

```js
Fliplet.Widget.complete();
```

## Namespaced widgets

You can also create a private widget namespace which you can use to store and access widget instances:

```js
// Register a namespace. Existing namespace will be returned.
Fliplet.Foo = Fliplet.Widget.Namespace('foo');
```

### Add an instance

```js
Fliplet.Foo.add(instance) // instance can be a promise but does not need to be
```

### Get an instance

```js
Fliplet.Foo.get().then((instance) => { /* Returns the first instance */ })
Fliplet.Foo.get('bar').then((instance) => { /* Returns the first instance with instance.name: "bar" */ })
Fliplet.Foo.get({ type: 'bar' }).then((instance) => { /* Returns the first instance with instance.type: "bar" */ })
```

### Get all instances

```js
Fliplet.Foo.getAll().then((instances) => { /* Returns an array of all instances */ })
Fliplet.Foo.getAll('bar').then((instances) => { /* Returns an array of instances where instance.name: "bar" */ })
Fliplet.Foo.getAll({ type: 'bar' }).then((instances) => { /* Returns an array of instances where instance.type: "bar" */ })
```
