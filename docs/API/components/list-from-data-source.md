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
  - [`flListDataAfterRenderListSocial`](#fllistdataafterrenderlistSocial)
  - [`flListDataBeforeRenderFilters`](#fllistdatabeforerenderfilters)
  - [`flListDataAfterRenderFilters`](#fllistdataafterrenderfilters)
  - [`flListDataSearchKeyUp`](#flListDataSearchKeyUp)
  - [`flListDataSearchInput`](#flListDataSearchInput)
  - [`flListDataBeforeDeleteConfirmation`](#fllistdatabeforedeleteconfirmation)
  - [`flListDataBeforeDeleteEntry`](#fllistdatabeforedeleteentry)
  - [`flListDataBeforeShowComments`](#flListdatabeforeshowcomments)
  - [`flListDataAfterShowComments`](#flListdataaftershowcomments)
  - [`flListDataBeforeNewComment`](#flListDataBeforeNewComment)
  - [`flListDataAfterNewComment`](#flListDataAfterNewComment)
  - [`flListDataAfterNewCommentShown`](#flListDataAfterNewCommentShown)
  - [`flListDataBeforeUpdateComment`](#flListDataBeforeUpdateComment)
  - [`flListDataAfterUpdateComment`](#flListDataAfterUpdateComment)
  - [`flListDataAfterUpdateCommentShown`](#flListDataAfterUpdateCommentShown)
  - [`flListDataBeforeDeleteComment`](#flListDataBeforeDeleteComment)
  - [`flListDataAfterDeleteComment`](#flListDataAfterDeleteComment)

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

**Add custom classes to the container of each list item**

```js
Fliplet.Hooks.on('flListDataAfterGetData', function(options) {
  _.forEach(options.records, function(record) {
    // Add new classes to the record container
    // Custom classes can be set with multiple classes separated by spaces or with an array of classes
    _.set(record, 'data.flClasses', 'text-danger text-muted');
  });
});
```

**Adjust agenda timezone to the device timezone**

```js
Fliplet.Hooks.on('flListDataAfterGetData', function (options) {
  var dateColumn = _.get(_.find(options.config['detailViewOptions'], { Location: 'Full Date' }), 'column', 'Date');
  var startTimeColumn = _.get(_.find(options.config['summary-fields'], { Location: 'Start Time' }), 'column', 'Start Time');
  var endTimeColumn = _.get(_.find(options.config['summary-fields'], { Location: 'End Time' }), 'column', 'End Time');

  var dataTimezone = 'Europe/London'; // Change this to the timezone that the data source assumes
  var userTimezone = moment.tz.guess();

  options.records.forEach(function(record) {
    var startAt = moment.tz(record.data[dateColumn] + ' ' + record.data[startTimeColumn], dataTimezone).tz(userTimezone);
    var endAt = moment.tz(record.data[dateColumn] + ' ' + record.data[endTimeColumn], dataTimezone).tz(userTimezone);

    record.data[dateColumn] = startAt.format('YYYY-MM-DD');
    record.data[startTimeColumn] = startAt.format('HH:mm');
    record.data[endTimeColumn] = endAt.format('HH:mm');
  });
});
```

### `flListDataBeforeRenderList`

The hook is run right before data is to be rendered in the list. This includes the initial render as well as any search and filter renders.

```js
Fliplet.Hooks.on('flListDataBeforeRenderList', fn);
```

#### Parameters

  - **fn** (Function(`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **records** (Array) Collection of records to be used for the component. This would be the last point in the process for the data to be manipulated before rendering.
      - **value** (String) Any search term that is being applied
      - **fields** (Array) An array of fields from the data source that will be used to perform the search
      - **activeFilters** (Object) An object mapping all active filters
      - **showBookmarks** (Boolean) Indicating if the user has chosen to show bookmarks only

### `flListDataAfterRenderList`

The hook is run right after data is rendered in the list. This includes the initial render as well as any search and filter renders.

```js
Fliplet.Hooks.on('flListDataAfterRenderList', fn);
```

#### Parameters

  - **fn** (Function(`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **records** (Array) Collection of records to be used for the component.
      - **value** (String) Any search term that is being applied
      - **activeFilters** (Object) An object mapping all active filters
      - **showBookmarks** (Boolean) Indicating if the user has chosen to show bookmarks only
      - **initialRender** (Boolean) Indicating if the hook is fired from the initial component load

### `flListDataAfterRenderListSocial`

The hook is run right after data is rendered in the list and after any social features (likes, comments and bookmarks) are initialized for the list. This includes the initial render as well as any search and filter renders.

```js
Fliplet.Hooks.on('flListDataAfterRenderListSocial', fn);
```

All parameters are the same as for the [`flListDataAfterRenderList`](#fllistdataafterrenderlist) hook.

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

### `flListDataSearchKeyUp`

The hook is run after when a key is pressed on the search field.

```js
Fliplet.Hooks.on('flListDataSearchKeyUp', fn);
```

#### Parameters

  - **fn** (Function(`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **input** (jQuery object) jQuery object for the search input field.
      - **value** (String) Search value.
      - **event** (Event) Event object that triggered the hook.

### `flListDataSearchInput`

The hook is run after when a the search field value changes.

```js
Fliplet.Hooks.on('flListDataSearchKeyUp', fn);
```

#### Parameters

  - **fn** (Function(`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **input** (jQuery object) jQuery object for the search input field.
      - **value** (String) Search value.
      - **event** (Event) Event object that triggered the hook.

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
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **html** (String) HTML code that is to be rendered for all the comments.
      - **comments** (Array) Comments retrieved for the entry.
      - **record** (Object) Data source entry that the comments are attached to.

### `flListDataAfterShowComments`

The hook is run after showing comments for an entry.

```js
Fliplet.Hooks.on('flListDataAfterShowComments', fn);
```

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **html** (String) HTML code that is to be rendered for all the comments.
      - **comments** (Array) Comments retrieved for the entry.
      - **record** (Object) Data source entry that the comments are attached to.

### `flListDataBeforeNewComment`

The hook is run before a comment is added to a data source entry.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **comment** (String) Comment entered by user.
      - **commentGuid** (String) A temporary ID given to the new comment.

### `flListDataAfterNewComment`

The hook is run after a comment is added to a data source entry.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **commentEntry** (String) Comment entry returned by the API.
      - **commentGuid** (String) A temporary ID given to the new comment.

### `flListDataAfterNewCommentShown`

The hook is run after a comment is added and rendered on the page.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **commentEntry** (String) Comment entry returned by the API.
      - **commentGuid** (String) A temporary ID given to the new comment.
      - **commentContainer** (jQuery object) jQuery object for the new comment container element.

### `flListDataBeforeUpdateComment`

The hook is run before a comment is updated.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **oldCommentData** (Object) Comment entry object for the comment to be updated.
      - **newComment** (String) New comment for the comment.

### `flListDataAfterUpdateComment`

The hook is run after a comment is updated.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **oldCommentData** (Object) Comment entry object for the comment before it is updated.
      - **newCommentData** (Object) Comment entry object for the comment after it is updated.

### `flListDataAfterUpdateCommentShown`

The hook is run after a comment is updated and rendered on the page.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **oldCommentData** (Object) Comment entry object for the comment before it is updated.
      - **newCommentData** (Object) Comment entry object for the comment after it is updated.
      - **commentContainer** (jQuery object) jQuery object for the updated comment container element.

### `flListDataBeforeDeleteComment`

The hook is run before a comment is deleted.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **commentId** (Number) Comment ID to be deleted.
      - **commentContainer** (jQuery object) jQuery object for the updated comment container element.

### `flListDataAfterDeleteComment`

The hook is run after a comment is deleted and removed from the page.

#### Parameters

  - **fn** (Function((`options`)) Callback function with an object parameter.
    - **options** (Object) A map of data containing the following.
      - **config** (Object) Configuration used to initialize the component.
      - **id** (Number) Component instance ID.
      - **uuid** (String) Component instance UUID.
      - **container** (jQuery object) jQuery object for the component container element.
      - **record** (Object) Data source entry that the comments are attached to.
      - **commentId** (Number) Comment ID to be deleted.
      - **commentContainer** (jQuery object) jQuery object for the updated comment container element.

## Configurations

Using the available hooks, component instance configuration can be used to modify component data and behavior. The available configuration properties are listed below:

### `getData`

(Function(`options`)) Function used to retrieve data. Each entry must include the following properties, which the `Fliplet.DataSources` JS API follows. **`[1]`** **`[2]`**
  - `id` (Number) Entry ID
  - `data` (Object) Entry data

**`[1]`** This function is best set using the [`flListDataBeforeGetData`](#fllistdatabeforegetdata) hook and must return a Promise.

**`[2]`** If `getData` is used to return data, the fields for the data source configured through the Studio interface needs to match the properties avaiable in the returned data. You can do this by creating at least one entry in the data source that contains all the respective fields.

### `dataQuery`

(Object \| Function(`options`)) If a custom `getData` isn't used, `dataQuery` customizes the query for retrieving data from the data source. This can be used to limit the amount of data retrieved from the data source, reducing the amount of transferred and processed data. When an **Object** is provided, the object is passed to the `.find()` function as outlined in the [`Fliplet.DataSources` JS API](../../API/fliplet-datasources.md#find-specific-records). When a **Function** is provided, the function must return an object to be pased to the same `.find()` function. The function can make use of an `options` object that contains the following properties.
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

### `beforeOpen`

(Function(`opt`)) Function executed before loading entry details. The `opt` parameter contains the following properties. Return a rejected Promise if you need to stop the entry from opening.
  - `config` (Object) Configuration used to initialize the component
  - `entry` (Object) Entry being opened
  - `entryId` (Object) ID for entry being opened
  - `entryTitle` (Object) Title for entry being opened
  - `event` (Object) Event object that triggered the opening

### `beforeShowDetails`

(Function(`opt`)) Function executed before showing the entry detail view, after the entry detail data is ready. The `opt` parameter contains the following properties. Return a rejected Promise if you need to stop the entry from opening.
  - `src` (String) HTML source for the detail view template
  - `data` (Object) Data being used for rendering the detail view template

### `afterShowDetails`

(Function(`opt`)) Function executed after the entry detail view is shown. The `opt` parameter contains the following properties.
  - `config` (Object) Configuration used to initialize the component
  - `src` (String) HTML source for the detail view template
  - `data` (Object) Data being used for rendering the detail view template

### `deleteData`

(Function(`opt`)) Function used to delete an entry. The `opt` parameter contains the following properties.
  - `entryId`
  - `config` (Object) Configuration used to initialize the component
  - `id` (Number) Component instance ID
  - `uuid` (String) Component instance UUID
  - `container` (jQuery object) jQuery object for the component container element

### `searchData`

(Function(`opt`)) Function used to execute a data search. The `opt` parameter contains the following properties.
  - `config` (object) Configuration used to initialize the component
  - `query` (String) Search value entered by user
  - `activeFilters` (Object) A map of active filters
  - `records` (Array) Records to be assessed for a match
  - `showBookmarks` (Boolean) If TRUE, show bookmarks only
  - `limit` (Number) Number of limited entries to display

### `searchMatch`

(Function(`opt`)) Custom search function to use for matching an entry by string.

The function includes a `opt` parameter that contains the following properties.
  - `record` (Object) Record to be assessed for a string match
  - `value` (String) Search value entered by user
  - `fields` (Array) List of searchable fields defined for the instance

For example:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  options.config.searchMatch = function(opt) {
    return _.some(opt.fields, function(field) {
      var fieldValue = _.get(opt.record, ['data', field]);

      // Field value is empty
      if (typeof fieldValue === 'undefined') {
        return false;
      }

      // Only return full string matches when the field value is not an array
      if (!Array.isArray(fieldValue)) {
        return ('' + fieldValue).toLowerCase().trim() === ('' + opt.value).toLowerCase();
      }

      // If the field value is an array, check that it contains the search value
      return _.some(fieldValue, function(val) {
        return ('' + val).toLowerCase().trim() === ('' + opt.value).toLowerCase();
      });
    })
  };
});
```

### `computedFields`

(Object) A mapping of computed fields, where the keys map to a list of fields that would be available based on the mapped values. For example:

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

### `dataPrimaryKey`

(String or Function(`opt`)) Provide a string to define the data source field name that contains the primary key. The primary key is used as a unique identifier when saving content for the social features, i.e. likes, comments and bookmarks. The primary key is also passed as the `sessionId` query parameter when user visits the allocated Poll, Survey and Question pages.<br><br>You can set this value so that if content is loaded into a different data source of changes entry ID, the social content won't be lost. Alternatively, define a function to return a unique primary key based on the record data (`opt.record`).

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

### `filterOptions`

(Array) An collection of pre-filter conditions to be applied before the pre-filters configured for the component. Each collection item should contain all the following properties:
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

### `summaryLinkAction`

(Object) This object is automatically created when the component is configured to link each entry to a screen if the user clicks on it. The object can be extended to support query strings when linking to a screen.

For example:

```js
Fliplet.Hooks.on('flListDataBeforeGetData', function (options) {
  // Specify a query based on the a field
  if (options.config.summaryLinkAction) {
    options.config.summaryLinkAction.queryColumn = 'Query';
  }
});
````

### `forceRenderList`

(Boolean) When a search/filter is applied to a list, the list is sometimes shortened by removing unneeded entries. Set this configuration to `true` so that every list render is forced to re-rendered instead of patching it. (**Default**: `false`)

## Query parameters

When navigating to a screen that contains a **List (from data source)** component, you can use queries to execute logic accordingly, e.g. load a specific list item, apply filters and/or search, or add a new pre-filter.

Use the following query parameters when linking to a screen with **List (from data source)** components.

  - **dynamicListOpenId** Entry ID to be opened after the list is rendered.
  - **dynamicListOpenColumn** Column name to use for opening an entry after the list is rendered
  - **dynamicListOpenValue** Value to match in the given column for opening an entry after the list is rendered
  - **dynamicListOpenComments** (`true|false`) Open the comments view, if applicable (Default: `false`)
  - **dynamicListCommentId** Open the comments view and scroll to the provided comment based on the comment ID
  - **dynamicListPreviousScreen** (`true|false`) If a query was used to open an entry, return to the previous page when users close the detail view. (Default: `false`)
  - **dynamicListSortColumn** Column to sort the data with. The column must be added as a sortable field for the LFD first.
  - **dynamicListSortOrder** (`asc|desc`) Sort the list by the specified column in ascending (`asc`) or descending (`desc`) order.
  - **dynamicListSearchValue** Search term to be applied after the list is rendered. Search will be executed according to the component configuration or custom configuration. If only one entry is found, the entry will be automatically opened.
  - **dynamicListSearchColumn** Column to execute a search against. If provided, the component configuration will be ignored. (Optional)
  - **dynamicListFilterValue** A comma-separated list of filter values to select. If `dynamicListFilterColumn` is not specified, all filters that match the value will be selected. **Note:** only filter values that are present in the dataset will be used. If the filter is based on a date range, use `..` to separate the start and end values, e.g. `2022-02-01..2022-03-01`.
  - **dynamicListFilterColumn** A comma-separated list of columns to select filter values within (optional). The number of columns provided must match the number of values provided. To select multiple values for a column, use `[]` to enclose the values and separate them by commas. e.g. `dynamicListFilterColumn=Tags,Category&dynamicListFilterValue=[Foo,Buzz],Enterprise%20software` selects the filters `Tags=Foo`, `Tags=Buzz` and `Category=Enterprise software`.
  - **dynamicListFilterHideControls** (`true|false`) Hide the filter controls when filter values are applied from the query. (Default: `false`)
  - **dynamicListPrefilterColumn** Pre-filter list based on the provided list of comma-separated column names.
  - **dynamicListPrefilterValue** Pre-filter list based on the provided list of comma-separated values for the column names. Any values that contain a comma (`,`) should be wrapped in URL-encoded double quotes (`%22`).
  - **dynamicListPrefilterLogic** Pre-filter list based on the provided list of comma-separated logic operators to be applied on the columns and values. The valid operators are:

| Operator | URL encoded operator | Description |
| -- | -- | -- |
| `==` | `%3D%3D` | Equals |
| `!=` | `%21%3D` |Not equal |
| `>` | `%3E` | Greater than |
| `>=` | `%3E%3D` | Greater than or equal |
| `<` | `%3C` | Less than |
| `<=` | `%3C%3D` | Less than or equal |
| `contains` | `contains` | Contains |
| `notcontain` | `notcontain` | Not contain |
| `oneof` | `oneof` | Is one of |
| `between` | `between` | Is between |
| `regex` | `regex` | RegExp |

### Contains vs Is one of

The **Contains** and **Is one of** operators could often be confused with one another. See the table below for some explanations on what each of them is suitable for.

| Logic | Data source value | Comparison | Sample scenario |
| -- | -- | -- | -- |
| **Contains** (for arrays)<br><br>*Data contains the comparison value (many-to-1)* | ["**Project Management**", "Security"] | "**Project Management**" | Show any employees where their list of expertise contains "Project Management". |
| **Contains** (for strings)<br><br>*Data contains the comparison value (substring)* | "**SW3** 8UE" | "**SW3**" | Show any employees where their postcode contains "SW3". |
| **Is one of**<br><br>*Data is one of the comparison values (1-to-many)* | "**London**" | ["**London**", "Paris"] | Show any employees where their office location is either "London" or "Paris". |
| **Is one of**<br><br>*Data contains one of the comparison values (many-to-many)* | ["Sales", "**Finance**"] | ["Project Management", "**Finance**"] | Show any employees where their list of expertise contains either "Project Management" or "Finance". |

### Examples

#### Open entry with ID 123

```
dynamicListOpenId=123
```

#### Execute a search with the search term "hello"

```
dynamicListSearchValue=hello
```

#### Apply in-app sorting based on the last name

```
dynamicListSortColumn=Last%20Name&dynamicListSortOrder=asc
```

#### Render with an in-app filter and hide the filter bar

```
dynamicListFilterValue=England,Monthly&dynamicListFilterHideControls=true
```

#### Apply in-app filters based on different Status and Office fields

```
dynamicListFilterColumn=Status,Office&dynamicListFilterValue=[Approved,Waitlisted],London
```

#### Apply in-app filters based on dates

```
dynamicListFilterColumn=Publish%20date&dynamicListFilterValue=2022-02-01..2022-03-01
```

#### Load only data where the name contains John and the age is less than 29

```
dynamicListPrefilterColumn=Name,Age&dynamicListPrefilterValue=John,29&dynamicListPrefilterLogic=contains,%3C
```

#### Load only data with the category is either Fruit or Vegetable

```
dynamicListPrefilterColumn=Category&dynamicListPrefilterValue=[Fruit,Vegetable]&dynamicListPrefilterLogic=oneof
```

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
