# List (from data source)

- [Templates](#templates)
- [Hooks](#hooks)
- [Configurations](#configurations)
- [Query parameters](#query-parameters)

## Templates

The **Edit component's code** feature allows you to change the templates for what users see in the component UI. This uses Handlebars as the templating engine, including some [custom helpers](../libraries/handlebars.md#using-helpers-to-enhance-your-templates) that Fliplet provide.

The summary and detail view templates are rendered using a predefined list of keyword variables, e.g. `Email`, `Telephone` and `LinkedIn` in the case of the Directory layout.

When editing the HTML templates, the {% raw %}`{{ }}`{% endraw %} templates are referring to these predefined variables. To access fields directly from the data source, use the `originalData.` prefix, e.g. a {% raw %}`{{#if}}`{% endraw %} statement would look like the below.

{% raw %}
```handlebars
{{#if originalData.[Status]}}
```
{% endraw %}

## Hooks

The **List (from data source)** component exposes hooks that you can use to modify the component data and behavior. Here are the hooks and their specific life cycle:

- [`flListDataBeforeGetData`](#fllistdatabeforegetdata)
- [`flListDataAfterGetData`](#fllistdataaftergetdata)
- [`flListDataBeforeRenderList`](#fllistdatabeforerenderlist)
- [`flListDataAfterRenderList`](#fllistdataafterrenderlist)
- [`flListDataBeforeRenderFilters`](#fllistdatabeforerenderfilters)
- [`flListDataAfterRenderFilters`](#fllistdataafterrenderfilters)
- [`flListDataBeforeDeleteConfirmation`](#fllistdatabeforedeleteconfirmation)
- [`flListDataBeforeDeleteEntry`](#fllistdatabeforedeleteentry)
- [`flListDataBeforeShowComments`](#flListdatabeforeshowcomments)
- [`flListDataAfterShowComments`](#flListdataaftershowcomments)

### `flListDataBeforeGetData`

The hook is run before data is retrieved for rendering. Return a rejected promise to stop the list from rendering with suitable error messages.

```js
Fliplet.Hooks.on('flListDataBeforeGetData', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **id** (Number) Component instance ID.
    - **uuid** (String) Component instance UUID.
    - **container** (jQuery object) jQuery object for the component container element.

#### Usage

**Overwriting data to be rendered**

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.getData = function() {
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

*Note: `data.config.getData` must return an array of objects. Each object must contain both `id` and `data` properties.*


### `flListDataAfterGetData`

The hook is run after data is retrieved for rendering.

```js
Fliplet.Hooks.on('flListDataAfterGetData', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **id** (Number) Component instance ID.
    - **uuid** (String) Component instance UUID.
    - **container** (jQuery object) jQuery object for the component container element.
    - **records** (Array) Collection of records to be used for the component. This can be manipulated to affect the output.

#### Usage

**Add custom classes the container of each list item**

```js
Fliplet.Hooks.on('flListDataAfterGetData', function(options) {
  _.forEach(options.records, function(record) {
    // Add new classes to the record container
    // Custom classes can be set with multiple classes separated by spaces or with an array of classes
    _.set(record, 'data.flClasses', 'text-danger text-muted');
  });
});
````

### `flListDataBeforeRenderList`

The hook is run right before data is to be rendered in the list.

```js
Fliplet.Hooks.on('flListDataBeforeRenderList', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **records** (Array) Collection of records to be used for the component. This would be the last point in the process for the data to be manipulated before rendering.

### `flListDataAfterRenderList`

The hook is run right after data is rendered in the list.

```js
Fliplet.Hooks.on('flListDataAfterRenderList', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **records** (Array) Collection of records to be used for the component.

### `flListDataBeforeRenderFilters`

The hook is run before filters are rendered.

```js
Fliplet.Hooks.on('flListDataBeforeRenderFilters', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **filters** (Array) Array of filters and values to be rendered.
    - **records** (Array) Collection of records to be used for the component. This can be manipulated to affect the output.

### `flListDataAfterRenderFilters`

The hook is run after data filters are rendered.

```js
Fliplet.Hooks.on('flListDataAfterRenderFilters', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **filters** (Array) Array of filters and values to be rendered.
    - **records** (Array) Collection of records to be used for the component. This can be manipulated to affect the output.

### `flListDataBeforeDeleteConfirmation`

The hook is run before delete confirmation pop up shows.

```js
Fliplet.Hooks.on('flListDataBeforeDeleteConfirmation', fn);
```

#### Parameters

- **fn** (Function(`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **id** (Number) Component instance ID.
    - **uuid** (String) Component instance UUID.
    - **container** (jQuery object) jQuery object for the component container element.
    - **entryId** (Number) Data source entry ID of the record to be deleted.

### `flListDataBeforeDeleteEntry`

The hook is run before deleting an entry.

```js
Fliplet.Hooks.on('flListDataBeforeDeleteConfirmation', fn);
```

#### Parameters

- **fn** (Function((`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **id** (Number) Component instance ID.
    - **uuid** (String) Component instance UUID.
    - **container** (jQuery object) jQuery object for the component container element.
    - **entryId** (Number) Data source entry ID of the record to be deleted.

#### Usage

**Before deleting an entry**

```js
Fliplet.Hooks.on('flListDataBeforeDeleteEntry', function onBeforeDeleteEntry(options) {
  options.config.deleteData = function(id) {
    // Execute a custom third-party entry deletion operation
    return $.ajax({
      url: 'http://example.com/api/entry/' + id,
      method: 'DELETE'
    });
  };
});
```

### `flListDataBeforeShowComments`

The hook is run before showing comments for an entry.

```js
Fliplet.Hooks.on('flListDataBeforeShowComments', fn);
```

#### Parameters

- **fn** (Function((`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **html** (String) HTML code that is to be rendered for all the comments.
    - **comments** (Array) Comments retrieved for the entry.
    - **entryId** (Number) Data source entry ID of the record to be deleted.

### `flListDataAfterShowComments`

The hook is run after showing comments for an entry.

```js
Fliplet.Hooks.on('flListDataAfterShowComments', fn);
```

#### Parameters

- **fn** (Function((`options`)) Callback function with an object parameter.
  - **options** (Object) A map of data containing the following.
    - **config** (Object) Configuration used to initialize the component.
    - **html** (String) HTML code that is to be rendered for all the comments.
    - **comments** (Array) Comments retrieved for the entry.
    - **entryId** (Number) Data source entry ID of the record to be deleted.



## Configurations

Using the available hooks, component instance configuration can be used to modify component data and behavior. The available configuration properties are listed below:

- `getData` (Function(`options`)) Function used to retrieve data. Each entry must include the following properties, which the `Fliplet.DataSources` JS API follows. **`[1]`** **`[2]`**
  - `id` (Number) Entry ID
  - `data` (Object) Entry data

**`[1]`** This function is best set using the [`flListDataBeforeGetData`](#fllistdatabeforegetdata) hook and must return a Promise.
**`[2]`** If `getData` is used to return data, the fields for the data source configured through the Studio interface needs to match the properties avaiable in the returned data. You can do this by creating at least one entry in the data source that contains all the respective fields.

- `dataQuery` (Object \| Function(`options`)) If a custom `getData` isn't used, `dataQuery` customizes the query for retrieving data from the data source. This can be used to limit the amount of data retrieved from the data source, reducing the amount of transferred and processed data. When an **Object** is provided, the object is passed to the `.find()` function as outlined in the [`Fliplet.DataSources` JS API](../../API/fliplet-datasources.md#find-specific-records). When a **Function** is provided, the function must return an object to be pased to the same `.find()` function. The function can make use of an `options` object that contains the following properties.
  - `config` (Object) Configuration used to initialize the component
  - `id` (Number) Entry ID
  - `uuid` (String) Component instance UUID
  - `container` (jQuery object) jQuery object for the component container element

For example:

```js
// Retrieve only data that belongs to the user
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  return Fliplet.Profile.get('email').then(function (email) {
    if (!email) {
      return Promise.reject('User is not logged in');
    }

    options.config.dataQuery = {
      where: {
        Email: {
          $iLike: email
        }
      }
    };
  });
});
```

- `beforeOpen` (Function(`options`)) Function executed before loading entry details. The `options` parameter contains the following properties. Return a rejected Promise if you need to stop the entry from opening.
  - `config` (Object) Configuration used to initialize the component
  - `entry` (Object) Entry being opened
  - `entryId` (Object) ID for entry being opened
  - `entryTitle` (Object) Title for entry being opened
  - `event` (Object) Event object that triggered the opening
- `beforeShowDetails` (Function(`options`)) Function executed before showing the entry detail view, after the entry detail data is ready. The `options` parameter contains the following properties. Return a rejected Promise if you need to stop the entry from opening.
  - `src` (String) HTML source for the detail view template
  - `data` (Object) Data being used for rendering the detail view template
- `afterShowDetails` (Function(`options`)) Function executed after the entry detail view is shown. The `options` parameter contains the following properties.
  - `config` (Object) Configuration used to initialize the component
  - `src` (String) HTML source for the detail view template
  - `data` (Object) Data being used for rendering the detail view template
- `deleteData` (Function(`options`)) Function used to delete an entry. The `options` parameter contains the following properties.
  - `entryId`
  - `config` (Object) Configuration used to initialize the component
  - `id` (Number) Component instance ID
  - `uuid` (String) Component instance UUID
  - `container` (jQuery object) jQuery object for the component container element
- `searchData` (Function(`options`)) Function used to execute a data search. The `options` parameter contains the following properties.
  - `config` (object) Configuration used to initialize the component
  - `query` (String) Query string entered by user
- `computedFields` (Object) A mapping of computed fields, where the keys map to a list of fields that would be available based on the mapped values. For example:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.computedFields = {
    foo: 'bar.$.buzz', // Iterate the array `record.data.bar` and return the array of values for `buzz` for each object
    qux: function (record) {
      // Returns a value for `record.data.qux` based on the record
      return [record.dataSourceId, record.id, data.createdAt].join('_');
    }
  };
});
```

- `dataPrimaryKey` (String or Function(`options`) Provide a string to define the data source field name that contains the primary key. The primary key is used as a unique identifier when saving content for the social features, i.e. likes, comments and bookmarks. You can set this value so that if content is loaded into a different data source of changes entry ID, the social content won't be lost. Alternatively, define a function to return a unique primary key based on the record data (`options.record`).

To define a custom primary key:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.dataPrimaryKey = 'Session ID';
});
```

To create a custom primary key based on record data:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.dataPrimaryKey = function (data) {
    return _.get(data, 'record.data.Title') + '-' + _.get(data, 'record.data.Date');
  };
});
````

- `filterOptions` (Array) An collection of pre-filter conditions to be applied before the pre-filters configured for the component. Each collection item should contain all the following properties:
  - `column` (String) The field to apply the filter logic to
  - `value` (Mixed) Value to pass to the logic operator
  - `logic` (String) Logic operator to be applied on the field and value. The valid operators are

| Operator | Description |
| == | == |
| `==` | Equals |
| `!=` |Not equal |
| `>` | Greater than |
| `>=` | Greater than or equal |
| `<` | Less than |
| `<=` | Less than or equal |
| `contains` | Contains |
| `notcontain` | Not contain |
| `regex` | RegExp |

**Note** The filter is applied on the frontend after data is retrieved from the data source. To restrict data transfer via the API, use the `dataQuery` configuration.

For example:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.filterOptions = [
    {
      column: 'Department',
      logic: 'contains',
      value: 'technology'
    },
    {
      column: 'Size',
      logic: '>',
      value: 50
    },
  ];
});
```

- `summaryLinkAction` (Object) This object is automatically created when the component is configured to link each entry to a screen if the user clicks on it. The object can be extended to support query strings when linking to a screen.

For example:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  // Specify a query based on the a field
  if (options.config.summaryLinkAction) {
    options.config.summaryLinkAction.queryColumn = 'Query';
  }
});
````

## Query parameters

When navigating to a screen that contains a **List (from data source)** component, you can use queries to execut logic accordingly, e.g. load a specific list item, apply filters and/or search, or add a new pre-filter.

Use the following query parameters when linking to a screen with **List (from data source)** components.

- **dynamicListOpenId** Entry ID to be opened after the list is rendered.
- **dynamicListOpenColumn** Column name to use for opening an entry after the list is rendered
- **dynamicListOpenValue** Value to match in the given column for opening an entry after the list is rendered
- **dynamicListPreviousScreen** (`true|false`) If a query was used to open an entry, return to the previous page when users close the detail view. (Default: `false`)
- **dynamicListSearchValue** Search term to be applied after the list is rendered. Search will be executed according to the component configuration or custom configuration. If only one entry is found, the entry will be automatically opened.
- **dynamicListSearchColumn** Column to execute a search against. If provided, the component configuration will be ignored. (Optional)
- **dynamicListFilterValue** A comma-separated list of filter values to select. If `dynamicListFilterColumn` is not specified, all filters that match the value will be selected. **Note:** only filter values that are present in the dataset will be used.
- **dynamicListFilterColumn** A comma-separated list of columns to select filter values within (optional). The number of columns provided must match the number of values provided. To select multiple values for a column, use `[]` to enclose the values and separate them by commas. e.g. `dynamicListFilterColumn=Tags,Category&dynamicListFilterValue=[Foo,Buzz],Enterprise%20software` selects the filters `Tags=Foo`, `Tags=Buzz` and `Category=Enterprise software`.
- **dynamicListFilterHideControls** (`true|false`) Hide the filter controls when filter values are applied from the query. (Default: `false`)
- **dynamicListPrefilterColumn** Pre-filter list based on the provided list of comma-separated column names.
- **dynamicListPrefilterValue** Pre-filter list based on the provided list of comma-separatedvalues for the column names.
- **dynamicListPrefilterLogic** Pre-filter list based on the provided list of comma-separated logic operators to be applied on the columns and values. The valid operators are:

| Operator | URL encoded operator | Description |
| == | == | == |
| `==` | `%3D%3D` | Equals |
| `!=` | `%21%3D` |Not equal |
| `>` | `%3E` | Greater than |
| `>=` | `%3E%3D` | Greater than or equal |
| `<` | `%3C` | Less than |
| `<=` | `%3C%3D` | Less than or equal |
| `contains` | `contains` | Contains |
| `notcontain` | `notcontain` | Not contain |
| `regex` | `regex` | RegExp |

### Examples

**Open entry with ID 123**

```
dynamicListOpenId=123
```

**Execute a search with the search term "hello"**

```
dynamicListSearchValue=hello
```

**Render with a filter and hide the filter bar**

```
dynamicListFilterValue=England,Monthly&dynamicListFilterHideControls=true
```

**Load only data that match names containing John and age less than 29**

```
dynamicListPrefilterColumn=Name,Age&dynamicListPrefilterValue=John,29&dynamicListPrefilterLogic=contains,%3C
```

## Persistent Variable Queries (deprecated)

**The Persistent Variable Queries method has been deprecated.**

With the **List (from data source)** you can programatically load a specific list item, apply filters and/or search, and even add a new pre-filter. _(pre-filter is a filter applied before the list is rendered - this won't override the filters added in component settings)_

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

- `==` Equals
- `!=` Not equal
- `>` Greater than
- `>=` Greater than or equal
- `<` Less than
- `<=` Less than or equal
- `contains` Contains
- `notcontain` Not contain
- `regex` RegExp

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}