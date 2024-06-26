# The component definition file

The `widget.json` file defines your component as well as the **dependencies** and **assets** it needs in order to run.

Please note: if you make changes to the `widget.json` file, restart the development server (`fliplet run`) to apply the changes you made.

Let's have a look at an example and we'll explain how each section works:

```json
{
  "name": "my Awesome Component",
  "package": "com.example.my-awesome-component",
  "version": "1.0.0",
  "icon": "img/icon.png",
  "tags": [
    "type:component",
    "category:general"
  ],
  "provider_only": false,
  "references": [],
  "html_tag": "span",
  "interface": {
    "dependencies": [
      "fliplet-core",
      "fliplet-studio-ui"
    ],
    "assets": [
      "js/interface.js"
    ]
  },
  "build": {
    "dependencies": [
      "jquery",
      "bootstrap"
    ],
    "assets": [
      "css/build.css"
    ],
    "appAssets": [
      "css/app.css"
    ]
  }
}
```

## "name"

The title of your component. This will be visible on Fliplet Studio when a user will select a component.

## "package"

A unique string to define your component on Fliplet. It's usually named after your company website and component name but in reverse order.

e.g. Given my company website is `fliplet.com` and the component I'm developing is a YouTube Video player, I will use `com.fliplet.youtube` (or even `com.fliplet.video.youtube` or `com.fliplet.youtube-video`).

## "version"

The semantic version of your component. The newest version will automatically be made available to users. For app and screen components, older versions will continue to be functional and configurable, but users will not be able to set up new instances.

## "icon"

The relative path to the icon of your component. When available, the icon will be displayed on Fliplet Studio in different parts of the user interface.

## "tags"

Tags are used by both the system and studio to filter components and organize them into different sections.

- A component is declared as a **page component** when the default tag `type:component` is included.
- A component becomes an **app component** when the tag `type:appComponent` is included.
- A component is displayed in Studio with a *Beta* tag if it includes `beta:true`.
- A component becomes unlisted when the none of the two above tags have been set. Therefore, **providers** usually don't include those tags.
- A component that has an older version will be available for users to set up as a new instance if it has the `listable:true` tag.

## "provider_only"

When set to `true`, marks the component as a **provider** only, hence cannot be assigned to an app or a screen with an instance. You're most likely to use this with empty `tags` as specified above.

## "references"

Specifies to the system which settings of the component (when saved with `Fliplet.Widget.save` to an instance) reference values which should be linked and kept as references.

This is extremely important when it comes to app cloning, because the system can understand what data should be moved across and get its references updated.

Here's an example taken from Fliplet's [button component](https://github.com/Fliplet/fliplet-widget-primary-button):

```json
{
  "references": [
    "action.page:page"
  ]
}
```

In a nutshell, the above tells the system that the value at the path `actions.page` in the instance settings is a reference to a page (a screen) of an app.

Possible values for the references are:

- **organization** (Organization ID)
- **app** (App ID)
- **page** (page ID)
- **dataSource** (Data Source ID)
- **dataSourceView** (A Data Source View)
- **mediaFolder** (Media Folder ID)
- **richContent** (A rich content view)

Components defining an array or complex objects can use the `$` operator to specify when to iterate over arrays of objects. Given your component saves data like the following:

```js
Fliplet.Widget.save({
  items: [
    { foo: 1 },
    { foo: 2 }
  ]
});
```

You can use the following references when describing the behavior of your component:

```json
{
  "references": [
    "items.$.foo:page"
  ]
}
```

## "html_tag"

App and page components can optionally output HTML via the `build.html` template. When doing that, the output is wrapped around a main html tag which also holds some metadata about the component instance. Your definition can specify which tag you want to use. This is mainly used with `div` and `span` to declare whether your output is block or inline.

Having said that, **any html tag** is allowed to be specified.

## "interface"

Declares `dependencies` and local `assets` to be used from the [interface.html](Interface.md). Please read our documentation about [dependencies and assets](../Dependencies-and-assets) for more details.

## "build"

Declares `dependencies` and local `assets` to be used from the **build.html** output. Please read our documentation about [dependencies and assets](../Dependencies-and-assets) for more details.

For page components you can also define `appAssets` that needs to be injected to all screens of the app when your component is dropped on any of the screens.

---

[Back to components](../Building-components.md#the-component-definition-file)
{: .buttons}
