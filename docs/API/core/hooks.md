# Hooks

### Register a callback for a hook

```js
Fliplet.Hooks.on('beforeFormSubmit', function (data) {
  console.log('just got', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

```js
Fliplet.Hooks.on('afterFormSubmit', function (data) {
  // data.formData is form data
  // data.result is null for insert and the entry when update
  console.log('just got', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

```js
Fliplet.Hooks.on('onFormSubmitError', function (data) {
  // data.formData is form data
  // data.error is the error
  console.log('something went wrong', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

### Run a hook

```js
var data = { foo: 1 };

Fliplet.Hooks.run('beforeFormSubmit', data).then(function (results) {
  // results[0] is "bar"
  // data.foo is 2
}, function onError (err) {
  // woop woop, an hook fired a rejection!
});
```