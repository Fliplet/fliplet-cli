# Methods

Helpers are can define instance methods which can then be called at any time during the lifecycle of the app.

---

## Class methods

### Find a helper

Use the `findOne` class method to find an instance of a helper. You can provide a predicate to look for a specific helper on the screen:

```js
var instance = Fliplet.Helper.findOne({
  name: 'profile',
  fields: { bar: 1 }
});
```

### Find a list of helper

Use the `find` class method to find a list of helper instances on a screen. You can provide a predicate to filter for specific helpers:

```js
var instances = Fliplet.Helper.find({
  name: 'profile'
});
```

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

---

### Find all nested helpers

Use the `find` method to retrieve a list of all helpers nested in the current helper.

```html
<fl-helper name="quiz">
  <fl-helper name="results"></fl-helper>
</fl-helper>
```

```js
// Get a list of nested helpers by name
var foundHelpers = quiz.find({ name: 'results' });

// You can also use the shorthand
var foundHelpers = quiz.find('results');

// You can also provide a predicate function
var foundHelpers = quiz.find(function (instance) {
  return instance.name === 'results';
});
```

### Find a nested helper

```html
<fl-helper name="quiz">
  <fl-helper name="results"></fl-helper>
</fl-helper>
```

Use the `findOne` method to retrieve a helper nested in the current helper.

```js
// Get a nested helper by name
var helperInstance = quiz.findOne({ name: 'results' });

// You can also use the shorthand
var helperInstance = quiz.findOne('results');

// You can also provide a predicate function
var helperInstance = quiz.findOne(function (instance) {
  return instance.name === 'results';
});
```

### Find all children helpers

```html
<fl-helper name="quiz">
  <fl-helper name="results"></fl-helper>
</fl-helper>
```

Use the `children` method to retrieve a list of all direct child helpers nested in the current helper.

```js
// Get a list of direct child helpers by name
var foundHelpers = quiz.children({ name: 'results' });

// You can also use the shorthand
var foundHelpers = quiz.children('results');

// You can also provide a predicate function
var foundHelpers = quiz.children(function (instance) {
  return instance.name === 'results';
});
```

---

## Define new instance methods

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
