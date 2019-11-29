# Shortcode JS APIs

<p class="warning">You are browsing an early private spec of this feature.</p>

## Register a simple component

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

### Use attributes

```js
Fliplet.Shortcode('welcome', {
  data: {
    first_name: 'John'
  }
});
```

```html
{! start welcome last_name="Doe" !}
  <p>Hi {! first_name !} {! attr.last_name}, how are you?</p>
{! end welcome }
```

### Use templates

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

### Register a nested shortcode

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