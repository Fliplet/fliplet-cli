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

```html
{! start welcome last_name="Doe" !}
  <p>Hi {! first_name !} {! attr.last_name}, how are you?</p>
{! end welcome }
```

```js
Fliplet.Shortcode('welcome', {
  data: {
    first_name: 'John'
  },
  mounted: function () {
    console.log(`Your last name is ${this.attr.last_name}`);
  }
});
```

---

### Templates

#### Defining a custom template

```js
Fliplet.Shortcode('welcome', {
  template: '<p>Hi {! first_name !} {! attr.last_name}, how are you?</p>'
  data: {
    first_name: 'John'
  }
});
```

```html
{! welcome last_name="Doe" !}
```

#### Defining an outer template

Use the `<slot></slot>` tag to serve as distribution outlets for content.

```js
Fliplet.Shortcode('welcome', {
  template: '<p>How are you? <slot></slot></p>'
  data: {
    first_name: 'John'
  }
});
```

```html
{! start welcome first_name="John" !}
  <span>I am <i>good</i> because my name is {! first_name !}!</span>
{! end welcome !}
```

Output:

```
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
  template: '<p>Hi {! first_name !} {! attr.last_name !}</p>'
  data: {
    first_name: 'John'
  },
  child: true
});

Fliplet.Shortcode('profile', {});
```

```html
{! start welcome !}
  <h1>Welcome to the app!</h1>
  {! greet last_name="Doe" !}
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