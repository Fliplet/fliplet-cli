# Building components

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

<a href="components/Definition.html" class="btn">Read more about the widget.json</a>

---

## Instances

Once a component is dropped onto a page (or an app component is added as an add-on), an instance of such component will be created in the system for the app.

A component instance (internally called `Widget Instance`) can save settings for the instance of the component.