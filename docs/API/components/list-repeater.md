# List Repeater JS APIs

The list repeater component is a container for a list of records. It is used to display a list of records from a data source.

Here's a HTML sample of a list repeater component in a dynamic container rendering a dynamic value from the loaded data source entries:

```html
<fl-dynamic-container cid="123">
  <view name="content">
    <fl-repeater cid="456">
      <view name="content">
        <fl-text cid="34"><p>ID: {! entry.id !}</p></fl-text>
      </view>
    </fl-repeater>
  </view>
</fl-dynamic-container>
```

If you want to display a single record in a screen, for example a contact card, you can use the [record container](/API/components/record-container.html) component instead.

The following JS APIs are available in a screen once a **Repeater** component is dropped into the screen.

## Retrieve an instance

Since you can have many list repeater components in a screen, we provide a handy function to grab a specific instance by its name or the first one available in the page when no input parameter is given.

### `Fliplet.ListRepeater.get()`

Retrieves the first or a specific record container instance.

```js
// Get the first repeater instance
Fliplet.ListRepeater.get()
  .then(function (repeater) {
    // Use repeater object to perform various actions
  });

// Get the first repeater instance named 'foo'
Fliplet.ListRepeater.get('foo')
  .then(function (repeater) {
    // Use repeater object to perform various actions
  });
```

The `container` instance variable above is a `Vue` compatible instance with the following properties available:

- `direction`: `vertical` or `horizontal`
- `rows`: `Array` from the parent context
- `el`: DOM Element
- `template`: the list row template

---

## Retrieve all instances

Use the `getAll` method of the namespace to get all instances at once:

```js
Fliplet.ListRepeater.getAll().then(function (repeaters) {
  // Use repeaters
});
```

---

## Hooks

### repeaterDataRetrieved

Use the `repeaterDataRetrieved` hook to mutate data after it's been retrieved from the Data Source JS APIs:

```js
Fliplet.Hooks.on('repeaterDataRetrieved', function(options) {
  // options contains "container" and "data"

  // e.g. mutate the data array/object before it's rendered
  options.data.push({ Name: 'John' });

  // Return a promise if this callback should be async.
});
```

---

### repeaterBeforeRetrieveData

Use the `repeaterBeforeRetrieveData` hook to mutate data before it gets sent to the Data Source JS APIs for querying:

```js
Fliplet.Hooks.on('repeaterBeforeRetrieveData', function(options) {
  // options contains "instance" and "data"

  // e.g. mutate the data
  options.data.where = {
    Office: 'London';
  };

  // change limit
  options.data.limit = 10;

  // Return a promise if this callback should be async.
});
```

### repeaterDataRetrieveError

Use the `repeaterDataRetrieveError` hook to handle errors when retrieving data from the Data Source JS APIs:

```js
Fliplet.Hooks.on('repeaterDataRetrieveError', function(result) {
  // result contains "instance" and "error"
  // e.g. show an alert
});
```
