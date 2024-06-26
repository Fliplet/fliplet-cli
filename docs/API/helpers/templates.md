# Templates
Helpers are required to define a HTML template which is used to render them in the app screen.

Templates support the following features:

- Binding to variables
- Blocks for conditional visibility
- Loops and iterators for arrays

Take a look at a basic example where a helper is defining a custom template:

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    template: '<p>Hi {! firstName !}, how are you?</p>'
  },
  data: {
    firstName: 'John'
  }
});
```

```html
<fl-helper name="welcome"></fl-helper>
```

---

## Binding to variables

Variables can also be defined via HTML `field` nodes and can be accessed using the `fields` property, e.g. use the `{! fields.name !}` syntax to define dynamic binding to variables from your HTML templates:

```html
<fl-helper name="user">
  <field name="name">John</field>
</fl-helper>
```

```js
Fliplet.Helper({
  name: 'welcome',
  render: {
    template: '<p>Hi {! fields.name !}, how are you?</p>'
  }
});
```

<div class="quote">
  <p><strong>Note:</strong> The paths are passed to <code>_.get(object, path)</code> <a href="https://lodash.com/docs/4.17.15#get" target="_blank">(ref)</a>  which supports <code>[ ]</code> notations for paths that contain spaces or <code>[ ]</code> characters.</p>

  <ul>
    <li>Use <code>[ ]</code> to wrap around keys that include a space, e.g. <code>[First name]</code></li>
    <li><code>""</code> within <code>[ ]</code> is supported but optional in some cases, e.g. <code>[First name]</code> and <code>["First name"]</code> are both supported</li>
    <li>When referencing nested properties, <code>.</code> before <code>[ ]</code> is supported but optional, <code>data[First name]</code> and <code>data.[First name]</code> are both supported</li>
    <li>
      If the key includes <code>[ ]</code> characters, use <code>""</code> within <code>[ ]</code> are required, e.g. <code>["Location [accuracy]"]</code>
    </li>
    <li>You can choose to always include <code>[]</code> and <code>""</code>, e.g. <code>["Name"]</code>, <code>["First name"]</code>, <code>["Location [accuracy]"]</code></li>
  </ul>
</div>

---

## Blocks for conditional visibility

If you require parts of your HTML to be conditionally visible only when a specific variable is "truthy" we made available the `<fl-if>` block available:

```html
<fl-if data-path="fields.title">
  This will only be shown when there is a title. The title is {! fields.title !}
</fl-if>
```

<p class="quote"><strong>Note:</strong> A "truthy" value is a value that translates to **true** when evaluated in a Boolean context.</p>

You can also the shorthand syntax as shown below:

```html
{! if title !}
  This will only be shown when there is a title. The title is {! fields.title !}
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
<fl-each data-path="fields.people" data-context="person">
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
