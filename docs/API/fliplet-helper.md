# Fliplet Helper JS APIs

<p class="warning">You are browsing an early private spec of this feature.</p>

Fliplet helpers allow you to **write reusable snippets** which binds dynamic data to screens of your apps. Another common use case is to reuse features across different screens of your app (or even between apps) by creating an abstract helper which can be configured differently depending on the case.

## Quick start

Helpers can be created by defining them via **screen or global JavaScript code** in your apps. A helper requires a **name** and its **configuration object** which defines its behaviour.

First of all, add the `fliplet-helper` package to your screen or app's dependencies via Fliplet Studio.

Once an helper is defined in your Javascript code with `Fliplet.Helper(name, definition)`, you can start using it in the Screens of your apps as shown in the example below:

##### JavaScript

```js
Fliplet.Helper('welcome', {
  data: {
    name: 'John'
  }
});
```

##### Screen HTML

```html
{! start helper welcome !}
  <p>Hi {! name !}, how are you?</p>
{! end helper welcome }
```

##### Output HTML

```html
<p>Hi John, how are you?</p>
```

---

Helpers can also be self-enclosing. In such case, they are defined without the `start` and `end` keyword in the HTML. When doing so, you can define their HTML `template` separately as shown below:

##### JavaScript

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi, how are you?</p>'
});
```

##### Screen HTML

```html
{! helper welcome !}
```

##### Output HTML

```html
<p class="welcome">Hi, how are you?</p>
```

---

This becomes really powerful when passing `attributes` via the HTML:

##### JavaScript

```js
Fliplet.Helper('welcome', {
  template: '<p class="welcome">Hi {! name !}, how are you?</p>'
});
```

##### Screen HTML

```html
{! helper welcome name="John" !}
```

##### Output HTML

```html
<p class="welcome">Hi John, how are you?</p>
```

---

## Documentation

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

You can also define variables in attributes of your template:

```js
Fliplet.Helper('button', {
  template: '<input type="submit" value="{! title !}" />'
});
```

```html
{! button title="Press here" !}
```

#### Defining an outer template

Use the `{! this !}` code to define the distribution outlet for content. This will also available as `this.initialHTML` on the helper instance as shown further below.

```js
Fliplet.Helper('option', {
  template: '<p><input type="checkbox" value="{! value !}" /> {! this !}</p>'
});
```

```html
{! start option value="Yes" !}
  Accept privacy policy
{! end option !}
```

Output:

```html
<p>
  <input type="checkbox" value="Yes" /> Accept privacy policy
</p>
```

If you need to specify a default value for the outlet you can populate it at runtime:

```js
Fliplet.Helper('option', {
  template: '<p><input type="checkbox" value="{! value !}" /> {! label !}</p>',
  ready: function () {
    this.set('label', this.initialHTML || this.data.value);
  }
});
```

```html
<!-- Example with a specific outlet for the label -->
{! start option value="Yes" !}
  Accept privacy policy
{! end option !}

<!-- Example where value will be used for the label instead -->
{! option value="Accept privacy policy" !}
```

---

### Loading data

#### From a DataSource

- `data` can return a `Promise`

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

### Conditionally display content

You can use the `if` and `else` helpers to conditionally display or hide content depending on whether a value is "truthy" or not.

> A "truthy" value is a value that translates to **true** when evaluated in a Boolean context.


```html
{! start profile email="john@example.org" !}
  {! if email }
    <p>Your email is {! email !}</p>
  {! else !}
    <p>Email address not configured.</p>
  {! endif !}
{! end profile !}
```
