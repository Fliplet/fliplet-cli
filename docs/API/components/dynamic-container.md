# Dynamic Container JS APIs

<p class="warning">This feature is currently available to beta users only.</p>

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

---

## Retrieve all instances

Use the `getAll` method of the namespace to get all instances at once:

```js
Fliplet.DynamicContainer.getAll().then(function (containers) {
  // Use containers
});
```

---

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
      return connection.findWithCursor({
        where: { Office: 'London' },
        limit: 10
      });
    });
  });
});
```

Note that we used the [findWithCursor](/API/fliplet-datasources.html#fetch-all-records-from-a-data-source) method instead of `find` to let the system manage pagination when the data is displayed in a repeated list.

For more details, check the JS API documentation for the [findWithCursor](/API/fliplet-datasources.html#fetch-all-records-from-a-data-source) method.

---

## Advanced scenarios

### Load more data for infinite scroll

Here's a simple example on how you can add an infinite scroll capability to your app when using a dynamic container with a limit set:

```js
// Attach a jQuery event on window scroll
$(window).on('scroll', _.throttle(updatePosition, 200));

function updatePosition() {
  // Check if the user is approaching the end of the screen
  if ($(window).scrollTop() + $(window).height() >= ($(document).height() - 200)) {
    loadMore();
  }
}

function loadMore() {
  Fliplet.DynamicContainer.get().then(function (container) {
    // Move to the next page of the dataset and keep existing entries in the cursor
    container.context.next().update({ keepExisting: true });
  });
}
```

---