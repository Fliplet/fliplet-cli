# Reference

## Query methods

**Dependency: `fliplet-helper`**

The `Fliplet.Helper` namespace contains several methods for querying the helper instances available in the current screen. These methods can be called from the apps as well as from the configuration interface.

### Find a helper

Use the `findOne` class method to find an instance of a helper. You can provide a predicate to look for a specific helper on the screen:

```js
var instance = Fliplet.Helper.findOne({
  name: 'profile',
  fields: { name: 'john' }
});
```

### Find a list of helpers

Use the `find` class method to find a list of helper instances on a screen. You can provide a predicate to filter for specific helpers:

```js
var instances = Fliplet.Helper.find({
  name: 'profile'
});
```
