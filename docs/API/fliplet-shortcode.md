# Shortcode JS APIs

<p class="warning">You are browsing an early private spec of this feature.</p>

## Register a shortcode

`Fliplet.Shortcode(name, definition)`

```js
Fliplet.Shortcode('welcome', {
  data: {
    name: 'John'
  }
});
```

```html
{! start welcome !}
  <p>Hi {! name !}, how are you?</p>
{! end welcome }
```

`data` can either be an object or a function returning an object or a promise returning an object.

---

### Attributes

#### Passing attributes to a shortcode

Attributes can be passed to shortcodes and then accessed via their name in HTML or `this.data.<name>` in JS.

Please note that attribute names are be converted to camelCase, e.g. `last-name` becomes `lastName` as the example below shows:

```html
{! start welcome last-name="Doe" !}
  <p>Hi {! firstName !} {! lastName !}, how are you?</p>
{! end welcome }
```

```js
Fliplet.Shortcode('welcome', {
  data: {
    firstName: 'John'
  },
  mounted: function () {
    console.log(`Your last name is ${this.data.lastName}`);
  }
});
```

---

### Templates

#### Defining a custom template

```js
Fliplet.Shortcode('welcome', {
  template: '<p>Hi {! firstName !} {! lastName !}, how are you?</p>'
  data: {
    firstName: 'John'
  }
});
```

```html
{! welcome last-name="Doe" !}
```

#### Defining an outer template

Use the `<fl-html />` tag to define the distribution outlet for content.

```js
Fliplet.Shortcode('welcome', {
  template: '<p>How are you? <fl-html /></p>'
  data: {
    firstName: 'John'
  }
});
```

```html
{! start welcome first-name="John" !}
  <span>I am <i>good</i> because my name is {! firstName !}!</span>
{! end welcome !}
```

Output:

```html
<p>
  How are you?
  <span>I am <i>good</i> because my name is John!</span>
</p>
```

---

### Loading data

#### From a DataSource

```js
Fliplet.Shortcode('profile', {
  data: function () {
    var firstName = this.data.firstName;

    Fliplet.DataSources.connect(123)
      .then(function (connection) {
        return connection.findOne({ where: { firstName: firstName } });
      }).then(function (entry) {
        return { user: entry.data };
      });
  }
});
```

```html
{! start profile first-name="Nick" !}
  <p>Searched by {! firstName }</p>
  <ul>
    <li>Email: {! user.email !}</li>
    <li>Name: {! user.name !}</li>
  </ul>
{! end profile !}
```

---

### Run logic once a shortcode is rendered

```js
Fliplet.Shortcode('profile', {
  data: {
    firstName: 'John'
  },
  ready: function () {
    // Shortcode has been rendered
  }
);
```

---

### Programmatically update values

```js
var profile = Fliplet.Shortcode('profile', {
  data: {
    firstName: 'John'
  }
);

profile.set('firstName', 'Nick');

profile.set('firstName', function () {
  return Promise.resolve('Tony');
})
```