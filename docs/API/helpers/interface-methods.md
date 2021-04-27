# Methods

Both configuration interface and configuration fields have available the following methods to fetch details regarding children helpers nested into the current helper:

- `find`
- `findOne`
- `children`

## Interface

Considering the following HTML template:

```html
<fl-helper name="quiz">
  <fl-helper name="results"></fl-helper>
</fl-helper>
```

The following methods allow you to get the `results` helper instance via the `quiz` helper instance.

### Find all nested helpers

Use the `find` method to retrieve a list of all helpers nested in the current helper.

```js
Fliplet.Helper({
  name: 'quiz',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a list of nested helpers by name
          var foundHelpers = this.find({ name: 'results' });

          // You can also use the shorthand
          var foundHelpers = this.find('results');

          // You can also provide a predicate function
          var foundHelpers = this.find(function (instance) {
            return instance.name === 'results' || instance.name === 'bar';
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
  name: 'quiz',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a nested helper by name
          var helperInstance = this.findOne({ name: 'results' });

          // You can also use the shorthand
          var helperInstance = this.findOne('results');

          // You can also provide a predicate function
          var helperInstance = this.findOne(function (instance) {
            return instance.name === 'results' || instance.name === 'bar';
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
  name: 'quiz',
  configuration: {
    fields: [
      {
        name: 'sample',
        type: 'html',
        html: '<input type="text" />',
        ready: function(el) {
          // Get a list of direct child helpers by name
          var foundHelpers = this.children({ name: 'results' });

          // You can also use the shorthand
          var foundHelpers = this.children('results');

          // You can also provide a predicate function
          var foundHelpers = this.children(function (instance) {
            return instance.name === 'results' || instance.name === 'bar';
          });
        }
      }
    ]
  }
});
```

### Find helpers on the same screen

Use the `findOne` class method to find an instance of a helper. You can provide a predicate to look for a specific helper on the screen:

```js
var instance = Fliplet.Helper.findOne({
  name: 'profile',
  fields: { name: 'john' }
});
```

### Find a list of helpers on the same screen

Use the `find` class method to find a list of helper instances on a screen. You can provide a predicate to filter for specific helpers:

```js
var instances = Fliplet.Helper.find({
  name: 'profile'
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