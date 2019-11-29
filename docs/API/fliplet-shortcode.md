# Shortcode JS APIs

<p class="warning">You are browsing an early private spec of this feature.</p>

## Register a shortcode

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

## Passing attributes to a shortcode

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

## Defining custom templates

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

## Defining custom templates

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

## Register a nested shortcode

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