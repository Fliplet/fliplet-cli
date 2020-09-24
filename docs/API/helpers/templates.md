# Templates
Helpers are required to define a HTML template which is used to render them in the app screen.

Templates support the following features:

- Binding to variables
- Blocks for conditional visibility
- Loops and iterators for arrays

---

## Binding to variables

Use the `{! attr.name !}` syntax to define dynamic binding to variables in your HTML templates, e.g.:

```html
<h3>The title is {! attr.title !}</h3>
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

---

## Loops and iterators for arrays

You can use the `<fl-each>` block to automatically render an array of items based on a sample template to be compiled with each item in the array as the context

```html
<fl-each data-path="attr.people" data-context="person">
  <template>
    <li>{! person.firstName !}</li>
  </template>
</fl-each>
```

---

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