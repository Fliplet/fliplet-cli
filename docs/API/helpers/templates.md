# Templates
Helpers are required to define a HTML template which is used to render them in the app screen.

Templates support the following features:

- Binding to variables
- Blocks for conditional visibility
- Loops and iterators for arrays

Take a look at a basic example where a helper is defining a custom template:

```js
Fliplet.Helper('welcome', {
  template: '<p>Hi {! firstName !}, how are you?</p>',
  data: {
    firstName: 'John'
  }
});
```

```html
<fl-helper data-type="welcome"></fl-helper>
```

---

## Binding to variables

Variables can also be defined via HTML `attr` nodes and can be accessed using the `attr` property, e.g. use the `{! attr.name !}` syntax to define dynamic binding to variables from your HTML templates:

```html
<fl-helper data-type="user">
  <attr name="name">John</attr>
</fl-helper>
```

```js
Fliplet.Helper('user', {
  template: '<p>Hi {! attr.name !}, how are you?</p>'
});
```

<p class="quote"><strong>Note:</strong> variables must be declared using the camelCase naming convention, e.g. use something like <code>firstName</code> instead of "first_name" and "first-name".</p>

---

## Blocks for conditional visibility

If you require parts of your HTML to be conditionally visible only when a specific variable is "truthy" we made available the `<fl-if>` block available:

```html
<fl-if data-path="attr.title">
  This will only be shown when there is a title. The title is {! attr.title !}
</fl-if>
```

<p class="quote"><strong>Note:</strong> A "truthy" value is a value that translates to **true** when evaluated in a Boolean context.</p>

You can also the shorthand syntax as shown below:

```html
{! if title !}
  This will only be shown when there is a title. The title is {! attr.title !}
{! endif !}
```

Else blocks are also supported:

```html
{! if title !}
  This will only be shown when there is a title.
{! else !}
  This will be shown when there is no title.
{! endif !}
```

---

## Loops and iterators for arrays

You can use the `<fl-each>` block to automatically render an array of items based on a sample template to be compiled with each item in the array as the context:

```html
<fl-each data-path="attr.people" data-context="person">
  <template>
    <li>{! person.firstName !}</li>
  </template>
</fl-each>
```

You can also the shorthand syntax as shown below:

```html
{! each person in people !}
  <li>{! person.firstName !}</li>
{! endeach !}
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="methods.html">
    <div>
      <span class="pin">Next article in this series</span>
      <h4>Methods</h4>
      <p>Learn more about defining instance methods in your helpers.</p>
      <button>Next &rarr;</button>
    </div>
  </a>
</section>