# Building menus

Before building menus, we recommend reading the documentation about [creating components](Building-components.md) as it contains many principles about how widgets (components, themes and menus) work on Fliplet.

A menu consist in:
- CSS and Javascript assets.
- A `build.html` handlebars template with the output of the menu

## Menu settings

Through the `menu.json` file, the `settings` property can control the behavioral properties of the menu.

- `settings.position` (String) `top` or `bottom` indicates whether the menu DOM markup appear at the top of the HTML (right after the body tag is opened) or at the bottom before the body tag gets closed. See [default menu](https://github.com/Fliplet/fliplet-menu-bottom-bar/blob/master/menu.json#L32) for an example
- `settings.showSettings` (Boolean) Default: `false` Set this to `true` to allow additional settings to be added via `interface.html` and any JavaScript added via the `interface` property of the `menu.json` file. See [component interfaces](components/Interface.md).

Menus can also specify . This can be configured through the `settings.position` on the `menu.json` file as we do on the .

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
<ul>
{{#each pages}}
  <li><a href="#" data-fl-navigate='{{{action}}}'>{{label}}</a></li>
{{/each}}
</ul>
```
{% endraw %}

---
