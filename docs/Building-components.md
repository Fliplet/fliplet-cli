# 4. Building components

To start creating a component, use the CLI to generate a boilerplate including the basic things you'll need:

```
$ fliplet create-widget "my-awesome-component"
```

The above code will create a new folder named "my-awesome-component" including the skeleton of your component, including these files:

```
css/
img/
js/interface.js
widget.json
interface.html
build.html
```

We'll first focus on the `widget.json`, which is the definition of your component. If you're used to npm, it's similar to the `package.json` file for npm modules.

## The component definition file

The `widget.json` file defines your component as well as the **dependencies** and **assets** it needs in order to run.

```json
{
  "name": "my Awesome Component",
  "package": "com.example.my-awesome-component",
  "dependencies": [],
  "assets": []
}
```

[Read more about the widget.json](components/Definition.md)
{: .buttons}

---

## Instances

Once a component is dropped onto a page (or an app component is added as an add-on), an instance of such component will be created in the system for the app.

A component instance (internally called `Widget Instance`) can save settings for the instance of the component.

Components can save their settings through our JS APIs (available via the `fliplet-core` package):

```js
Fliplet.Widget.save({
  someValue: true,
  otherValue: 1,
  supportsObjects: {
    a: 'Hello',
    b: 'World'
  }
});
```

As you can see, plain Javascript objects (which can be serialized to JSON) are supported.

---

## UI: Interface and Output (build)

**All components** can define a **html interface** where their settings for the instance can be configured. An interface is made of a HTML page (which is compiled via Handlebars from the engine) and any number of assets (JS, CSS, etc).

In addition, **app and page components** should also define a **html output** (internally called `build`) to be displayed in the page when they are dropped in.

Therefore, to recap:

- `interface.html` defines the interface for app components, page components and providers
- `build.html` defines the output of an app or page component

### Sample interface.html

```handlebars
{% raw %}
<form>
  <input type="text" name="videoUrl" value="{{ videoUrl }}" placeholder="A video url" />
</form>
{% endraw %}
```

### Sample build.html

```handlebars
{% raw %}
{{#if videoUrl}}
  <video src="{{ videoUrl"></video>
{{/if}}
{% endraw %}
```