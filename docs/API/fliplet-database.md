# `Fliplet.Database`

Low-level helper for reading and querying JSON data from a local file as a database; used internally by Fliplet.DataSources.

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