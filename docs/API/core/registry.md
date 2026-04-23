# `Fliplet.Registry`

Store and retrieve runtime values and functions by key so components can share state and helpers.

### Set data

```js
// Set a single value
Fliplet.Registry.set('foo', 1);

// Set a function
Fliplet.Registry.set('multiply', (function (x, y) {
  return x * y;
}));
```

### Get data

```js
// Get a registered value
var foo = Fliplet.Registry.get('foo');

// Get a registered function
var multiply = Fliplet.Registry.get('multiply');
multiply(2, 3); // 6
```
