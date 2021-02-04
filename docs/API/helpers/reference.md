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
      <td><code>options.data</code></td>
      <td><code>object</code> or <code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/fields.html#default-fields">The data for your helper</a>.</td>
    </tr>
    <tr>
      <td><code>options.render.template</code></td>
      <td><code>string</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/templates.html">An optional HTML template</a>.</td>
    </tr>
    <tr>
      <td><code>options.render.beforeReady</code></td>
      <td><code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/hooks.html#run-logic-before-a-helper-is-rendered">A function to run before the helper instance is rendered</a>.</td>
    </tr>
    <tr>
      <td><code>options.render.ready</code></td>
      <td><code>function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/hooks.html#run-logic-once-a-helper-is-rendered">A function to run when the helper instance is rendered</a>.</td>
    </tr>
    <tr>
      <td><code>options.configuration</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface.html">The list of fields to present in the configuration UI</a>.</td>
    </tr>
    <tr>
      <td><code>options.containers</code></td>
      <td><code>object</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/containers.html">The list of rich content containers</a>.</td>
    </tr>
    <tr>
      <td><code>options.childOf</code></td>
      <td><code>array</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/containers.html#define-where-a-helper-can-be-dropped-into">The list of helpers an helper can be dropped in</a>.</td>
    </tr>
  </tbody>
</table>

---

## Instance properties

```js
Fliplet.Helper(name, {
  ready: function () {
    var instance = this;
  }
});
```

**Parameters:**

<table style="width:100%">
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td><code>instance.set</code></td>
      <td><code>function</code></td>
      <td>
        <a href="/API/helpers/fields.html#updating-fields">Update the helper instance fields</a>.</td>
    </tr>
    <tr>
      <td><code>instance.$el</code></td>
      <td><code><a href="https://learn.jquery.com/using-jquery-core/jquery-object/">jQuery object</a></code></td>
      <td>
        The jQuery object containing the helper instance as element.
      </td>
    </tr>
    <tr>
      <td><code>instance.parent</code></td>
      <td><code>object</code></td>
      <td>
        A reference to the parent helper instance if the current instance is nested (e.g. it's a children element of a parent helper).
      </td>
    </tr>
  </tbody>
</table>