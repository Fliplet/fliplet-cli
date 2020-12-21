# Attributes

Attributes can be passed to helpers and then accessed via the `attr` object in HTML or `this.attr.<name>` in JS.

## Accessing attributes

Use the `attr` property of the helper instance (`this`) to access attribute values in JavaScript as shown below.

Please note that attribute names are automatically converted to camelCase, e.g. `last-name` becomes `lastName` as the example below illustrates.

```html
<fl-helper data-type="welcome" data-first-name="John"></fl-helper>
```

```js
Fliplet.Helper('welcome', {
  ready: function () {
    console.log('Your first name is', this.attr.firstName);
  }
});
```

Attributes can also be accessed in the HTML template by using the shortcode syntax, e.g. `{! attr.firstName !}`.

## Updating attributes

Use the `set` instance method to update attributes and values at runtime. Given the following example:

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

## Default attributes

Use the `data` object to define default attributes for your helpers:

```js
Fliplet.Helper('welcome', {
  data: {
    lastName: 'Doe'
  },
  ready: function () {
    console.log('Your last name is', this.attr.lastName);
  }
});
```

---

## Dynamically loading attributes

The `data` object can optionally be a function returning a promise. This can be used to programmatcally load dynamic data when the helper is loaded:

```js
Fliplet.Helper('profile', {
  data: function () {
    var firstName = this.data.firstName;

    return Fliplet.DataSources.connect(123).then(function (connection) {
      return connection.findOne({ where: { firstName: firstName } });
    }).then(function (entry) {
      return { user: entry.data };
    });
  }
});
```

```html
{! start profile first-name="Nick" !}
  <p>Searched by {! firstName !}</p>
  <ul>
    <li>Email: {! user.email !}</li>
    <li>Name: {! user.name !}</li>
  </ul>
{! end profile !}
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="hooks.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Hooks &amp; Events</h4>
      <p>Learn more about responsing to hooks and events in your helpers.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>