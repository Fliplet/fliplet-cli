# Data Sources JS APIs

The Data Source JS APIs allows you to interact and make any sort of change to your app's Data Sources from the app itself.

The `fliplet-datasources` package contains the following namespaces:


- [Data Sources JS APIs](#data-sources-js-apis)
  - [Data Sources](#data-sources)
    - [Get the list of data sources for the current organization](#get-the-list-of-data-sources-for-the-current-organization)
    - [Get the list of data sources in use by the current app](#get-the-list-of-data-sources-in-use-by-the-current-app)
    - [Get a data source by ID](#get-a-data-source-by-id)
    - [Create a new data source](#create-a-new-data-source)
    - [Connect to a data source by ID](#connect-to-a-data-source-by-id)
    - [Connect to a data source by Name](#connect-to-a-data-source-by-name)
  - [Connection instance methods](#connection-instance-methods)
    - [Fetch records from a data source](#fetch-records-from-a-data-source)
      - [Fetch all records](#fetch-all-records)
      - [Fetch records with a query](#fetch-records-with-a-query)
      - [Filter the columns returned when finding records](#filter-the-columns-returned-when-finding-records)
      - [Fetch records with pagination](#fetch-records-with-pagination)
      - [Fetch records with a pagination cursor](#fetch-records-with-a-pagination-cursor)
      - [Join data from other dataSources](#join-data-from-other-datasources)
      - [Run aggregation queries](#run-aggregation-queries)
      - [Subscribe to data changes](#subscribe-to-data-changes)
    - [Sort / order the results](#sort--order-the-results)
    - [Find a specific record](#find-a-specific-record)
    - [Find a record by its ID](#find-a-record-by-its-id)
    - [Replace the contents of the data source with new records](#replace-the-contents-of-the-data-source-with-new-records)
    - [Insert an array of new records into a data source](#insert-an-array-of-new-records-into-a-data-source)
    - [Commit changes at once to a data source](#commit-changes-at-once-to-a-data-source)
    - [Insert a single record into the data source](#insert-a-single-record-into-the-data-source)
      - [**Options: folderId**](#options-folderid)
      - [**Options: ack**](#options-ack)
    - [Update a record (entry)](#update-a-record-entry)
    - [Import a file into the data sources](#import-a-file-into-the-data-sources)
    - [Remove a record by its ID](#remove-a-record-by-its-id)
    - [Remove entries matching a query](#remove-entries-matching-a-query)
    - [Get unique values for a column](#get-unique-values-for-a-column)
    - [Get unique values for multiple columns at once](#get-unique-values-for-multiple-columns-at-once)
  - [Define views to filter a data source](#define-views-to-filter-a-data-source)
  - [Configurable operations](#configurable-operations)
    - [Automatically generate a unique ID for your entries](#automatically-generate-a-unique-id-for-your-entries)

---

## Data Sources

### Get the list of data sources for the current organization

Use the `get` function to fetch the list of data sources for the current organization. You can optionally pass a list of `attributes` to return.

```js
Fliplet.DataSources.get({ attributes: ['id', 'name'] }).then(function (dataSources) {
  // dataSources is an array of data sources
});
```

### Get the list of data sources in use by the current app

Use the `appId` and `includeInUse` options together to get the list of data sources owned or in use by the current app.

```js
Fliplet.DataSources.get({
  appId: Fliplet.Env.get('masterAppId'),
  includeInUse: true
}).then(function (dataSources) {
 // dataSources is an array of data sources in use by the current app
});
```

### Get a data source by ID

Use the `getById` function to fetch details about a data source by its ID. You can optionally pass a list of `attributes` to return.

```js
Fliplet.DataSources.getById(123, {
  attributes: ['name', 'hooks', 'columns']
}).then(function (dataSource) {

});
```

### Create a new data source

Use the `create` function to programmatically create a new data source.

```js
Fliplet.DataSources.create({ name: 'foo' }).then(function (dataSource) {
  // The data source has been created
});
```

If you don't want your data source to be displayed in the **Data Source Manager** in Fliplet Studio (available under the "App data" menu in the top header), simply add a specific `type` to it when it's being created, e.g. `type: 'comments'`.

The following example creates a data source with 2 columns and 2 entries. It also attaches the data source to the current app and organization.

```js
Fliplet.DataSources.create({
  name: 'foo',

  // Optionally attach the data source to a specific app or organization
  appId: Fliplet.Env.get('appId'),
  organizationId: Fliplet.Env.get('organizationId'),

  // Define a type (String) to avoid showing the data source in the data source manager
  type: null,

  // Define the columns for the data source
  columns: ['Email' ,'Name'],

  // Optionally define the initial data source entries to create for the data source
  entries: [
    {
      Name: 'John Doe',
      Email: 'johndoe@example.com'
    },
    {
      Name: 'Jane Doe',
      Email: 'janedoe@example.com'
    }
  ],

  // Optionally define access rules
  accessRules: [
    { type: ['select', 'insert', 'update', 'delete'], allow: 'all' }
  ]
}).then(function (dataSource) {
  // The data source has been created
});
```

### Connect to a data source by ID

```js
Fliplet.DataSources.connect(dataSourceId).then(function (connection) {
  // check below for the list of instance methods for the connection object
});
```

Fliplet apps on mobile devices attempt to connect to the **offline bundled data sources by default**. You can optionally prevent a data source from being bundled by editing its settings in Fliplet Studio, but this can also be custom coded when connecting to the data source.

Providing the `offline: false` parameter instructs the JS API to only connect to the live online data source to Fliplet APIs:

```js
// Advanced connection passing options as second parameter
Fliplet.DataSources.connect(dataSourceId, {
  offline: false // disable querying offline on mobile devices
}).then(function (connection) {
  // check below for the list of instance methods for the connection object
});
```

Once you get a **connection**, you can use the instance methods described below to **find, insert, update and delete data source entries**.

### Connect to a data source by Name

You can also connect to a datas ource by its name (case-sensitive) using the `connectByName` method.

```js
Fliplet.DataSources.connectByName("Attendees").then(function (connection) {
  // check below for the list of instance methods for the connection object
});
```

---

## Connection instance methods

### Fetch records from a data source

#### Fetch all records

```js
// use "find" with no options to get all entries
connection.find().then(function (records) {
  // records is an array
});
```

#### Fetch records with a query

Querying options are based on the [Sift.js](https://github.com/Fliplet/sift.js) operators, which mimic MongoDB querying operators. Here are the supported operators from Sift.js:

  - `$in`, `$nin`, `$exists`, `$gte`, `$gt`, `$lte`, `$lt`, `$eq`, `$ne`, `$iLike`, `$mod`, `$all`, `$and`, `$or`, `$nor`, `$not`, `$size`, `$type`, `$regex`, `$elemMatch`

The following operators and values are optimized to perform better with Fliplet's database.

  - Operators: `$or`, `$and`, `$gte`, `$lte`, `$gt`, `$lt`, `$eq`
  - Values: strings and numbers

Fliplet also supports a custom `$filters` operator with some unique conditional logic such as case-insensitive match or date & time comparison. See example below.

A few examples to get you started:

```js
// Find records where column "sum" is greater than 10 and column "name"
// is either "Nick" or "Tony"
connection.find({
  where: {
    sum: { $gt: 10 },
    name: { $in: ['Nick', 'Tony'] }
  }
});

// Find a case insensitive and partial match to the "Email" column. For e.g. it will match with bobsmith@email.com or Bobsmith@email.com or smith@email.com
connection.find({
  where: {
    Email: { $iLike: 'BobSmith@email.com' }
  }
});

// Find records where column "email" matches the domain "example.org"
connection.find({
  where: {
    email: { $regex: /example\.org$/i }
  }
});

// Nested queries using the $or operator: find records where either "name" is "Nick"
// or "address" is "UK" and "name" is "Tony"
connection.find({
  where: {
    $or: [
      { name: 'Nick' },
      { address: 'UK', name: 'Tony' }
    ]
  }
});

// Find records where the column "country" is not "Germany" or "France"
// and "createdAt" is on or after a specific date
connection.find({
  where: {
    country: { $nin: ['Germany', 'France'] },
    createdAt: { $gte: '2018-03-20' }
  }
});

// Use Fliplet's custom $filters operator
// The "==" and "contains" conditions are optimized to perform better with Fliplet's database
connection.find({
  where: {
    // Find entries that match ALL of the following conditions
    $filters: [
      // Find entries with a case insensitive match on the column
      {
        column: 'Email',
        condition: '==',
        value: 'user@email.com'
      },
      // Find entries where the column does not match the value
      {
        column: 'Email',
        condition: '!=',
        value: 'user@email.com'
      },
      // Find entries where the column is greater than the value
      {
        column: 'Size',
        condition: '>',
        value: 10
      },
      // Find entries where the column is greater than or equal to the value
      {
        column: 'Size',
        condition: '>=',
        value: 10
      },
      // Find entries where the column is less than the value
      {
        column: 'Size',
        condition: '<',
        value: 10
      },
      // Find entries where the column is less than or equal to the value
      {
        column: 'Size',
        condition: '<=',
        value: 10
      },
      // Find entries with a case insensitive partial match on the column
      {
        column: 'Email',
        condition: 'contains',
        value: '@email.com'
      },
      // Find entries where the column is empty based on _.isEmpty()
      {
        column: 'Tags',
        condition: 'empty'
      },
      // Find entries where the column is not empty based on _.isEmpty()
      {
        column: 'Tags',
        condition: 'notempty'
      },
      // Find entries where the column is in between 2 numeric values (inclusive)
      {
        column: 'Size',
        condition: 'between',
        value: {
          from: 10,
          to: 20
        }
      },
      // Find entries where the column is one of the values
      {
        column: 'Category',
        condition: 'oneof',
        // value can also be a CSV string
        value: ['News', 'Tutorial']
      },
      // Find entries where the column matches a date comparison
      {
        column: 'Birthday',
        // Use dateis, datebefore or dateafter to match
        // dates before and after the comparison value
        condition: 'dateis',
        value: '1978-04-30'
        // Optionally provide a unit of comparison:
        //  - year
        //  - quarter
        //  - month
        //  - week
        //  - day
        //  - hour
        //  - minute
        //  - second
        // unit: 'month'
      },
      // Find entries where the column is before the a certain time of the day
      {
        column: 'Start time',
        condition: 'datebefore',
        value: '17:30'
      },
      // Find entries where the column is after a timestamp
      {
        column: 'Birthday',
        condition: 'dateafter',
        // Provide a full timestamp for comparison in YYYY-MM-DD HH:mm format
        value: '2020-03-10 13:03'
      },
      // Find entries where the column is between 2 dates (inclusive)
      {
        column: 'Birthday',
        condition: 'datebetween',
        from: {
          value: '1978-01-01'
        },
        to: {
          value: '1978-12-31'
        }
      }
    ]
  }
});
```

#### Filter the columns returned when finding records

Use the `attributes` array to optionally define a list of the columns that should be returned for the records.

```js
// use "find" with "attributes" to filter the columns returned
connection.find({ attributes: ['Foo', 'Bar'] }).then(function (records) {
  // records is an array
});
```

You can also use this by passing an empty array as an efficient method to count the number of entries without requesting much data from the server:

```js
connection.find({ attributes: [] }).then(function (records) {
  // use records.length as the number of records
});
```

#### Fetch records with pagination

You can use the `limit` and `offset` parameters to filter down the returned entries to a specific chunk (page) of the Data Source.

```js
// use limit and offset for pagination
connection.find({
  limit: 50,
  offset: 10
});
```

Full example:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  return connection.find({ limit: 1000 }).then(function (results) {

  });
});
```

Moreover, the `includePagination` parameter enables the response to return the count of total entries in the Data Source:

```js
connection.find({
  limit: 50,
  offset: 10,
  includePagination: true
}).then(function (response) {
  // response.entries []
  // response.pagination = { total, limit, offset }
});
```

Note that when using the above parameter, the returned object from the `find()` method changes from an array of records to an object with the following structure:

```json
{
  "entries": [],
  "dataSourceId": 123456,
  "count": 50,
  "pagination": {
    "total": 1000,
    "limit": 50,
    "offset": 10
  }
}
```

---

#### Fetch records with a pagination cursor

A more powerful alternative to the `find` method is `findWithCursor`, which creates an array cursor with methods to navigate between pages of the dataset. This is useful if you want to add pagination to a Data Source. Start by creating a cursor with the `findWithCursor` method:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  return connection.findWithCursor({ limit: 20 }); // 20 records per page
}).then(function (cursor) {

});
```

The cursor is an array with the results. It also supports the following properties, which can be overridden at any time:

- `limit`: The page size (number of records per page).
- `offset`: The current offset of records from the first page. This is 0 for the first page.
- `currentPage`: The current page number (`0` for the first page)
- `isFirstPage` Whether the current page is the first one of the dataset.
- `isLastPage`: Whether the current page is the last one of the dataset.
- `query`: The options used for the first argument of the `findWithCursor` method.

The cursor also exports the following methods:

- `next()`: Moves the cursor to the next page and returns it.
- `prev()`: Moves the cursor to the previous page and returns it.
- `setPage(n)`: Sets the cursor to a specific page number and returns it.
- `update()`: Updates the dataset for the current page (returns a `Promise`)

Here's a full example on how you would typically use the cursor:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  return connection.findWithCursor({
    where: { Office: 'London' }, // find specific entries
    limit: 20                    // limit to 20 records per page
  });
}).then(function (cursor) {
  displayData(cursor);

  // Moves the cursor to the first page, then fetch and display the new data
  $('#prev').click((e) => cursor.prev().update().then(displayData));

  // Moves the cursor to the next page, then fetch and display the new data
  $('#next').click((e) => cursor.next().update().then(displayData));
});

function displayData(cursor) {
  cursor.forEach((entry) => {
    // Display data
  });

  if (cursor.isFirstPage) {
    // Disable "previous" button
  } else if (cursor.isLastPage) {
    // Disable "next" button
  }
}
```

---

#### Join data from other dataSources

[View documentation for joining data from other data sources](datasources/joins.md)

---

#### Run aggregation queries

You can use the built-in [Mingo](https://github.com/kofrasa/mingo) library to run complex aggregation queries or projections on top of Data Sources. Mingo operations can be provided to the `find` method via the `aggregate` attribute:

```js
// This example groups records by values found on a sample column "myColumnName"
// and counts the matches for each value
connection.find({
  aggregate: [
    {
      $project: {
        numericData: { $convertToNumber: $data.myColumnName }
      }
    },
    {
      $group: {
        _id: '$numericData',
        avg: { $avg: $numericData }
      }
    }
  ]
});
```
The version of Mingo we have used does not automatically typecast strings to numbers. Therefore, we have added our own custom operator ($convertToNumber) to type cast to a number before performing aggregation. To use this custom operator, please refer to above snippet.

Please refer to the [Mingo](https://github.com/kofrasa/mingo) documentation to read more about all the different usages and types of aggregation queries.

---

#### Subscribe to data changes

The `subscribe()` method allows for listening to real-time updates on data source changes. This can be crucial for applications that need to react instantly to changes in data, such as collaborative platforms, live dashboards, or any application requiring instant data sync.

**Usage**

```js
connection.subscribe(options, callback);
```

**Parameters**

- `options` (Object) Configuration for subscription.
  - `events` (Array of String) Types of changes to subscribe to. Possible values are `insert`, `update`, `delete`. Default: `['insert', 'update', 'delete']`.
  - `cursor` (Cursor Object) An optional cursor object as received from the `findWithCursor` method to specify the scope of data to listen to.
- `callback` (Function) A function that will be called whenever the subscribed events occur. The function receives an object containing arrays of `inserted`, `updated`, and `deleted` items depending on the subscribed events.

**Returns**

- `subscription` (Object) Subscription object.
  - `id` (Number) Unique ID of the subscription.
  - `options` (Object) Options used to set up the subscription.
  - `status` (Function) Status of subscription. Returns `active` or `paused`.
  - `unsubscribe` (Function) Unsubscribe from the data changes.
  - `pause` (Function) Pause the subscription and set the status to `paused`.
  - `resume` (Function) Resume the subscription and set the status to `active`.
  - `updateOptions` (Function(`options`)) Update the subscription options.
  - `isInScope` (Function(`entry`)) Checks if an entry is within the scope of the subscription. Returns `true` or `false`.

**Example**

This example demonstrates how to subscribe to insert and update events on a data source:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  var options = {
    events: ['insert', 'update'] // Assuming a cursor setup
  };

  var subscription = connection.subscribe(options, function (changes) {
    if (changes.inserted.length) {
      console.log('New records:', changes.inserted);
    }

    if (changes.updated.length) {
      console.log('Updated records:', changes.updated);
    }
  });

  console.log(subscription.status()); // active
});
```

In this example, `connection.subscribe()` is used to monitor for new inserts and updates. When changes are detected, the callback function processes the arrays of `inserted` and `updated` data to handle them appropriately, such as updating a UI element or triggering further actions.

### Sort / order the results

Use the `order` array of arrays to specify the sorting order for the returned entries.

You can order by:
- Fliplet columns: `id`, `order`, `createdAt`, `deletedAt`, `updatedAt`
- Entry columns, using the `data.` prefix (e.g. `data.Email`)

The order direction is either `ASC` for ascending ordering or `DESC` for descending ordering.

The `order` array accepts a list of arrays, where each includes the column and sorting order:

```js
// Sort records by their created time (first records are newer)
connection.find({
  where: { Office: 'London' },
  order: [
    ['createdAt', 'DESC']
  ]
}).then(function (records) {
  // ...
});

// Sort records alphabetically by their last name first and then first name
connection.find({
  where: { Office: 'London' },
  order: [
    ['data.LastName', 'ASC'],
    ['data.FirstName', 'ASC']
  ]
}).then(function (records) {
  // ...
});
```

### Find a specific record

The `findOne` method allows you to look for up to one record, limiting the amount of entries returned if you're only looking for one specific entry.

```js
connection.findOne({
  where: { name: 'John' }
}).then(function (record) {
  // record is either the found entry "object" or "undefined"
});
```

### Find a record by its ID

This is a code snippet for finding a record in a specific Data Source by its ID.

The `findById()` method accepts a single parameter, which is the ID of the entry to search for in the Data Source. Once the entry has been found, it will be returned as a record object in the response, and the code inside the promise callback function will be executed.

```js
connection.findById(1).then(function (record) {
  // records is the found object
});
```

### Replace the contents of the data source with new records

```js
connection.replaceWith([
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob', email: 'bob@example.org' }
]).then(function onComplete() {

});
```

### Insert an array of new records into a data source

```js
connection.append([
  { id: 3, name: 'Nick' },
  { id: 4, name: 'Ian', email: 'ian@example.org' }
]).then(function onComplete() {

});
```

Using `connection.append(entriesArray)` also triggers "**insert** "hooks for each created entry. This can be turned off (it defaults to `true` via the options second parameter) as follows:

```js
connection.append([{ name: 'Nick' }], { runHooks: false })
```

### Commit changes at once to a data source

Use `connection.commit(Array)` to commit more than one change at once to a data source. You can use this to insert, update and delete entries at the same time with a single request. This makes it very efficient in terms of both minimizing the network requests and computation required from both sides.

List of input parameters:
  - `entries`: (required array): the list of entries to insert or update (`{ data }` for insert and `{ id, data }` for updates).
  - `append`: (optional boolean, defaults to false): set to `true` to keep existing remote entries not sent in the updates to be made. When this is set to `false` you will essentially be replacing the whole data source with just the data you are sending.
  - `delete`: (optional array): the list of entry IDs to remove (when used in combination with `append: true`).
  - `extend` (optional boolean, defaults to false): set to `true` to enable merging the local columns you are sending with any existing columns for the affected data source entries.
  - `runHooks` (optional array) the list of hooks (`insert` or `update`) to run on the data source during the operation.
  - `returnEntries` (optional boolean, defaults to true): set to `false` to stop the API from returning all the entries in the data source

The following sample request applies the following changes to the data source:
  - inserts a new entry
  - updates the entry with ID 123 merging its data with the new added column(s)
  - deletes the entry with ID 456

```js
connection.commit({
  entries: [
    // Insert a new entry
    { data: { foo: 'bar' } },

    // Update the entry with ID 123
    { id: 123, data: { foo: 'barbaz' } }
  ],

  // Delete the entry with ID 456
  delete: [456],

  // Ensure existing entries are unaffected
  append: true,

  // Keep remote columns not sent with
  // the updates of entry ID 123
  extend: true,

  // Do not return the whole data source after updating the data.
  // Keep this as "false" to speed up the response.
  returnEntries: false
});
```

---

### Insert a single record into the data source

To insert a record into a data source, use the `connection.insert` method by passing the data to be inserted as a **JSON** object or a **FormData** object.

```js
// Using a JSON object
connection.insert({
  id: 3,
  name: 'Bill'
});

// Using a FormData object
connection.insert(FormData);
```

**Note**: the `dataSourceId` and `dataSourceEntryId` are **reserved keys** and should not be used in the input JSON.

The second parameter of the `connection.insert` function accepts various options as described below:

  - [folderId](#options-folderid) (Number)
  - [ack](#options-ack) (Boolean)

#### **Options: folderId**

When `FormData` is used as first parameter, your record gets uploaded using a multipart request. If your FormData contains files, you can specify the **MediaFolder** where files should be stored to using the `folderId` parameter:

```js
connection.insert(FormData, {
  folderId: 123
});
```

#### **Options: ack**

If you want to make sure the local (offline) database on the device also gets updated as soon as the server receives your record you can use the `ack` (which abbreviates the word **acknowledge**) parameter:

```js
connection.insert({ foo: 'bar' }, {
  // this ensure the local database gets updated straight away, without
  // waiting for silent updates (which can take up to 30 seconds to be received).
  ack: true
});
```

---

### Update a record (entry)

Updating a data source entry is done via the `connection.insert` method by providing its ID and the update to be applied.

```js
connection.update(123, {
  name: 'Bill'
});
```

You can also pass a `FormData` object to upload files using a multipart request. When uploading files, you can also specify the MediaFolder where files should be stored to:

```js
connection.update(123, FormData, {
  mediaFolderId: 456
});
```

### Import a file into the data sources

```js
connection.import(FormData).then(function onSuccess() {});
```

### Remove a record by its ID

Use the `removeById` method to remove a entry from a data source given its ID.

```js
connection.removeById(1).then(function onRemove() {});
```
### Remove entries matching a query

Set `type` to `delete` and specify a where clause. This will query the data source and delete any matching entries.

```js
connection.query({
  type: 'delete',
  where: { Email: 'test@fliplet.com' }
});
```

### Get unique values for a column

Use the `getIndex` method to get unique values for a given column of the Data Source:

```js
connection.getIndex('name').then(function onSuccess(values) {
  // array of unique values
});
```

### Get unique values for multiple columns at once

Use the `getIndexes` method to get unique values for a given array of columns of the Data Source:

```js
connection.getIndexes(['name','email']).then(function onSuccess(values) {
  // an object having key representing each index and the value being the array of values
  // e.g. { name: ['a', 'b'], email: ['c', 'd'] }
});
```

---

## Define views to filter a data source

[View documentation on how to define views to filter data of a data source](datasources/views.md)
{: .buttons}

---

## Configurable operations

### Automatically generate a unique ID for your entries

You can instruct the system to automatically generate a [GUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) (also known as UUID) to all entries you insert by simply defining the `guid` key for a data source definition in Fliplet Studio (under the "App Data" section) and specifying the target column:

```json
{ "guid": "myPrimaryGuidColumn" }
```

When this is set, all entries will automatically get a random 36-characters GUID once they get saved in the data source.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
