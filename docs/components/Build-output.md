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

You can then receive parent context and subscribe for updates to it:

```js
Fliplet.Widget.instance('primary-button', function(data, parent) {
  if (parent) {
    parent.$watch('context', (ctx) => {
      const value = _.get(ctx, data.label);

      if (value) {
        $(this).find('input').val(value);
      }
    });
  }

  // ...
}, { supportsDynamicContext: true });
```

Likewise, you can use the `Fliplet.Widget.initializeChildren()` method if you're building a dynamic component that should initialize children components supporting the dynamic context:

```js
Fliplet.Widget.instance('dynamic-container', function(data, parent) {
  const $el = $(this);

  // fetch required data
  let context;

  Fliplet.Widget.initializeChildren(this, context);
}, {
  supportsDynamicContext: true
});
```

---

## Interface of components

Need to read more about the interface? Once you're familiar with the above documentation on the component output, have a read to the previous section which covers the output of components interfaces.

[Previous: interface of components (interface.html)](Interface.md)
{: .buttons}