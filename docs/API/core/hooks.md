# Hooks

Hooks are used to execute custom code at specific points in the application flow, typically before or after certain actions occur.

### Register a callback for a hook

```js
Fliplet.Hooks.on('beforeFormSubmit', function (data) {
  console.log('just got', data);

  data.foo = 2;

  return Promise.resolve('bar'); // you can return a promise if your hook is async
});
```

The `beforeFormSubmit` event is triggered just before a form is submitted to the server. When this event occurs, any registered hooks will be executed in the order they were added.

The callback function passed as the second argument to the `Fliplet.Hooks.on()` method will be executed when the hook is triggered. This function takes a single argument, which is an object representing the data that will be submitted with the form.

In this example, the callback function logs the current value of data to the console using `console.log()`, then adds a new property called `foo` to the data object and assigns it a value of `2`.

Finally, the function returns a Promise resolved with the string `'bar'`. This can be useful if the hook function needs to perform asynchronous operations (such as fetching data from an external API) before the next step in the app flow can proceed.

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

This code first initializes a JavaScript object data with a property called `foo` that has a value of `1`.

It then uses the `Fliplet.Hooks.run()` method to trigger the `'beforeFormSubmit'` hook, passing in a reference to the data object as an argument. This will execute any registered callback functions that were added to the hook using `Fliplet.Hooks.on('beforeFormSubmit', ...)`.

```js
var data = { foo: 1 };

Fliplet.Hooks.run('beforeFormSubmit', data).then(function (results) {
  // results[0] is "bar"
  // data.foo is 2
}, function onError (err) {
  // woop woop, an hook fired a rejection!
});
```

The `run()` method returns a promise, which can be used to handle the results of the hook execution. In this case, the promise is resolved with an array containing a single element that is the string `'bar'`. This value was returned from the hook function that was called by `run()`. Additionally, the `data.foo` property will have been updated to `2` by the hook function.

The promise's `then()` method takes two callback functions as arguments. The first function runs when the promise is resolved successfully, and is passed an array of results.
The second function is an error handler that runs if the promise is rejected for any reason. This could happen if one of the hook functions throws an error, or if a hook function returns a rejected promise.