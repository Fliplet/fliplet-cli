# Fliplet CLI
Command line utility for creating and running widgets to be used on the Fliplet platform.

# Install
With [node.js](http://nodejs.org/) and [npm](http://github.com/isaacs/npm):

```
npm install fliplet-cli -g
```

You can now use the command `fliplet` from the command line. Just type `fliplet` to see the available options and their example usage.

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

The interface and output of the widget have the following environment variables available:

```
window.ENV = {
  widgetInstanceId: 1,                 // The unique ID of this widget instance
  apiUrl: "https://api.fliplet.com/"   // The endpoint to be used for API requests
}

window.widgetData = {
  foo: "bar"                           // Data saved through "Fliplet.saveWidgetData"
};
```

---

By default, the dependencies of the interface contain `fliplet-core`, which will make available the following methods of the `Fliplet` JavaScript library:

```
// Saves the data of a widget instance
Promise<> Fliplet.saveWidgetData (data)

// Tells the UI this widget can be closed, optionally passing back some data
void Fliplet.complete(data)
```

You can see an example of how those functions are used in the default [interface.js](https://github.com/WebooOnline/fliplet-cli/blob/master/widget-template/js/interface.js) template of your widget.

---

The `interface.html` and `build.html` files gets compiled through *Handlebars*, and they also have available any data the widget instance has saved.