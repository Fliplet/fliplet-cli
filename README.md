# Fliplet CLI
Command line utility for creating and running widgets to be used on the Fliplet platform.

# Install
With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

```
npm install fliplet-cli -g
```

You can now use the command `fliplet` from the command line. Just type `fliplet` to see the available options and their example usage.

By default, the CLI is using the production environment. You can change it using the `env` command, like `fliplet env staging` (dev, staging, production).

## Examples

Create a new widget:

```
$ fliplet create-widget "My Form Plugin"
```

Run your widget for development:

```
$ cd my-form-plugin
$ fliplet run-widget
```

Which will run your widget on [http://localhost:3000](http://localhost:3000).

## Publish a widget

To publish a widget on the Fliplet platform, you must be logged in by using `fliplet login` then you can use the `fliplet publish-widget` which will upload and publish your widget to the current environment (by default, production).

Please note: your widget won't be published as public, but will rather kept private and visible only for the organisation you belong to.


## Widget development

Your widget skeleton is made of the following directory structure:

```
build.html            // The output of the widget when running inside an app
interface.html        // The interface of the widget on Fliplet Studio
widget.json           // The widget definition file
css/                  // CSS Assets
js/                   // JS Assets
img/                  // Images
```

---

By default, the dependencies of the interface contain `fliplet-core`, which is only one of the packages available as part of Fliplet's JS Public APIs.

Head to our [Documentation](https://github.com/Fliplet/fliplet-cli/wiki) to read about all the available JS APIs to be used from your components.

You can also see an example of how those APIs are used in the default [interface.js](https://github.com/Fliplet/fliplet-cli/blob/master/widget-template/js/interface.js) template of your widget.

---

### Assets library

The following assets are available in the system as depencencies for your widget:

- `fliplet-core` (also includes jquery)
- `fliplet-datasources`
- `fliplet-media`
- `fliplet-communicate`
- `fliplet-studio-ui` (includes some basic style for the UI of the interface)
- `bootstrap` (js and css; also includes jquery)
- `bootstrap-css` (css only)
- `jquery`
- `tinymce`
- `handlebars`
- `lodash`

You can list all their details by running `fliplet list-assets`.

### Templates

The `interface.html` and `build.html` files gets compiled through *Handlebars*, and they also have available any data the widget instance has saved, and the widget instance id as `{{id}}`.

The following handlebars helpers are available in the system:

```
// Compare two variables
{{#equals foo 'bar'}}Yes it does{{/equals}}
```

---

## Best practises and advices

### Your widget might be dropped more than once into a page

Does your code handle that? Here's a piece of advice:

1. Output each widget instance ID via the `build.html` file

```html
<div data-my-widget="{{id}}">Hi!</div>
```

2. On your JS files, cycle through the instances and get the data of each instance

```js
$('[data-my-widget]').each(function () {
  var $el = $(this);
  var instanceId = $el.data('my-widget');
  var data = Fliplet.Widget.getData(instanceId);
});
```

This makes sure your widget will work correctly when is dropped more than once into a page.

### Escape variables when necessary

Templates (`build.html` and `interface.html`) get compiled through Handlebars. If you are using Handlebars yourself in the JS at runtime, you might want to escape your html template variables from getting compiled. You can prefix any curly brackets to escape the command from getting compiled:

```
<!-- this gets compiled -->
<div id="{{id}}">{{foo}}</div>

<!-- these don't -->
<div>\{{foo}}</div>
<template name="bar">\{{#if foo}} \{{foo}} \{{/if}}</template>
```
