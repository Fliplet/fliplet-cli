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

**Note: `data.config.getData` must return an array of objects. Each object must contain both `id` and `data` properties. If you are integrating with a third-party API, it may be necessary to map the returned response using `Array.prototype.map()` or `_.map()` from lodash to restructure the response.**

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function onBeforeGetData(data) {
  // data is an object with the component configuration and the component container
  // data.config
  // data.container

  // Define the "getData" promise to return the new data
  data.config.getData = function() {
    return Promise.resolve([
      {
        id: 1,
        data: { name: 'Nick' }
      },
      {
        id: 2,
        data: { name: 'Tony' }
      }
    ]);
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

## Run a hook before deleting an entry
```js
Fliplet.Hooks.on('flListDataBeforeDeleteEntry', function onBeforeDeleteEntry(data) {
  // data - (Object) Contains "entryId", "config", "container"
  // data.entryId - (Number) ID of the entry that is going to be deleted
  // data.config - (Object) Entire component's configuration object
  // data.container - (Object) DOM element

  data.config.deleteData = function(id) {
    // Resolve Promise with the entry ID
    return Promise.resolve(id);
  };
});
```

## Persistent Variable Queries
With the **List (from data source)** you can programatically load a specific list item, apply filters and/or search, and even add a new pre-filter.
_(pre-filter is a filter applied before the list is rendered - this won't override the filters added in component settings)_

This can be achieved by setting a persistant variable using the `Fliplet.App.Storage`. [Read more here](../../API/fliplet-core.md#app-storage)
The persistant variable, by default, will be removed automatically after running.
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', { ... });
```
The persistant variable is namespaced with `flDynamicListQuery:` plus the list layout name. Below are all the layout names you can use.
### List layouts
The key of the persistant variable includes the layout name of the List (from data source).
Here is a list of all the layouts available in the List (from data source) component:
- `small-card` Small Expandable Cards
- `news-feed` Cards with Description
- `agenda` Agenda
- `small-h-card` Small Horizontal Cards
- `simple-list` Simple List

Let's have a look at how to use the feature.
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', options);
```
- **options** (Object) A map of options to pass as the value of the persistant variable.
  - **prefilter** (Array) (Array of objects) Use this if you want to pre-filter your list.
    - **column** (String) [Required] The name of the column that you want to use to filter by.
    - **logic** (String) [Required] The logic operator for the filtering. _See the possible logic operators below._
    - **value** (String) [Required] The value that will determine the filter.
  - **open** (Object) Use this if you want to open a specific list item.
    - **id** (String) The `id` of the list item that you want to open.
    - **column** (String) The column where the `value` will be queried for.
    - **value** (String) The value used to query the column.
  - **search** (Object) Use this if you want to load your list with a search applied. _If only one list item is returned, it will automatically open it._
    - **value** (String) [Required] The search value.
    - **column** (String or Array) The column or columns where the `value` will be searched for. _If the `column` is defined, it will override the component's settings._
  - **filter** (Object) Use this if you want to load your list with one or multiple filters applied.
    - **value** (String or Array) [Required] A value or list of values containing the filters that you want activated on load.
    - **hideControls** (Boolean) Use this option to hide or show the filters buttons when the page loads (**Default**: `true`)
  - **goBack** (Object) Use this if you want to set a new back button or hijack the top bar's back button
    - **enableButton** (Boolean) This will render a new button at the top of the component that will trigger a `Fliplet.Navigate.back()` (**Default**: `false`)
    - **hijackBack** (Boolean) This will hijack the action of the back button (arrow left) on the top bar menu (**Default**: `false`)
    - **action** (Function) The function will be executed before the user is returned to the previous screen. The function must be written as a `String`, because functions can't be saved to `Fliplet.Storage`.
  - **previousScreen** (Boolean or Function) If you want to return to the previous screen when closing a list item, set to true or write a function. The function will be executed before the user is returned to the previous screen. We recommend only using this option when you know there will only be one entry as a result. (**Default**: false)
  - **persist** (Boolean) Use this if you want to prevent the persistant variable from being deleted. (**Default**: `false`)

Let's see a few examples on how to use all these options:

### Open specific list item
```js
// Open by ID
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  open: {
    id: 1234
  }
});

// Open by column and value
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  open: {
    column: "First Name",
    value: "John"
  }
});
```

### Load list with search value
```js
// Search by value only
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    value: "business apps"
  }
});

// Search by value on a specific data column
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    column: "Title",
    value: "business apps"
  }
});

// Search by value on an array of data columns
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: {
    column: ["Title", "Category"],
    value: "business apps"
  }
});
```

### Load list with a filter
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

### Pre-filter the list
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

### Other options
```js
Fliplet.App.Storage.set('flDynamicListQuery:simple-list', {
  search: { ... },
  goBack: {
    enableButton: true,
    action: "(function () { console.log('run code') })"
  },
  persist: true
});
```

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

#### **Operators for the `logic` key**
- `==` Equal
- `!=` Not equal
- `>` Greater than
- `>=` Greater than or equal
- `<` Less than
- `<=` Less than or equal
- `contains` Contains
- `notcontain` Not contains
- `regex` RegExp


---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}