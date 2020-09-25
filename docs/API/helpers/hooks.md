# Hooks & Events

## Run logic once a helper is rendered

Define a `ready` function to run code when a helper instance is initialized and mounted to the HTML:

```js
Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  },
  ready: function () {
    // Helper has been rendered
  }
});
```

## Run logic once all helpers have been rendered

Define a `afterHelpersRender` hook to run code when all helpers have been initialized and rendered:

```js
Fliplet.Hooks.on('afterHelpersRender', function () {
  // All helpers have been rendered
});
```