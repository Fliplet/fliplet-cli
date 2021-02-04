# Methods

Helpers are can define instance methods which can then be called at any time during the lifecycle of the app.

---

## Define instance methods

Instance methods can be defined via the `methods` property as shown in the example below:

```js
Fliplet.Helper('welcome', {
  methods: {
    greet: function () {
      console.log('Hello');
    }
  },
  ready: function () {
    // Greet once a button inside this helper is clickd
    this.$el.find('button').click(this.greet);
  }
});
```

You can also keep a reference to a helper instance and call its methods any time:

```js
var welcome;

Fliplet.Helper('welcome', {
  methods: {
    greet: function () {
      console.log('Hello');
    }
  },
  ready: function () {
    welcome = this;
  }
});

welcome.greet();
```

---

## Public methods

### Update fields

Use the `set` instance method to update fields and values at runtime. Given the following example:

```js
var profile;

Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  },
  ready: function () {
    profile = this;
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
