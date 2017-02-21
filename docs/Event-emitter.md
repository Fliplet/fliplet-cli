# Sending events between components

Components interfaces can send events to Fliplet Studio using a event emitter bus provided with the `fliplet-core` dependency.

## Tells the parent window the height of the component interface has changed

This is particularly useful when the height of your interface has dramatically changed and you want to make sure the parent windows is aware of that.

When a component is a provider, the parent window will be the component which is hosting the provider. On the other hand, the parent windows of a component interface will be Fliplet Studio.

```js
// Call from a provider or a component interface
Fliplet.Widget.autosize()
```

## Refresh the screen preview frame

Particularly useful after saving a component instance configuration, if you require the screen to be reloaded.

```js
Fliplet.Studio.emit('reload-page-preview');
```

## Tells the parent window a component is done

```js
Fliplet.Widget.complete();
```

The typical use is to call `complete()` shortly after a component instance has saved its settings:

```js
Fliplet.Widget.save({ foo: 'bar' }).then(function onSave() {
  Fliplet.Widget.complete();
});