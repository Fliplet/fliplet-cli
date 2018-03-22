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
Fliplet.DataSources.connect(1).then(function (connection) {
  return connection.find({ limit: 1000 });
}).then(function (records) {
  records.forEach(function (row) {
    // do something for each row, e.g. append it to a html tag
    $('.foo').append(row.data.bar)
  });
});
```

## Find specific records

```js
connection.find({
  where: { name: 'John' },
  limit: 1
}).then(function (records) {
  // records is an array
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