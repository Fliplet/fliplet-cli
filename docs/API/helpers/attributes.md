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