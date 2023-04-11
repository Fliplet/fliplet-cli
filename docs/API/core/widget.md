# Widget

## Core widget APIs

### Get the JSON schema of a widget

You can use this method to fetch the JSON schema of a widget. The following widget packages are currently supporting this feature:

- `com.fliplet.form-builder`

```js
Fliplet.Widget.getSchema("com.fliplet.form-builder").then(function (schema) {
  // Use the schema
});
```

### Get the widget instance id

This method is usually meant to be called from a widget interface, to get the widget instance id if necessary.

```js
var id = Fliplet.Widget.getDefaultId();
```

### Get a widget instance data

This method is usually meant to be called from a widget interface, to get the saved data. It also returns any data passed through the `data` query parameter for the interface URL.

```js
var data = Fliplet.Widget.getData();
```

You can also get the data of a specific widget instance in the current page by passing its ID:

```js
var data = Fliplet.Widget.getData(1);
```

### Get the URL to an asset from the relative path of a widget

```js
// the first parameter is the widget id as usual
var url = Fliplet.Widget.getAsset(123, 'img/icon.png');

// on the interface, you can skip the id (same as getData and getUUID)
var url = Fliplet.Widget.getAsset('img/icon.png');
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

// You can also resolve an array of providers
Fliplet.Widget.all([myProvider]).then(function (results) {
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
