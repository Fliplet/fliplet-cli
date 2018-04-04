# Theme JS APIs

## Get the list of available themes

```js
Fliplet.Themes.get().then(function (themes) {

});
```

## Get settings from the current theme

```js
var value = Fliplet.Themes.Current.get('keyName');
```