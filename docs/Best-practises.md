# Best practice and advices when building components

Got stuck building components or found some nasty bugs? Here's a few tips that might help you dealing with basic issues during the development of components on our platform.

## Instance data

A widget instance data won't be available on the page unless your dependencies include `fliplet-core`.

## Your component can be dropped more than once into a page

Does your code handle that? Here's a piece of advice:

1. Output each widget instance ID via the `build.html` file ensuring the format is `data-WIDGET-NAME-id` where "WIDGET-NAME" is your widget unique name:

{% raw %}
```handlebars
<div data-my-nice-widget-id="{{id}}">Hi!</div>
```
{% endraw %}

2. On your JS files, cycle through the instances and get the data of each instance

```js
Fliplet.Widget.instance('my-nice-widget', function (data) {
  // initialize your component.
  // this function is called for each component if this type dropped into the page

  // "this" will be the element so you can use $(this) to access it via jQuery:
  var $el = $(this);
});
```

This makes sure your widget will work correctly when is dropped more than once into a page.

---

## Escape variables when necessary

All `build.html` and `interface.html` files are parsed as Handlebars templates during Fliplet's app compilation engine. This means that any syntax in these files that resembles Handlebars templates (such as `{{ }}` curly braces) will be processed by the Handlebars compiler, even if you intended them for other purposes like Vue.js templates, Angular templates, or other client-side templating systems.

To prevent unwanted compilation, you need to escape any curly bracket syntax that should not be processed by Handlebars. You can do this by prefixing curly brackets with a backslash (`\`):

{% raw %}
```handlebars
<!-- This gets compiled by Handlebars during app compilation -->
<div id="{{id}}">{{foo}}</div>

<!-- These are escaped and won't be compiled by Handlebars -->
<div>\{{foo}}</div>
<template name="bar">\{{#if foo}} \{{foo}} \{{/if}}</template>

<!-- Example: Vue.js template syntax that needs escaping -->
<div id="my-vue-app">
  <p>\{{ message }}</p>
  <button @click="updateMessage">\{{ buttonText }}</button>
  <ul>
    <li v-for="item in items" :key="item.id">\{{ item.name }}</li>
  </ul>
</div>
```
{% endraw %}

**Important:** This escaping is only necessary in `build.html` and `interface.html` files. JavaScript files (`.js`) and other assets are not processed through Handlebars and don't require escaping.

**Common scenarios where escaping is needed:**

  - Vue.js templates with `{{ }}` interpolation syntax
  - Handlebars templates intended for client-side rendering
  - Any other templating syntax that uses curly braces

---

## Using Handlebars in your widget client-side code

**Note: this documentation only applies to building components. If you need to use Handlebars in your apps, please refer to the "[using handlebars](API/libraries/handlebars)" documentation**.

You can also use handlebars templates in your client-side code and let the system compile them.

1. Add `handlebars` in your widget.json dependencies
2. Add a reference to `js/interface.templates.js` or `js/build.templates.js` in your build or interface assets
3. Create your templates anywhere in the folders of your component. Please note that the folder structure will be used as namespace for your templates. They will be available under the `Fliplet.Widget.Templates` object.

Files that ends with `.interface.hbs` will be compiled to the interface template file. Same applies for `.build.hbs` and the build template.

e.g. given the following template:

```text
js/foo/bar.interface.hbs
```

The handlebars-compiled template will be available as:

```js
var tpl = Fliplet.Widget.Templates['foo.bar'];
var html = tpl({ sample: 123 })
```
