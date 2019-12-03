# Helper JS APIs

<p class="warning">You are browsing an early private spec of this feature.</p>

## Register a helper

`Fliplet.Helper(name, definition)`

```js
Fliplet.Helper('welcome', {
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

#### Passing attributes to a helper

Attributes can be passed to helpers and then accessed via their name in HTML or `this.data.<name>` in JS.

Please note that attribute names are be converted to camelCase, e.g. `last-name` becomes `lastName` as the example below shows:

```html
{! start welcome last-name="Doe" !}
  <p>Hi {! firstName !} {! lastName !}, how are you?</p>
{! end welcome }
```

```js
Fliplet.Helper('welcome', {
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
Fliplet.Helper('welcome', {
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

Use the `{! this !}` code to define the distribution outlet for content.

```js
Fliplet.Helper('welcome', {
  template: '<p>How are you? {! this !}</p>'
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

- `data` can return a `Promise`

```js
Fliplet.Helper('profile', {
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

### Run logic once a helper is rendered

```js
Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  },
  ready: function () {
    // Helper has been rendered
  }
});
```

---

### Access a parent component when nesting

```js
Fliplet.Helper('poll', {
  data: {
    foo: 'bar'
  }
});

Fliplet.Helper('question', {
  ready: function () {
    this.parent.foo;
  }
);
```

---

### Run logic once all helpers have been rendered

```js
Fliplet.Hooks.on('afterHelpersRender', function () {
  // All helpers have been rendered
});
```

---

### Programmatically update values

```js
var profile = Fliplet.Helper('profile', {
  data: {
    firstName: 'John'
  }
);

profile.set('firstName', 'Nick');

profile.set('firstName', function () {
  return Promise.resolve('Tony');
})
```