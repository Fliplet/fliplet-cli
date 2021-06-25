# Data Sources JS APIs

The Data Source JS APIs allows you to interact and make any sort of change to your app's Data Sources from the app itself.

The `fliplet-datasources` package contains the following namespaces:

- [Data Sources JS APIs](#data-sources-js-apis)
  - [Data Sources](#data-sources)
    - [Get the list of data sources for the current organization](#get-the-list-of-data-sources-for-the-current-organization)
    - [Create a new data source](#create-a-new-data-source)
    - [Connect to a data source by ID](#connect-to-a-data-source-by-id)
    - [Connect to a data source by Name](#connect-to-a-data-source-by-name)
  - [Connection instance methods](#connection-instance-methods)
    - [Fetch all records from a data source](#fetch-all-records-from-a-data-source)
    - [Find a specific record](#find-a-specific-record)
    - [Find a record by its ID](#find-a-record-by-its-id)
    - [Filter the columns returned when finding records](#filter-the-columns-returned-when-finding-records)
    - [Run aggregation queries](#run-aggregation-queries)
    - [Replace the contents of the data source with new records](#replace-the-contents-of-the-data-source-with-new-records)
    - [Insert an array of new records into a data source](#insert-an-array-of-new-records-into-a-data-source)
    - [Commit changes at once to a data source](#commit-changes-at-once-to-a-data-source)
    - [Insert a single record into the data source](#insert-a-single-record-into-the-data-source)
      - [**Options: folderId**](#options-folderid)
      - [**Options: ack**](#options-ack)
    - [Update a record (entry)](#update-a-record-entry)
    - [Import a file into the data sources](#import-a-file-into-the-data-sources)
    - [Remove a record by its ID](#remove-a-record-by-its-id)
  - [Join data from other dataSources](#join-data-from-other-datasources)
  - [Define views to filter a data source](#define-views-to-filter-a-data-source)
  - [Configurable operations](#configurable-operations)
    - [Automatically generate a unique ID for your entries](#automatically-generate-a-unique-id-for-your-entries)

---

## Data Sources

### Get the list of data sources for the current organization

```js
Fliplet.DataSources.get().then(function (dataSources) {});
```

### Create a new data source

Use the `create` function to programmatically create a new data source.

```js
Fliplet.DataSources.create({
  name: 'foo',
  organizationId: 1 // optional
}).then(function (dataSource) {
  // created
});
```

If you don't want your data source to be displayed in the **Data Source Manager** in Fliplet Studio (available under the "App data" menu in the top header), simply add a specific `type` to it when it's being created, e.g.:

```js
Fliplet.DataSources.create({
  name: 'foo',
  organizationId: 1,
  // Define a type to avoid showing the data source in the data source manager
  type: 'comments'
}).then(function (dataSource) {
  // created
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

### Fetch all records from a data source

```js
// use "find" with no options to get all entries
connection.find().then(function (records) {
  // records is an array
});
```

```js
// use limit and offset for pagination
connection.find({ limit: 50, offset: 10 }).then(function (records) {
  // records is an array
});
```

Full example:

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  return connection.find({ limit: 1000 });
}).then(function (records) {
  records.forEach(function (row) {
    // do something for each row, e.g. append it to a html tag
    $('.foo').append(row.data.bar)
  });
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

Querying options are based on the [Sift.js](https://github.com/Fliplet/sift.js) operators, which mimic MongoDB querying operators. Here's the supported operators:

- `$in`, `$nin`, `$exists`, `$gte`, `$gt`, `$lte`, `$lt`, `$eq`, `$ne`, `$mod`, `$all`, `$and`, `$or`, `$nor`, `$not`, `$size`, `$type`, `$regex`, `$elemMatch`

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

```

### Find a record by its ID

```js
connection.findById(1).then(function (record) {
  // records is the found object
});
```

### Filter the columns returned when finding records

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
  return records.length;
}).then(function (count) {
  // use count
});
```

### Run aggregation queries

You can use the built-in [Mingo](https://github.com/kofrasa/mingo) library to run complex aggregation queries or projections on top of Data Sources. Mingo operations can be provided to the `find` method via the `aggregate` attribute:

```js
// This example groups records by values found on a sample column "myColumnName"
// and counts the matches for each value
connection.find({
  aggregate: [
    {
      $group: {
        _id: '$data.myColumnName',
        count: { $sum: 1 }
      }
    }
  ]
}).then(function (records) {
  // user records as required
});
```

Please refer to the [Mingo](https://github.com/kofrasa/mingo) documentation to read more about all the different usages and types of aggregation queries.

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


The following sample request applies the following changes to the data source:
- inserts a new entry
- updates the entry with ID 123 merging its data with the new added column(s)
- deletes the entry with ID 456

```js
connection.commit({
  entries: [
    // insert a new entry
    { data: { foo: 'bar' } },

    // update the entry with ID 123
    { id: 123, data: { foo: 'barbaz' } }
  ],

  // delete the entry with ID 456
  delete: [456],

  // ensure existing entries are unaffected
  append: true,

  // keep remote columns not sent with
  // the updates of entry ID 123
  extend: true
])
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

---

## Join data from other dataSources

[View documentation on how to join data from other dataSources](datasources/joins.md)
{: .buttons}

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