# Form Builder JS APIs

These public JS APIs will be automatically available in your screens once a **Form Builder** component is dropped into such screens.

## Retrieve an instance

Since you can have many forms into a screen, we provide a handy function to grab a specific instance by its form name or the first one available in the page when no input parameter is given.

### `Fliplet.FormBuilder.get()`

Retrieves the first or a specific form instance.

```js
// Gets the first form instance
Fliplet.FormBuilder.get()
  .then(function (form) {
    // Use form to perform various actions
  });

// Gets the form instance named 'foo'
Fliplet.FormBuilder.get('foo')
  .then(function (form) {
    // Use form to perform various actions
  });
```

The `form` instance variable above makes available the following instance methods.

## Instance methods

### `form.load(Function)`

Allows to overwrite all form field values with new data. Useful if you manually want to populate the form based on your data.

```js
Fliplet.FormBuilder.get().then(function (form) {
  form.load(function () {
    return {
      Name: 'Nick',
      Email: 'nick@example.org'
    };
  });
});
```

You can also return a `Promise` if you're loading the data asynchronously. In the following example we are populating a form from an entry in a Fliplet data source:

```js
Fliplet.FormBuilder.get().then(function (form) {
  form.load(function () {
    return Fliplet.DataSources.connect(123).then(function (connection) {
      return connection.findById(456);
    });
  });
});
```

For more details, check the JS API documentation on the `Fliplet.DataSources` namespace.

<strong>Retrieve information of signed in user:</strong>

`form.load` can also be used in conjunction with `Fliplet.Session` to populate a form with the logged user's data:


```js
Fliplet.FormBuilder.get().then(function (form) {
  form.load(function () {
    return Fliplet.Session.passport().data().then(function (response) {
      // response.user.id
      // response.user.email
      // response.user.firstName
      // response.user.lastName

      // Simply return the user when your fields have the same name as the user's columns
      return response.user;

      // Otherwise, you can do some basic mapping:
      return {
        'Email address': response.user.email
      };
    });
  });
});
```

---

### `form.instance`

Property that references a `Vue` object with more advanced properties of the form. For example, you can loop all form fields using the `instance.fields` array:

```js
Fliplet.FormBuilder.get().then(function (form) {
  form.instance.fields.forEach(function (field) {
    // field is an object with "type", "name" and "value"
  });
});
```

---

### `form.field(String)`

Retrieves a form field by its ID (defined in Fliplet Studio interface).

```js
Fliplet.FormBuilder.get().then(function (form) {
  // Get the field with ID 'foo'
  var field = form.field('foo');
});
```

## Field methods

### `field().get()`

Gets the value of a form field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // gets the input value
    var value = form.field('foo').get();
  });
```

---

### `field().set()`

Sets the value of a form field to one of the following:

- a **literal value** (e.g. a `String`, a `Number`, a `Boolean` or an `Object`)
- a value from the **user's profile**
- a value from the **device shared storage**
- a value from the **current app's private storage**
- a value from a **query parameter**
- a value as **result of a function** (optionally returning a promise when asynchronous)

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // Sets the value to a literal value
    form.field('field-1').set('foo');

    // Sets the value to the current user's email
    form.field('field-1').set({ source: 'profile', key: 'email' });

    // Sets the value with the content of the "foo" query parameter
    form.field('field-1').set({ source: 'query', key: 'foo' });

    // Sets the value from the key named "foo" in the device shared storage
    form.field('field-1').set({ source: 'storage', key: 'foo' });

    // Sets the value from the key named "foo" in the device app's private storage
    form.field('field-1').set({ source: 'appStorage', key: 'foo' });

    // Sets the value as a result of a function
    form.field('field-1').set(function () {
      return 'foo' + 'bar';
    });

    // Sets the value as a result of an asynchronous method. In this example,
    // we're populating the field with the full name of a user in a data source
    form.field('field-1').set(function () {
      return Fliplet.DataSources.connect(123).then(function (connection) {
        return connection.find({ where: { email: 'foo@example.org' } });
      }).then(function (entries) {
        return _.get(_.first(entries), 'data.fullName');
      });
    });

  });
```

---

### `field().val()`

Gets or sets the value of a form field.

<p class="warning"><strong>DEPRECATION NOTICE:</strong> uses of <code>val()</code> are considered deprecated for new apps. We do recommend using the new <code class="success">set()</code> and <code class="success">get()</code> methods described in the sections above.</p>

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // set the input value
    form.field('foo').val('bar');

    // gets the input value
    var value = form.field('foo').val();
  });
```

---

### `field().change(Function)`

Attaches event listeners to a field changed.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // registers a callback to be fired whenever the field value changes
    form.field('foo').change(function (val) {
      // do stuff with "val"
    });
  });
```

---

### `field().toggle(Boolean)`

Shows or hides a field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    form.field('foo').toggle(); // Toggles field visibility
    form.field('bar').toggle(true); // Shows field
    form.field('baz').toggle(false); // Hides field
  });
```

Shows or hides fields based on another field's value

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // registers a callback to be fired whenever the field value changes
    form.field('foo').change(function (val) {
      // shows the field "bar" when the value of "foo" is greater than 10
      form.field('bar').toggle(val > 10);

      // shows the field "baz" when the value of "foo" is 50
      form.field('baz').toggle(val === 50);
    });
  });
```

---

### `field().options(Array)`

Programmatically sets the options of a dropdown or radio or checkbox field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    form.field('foo').options(['John', 'Nick', 'Tony']);
  });
```

## Hooks

### beforeFormSubmit

Capture data when the form is submitted. You can modify the data and also avoid data from being saved to a data source or continuing its flow.

```js
Fliplet.Hooks.on('beforeFormSubmit', function(data) {
  // add your code here

  // e.g. mutate the data before it's sent
  data.foo = 'bar'

  // return a promise if this callback should be async.
  // reject the promise to stop the form from submitting the data or continuing
});
```

---

### afterFormSubmit

Runs when a form has been submitted and has finished its processing.

```js
Fliplet.Hooks.on('afterFormSubmit', function() {
  // form data has been saved and submitted
});
```

---

### onFormSubmitError

Runs when a form has could not be submitted.

```js
Fliplet.Hooks.on('onFormSubmitError', function(error) {
  // form encountered an error when saving or submitting
});
```

---

## Events

### Reset (clear button pressed)

This event is fired when the clear button is pressed or the form is cleared programmatically.

```js
Fliplet.FormBuilder.on('reset', function () {

});
```

---

## Examples

### Updating data source entries

```js
var dataSourceId = 123;
var entryId = 456;

Fliplet.DataSources.connect(dataSourceId).then(function (connection) {
  // 1. Load the form in edit mode from a dataSource
  Fliplet.FormBuilder.get().then(function (form) {
    form.load(function () {
      return connection.findById(entryId);
    });
  });

  // 2. Bind a hook to update the data once the form is submitted:
  Fliplet.Hooks.on('beforeFormSubmit', function(data) {
    return connection.update(entryId, data);
  });
});
```

[Back to API documentation](../../API-Documentation.md)
{: .buttons}