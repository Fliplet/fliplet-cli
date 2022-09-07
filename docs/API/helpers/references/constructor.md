# Reference

## Constructor (`Fliplet.Helper()`)

**Dependency: `fliplet-helper`**

The `Fliplet.Helper()` constructor defines a new Helper for the current screen. Use the constructor in Global JS code to define it for the entire app.

```js
Fliplet.Helper({
 name: String,
 displayName: String,
 icon: String,
 supportUrl: String,
 data: Object,
 supportsDynamicContext: Boolean,
 watch: Array,
 category: {
   name: String,
   before: String,
   after: String
 },
 position: {
   before: String,
   after: String
 },
 render: {
   template: String,
   beforeReady: Function,
   ready: Function,
   dependencies: Array
 },
 configuration: {
   title: String,
   fields: Array,
   beforeReady: Function,
   ready: Function,
   beforeSave: Function
 },
 views: Object,
 childOf: Array
});
```

### Parameters

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
      <td><code>String</code></td>
      <td>required</td>
      <td>A unique name for your helper.</td>
    </tr>
    <tr>
      <td><code>displayName</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>The display name of the helper to show in the components list of Fliplet Studio.</td>
    </tr>
    <tr>
      <td><code>supportsDynamicContext</code></td>
      <td><code>Boolean</code></td>
      <td>optional</td>
      <td>Enable support for reactive data when used in a dynamic container component.</td>
    </tr>
    <tr>
      <td><code>icon</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>The icon of the helper to show in the components list of Fliplet Studio. You can use any Font Awesome name (e.g. <code>fa-check</code>) or a URL.</td>
    </tr>
    <tr>
      <td><code>category</code></td>
      <td><code>Object</code></td>
      <td>optional</td>
      <td>Use this to define which category the helper should be listed under</td>
    </tr>
    <tr>
      <td><code>category.name</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Specify the category where the helper should be listed under or provide a new category name</td>
    </tr>
    <tr>
      <td><code>category.before</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Specify the category that the new category should be listed before. Takes precedence over <code>category.after</code>.</td>
    </tr>
    <tr>
      <td><code>category.after</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Specify the category that the new category should be listed after</td>
    </tr>
    <tr>
      <td><code>position</code></td>
      <td><code>Object</code></td>
      <td>optional</td>
      <td>Specify where in a category the helper should be positioned</td>
    </tr>
    <tr>
      <td><code>position.before</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Specify the name/package of widget or name of helper to position the helper before. Takes precedence over <code>position.after</code>.</td>
    </tr>
    <tr>
      <td><code>position.after</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Specify the name/package of widget or name of helper to position the helper after.</td>
    </tr>
    <tr>
      <td><code>supportUrl</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>Support URL for the component. Users can access this via the configuration interface in a "?" icon.</td>
    </tr>
    <tr>
      <td><code>watch</code></td>
      <td><code>Array</code></td>
      <td>optional</td>
      <td>The list of properties to add watchers for, when used in a dynamic container component. The most common value for this field is <code>['context']</code>.</td>
    </tr>
    <tr>
      <td><code>data</code></td>
      <td><code>Object</code> or <code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/fields.html#default-fields">The data for your helper</a>.</td>
    </tr>
    <tr>
      <td><code>render.template</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/templates.html">An optional HTML template</a>.</td>
    </tr>
    <tr>
      <td><code>render.beforeReady</code></td>
      <td><code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/hooks.html#run-logic-before-a-helper-is-rendered">A function to run before the helper instance is rendered</a>.</td>
    </tr>
    <tr>
      <td><code>render.ready</code></td>
      <td><code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/hooks.html#run-logic-once-a-helper-is-rendered">A function to run when the helper instance is rendered</a>.</td>
    </tr>
    <tr>
      <td><code>render.dependencies</code></td>
      <td><code>Array</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/libraries.html">A list of dependencies to include when rendering the helper</a>.</td>
    </tr>
    <tr>
      <td><code>configuration</code></td>
      <td><code>Object</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface.html">The list of fields to present in the configuration UI</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.title</code></td>
      <td><code>String</code></td>
      <td>optional</td>
      <td>A title to display at the top of the configuration interface</td>
    </tr>
    <tr>
      <td><code>configuration.fields</code></td>
      <td><code>Array</code></td>
      <td>required</td>
      <td><a href="/API/helpers/interface-fields.html">The list of fields to display in the UI</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.beforeReady</code></td>
      <td><code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-before-the-interface-is-initialized">A function to run before the configuration interface gets initialized</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.ready</code></td>
      <td><code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-when-the-interface-is-initialized">A function to run when the configuration interface gets initialized</a>.</td>
    </tr>
    <tr>
      <td><code>configuration.beforeSave</code></td>
      <td><code>Function</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/interface-hooks.html#run-a-function-before-the-interface-is-saved">A function to run before the configuration interface data is saved.</a>.</td>
    </tr>
    <tr>
      <td><code>views</code></td>
      <td><code>Object</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/views.html">The list of rich content views</a>.</td>
    </tr>
    <tr>
      <td><code>childOf</code></td>
      <td><code>Array</code></td>
      <td>optional</td>
      <td>
        <a href="/API/helpers/views.html#define-where-a-helper-can-be-dropped-into">The list of helpers an helper can be dropped in</a>.</td>
    </tr>
  </tbody>
</table>

---

### Helper instance

```js
Fliplet.Helper({
  name: String,
  render: {
    ready: function () {
      var instance = this;
    }
  }
});
```

### Instance properties

<table style="width:100%">
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td><code>instance.$el</code></td>
      <td><code>jQuery</code></td>
      <td>
        The jQuery object containing the helper instance as element.
      </td>
    </tr>
    <tr>
      <td><code>instance.parent</code></td>
      <td><code>Object</code></td>
      <td>
        A reference to the parent helper instance if the current instance is nested (e.g. it's a children element of a parent helper).
      </td>
    </tr>
  </tbody>
</table>

### Instance methods

<table style="width:100%">
  <thead>
    <th>Name</th>
    <th>Type</th>
    <th>Description</th>
  </thead>
  <tbody>
    <tr>
      <td><code>instance.set</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/fields.html#updating-fields">Update the helper instance fields</a>.</td>
    </tr>
    <tr>
      <td><code>instance.find</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/methods.html#find-all-nested-helpers">Find nested helpers</a>.</td>
    </tr>
    <tr>
      <td><code>instance.findOne</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/methods.html#find-a-nested-helper">Find a nested helper</a>.</td>
    </tr>
    <tr>
      <td><code>instance.children</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/methods.html#find-all-children-helpers">Find direct child helpers</a>.</td>
    </tr>
    <tr>
      <td><code>instance.parents</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/methods.html#find-all-parents">Find all parent helpers</a>.</td>
    </tr>
    <tr>
      <td><code>instance.closest</code></td>
      <td><code>Function</code></td>
      <td>
        <a href="/API/helpers/methods.html#find-closest-helper">Find closest helper</a>.</td>
    </tr>
  </tbody>
</table>
