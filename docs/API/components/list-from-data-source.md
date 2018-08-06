# List (from data source) JS APIs

These public JS APIs will be automatically available in your screens once a **List (from data source)** component is dropped into such screens.

## Run a hook before the list is rendered

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  // insert your code here
  // return a promise if this hook should be async
});
```

### Overwriting data to be rendered

The  `flListDataBeforeGetData` hook explained above can be useful to overwrite the list data by declaring a function at the `data.config.getData` path returning a promise which resolves with the new data:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  // data is an object with the component configuration and the component container
  // data.config
  // data.container

  // Define the "getData" promise to return the new data
  data.config.getData = function() {
    return Promise.resolve([{ id: 1, name: 'Nick' }, { id: 2, name: 'Tony' }]);
  };
});
```

Let's take a look at a complete example injecting data from a data source to the list component with custom filter and without data transformations:
```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  // data is an object with the component configuration and the component container
  // data.config
  // data.container

  // disable caching the data so it's always retrieved from the server
  data.config.cache = false;

  // Define the "getData" promise to manually fetching data. 
  data.config.getData = function () {
    // In this example we connect to a datasource with ID 123
    // Change the ID to your data source ID
    return Fliplet.DataSources.connect(123)
      .then(function(connection) {
      // Get all entries in the data source matching a specific condition
      return connection.find({
        where: { 'column': 'value' }
      });
    });
  };
});
```

Now, let's have a look at another complete example injecting data from a data source to the list component with a custom filter and with data transformations:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  // data is an object with the component configuration and the component container
  // data.config
  // data.container

  // disable caching the data so it's always retrieved from the server
  data.config.cache = false;

  // Define the "getData" promise to manually fetching data. 
  data.config.getData = function () {
    // In this example we connect to a datasource with ID 123
    // Change the ID to your data source ID
    return Fliplet.DataSources.connect(123).then(function(connection) {
      // Get all entries in the data source matching a specific condition
      return connection.find({
        where: {
          'column': 'value'
        }
      })
    }).then(function (entries) {
      // Apply some transformations to the data before sending it back to the list component
      var entries = result.map(function(entry) {
        entry.data.dataSourceEntryId = entry.id;
        return entry.data;
      });

      // Return the data to be rendered on the list component
      return entries;
    });
  };
});
```


---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}