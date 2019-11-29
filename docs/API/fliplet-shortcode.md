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

All properties of [Vue.js](https://vuejs.org/v2/api/#Options-Data) are supported in the shortcodes `definition`.

---

### Attributes

#### Passing attributes to a shortcode

Attributes can be passed to shortcodes and then accessed via `attr.<name>` in HTML or `this.attr.<name>` in JS.

Please note that attribute names are be converted to camelCase, e.g. `last-name` becomes `lastName` as the example below shows:

```html
{! start welcome last-name="Doe" !}
  <p>Hi {! firstName !} {! attr.lastName}, how are you?</p>
{! end welcome }
```

```js
Fliplet.Shortcode('welcome', {
  data: {
    firstName: 'John'
  },
  mounted: function () {
    console.log(`Your last name is ${this.attr.lastName}`);
  }
});
```

---

### Templates

#### Defining a custom template

```js
Fliplet.Shortcode('welcome', {
  template: '<p>Hi {! firstName !} {! attr.lastName}, how are you?</p>'
  data: {
    firstName: 'John'
  }
});
```

```html
{! welcome last_name="Doe" !}
```

#### Defining an outer template

Use the `<slot></slot>` tag to define the distribution outlet for content.

```js
Fliplet.Shortcode('welcome', {
  template: '<p>How are you? <slot></slot></p>'
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

### Nested shortcodes

#### Register a nested shortcode

Pass the `child: true` attribute in the shortcode definition to register the shortcode as a nested shortcode for other shortcodes.

```js
Fliplet.Shortcode('greet', {
  template: '<p>Hi {! firstName !} {! attr.lastName !}</p>'
  data: {
    firstName: 'John'
  },
  child: true
});

Fliplet.Shortcode('welcome', {});
```

```html
{! start welcome !}
  <h1>Welcome to the app!</h1>
  {! greet last-name="Doe" !}
{! end welcome }
```

---

### Loading data

#### From a DataSource

```js
Fliplet.Shortcode('profile', {
  data: {
    user: undefined
  },
  mounted: function () {
    var instance = this;

    Fliplet.DataSources.connect(123)
      .then(function (connection) {
        return connection.findOne({ where: { name: instance.attr.name } });
      }).then(function (entry) {
        instance.user = entry.data;
      });
  }
});
```

```html
{! start profile name="John" !}
  <ul>
    <li>Email: {! user.email !}</li>
    <li>Name: {! user.name !}</li>
  </ul>
{! end profile !}
```