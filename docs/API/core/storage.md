# Storage

The `Storage` JS APIs allow you to save and read data to and from the device or browser. You can save values such as **numbers**, **booleans**, **strings** and also **objects** (as long as they can be serialized via **JSON**).

Please note that all these methods (`set`, `get` and `remove`) are asynchronous and the result is returned via promises. You don't need to wait for the promise when you use `set` and `remove` but you surely will need it when you use the `get` method to read a variable.

We currently allow storing settings to the current app but also to apps you have installed in your device (e.g. when running via the App List component or Fliplet Viewer). Please make sure to use the correct storage depending on the case:

- `Fliplet.App.Storage` writes and reads data for the current app; this is most likely what you want to use.
- `Fliplet.Storage` writes and reads to a global storage which is shared across your apps.

Both namespaces have the same methods for reading, setting and removing data as explained in the sections below.

### Store data

```js
Fliplet.App.Storage.set('key', value);

// You can also wait for this to be saved on disk with a promise, if necessary
Fliplet.App.Storage.set('key', value).then(function () {
  // this runs when the variable has been saved to disk
}).catch(function (error) {
  // this runs when an error was triggered and the data could not be saved
});
```

### Read data

Use the `Fliplet.App.Storage.get()` method to read one or more values from the device storage for the current app. The input parameter can either be a `String` when looking for a single key or an `Array` when you need to lookup for more than one.

```js
// Read a single key from the app's storage
Fliplet.App.Storage.get('foo').then(function (value) {
  // here you can use the "value"
});

// Read multiple keys from the app's storage
Fliplet.App.Storage.get(['foo', 'bar']).then(function (values) {
  // values will be an object containing "foo" and "bar":
  // - values.foo
  // - values.bar
}).catch(function (error) {
  // this block is optional and it runs when an error was triggered
  // and the data could not be read
});

// You can also provide default properties to return when the key is not set.
// This also works when the input key is an array.
Fliplet.App.Storage.get('key', { defaults: 123 })
  .then(function (value) {
    // here you can use the "value"
  });

// Providing default properties also works when the value is an object.
Fliplet.App.Storage.get('key', { defaults: { hello: 'world' } })
  .then(function (value) {
    // here you can use the "value"
  });

// Providing default properties also works when the input key is an array.
Fliplet.App.Storage.get(['foo', 'bar'], { defaults: { foo: '1', bar: 'baz' } })
  .then(function (value) {
    // here you can use the "value"
  });
```

You can optionally provide a default value in case the key has not been assigned a value yet.

### Remove data

```js
Fliplet.App.Storage.remove('key');

// You can also wait for this to be removed from the disk with a promise, if necessary
Fliplet.App.Storage.remove('key').then(function () {
  // this runs when the variable has been removed from to disk
});
```

---

## Namespaced storage

You can also create a private namespaced storage which is nor shared with the `Fliplet.App.Storage` neither with the global `Fliplet.Storage`:

```js
var myPrivateStorage = Fliplet.Storage.Namespace('foo');
```

### Set data
```js
myPrivateStorage.set('bar', 'my data')
```

### Get data

```js
myPrivateStorage.get('bar').then(function(value) {})
```

### Get all data

**Note** This is only available for namespaced storage

```js
myNamespaceStorage.getAll().then(function(data) {})
```

### Remove

Remove a key or list of keys from the namespaced storage

```js
myNamespaceStorage.remove('bar')
```

**Note** If you need to remove multiple storage keys at once, you must pass an array of keys

```js
// Correct
myNamespaceStorage.remove(['foo', 'bar'])

// Incorrect - This will result in only the last one being removed
myNamespaceStorage.remove('foo')
myNamespaceStorage.remove('bar')
```

### Clear

**Note** This is only available for namespaced storage

Clear all namespaced storage
```js
myNamespaceStorage.clear()
```