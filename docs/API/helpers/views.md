# Views

## Define a rich-content view

Define a list of rich-content views for your helper using the `views` object.

Each key will correspond to the unique view name within the helper, whereas the value is required to be an object to define its configuration, including what helpers are allowed to be dropped into the view.

```js
Fliplet.Helper({
  name: 'slider',
  render: {
    template: [
      '<div data-view="myFirstView"></div>',
      '<div data-view="mySecondView"></div>'
    ].join('')
  },
  views: {
    myFirstView: { allow: [] },
    mySecondView: { allow: ['slide'] }
  }
});
```

The example above defines two views:

- `myFirstView` allows any helper to be dropped in
- `mySecondView` only allows an helper called `slide` to be dropped in

---

## Define where a helper can be dropped into

By default, helpers are not allowed to be dropped into other helpers. However, they can optionally be allowed <strong>to be dropped any into rich-content views defined by other helpers</strong>. To do so you must define the `childOf` array property in the child helper with a list of helpers it can be dropped to:

```js
// This helper can only be dropped in the "slider" helper
Fliplet.Helper({
  name: 'slide',
  childOf: ['slider']
});
```

Furthermore, if your parent helper is declaring more than one rich-content view you can restrict your child helper to only be allowed <strong>to be dropped into a specific view</strong> by using the <strong>dot notation</strong> as follows:

```js
// This helper can only be dropped in the
// "slider" helper view named "mySecondView"
Fliplet.Helper({
  name: 'slide',
  childOf: ['slider.mySecondView']
});
```

<p class="quote"><strong>Note:</strong> If you want to allow an helper to be dropped in any other helper with no restrictions, you don't need to define the <code>childOf</code> property.</p>

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