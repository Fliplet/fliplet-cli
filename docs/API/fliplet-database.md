# Database JS APIs

The following JS API is primarily used by `Fliplet.DataSources` and it's meant to be used as a very low-level library to read and query JSON data from a file.

## Opening a local JSON file as a database

```js
Fliplet.Database('dataSources.db').then(function (db) {
  return db.dataSource(2).find();
}).then(function (results) {

});
```

The JSON file must declare keys for each collection (or dataSource):

```json
{
    "1": [ { "id": 123, "name": "John" }, { "id": 456, "name": "Emma" } ],
    "2": [ { "id": 789, "name": "Alex" }, { "id": 912, "name": "Nick" } ]
}
```

The `db` object exposes a `dataSource()` public method which requires a valid top-level key from the JSON.

The latter method returns an object with two public methods:

- `find(query)` Returns an array of results. Query using [Sift.js](https://github.com/Fliplet/sift.js) operators.
- `findById(id)` Returns a single record by its ID

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}