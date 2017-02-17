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

## The component definition file (`widget.json`)

