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
        where: { column: 'value' }
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
          column: 'value'
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

## Filter or Search the list on load
With the List (from data source) you can programatically load the list with filters applied, a search value applied, and even add a new pre-filter.  
_(pre-filter is a filter applied before the list is rendered - this won't override the filters added in component settings, it will run after those)_

This can be achieved by setting a persistant variable using the `Fliplet.App.Storage`. [Read more here](../../API/fliplet-core.md#app-storage)  
The persistant variable, by default, will be removed automatically after running.
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', { ... });
```
### List layouts
The key of the persistant variable includes the layout name of the List (from data source).  
Here is a list of all the layouts available in the List (from data source) component:
- Small Expandable Cards: `small-cards`
- Cards with Description: `news-feed`
- Agenda: `agenda`
- Small Horizontal Cards: `small-h-cards`
- Simple List: `simple-list`

### Search
#### **By value**
`search` - Object  
`value` - String  
When using by value only, it will search on the fields defined in the component's settings.

```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    value: "business apps"
  }
});
```
#### **By column and value**
`search` - Object  
`value` - String  
`column` - String/Array  
When defining the `column` key, the field defined in the component's settings will be overriden.

```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    column: "Title",
    value: "business apps"
  }
});

Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    column: ["Title", "Category"],
    value: "business apps"
  }
});
```
### Filter
`filter` - Object  
`value` - String/Array  
You must still define the columns that contain the filter values in the settings of the component.

```js
// Applying one filter
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  filter: {
    value: "Apps"
  }
});

// Applying multiple filters
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  filter:{
    value: ["Apps", "London"]
  }
});
```
### Pre-filter
`prefilter` - Array  
`column` - String  
`logic` - String  
`value` - String  

```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  prefilter: [
    {
      column: "Title",
      logic: "contains",
      value: "apps"
    }
  ]
});
```
#### **Operators for the `logic` key**
- Equal: `==`
- Not equal: `!=`
- Greater than: `>`
- Greater than or equal: `>=`
- Less than: `<`
- Less than or equal: `<=`
- Contains: `contains`
- Not contains: `notcontain`
- RegExp: `regex`

### Chain features
A pre-filter and a search
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  prefilter: [
    {
      column: "Title",
      logic: "contains",
      value: "apps"
    }
  ],
  search: {
    column: ["Title", "Category"],
    value: "business apps"
  }
});
```

### Other options
`previousScreen` - Boolean/Function (Default: `false`) - When set to `true` or defined as a `function`, closing a detail view of a list item, will navigate to the previous screen. _We recommend only using this option when you know there will only be on entry as a result_  
`persist` - Boolean (Default: `false`) - When set to `true` the persistant variable will never be removed, until you remove it programatically.
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: { ... },
  previousScreen: true,
  persist: true
});
```


---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}