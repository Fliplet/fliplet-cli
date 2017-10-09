# Fliplet DataSources JS APIs

The `fliplet-datasources` package contains the following namespaces:

- [Data Sources](#data-sources)

---

## Data Sources

### Get the list of data sources for the current organization

```js
Fliplet.DataSources.get().then(function (dataSources) {});
```

### Create a new data source

```js
Fliplet.DataSources.create({
  name: 'foo',
  organizationId: 1 // optional
}).then(function (dataSource) {
  // created
});
```

### Connect to a data source, given its ID

```js
// All options are optional
var options = {
  offline: true // By default on native platform it connects to offline DB. Set this option to false to connect to api's
}

Fliplet.DataSources.connect(dataSourceId, options).then(function (connection) {
  // check below for usages of the connection
});
```

Once you get a **connection**, you can use the following methods to **find, insert, update and delete data**.

## Fetch all records from a data source

```js
// user "find" with no options to get all entries
connection.find().then(function (records) {

});
```

Full example:

```js
Fliplet.DataSources.connect(1).then(function (connection) {
  return connection.find();
}).then(function (records) {
  records.forEach(function (row) {
    $('foo').append(row.data.bar)
  });
});
```

## Find for specific records

```js
connection.find({
  where: { name: 'John' }
}).then(function (records) {

});
```

### Query a data source

```js
// All options are optional
var options = {
  type: "select" // select(default)/update/delete
  where: { name: 'John' },
  attributes: ["name", "country"],
  dataSourceEntryId: 123
};

connection.query(options).then(function (records) {

});
```

### Find a record by its ID

```js
connection.findById(1).then(function (record) {

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

### Insert a single record into the data source

```js
connection.insert({
  id: 3,
  name: 'Bill'
});
```

You can also pass a `FormData` object to upload files using a multipart request. When uploading files, you can also specify the MediaFolder where files should be stored to:

```js
connection.insert(FormData, {
  mediaFolderId: 123
});
```

### Update a record

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

```js
connection.removeById(1).then(function onRemove() {});
```