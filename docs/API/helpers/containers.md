# Containers

## Define a rich-content container

Define a list of rich-content containers for your helper using the `containers` object.

Each key will correspond to the unique container name within the helper, whereas the value is required to be an object to define its configuration, including what helpers are allowed to be dropped into the container.

```js
Fliplet.Helper('slider', {
  template: [
    '<div data-container="myFirstContainer"></div>',
    '<div data-container="mySecondContainer"></div>'
  ].join(''),
  containers: {
    myFirstContainer: { allow: [] },
    mySecondContainer: { allow: ['slide'] }
  }
});
```

The example above defines two containers:

- `myFirstContainer` allows any helper to be dropped in
- `mySecondContainer` only allows an helper called `slide` to be dropped in

---

## Define where a helper can be dropped into

Helpers can optionally be allowed <strong>to be dropped any into rich-content containers defined by other helpers</strong>. To do so. You must define the `childOf` array property in the child helper with a list of helpers it can be dropped to:

```js
// This helper can only be dropped in the "slider" helper
Fliplet.Helper('slide', {
  childOf: ['slider']
});
```

Furthermore, if your parent helper is declaring more than one rich-content container you can restrict your child helper to only be allowed <strong>to be dropped into a specific container</strong> by using the <strong>dot notation</strong> as follows:

```js
// This helper can only be dropped in the
// "slider" helper container named "mySecondContainer"
Fliplet.Helper('slide', {
  childOf: ['slider.mySecondContainer']
});
```

<p class="quote"><strong>Note:</strong>If you want to allow an helper to be dropped in any other helper with no restrictions, you don't need to define the <code>childOf</code> property.</p>

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