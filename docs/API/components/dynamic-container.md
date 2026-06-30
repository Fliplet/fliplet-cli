---
title: Dynamic Container JS APIs
description: "Bind a screen region to a data source query via Fliplet.DynamicContainer so the component renders a list of entries with bound expressions."
type: api-reference
tags: [js-api, components, dynamic, container]
v3_relevant: true
deprecated: false
---
# Dynamic Container JS APIs

Bind a screen region to a data source query via `Fliplet.DynamicContainer` so the component renders a list of entries with bound expressions, typically paired with the [list repeater](/API/components/list-repeater) component.

Here's a HTML sample of a dynamic container with a list repeater component rendering a dynamic value from the loaded data source entries:

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

If you want to display a single record in a screen, for example a contact card, you can use the [record container](/API/components/record-container) component instead.

---

The following JS APIs are available in a screen once a **Dynamic container** component is dropped into the screen.

## Retrieve an instance

Since you can have many dynamic containers in a screen, we provide a handy function to grab a specific instance by its id or the first one available in the page when no input parameter is given.

### `Fliplet.DynamicContainer.get()`

Retrieves the first or a specific dynamic container.

```js
// Gets the first dynamic container instance
Fliplet.DynamicContainer.get()
  .then(function (container) {
    // Use container to perform various actions
  });

// Gets the dynamic container instance with id 123
Fliplet.DynamicContainer.get(123)
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

### `container.connection()`

Use the `connection` function to load the data source connection object.

```js
Fliplet.DynamicContainer.get().then(function (container) {
  container.connection().then(function (connection) {
    // Use connection instance as documented for the Data Sources JS API
  });
});
```
---
