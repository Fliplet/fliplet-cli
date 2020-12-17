# Registry

The `Registry` JS APIs allow you to save and read data and functions in the run time.

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
