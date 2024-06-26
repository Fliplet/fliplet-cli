# Hooks & Events

Lifecycle:
1. `beforeReady`
2. `ready`

## Run logic before a helper is rendered

Define a `beforeReady` function to run code when a helper instance is initialized and mounted to the HTML:

```js
Fliplet.Helper({
  name: 'profile',
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

---

## Run logic once a helper is rendered

Define a `ready` function to run code when a helper instance is initialized and mounted to the HTML:

```js
Fliplet.Helper({
  name: 'profile',
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

<p class="quote"><strong>Note:</strong>the <code>ready</code> does not get fired when you are editing your app in Fliplet Studio. Please use "Preview" mode to test your code.</p>

---

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
  <a class="bl two" href="dynamic-components.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Dynamic components</h4>
      <p>Learn how to add support for dynamic components to your helper.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
  <a class="bl two alt" href="views.html">
    <div class="secondary">
      <span class="pin"><i class="fa fa-file-alt"></i></span>
      <h4>Views</h4>
      <p>Learn more about how to add rich-content views to your helper.</p>
      <button>Read more &rarr;</button>
    </div>
  </a>
</section>