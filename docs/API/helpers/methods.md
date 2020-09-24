# Methods

Helpers are can define instance methods which can then be called at any time during the lifecycle of the app.

---


## Instance methods

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

<section class="blocks alt">
  <a class="bl two" href="attributes.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Attributes</h4>
      <p>Learn more about defining attributes in your helpers.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>