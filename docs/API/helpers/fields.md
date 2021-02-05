# Fields

fields can be passed to helpers via the `field` HTML element and then accessed via `this.fields.<name>` in JavaScript.

## Accessing fields

Use the `field` property of the helper instance (`this`) to access field values in JavaScript as shown below.

```html
<fl-helper name="question">
  <field name="title">What is your name?</field>
  <field name="description">Lorem ipsum dolor sit amet</field>
</fl-helper>
```

```js
Fliplet.Helper({
  name: 'question',
  render: {
    ready: function () {
      console.log('Title of the question', this.fields.title);
    }
  }
});
```

fields can also be accessed in the HTML template by using the shortcode syntax, e.g. `{! fields.firstName !}`.

## Updating fields

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

## Default fields

Use the `data` object to define default fields for your helpers:

```js
Fliplet.Helper({
  name: 'welcome',
  data: {
    lastName: 'Doe'
  },
  render: {
    ready: function () {
      console.log('Your last name is', this.fields.lastName);
    }
  }
});
```

---

## Dynamically loading fields

The `data` object can optionally be a function returning a promise. This can be used to programmatcally load dynamic data when the helper is loaded:

```js
Fliplet.Helper({
  name: 'profile',
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