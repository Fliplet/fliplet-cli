# Fliplet Form Builder JS APIs

## Retrieve an instance

### `Fliplet.FormBuilder.get()`

Retries the first or a specific form instance.

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

## Instance methods

### `.field(name)`

Retrieve a form field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // Gets the field named 'foo'
    // form.field('foo');
  });
```

## Field methods

### `.val()`

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

### `.change()`

Attaches event listeners to a field changed.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    // registers a callback to be fired whenever the field value changes
    form.field('foo').change(function (val) {
    })
  });
```

### `.toggle()`

Show and hide a field.

```js
Fliplet.FormBuilder.get()
  .then(function (form) {
    form.field('foo').toggle(); // Toggles field visibility
    form.field('bar').toggle(true); // Shows field
    form.field('baz').toggle(false); // Hides field
  });
```

## Hooks

### `beforeSubmit`

```js
Fliplet.Hooks.on('beforeFormSubmit')
```
