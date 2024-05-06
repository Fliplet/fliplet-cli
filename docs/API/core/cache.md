# Cache

### Fetch data and keep it cached for future calls

This feature allows you to run an operation (even asynchronously) and store its result so that future calls to the function will instantly resolve the Promise instead of waiting for the result.

If the data is already in cache at the time of running the call, your promise will be resolved instantly. However, when the cache is about to expire (if an expiration has been set) it will automatically attempt to renew the cache in background.

`Promise<result> Fliplet.Cache.get(<string|object>, <function>)`

```js
Fliplet.Cache.get('foo', function () {
  return { bar: 1 };
}).then(function (result) {

});
```

This code demonstrates the usage of the `Fliplet.Cache.get()` method to retrieve data from a cache. The `get()` method takes two arguments, a cache key and a callback function that is executed if the requested value is not present in the cache.

Here, the code provides the key `'foo'` as the first argument to `get()`. If there is no cached value associated with the key `'foo'`, then the anonymous function provided as the second argument will be executed to generate a value to cache. In this case, the function simply returns an object `{ bar: 1 }` as the value to cache.

The `then()` method is called on the promise returned by `get()`, which allows asynchronous code execution after the data has been retrieved from the cache. The anonymous function provided as the argument to then() can receive the retrieved data as its argument (in this case, the previously returned object `{ bar: 1 }`).

Here's a more complete example including all options:

```js
Fliplet.Cache.get({
  key: 'foo',         // unique name
  platform: 'native', // only cache on native
  expire: 60 * 10     // keep cache for 10 minutes
}, function onFetchData() {
  // Function to be called when data does not exist in the cache or when the cache has expired.
  // Return a promise if your operation is asynchronous.
  return Fliplet.API.request({
    url: 'v1/something'
  });
}).then(function (result) {
  // This promise will resolve instantly if the data is already cached
});
```

### Clear cache for one or more keys

Use the `remove` method to clear a single key from the cache. Likewise, use the `clear` method to remove all keys at once.

```js
// Clear a single value
Fliplet.Cache.remove('foo');

// Clear everything for this app
Fliplet.Cache.clear();
```
