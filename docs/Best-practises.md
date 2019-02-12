# Best practises and advices when building components

Got stuck building components or found some nasty bugs? Here's a few tips that might help you dealing with basic issues during the development of components on our platform.

## Instance data

A widget instance data won't be available on the page unless your dependencies include `fliplet-core`.

## Your component can be dropped more than once into a page

Does your code handle that? Here's a piece of advice:

1. Output each widget instance ID via the `build.html` file

{% raw %}
```handlebars
<div data-my-widget-id="{{id}}">Hi!</div>
```
{% endraw %}

2. On your JS files, cycle through the instances and get the data of each instance

```js
// Using our helper from fliplet-core
Fliplet.Widget.instance('my-widget', function (data) {

});

// Or using plain jQuery
$('[data-my-widget-id]').each(function () {
  var $el = $(this);
  var instanceId = $el.data('my-widget-id');
  var data = Fliplet.Widget.getData(instanceId);
});
```

This makes sure your widget will work correctly when is dropped more than once into a page.

---

## Escape variables when necessary

Templates (`build.html` and `interface.html`) get compiled through Handlebars. If you are using Handlebars yourself in the JS at runtime, you might want to escape your html template variables from getting compiled. You can prefix any curly brackets to escape the command from getting compiled:

{% raw %}
```handlebars
<!-- this gets compiled -->
<div id="{{id}}">{{foo}}</div>

<!-- these don't -->
<div>\{{foo}}</div>
<template name="bar">\{{#if foo}} \{{foo}} \{{/if}}</template>
```
{% endraw %}

---

## Using Handlebars in your widget clent-side code

**Note: this documentation only applies to building components. If you need to use Handlebars in your apps, please refer to the "[using handlebars](API/libraries/handlebars)" documentation**.

You can also use handlebars templates in your client-side code and let the system compile them.

1. Add `handlebars` in your widget.json dependencies
2. Add a reference to `js/interface.templates.js` or `js/build.templates.js` in your build or interface assets
3. Create your templates anywhere in the folders of your component. Please note that the folder structure will be used as namespace for your templates. They will be available under the `Fliplet.Widget.Templates` object.

Files that ends with `.interface.hbs` will be compiled to the interface template file. Same applies for `.build.hbs` and the build template.

e.g. given the following template:

```
js/foo/bar.interface.hbs
```

The handlebars-compiled template will be available as:

```js
var tpl = Fliplet.Widget.Templates['foo.bar'];
var html = tpl({ sample: 123 })
```
