# Theme JS APIs

Add `fliplet-themes` library as a dependency to access your current theme settings.

## Get the list of available themes

```js
Fliplet.Themes.get().then(function (themes) {

});
```

## Get theme instance

```js
var themeInstance = Fliplet.Themes.Current.getInstance();
```

| Property | Type | Description |
| -- | -- | -- |
| data.values | `Object` | Key-value storage of theme values |
| data.widgetInstances | `Array` | List of widget instances and associated theme value settings |

## Get settings from the current theme

```js
var value = Fliplet.Themes.Current.get('keyName');
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
