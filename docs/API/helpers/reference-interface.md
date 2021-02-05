# Interface Reference

## Constructor (`Fliplet.Helper`)

Defines a new Helper for the current screen. Use the constructor in Global JS code to define it for the entire app.

#### - `public static object Fliplet.Helper(options: Object)`

```js
Fliplet.Helper({
  name: String
  configuration: Object
});
```

**Parameters of the `configuration` object:**

<table style="width:100%">
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Attribute</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td><code>configuration.title</code></td>
      <td><code>string</code></td>
      <td>optional</td>
      <td>A title to display at the top of the configuration interface</td>
    </tr>
    <tr>
      <td><code>configuration.fields</code></td>
      <td><code>array</code></td>
      <td>required</td>
      <td><a href="/API/helpers/interface-fields.html">The list of fields to display in the UI</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.beforeReady</code></td>
      <td><code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-before-the-interface-is-initialized">A function to run before the configuration interface gets initialized</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.ready</code></td>
      <td><code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-when-the-interface-is-initialized">A function to run when the configuration interface gets initialized</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.beforeSave</code></td>
      <td><code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-before-the-interface-is-saved">A function to run before the configuration interface data is saved.</a>.</td>
    </tr>
  </tbody>
</table>

---