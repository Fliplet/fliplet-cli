# Components interfaces

Components usually define interfaces to let ther instances **save settings**.

A quick example is the interface of the [button component](https://github.com/Fliplet/fliplet-widget-primary-button) to let you specify the button label and the action to be fired or page to view once tapped:

![Component interface](../assets/img/component-interface.jpg)

In the above example, the [button component](https://github.com/Fliplet/fliplet-widget-primary-button) is also using the [link provider](https://github.com/Fliplet/fliplet-widget-link) to select an action for the button.

Both page components and app components can have an interface, although it is not required.

## The template (interface.html)

The interface consists in a html template which gets parsed and compiled via [Handlebars](http://handlebarsjs.com/), plus any other asset (like CSS and JS files, though they don't get compiled).

Your template will get available in the view all settings that have been previously saved in the instance as handlebars variables. You can also print the component unique id using the {% raw %}`{{ id }}`{% endraw %} variable.

Example:

{% raw %}
```handlebars
<p>{{ foo }}</p>

{{#if baz}}
  <video src="{{ baz }}" data-my-component-id="{{ id }}"></video>
{{/if}}
```
{% endraw %}

## Saving the settings

Saving an instance settings is done using the public method `Fliplet.Widget.save` found in the `fliplet-core` package:

```js
// Returns a promise
Fliplet.Widget.save({
  foo: 'bar',
  baz: 1,
  hello: {
    world: true
  }
});
```

## Reading previously saved settings

Your component interface can be reopened if the component output is clicked via the screen preview by the Fliplet Studio user. Once the interface is reopened, you're responsible for reading the previously saved settings and repopulate your interface.

Data for the interface can be retrieved using the `Fliplet.Widget.getData` method from `fliplet-core` as follows:

```js
var data = Fliplet.Widget.getData();

// data.foo is 'bar'
```

---

[Back to building components](../Building-components#the-component-definition-file.md)
{: .buttons}