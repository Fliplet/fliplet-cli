# Building themes

Before building themes, we recommend reading the documentation about [creating components](Building-components.md) as it contains many principles about how widgets (components, themes and menus) work on Fliplet.

A theme consist in:
  - SCSS, CSS and Javascript assets.
  - A configuration object which is used from Fliplet Studio to build a UI and let users customize various parts of your theme.
  - Sample html files to be used from the CLI to preview a theme during development.

---

## Creating a theme

Use the `create-theme` command of the CLI to create your theme:

```
fliplet create-theme "my-awesome-theme"
```

Creating new theme my-awesome-theme to /Users/nicholas/my-awesome-theme
Theme has been successfully created. To run it for development:

```
cd my-awesome-theme
fliplet run
```

Same as for components development, the `run` command will start the local development tools and a new window of your browser pointing to `http://localhost:3000` (or the first open port) should open.

---

## Theme assets

Assets and dependencies for themes follow the same structure as for components, just check the example provided in the generated `theme.json` file of your theme.

## Using SCSS (Sass)

Your theme CSS files can be compiled from [SASS](http://sass-lang.com/) files (`*.scss`) if they are described in the `assets[]` of your theme. Importing other sass files works normally using the sass syntax (`@import "path/to/file"`).

## Theme variables and configuration

Your theme can describe an array of variables which can be configured from the user once the theme is applied to its apps.

These variables are both available from your Javascript files using `Fliplet.Themes.Current.get('foo')` and on your SCSS files as variables (like `$foo`).

The theme configuration can be specified via the `settings.configuration` array in the `theme.json` file as follows:

```json
{
  "configuration": [
    {
      "name": "Page",
      "variables": [
        {
          "name": "bodyBackground",
          "description": "The background color of the page",
          "type": "color",
          "default": "#FFFFFF"
        }
      ]
    }
  ]
}
```

## Theme inheritance

Themes can inherit properties and assets from other themes by listing their package names under the `settings.inherits` array:

```json
{
  "inherits": ["com.fliplet.theme.default"]
}
```

### Providing defaults

If you want to provide default values for the configurations of the theme you inherit, like your branding options, you can define them as key/values of the `defaults` object in the settings of the theme:

```json
{
  "defaults": {
    "bodyBackground": "#FF0000"
  }
}
```

### Partially showing inherited configurations

When you inherit from one or more themes, all their configurations will be available unless `showInheritedConfigurations` is set to `false` or an array. If it's set as an array you can include the name of the configuration groups or single options you want to display to the user:

```json
{
  "showInheritedConfigurations": ["General layouts", "introBodyBackground"]
}
```
