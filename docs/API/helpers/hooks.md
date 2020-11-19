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

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="style.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Styling</h4>
      <p>Learn more about styling your helpers with CSS.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>