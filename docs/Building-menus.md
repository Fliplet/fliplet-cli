# Building menus

Before building menus, we recommend reading the documentation about [creating components](Building-components.md) as it contains many principles about how widgets (components, themes and menus) work on Fliplet.

A menu consist in:
- CSS and Javascript assets.
- A `build.html` handlebars template with the output of the menu


Menus can also specify whether they appear at the top of the HTML (right after the body tag is opened) or at the bottom before the body tag gets closed. This can be configured through the `settings.position` on the `menu.json` file as we do on the [default menu](https://github.com/Fliplet/fliplet-menu-default/blob/master/menu.json#L22).

---

## Creating a menu

Use the `create-menu` command of the CLI to create your menu:

```
$ fliplet create-menu "my-awesome-menu"

Creating new menu my-awesome-menu to /Users/nicholas/my-awesome-menu
Menu has been successfully created. To run it for development:

$ cd my-awesome-menu
$ fliplet run
```

Same as for components development, the `run` command will start the local development tools and a new window of your browser pointing to `http://localhost:3000` (or the first open port) should open.

---

## Menu assets

Assets and dependencies for menus follow the same structure as for components, just check the example provided in the generated `menu.json` file of your theme.

Furthermore, menus only have a `build.html` output file as they don't have a configuration interface.

---

### Runtime variables

The `build.html` output of menus gets compiled with some built-in variables at runtime as follows:

- **canGoBack** `Boolean` - True when the back button should be displayed
- **title** `String` - The title of the current page
- **pages** `Array` - An array of the screens of the menu
- **appVersion** `String` - The current version of the app

Each **page** in **pages** will have a **label** `String` and a **action** `JSON String` with the navigation details. Most likely, this is what you will do in your template:

{% raw %}
```handlebars
{{#each pages}}
  <a href="#" data-fl-navigate='{{{action}}}'>{{label}}</li>
{{/each}}
```
{% endraw %}

---