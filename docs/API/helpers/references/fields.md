# Reference

## Field methods

**Dependency: `fliplet-helper`**

The `Fliplet.Helper.field()` method can be called from the configuration interface to access other fields in the configuration.

### Find a field

```js
var field = Fliplet.Helper.field('name');
```

### Get the value of a field

```js
var field = Fliplet.Helper.field('name');

field.get();
```

### Get the value of a specific list item in a list field

```js
var field = Fliplet.Helper.field('items');
var item = field.get(0);

item.get();
```

### Get the value of a specific field for a list item in a list field

```js
var field = Fliplet.Helper.field('items');
var item = field.get(0);
var itemField = item.field('name');

itemField.get();
```

### Set the value of a field

```js
var field = Fliplet.Helper.field('name');

field.set('John');
```

The same works on a field of a list item.

### Show/hide a field

```js
var field = Fliplet.Helper.field('name');

field.toggle(); // Toggle the field
field.toggle(true); // Show the field
field.toggle(false); // Hide the field
```

Fields that are hidden using the `toggle()` method will not be included when the form is submitted. This is different from fields that are defined with `type: 'hidden'`, which will still be included in the form submission even though they are not visible.

### Check if a field is shown or hidden

```js
var field = Fliplet.Helper.field('name');

field.isShown(); // TRUE if shown
```

### Access provider instance for a provider field

```js
var field = Fliplet.Helper.field('name');

// Access the field provider instance and its methods
field.provider.emit('event-name');
```
