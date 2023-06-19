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

### Set the value of a field

```js
var field = Fliplet.Helper.field('name');

field.set('John');
```

### Show/hide a field

```js
var field = Fliplet.Helper.field('name');

field.toggle(); // Toggle the field
field.toggle(true); // Show the field
field.toggle(false); // Hide the field
```

### Access provider instance for a provider field

```js
var field = Fliplet.Helper.field('name');

// Access the field provider instance and its methods
field.provider.emit('event-name');
```
