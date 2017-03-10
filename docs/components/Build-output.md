# Output of components

Components generally output HTML code when dropped into the page. Their output is compiled with [Handlebars](http://handlebarsjs.com/) using the `build.html` file from your component.

App components are not required to output any HTML, though when they do you can decide whether their output will be appended at the beginning or the end of the page (e.g. once the body tag is opened or closed).

The typical workflow is:

1) Interface saves some data via `Fliplet.Widget.getData()`
2) `build.html` gets compiled using the above data and the page/screen gets the updated HTML

Your template will get available in the view all settings that have been previously saved in the instance as handlebars variables. You can also print the component unique id using the {% raw %}`{{ id }}`{% endraw %} variable.

Example:

{% raw %}
```handlebars
<video src="{{ baz }}" data-my-component-id="{{ id }}"></video>
```
{% endraw %}

---

## Reading previously saved settings

Data can be retrieved via Javascript using the `Fliplet.Widget.instance` method from `fliplet-core` as follows:

```js
Fliplet.Widget.instance('my-component', function (data) {

});
```

As you can see above, the method accepts two parameters: the `data-[name]-id` attribute you define in the output, and a callback function to be executed.

This is by design: **your widget can be dropped more than once into a screen**, hence you are responsive for reading the data of each instance given the unique instance id ({% raw %}`{{ id }}`{% endraw %}) you use in the output.

---

## Interface of components

Need to read more about the interface? Once you're familiar with the above documentation on the component output, have a read to the previous section which covers the output of components interfaces.

[Previous: interface of components (interface.html)](Interface.md)
{: .buttons}