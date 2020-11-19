# Fields

## Properties for all fields

- `type` (String, required)
- `name` (String, required)
- `label` (String) a bold label displayed before the input field
- `description` (String) a description displayed before the input field

## Types

### Text input (`text`)

A simple text input field. Also supports the following optional properties:

- `placeholder` (String)
- `required` (Boolean)

Example:

```js
{
  type: 'text',
  name: 'firstName',
  label: 'First Name',
  description: 'The first name of the user',
  placeholder: 'Type your name',
  required: true
}
```

---

### HTML

- A freeform HTML field. Supports the following properties:

- `html` (HTML String)

```js
{
  type: 'html',
  html: '<input type="email" name="Email" />'
}
```

---

## Further reading

<section class="blocks alt">
  <a class="bl two" href="interface-hooks.html">
    <div>
      <span class="pin">Recommended reading</span>
      <h4>Hooks &amp; Events</h4>
      <p>Learn the different hooks and events for helper interfaces.</p>
      <button>Read &rarr;</button>
    </div>
  </a>
</section>