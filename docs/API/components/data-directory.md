# Data Directory JS APIs

These public JS APIs will be automatically available in your screens once a **Data Directory** component is dropped into such screens.

## Run a hook before the directory is rendered

```js
Fliplet.Hooks.on('flDirectoryBeforeGetData', function onBeforeGetData(data) {
  // insert your code here
  // return a promise if this hook should be async
});
```

### Overwriting data to be rendered

The  `flDirectoryBeforeGetData` hook explained above can be useful to overwrite the directory data by declaring a function at the `data.config.getData` path returning a promise which resolves with the new data:

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
  data.config.getData = function () {
    // In this example we connect to a datasource with ID 123
    return Fliplet.DataSources.connect(123).then(function(connection) {
      // Get all entries in the data source matching a specific condition
      return connection.find({ where: { foo: 'bar' } })
    }).then(function (entries) {
      // Apply some transformations to the data before sending it back to the directory
      var entries = result.map(function(entry) {
        entry.data.dataSourceEntryId = entry.id;
        return entry.data;
      });

      // Return the data to be rendered on the directory
      return entries;
    });
  };
});
```

## Running code before the directory is initialised

```js
// Register the event
document.addEventListener('flDirectoryBeforeInit', function(e) {
  // Get the directory instance
  document.querySelector('.directory-list').classList.add('loading');
  var directory = e.detail.context;

  for(var i = 0; i < directory.data.length; i++) {
    // Modify data in the directory with a sample "formatCurrency" function we have defined elsewhere
    directory.data[i]['AmountInUSD'] = formatCurrency(directory.data[i]['AmountInUSD'], '$');
  }

  e.stopPropagation();
});
```

## Query parameters

Use the following query parameters when linking to a directory screen.

* `action` (String) (`filter` or `search`) The action to execute when opening the directory screen.
  * `filter` Open filter mode
  * `search` Open search mode
* `field` (String - Optional) When the `action` parameter is set to `filter`, use the `field` parameter to determine which field the filter mode should be activated with. If left unset, users will be able to choose the field through the directory filter interface. This parameter is case sensitive.
* `value` (String - Optional) The value to run the filter or search mode with. When the search result returns only 1 entry, the entry will be automatically opened. This parameter is case insensitive.

### Example 1

Open filter mode.

```
?action=filter
```

### Example 2

Open the filter mode with all possible values of the "Country" field.

```
?action=filter&field=Country
```

### Example 3

Search the directory with the keyword "engineer"

```
?action=search&value=engineering
```


---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}