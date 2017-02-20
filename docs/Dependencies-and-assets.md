# Dependencies and assets

Both **components** and **themes** can specify a list of dependencies and local assets which should be used when rendering it.

## Dependencies

A list of packages which are required in order for the component or theme to work. These will be included before any declared asset.

Still confused? We've got you covered. Find out more on the [JS APIs](JS-APIs) part of these docs.

Example on dependencies:

```json
{
  "dependencies": [
    "bootstrap",
    "fliplet-media"
  ]
}
```

It's worth saying that in the above example `fliplet-media` will also include `fliplet-core` as it's a dependency of it. Likewise, `fliplet-core` will include `jquery` too because is required for it to work.

Note: **components can specify different dependencies for their interface and build output**, since they will most likely be different.

---

## Assets

Components and themes using assets such as Javascript, CSS and font files **should never include them directly in the html**. This is by design, because assets get bundled from the server engine when sent to the devices to be consumed.

Therefore, all assets that requires to be bundled will need to be listed in the **assets** of the component (or theme) definition.

In addition to that, **components can specify different assets for their interface and build output**, since they will most likely be different.

Example of assets for a component:

```json
{
  "build": {
    "assets": [
      "vendor/datepicker.js",
      "js/interface.js",
      "css/style.css",
      "css/fonts/open-sans.ttf"
    ]
  }
}
```

Example of assets for a theme:

```json
{
  "assets": [
    "vendor/datepicker.js",
    "css/index.scss"
  ]
}
```