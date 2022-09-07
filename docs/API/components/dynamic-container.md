# Dynamic Container JS APIs

The following JS APIs are available in a screen once a **Dynamic container** component is dropped into the screen.

## Retrieve an instance

Since you can have many dynamic containers in a screen, we provide a handy function to grab a specific instance by its name or the first one available in the page when no input parameter is given.

### `Fliplet.DynamicContainer.get()`

Retrieves the first or a specific form instance.

```js
// Gets the first Dynamic Container instance
Fliplet.DynamicContainer.get()
  .then(function (container) {
    // Use container to perform various actions
  });

// Gets the first Dynamic Container instance named 'foo'
Fliplet.DynamicContainer.get('foo')
  .then(function (container) {
    // Use container to perform various actions
  });
```

The `container` instance variable above makes available the following instance methods.

## Instance methods

### `container.load()`

Use the `load` function to populate the dynamic container context with an array or an object:

```js
Fliplet.DynamicContainer.get().then(function (container) {
  container.load(function () {
    return [
      { Name: 'Bob' },
      { Name: 'Alice' }
    ];
  });
});
```

You can also return a `Promise` if you're loading the data asynchronously. In the following example we are populating a container with entries from a Fliplet data source:

```js
Fliplet.DynamicContainer.get().then(function (container) {
  container.load(function () {
    return Fliplet.DataSources.connect(123).then(function (connection) {
      return connection.find({
        where: { Office: 'London' }
      });
    });
  });
});
```

For more details, check the JS API documentation for the `Fliplet.DataSources` namespace.

---

## Hooks

### containerDataRetrieved

Use the `containerDataRetrieved` hook to mutate data before it gets sent to any children component in the dynamic container:

```js
Fliplet.Hooks.on('containerDataRetrieved', function(options) {
  // options contains "container" and "data"

  // e.g. mutate the data array/object before it's sent
  options.data.push({ Name: 'Tony' });

  // Return a promise if this callback should be async.
});
```

---