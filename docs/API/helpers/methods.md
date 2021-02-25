# Methods

Helpers are can define instance methods which can then be called at any time during the lifecycle of the app.

---

## Instance methods

### Update fields

Use the `set` instance method to update fields and values at runtime. Given the following example:

```js
var profile;

Fliplet.Helper({
  name: 'profile',
  data: {
    firstName: 'John'
  },
  render: {
    ready: function () {
      profile = this;
    }
  }
});
```

See how the `firstName` property can be updated at anytime using a static value or using the result of a promise returned by a function:

```js
profile.set('firstName', 'Nick');

profile.set('firstName', function () {
  return Promise.resolve('Tony');
})
```

### Find all nested helpers

Use the `find` method to retrieve a list of all helpers nested in the current helper.

```js
// Get a list of nested helpers by name
var foundHelpers = profile.find({ name: 'foo' });

// You can also use the shorthand
var foundHelpers = profile.find('foo');

// You can also provide a predicate function
var foundHelpers = profile.find(function (instance) {
  return instance.name === 'foo' || instance.name === 'bar';
});
```

### Find a nested helper

Use the `findOne` method to retrieve a helper nested in the current helper.

```js
// Get a nested helper by name
var helperInstance = profile.findOne({ name: 'foo' });

// You can also use the shorthand
var helperInstance = profile.findOne('foo');

// You can also provide a predicate function
var helperInstance = profile.findOne(function (instance) {
  return instance.name === 'foo' || instance.name === 'bar';
});
```

### Find all children helpers

Use the `children` method to retrieve a list of all direct child helpers nested in the current helper.

```js
// Get a list of direct child helpers by name
var foundHelpers = profile.children({ name: 'foo' });

// You can also use the shorthand
var foundHelpers = profile.children('foo');

// You can also provide a predicate function
var foundHelpers = profile.children(function (instance) {
  return instance.name === 'foo' || instance.name === 'bar';
});
```

---



## Define instance methods

Instance methods can be defined via the `methods` property as shown in the example below:

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    methods: {
      greet: function () {
        console.log('Hello');
      }
    },
    ready: function () {
      // Greet once a button inside this helper is clickd
      this.$el.find('button').click(this.greet);
    }
  }
});
```

You can also keep a reference to a helper instance and call its methods any time:

```js
var welcome;

Fliplet.Helper({
  name: 'welcome',
  render: {
    methods: {
      greet: function () {
        console.log('Hello');
      }
    },
    ready: function () {
      welcome = this;
    }
  }
});

welcome.greet();
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="fields.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Fields</h4>
      <p>Learn more about defining fields in your helpers.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>
