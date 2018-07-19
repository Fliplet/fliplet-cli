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
    return Fliplet.DataSources.connect(133).then(function (connection) {
      return connection.findById(456);
    });
  });
});
```

#### Retrieve information of signed in user

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

### `form.val()`

Gets or sets the value of a field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // set the input value
    form.field('foo').val('bar');

    // gets the input value
    return form.field('foo').val();
  });
```

--- 

### `form.change(Function)`

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

### `form.toggle(Boolean)`

Show and hide a field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    form.field('foo').toggle(); // Toggles field visibility
    form.field('bar').toggle(true); // Shows field
    form.field('baz').toggle(false); // Hides field
  });
```

Show and hide fields based on another field value

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

### `form.options(Array)`

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

[Back to API documentation](../../API-Documentation.md)
{: .buttons}