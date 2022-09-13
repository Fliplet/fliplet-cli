# Repeater JS APIs

<p class="warning">This feature is currently available to beta users only.</p>

The following JS APIs are available in a screen once a **Repeater** component is dropped into the screen.

## Retrieve an instance

Since you can have many list repeater components in a screen, we provide a handy function to grab a specific instance by its name or the first one available in the page when no input parameter is given.

### `Fliplet.ListRepeater.get()`

Retrieves the first or a specific form instance.

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

## Add infinite scroll to a list

Here's a simple example on how you can add infinite scroll to a list using a dynamic container with a limit set:

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

## Hooks

No hooks are available for this component.