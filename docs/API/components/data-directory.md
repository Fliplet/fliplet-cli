# Fliplet Data Directory JS APIs

These public JS APIs will be automatically available in your screens once a **Data Directory** component is dropped into such screens.

## Run a hook before the directory is rendered

```js
Fliplet.Hooks.on('flDirectoryBeforeGetData', function onBeforeGetData(data) {
  // insert your code here
  // return a promise if this hook should be async
});
```

This can be useful to overwrite the directory data by providing a function returning a promise resolving with the new data:

```js
Fliplet.Hooks.on('flDirectoryBeforeGetData', function onBeforeGetData(data) {
  data.config.getData = function() {
    return Promise.resolve([{ id: 1, name: 'Nick' }, { id: 2, name: 'Tony' }]);
  };
});
```

Let's take a look at a complete example injecting data from a data source to a directory:

```js
Fliplet.Hooks.on('flDirectoryBeforeGetData', function onBeforeGetData(data) {
  // disable caching the data so it's always retrieved from the server
  data.config.cache = false;

  // Define the "getData" promise to manually fetching data. 
  // In this example we connect to a datasource with ID 123
  data.config.getData = Fliplet.DataSources.connect(123).then(function(connection) {
    // Get all entries in the data source matching a specific condition
    return connection.find({ where: { foo: 'bar' } })
  }).then(function (entries) {
    // Apply some transformations to the data before sending it back to the directory
    var entries = result.map(function(entries) {
      entries.data.dataSourceEntryId = entries.id;
      return entries.data;
    });

    // Return the data to be rendered on the directory
    return entries;
  });
});
```