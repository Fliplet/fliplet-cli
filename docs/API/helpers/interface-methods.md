# Methods

Both configuration interface and configuration fields have available the following methods to fetch details regarding children helpers nested into the current helper:

- `find`
- `findOne`
- `children`

## Interface

### Find all nested helpers

Use the `find` method to retrieve a list of all helpers nested in the current helper.

```js
Fliplet.Helper({
  name: 'welcome',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a list of nested helpers by name
          var foundHelpers = this.find({ name: 'foo' });

          // You can also use the shorthand
          var foundHelpers = this.find('foo');

          // You can also provide a predicate function
          var foundHelpers = this.find(function (instance) {
            return instance.name === 'foo' || instance.name === 'bar';
          });
        }
      }
    ]
  }
});
```

### Find a nested helper

Use the `findOne` method to retrieve a helper nested in the current helper.

```js
Fliplet.Helper({
  name: 'welcome',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a nested helper by name
          var helperInstance = this.findOne({ name: 'foo' });

          // You can also use the shorthand
          var helperInstance = this.findOne('foo');

          // You can also provide a predicate function
          var helperInstance = this.findOne(function (instance) {
            return instance.name === 'foo' || instance.name === 'bar';
          });
        }
      }
    ]
  }
});
```

### Find all children helpers

Use the `children` method to retrieve a list of all direct child helpers nested in the current helper.

```js
Fliplet.Helper({
  name: 'welcome',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a list of direct child helpers by name
          var foundHelpers = this.children({ name: 'foo' });

          // You can also use the shorthand
          var foundHelpers = this.children('foo');

          // You can also provide a predicate function
          var foundHelpers = this.children(function (instance) {
            return instance.name === 'foo' || instance.name === 'bar';
          });
        }
      }
    ]
  }
});
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="interface-hooks.html">
    <div>
      <span class="pin">Next up</span>
      <h4>Hooks &amp; events</h4>
      <p>Learn the hooks and events available to fields.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
  <a class="bl two" href="interface-libraries.html">
    <div>
      <span class="pin">Recommended reading</span>
      <h4>External libraries</h4>
      <p>Learn how configuration UIs can use external libraries.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
</section>