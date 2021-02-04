# Hooks & Events

## Run logic before a helper is rendered

Define a `beforeReady` function to run code when a helper instance is initialized and mounted to the HTML:

```js
Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  },
  render: {
    beforeReady: function () {
      // Helper has been rendered
    }
  }
});
```

## Run logic once a helper is rendered

Define a `ready` function to run code when a helper instance is initialized and mounted to the HTML:

```js
Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  },
  render: {
    ready: function () {
      // Helper has been rendered
    }
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

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="containers.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Containers</h4>
      <p>Learn more about how to add rich-content containers to your helper.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>