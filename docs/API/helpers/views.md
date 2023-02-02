# Helper Views

## Define a rich-content view

Define a list of rich-content views for your helper using the `views` object.

Each key will correspond to the unique view name within the helper, whereas the value is required to be an object to define its configuration, including what helpers are allowed to be dropped into the view.

```js
Fliplet.Helper({
  name: 'slider',
  render: {
    template: [
      '<div data-view="myFirstView"></div>',
      '<div data-view="mySecondView"></div>',
      '<div data-view="myThirdView"></div>'
    ].join('')
  },
  views: [
    { name: 'myFirstView', displayName: 'View 1' },
    { name: 'mySecondView', displayName: 'View 2', allow: ['slide'] },
    { name: 'myThirdView', displayName: 'View 3', allow: [] }
  ]
});
```

The example above defines three views:

- `myFirstView` allows any helper to be dropped in
- `mySecondView` only allows an helper called `slide` to be dropped in
- `myThirdView` only allows no helpers to be dropped in

---

## Define a placeholder for a rich-content view

Views can define a placeholder HTML to be rendered when empty. Use the `placeholder` attribute as detailed here below:


```js
Fliplet.Helper({
  name: 'slider',
  render: {
    template: [
      '<div data-view="myFirstView"></div>'
    ].join('')
  },
  views: [
    {
      name: 'myFirstView',
      displayName: 'View 1',
      placeholder: '<p>Please drop content here</p>'
    }
  ]
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
