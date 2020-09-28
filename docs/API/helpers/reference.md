# Reference

## Constructor (`Fliplet.Helper`)

Defines a new Helper for the current screen. Use the constructor in Global JS code to define it for the entire app.

#### - `public static object Fliplet.Helper(name: String, options: Object)`

```js
Fliplet.Helper(name, options);
```

**Parameters:**

<table style="width:100%">
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Attribute</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td><code>name</code></td>
      <td><code>string</code></td>
      <td>required</td>
      <td>A unique name for your helper.</td>
    </tr>
    <tr>
      <td><code>options</code></td>
      <td><code>object</code></td>
      <td>required</td>
      <td>The configuration option.</td>
    </tr>
    <tr>
      <td><code>options.template</code></td>
      <td><code>string</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/templates.html">An optional HTML template</a>.</td>
    </tr>
    <tr>
      <td><code>options.data</code></td>
      <td><code>object</code> or <code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/attributes.html#default-attributes">The data attributes for your helper</a>.</td>
    </tr>
  </tbody>
</table>