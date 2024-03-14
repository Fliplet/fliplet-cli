# Record container JS APIs

The record container allows you to display one record from a data source in a screen. It is useful when you want to display a single record in a screen, for example a contact card.

Here's a HTML sample of a record container with a text component rendering a dynamic value from the loaded data source entry:

```html
<fl-record-container cid="123">
  <view name="content">
    <fl-text cid="456">
      <p>ID: {! entry.id !}</p>
      <p>Email: {! entry.data.emailAddress !}</p>
    </fl-text>
  </view>
</fl-record-container>
```

The record container automatically loads the data source entry based on the `dataSourceEntryId` query parameter, when available. If the query parameter is not available, the record container will not load any data.

The entry loaded by the record container is available in the `entry` variable in the context of the components inside the record container.

You can use the component's hooks to perform actions when the data is retrieved from the data source or before the data is retrieved. See the [hooks](#hooks) section below for more information.

---

The following JS APIs are available in a screen once a **Record container** component is dropped into the screen.

## Retrieve an instance

Since you can have many list repeater components in a screen, we provide a handy function to grab a specific instance by its name or the first one available in the page when no input parameter is given.

### `Fliplet.RecordContainer.get()`

Retrieves the first or a specific record container instance.

```js
// Get the first record container instance
Fliplet.RecordContainer.get()
  .then(function (container) {
    // Use container object to perform various actions
  });

// Get the first record container instance named 'foo'
Fliplet.RecordContainer.get('foo')
  .then(function (container) {
    // Use container object to perform various actions
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
Fliplet.RecordContainer.getAll().then(function (containers) {
  // Use containers
});
```

---

## Hooks

### `recordContainerDataRetrieved`

This hook is triggered when the data is retrieved from the data source.

Attributes returned in the `options` object:

- `container`: the container element
- `entry`: the data source entry
- `vm`: the Vue instance of the widget

```js
Fliplet.Hooks.on('recordContainerDataRetrieved', function(options) {
  // options contains "container", "entry" and "vm"
});
```

---

### `recordContainerBeforeRetrieveData`

This hook is triggered before the entry is retrieved from the data source. It can be used to modify the data source query.

Attributes returned in the `options` object:

- `container`: the container element
- `connection`: the data source connection
- `vm`: the Vue instance of the widget
- `dataSourceId`: the data source id used for the connection
- `dataSourceEntryId`: the data source entry id to be loaded

```js
Fliplet.Hooks.on('recordContainerBeforeRetrieveData', function () {
  // Modify the data source query used by "findOne" to retrieve the data
  return { where: { name: 'John' } };
});
```
