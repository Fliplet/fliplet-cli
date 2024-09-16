# Output of components

Components generally output HTML code when dropped into the page. Their output is compiled with [Handlebars](http://handlebarsjs.com/) using the `build.html` file from your component.

App components are not required to output any HTML, though when they do you can decide whether their output will be appended at the beginning or the end of the page (e.g. once the body tag is opened or closed).

The typical workflow is:

1. **Interface** saves some data via `Fliplet.Widget.save()`
2. `build.html` gets compiled using the above data and the page/screen gets the updated HTML

Your template will get available in the view all settings that have been previously saved in the instance as handlebars variables. You can also print the component unique id using the {% raw %}`{{ id }}`{% endraw %} variable.

Example:

{% raw %}
```handlebars
<video src="{{ url }}" data-my-component-id="{{ id }}"></video>
```
{% endraw %}

---

## Reading previously saved settings

Data can be retrieved via Javascript using the `Fliplet.Widget.instance` method from `fliplet-core` as follows:

```js
Fliplet.Widget.instance('my-component', function (data, parent) {
  const $el = $(this); // this gets you each component via jQuery
}, {
  // Set this to true if your component supports being initialized
  // from a dynamic container
  supportsDynamicContext: false
});
```

As you can see above, the method accepts two parameters: the `data-[name]-id` attribute you define in the output, and a callback function to be executed.

This is by design: **your widget can be dropped more than once into a screen**, hence you are responsible for reading the data of each instance given the unique instance id ({% raw %}`{{ id }}`{% endraw %}) you use in the output.

Here's an example to let you understand how a screen can look like when your widget is dropped to a page more than once:

```html
<video src="foo.mp4" data-my-component-id="1"></video>
<video src="bar.mp4" data-my-component-id="2"></video>
<video src="baz.mp4" data-my-component-id="3"></video>
```

```js
Fliplet.Widget.instance('my-component', console.log);

// { id: 1, url: 'foo.mp4' }
// { id: 2, url: 'bar.mp4' }
// { id: 3, url: 'baz.mp4' }
```

---

## Support for dynamic components

1. Add `supportsDynamicContext: true` to the `Fliplet.Widget.instance` options
2. In the `build.html` file, add `data-widget-name="component-name"` alongside the current `data-component-name-id="{{id}}"`

You can then receive parent context and access data from it.

```js
Fliplet.Widget.instance('dynamic-data-component', function(data, parent) {
  console.log(parent.entry); // Reference the dynamic data entry for the component
}, { supportsDynamicContext: true });
```

Likewise, you can use the `Fliplet.Widget.initializeChildren()` method if you're building a dynamic component that should initialize children components supporting the dynamic context:

```js
Fliplet.Widget.instance('dynamic-data-component', function(data, parent) {
  // Pass the parent context to the children
  Fliplet.Widget.initializeChildren(this, parent);
}, {
  supportsDynamicContext: true
});
```

If `Fliplet.Widget.instance()` is used to initialize [components converted from helpers](../API/helpers/components.html), the parent entry should be referenced differently.

```js
Fliplet.Widget.instance({
  name: 'dynamic-data-component',
  render: {
    ready: function() {
      console.log(this.parent.entry); // Reference the dynamic data entry for the component
    }
  }
});
```

---

## Support for rich content in Fliplet Studio

If your component includes references to `richContent` properties (see [References](/components/Definition.html#references), each `richContent` property needs to be rendered on the page. This can be done using the {% raw %}`{{{ prop }}}`{% endraw %} syntax.

`richContent` data is managed in Fliplet Studio by allowing users to drag and drop content into a container. To add support for this drag and drop interaction, make the following changes to your `build.html` template:

1. Make sure the rich content is rendered as {% raw %}`{{{ prop }}}`{% endraw %} where `prop` is the name of your rich content property
2. Wrap the {% raw %}`{{{ prop }}}`{% endraw %} syntax in a DOM element with a `data-view` property and a `data-node-name` property:
   - The `data-view` value is should match the property name.
   - The `data-node-name` value is what will be displayed in Fliplet Studio in the **Screen structure** panel.

For example:

{% raw %}
```html
<div data-view="content" data-node-name="Content">{{{ content }}}</div>
```
{% endraw %}

**If the widget is built using Fliplet Helper, the `richContent` reference still needs to be declared in `widget.json`, but does not need a view container defined as above. The Helper framework has built-in support for the management of rich content views.**

---

## Interface of components

Need to read more about the interface? Once you're familiar with the above documentation on the component output, have a read to the previous section which covers the output of components interfaces.

[Previous: interface of components (interface.html)](Interface.md)
{: .buttons}
