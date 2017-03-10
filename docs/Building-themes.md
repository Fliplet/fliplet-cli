# Building themes

Before building theme, we recommend reading the documentation about [creating components](Building-components.md) as it contains many principles about how widgets (components, themes and menus) work on Fliplet.

A theme consist in:
- SCSS, CSS and Javascript assets.
- A configuration object which is used from Fliplet Studio to build a UI and let users customise various parts of your theme.
- Sample html files to be used from the CLI to preview a theme during development.

---

## Creating a theme

Use the `create-theme` command of the CLI to create your theme:

```
$ fliplet create-theme "my-awesome-theme"

Creating new theme my-awesome-theme to /Users/nicholas/my-awesome-theme
Theme has been successfully created. To run it for development:

    $ cd my-awesome-theme
    $ fliplet run
```

Same as for components development, the `run` command will start the local development tools and a new window of your browser pointing to `http://localhost:3000` (or the first open port) should open.