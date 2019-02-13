# Writing more readable code when using the JS APIs

As you might know most of Fliplet JS APIs use **Promises** when the result of such operation cannot be read synchronously. For example when reading data from the server or the device storage.

Take the following example:

```js
Fliplet.App.Storage.get('foo').then(function (result) {

});
```

**Promises** are great, but they make the code less procedural hence more difficult to read and maintain. If you don't need to support **Internet Explorer 11**, there's a nice new feature of Javascript you can use right now in your Fliplet apps to make your code more readable and it's called `await/async`.

## The "await" keyword

By prefixing a promise with the `await` keyword, you can wait for the result of such promise before your code continues:

```js
var result = await Fliplet.App.Storage.get('foo');
```

This means you can use the `result` straight away. Let's take a look at a more complex example:

```js
var connection = await Fliplet.DataSources.connect(123);
var entries = await connection.find();

var newEntry = await connection.insert({ foo: 'bar' });

// here I can use the "entries" array and also "newEntry"
```

## Catching errors with async/await

When using `await`, errors can be caught in the more traditional **try/catch** way:

```js
try {
  var result1 = await Fliplet.App.Storage.get('foo');
  var result2 = await Fliplet.App.Storage.get('bar');
} catch (err) {
  // woops! one of the above promises failed
  console.error(err);
}
```

---

---

## Behind the scenes

The above works because when we detect the **await** keyword in your apps and screens custom code we wrap your code into a asynchronous function, like:

```
(async function () {
  // your code which uses "await" is here
})();
```

Don't forget that using `async/await` is not supported on IE11.