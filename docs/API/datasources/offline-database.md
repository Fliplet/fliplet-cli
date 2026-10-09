---
title: Offline Data Source database
description: "Read and modify native bundled Data Sources with Database handles, local collection methods, views, indexes, and explicit persistence boundaries."
type: api-reference
tags: [js-api, datasources, offline, native]
v3_relevant: true
deprecated: false
---
# Offline Data Source database

`Fliplet.DataSources.Database` opens bundled Data Source data and returns local collection handles. Native collection writes change the local bundle; they do not make an online Data Source write or establish server authorization.

## Choose the correct API

Use [Data Source connections](../fliplet-datasources) for application reads and writes. Native connections integrate bundled reads and local acknowledgments with online operations. The lower-level `Database` API is for code that intentionally manages local bundle data.

A native bundle and `Fliplet.Native.Maintenance` must be available. Opening a database on web fetches bundle data, but local write methods still call native file APIs. A successful web read does not establish native filesystem or synchronization behavior. Native applications must verify file persistence, incremental delivery and recovery on their supported devices.

Offline data and cached-session views are not substitutes for [security-enabled online tests](testing-security).

## Open a bundled Data Source

`Fliplet.DataSources.Database(options)` returns `Promise<DatabaseHandle>`.

| Option | Type | Required | Behavior |
|---|---|---|---|
| `id` | Number or String | Yes when not supplying `name` | Data Source ID; a string name requires `isName: true`. |
| `isName` | Boolean | No | With a truthy value, resolves `name || id` from the app's bundled-source metadata. Use `true` for names. |
| `name` | String | No | Alternative name when `isName: true`; it takes precedence over `id`. |
| `appId` | Number | No | Defaults to the current app ID. Selects the native app data directory. |

The following native example assumes `Products` is bundled in the app. It reads without changing the bundle.

```js
const database = await Fliplet.DataSources.Database({
  id: 'Products',
  isName: true
});
const products = database.dataSource(null, { name: 'Products' });
const entries = await products.find({}, {});
for (const entry of entries) {
  console.log(entry.id, entry.data.Name);
}
```

An ID-based connection uses matching IDs at both stages:

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const entry = await products.findById(101);
if (entry) console.log(entry.data.Name);
```

The filename-string overload, such as `Database('dataSources.db')`, supports older multi-source bundles. It is a compatibility form used by the connection API. Prefer the ID/name options for dedicated bundles; do not assume a dedicated bundle includes other Data Sources.

There is no public close/dispose method on a database handle. Do not depend on repeated native opens avoiding file reads; use the handle you already opened for related operations.

## Select a collection

`database.dataSource(id, options?)` returns a collection handle synchronously.

| Argument | Type | Behavior |
|---|---|---|
| `id` | Number or numeric String | Selects a Data Source present in the loaded bundle. |
| `options.name` | String | Resolves the name within the loaded bundle's source descriptors instead of using the supplied ID. |

Selecting an unavailable source can throw synchronously. Choose a source actually present in the opened bundle and wrap selection as well as awaited operations in error handling.

Collection entries have metadata and a nested data object:

```js
const exampleEntry = { id: 101, data: { Name: 'USB-C hub', Category: 'Accessories', Price: 49.99 } };
```

## Read local entries

### `find(where, options)`

Returns `Promise<Array<Entry>>`. Both arguments should be supplied: use `{}` for an empty filter and `{}` for no options. Omitting `options` can throw synchronously.

`where` filters the entry's `data` fields using the local Sift matcher. This API does not inherit every online query option. It does not provide pagination counts, joins, online authorization or server-side sorting.

| Option | Type | Default | Behavior |
|---|---|---|---|
| `limit` | Number | No limit | A truthy value limits the matched entries. `0` does not limit results. |
| `views` | Array of strings | None | Applies matching named views before the filter. Multiple resolved view filters are combined with OR. |

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const affordableAccessories = await products.find({
  Category: 'Accessories',
  Price: { $lte: 50 }
}, { limit: 20 });
console.log(affordableAccessories.map(entry => entry.data.Name));
```

Views resolve values from cached Data Source session data and, when available, the device UUID. Unknown view names or missing view definitions can leave results unfiltered. Treat views as local display filtering, not as an access-control boundary. See [Data Source views](views).

### `findById(id)`

Returns `Promise<Entry | undefined>`. The filter addresses the entry's metadata `id`, not a column named `ID`.

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const product = await products.findById(101);
if (product) console.log(product.data.Name);
else console.log('Product is not in the local bundle.');
```

## Write the local bundle

Each method below changes in-memory data before writing the full JSON bundle to native storage. A file-write failure rejects the promise; it does not undo the earlier memory change. Local writes do not send server updates, validate server rules, or generate server IDs. Use [online writes](writing-data) when the server must persist the change.

| Method | Arguments | Resolved value |
|---|---|---|
| `insert(entry)` | Complete entry object, including its ID and `data` | The supplied entry object. |
| `update(existingEntry, patch)` | A fetched collection entry and a partial entry object | The supplied patch, not the complete merged entry. |
| `remove(entryOrPredicate)` | Entry object matched by `id`, or a function returning true for entries to remove | The supplied object or predicate function, not a list of removed entries. |

`update` deep-merges the patch into the existing entry in place. These operations are local bookkeeping; an ID supplied to `insert` does not reserve that ID on the server.

This example deliberately changes a local copy of an existing product. Verify device persistence before using this behavior in an application workflow.

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const product = await products.findById(101);
if (!product) throw new Error('Product 101 is missing from the local bundle.');

const patch = { data: { Price: 44.99 } };
const result = await products.update(product, patch);
console.log(result.data.Price);  // 44.99: result is the patch
console.log(product.data.Name); // Existing fields remain on the merged entry
```

For predicate removal, inspect the affected rows first:

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const discontinued = await products.find({ Status: 'Discontinued' }, {});
console.log('Local entries selected for removal:', discontinued.map(entry => entry.id));
// Run only when the application intends to remove these local entries:
// await products.remove(entry => entry.data.Status === 'Discontinued');
```

## Apply a server diff

`collection.applyDiff(diff)` returns `Promise<void>`. This method supports the native update pipeline; it is not an online write or a custom synchronization service.

| Field | Type | Behavior |
|---|---|---|
| `updated` | Array of entries | Required in incremental mode. Removes existing entries with the same IDs, then appends the supplied replacements. |
| `deleted` | Array of objects with `id` | Required in incremental mode. Removes matching IDs. |
| `fullRefresh` | Boolean | When truthy, replaces the collection with `updated` or an empty array if `updated` is absent. |

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
// Example diff for a disposable native fixture, not an online server write.
await products.applyDiff({
  updated: [{ id: 101, data: { Name: 'USB-C hub', Price: 49.99 } }],
  deleted: [{ id: 103 }]
});
```

A full refresh is destructive to local entries absent from the supplied array. Incremental replacements do not deep-merge old entry data.

## Read local indexes

`indexes(columns)` returns `Promise<Object>` mapping each requested column to unique values. `index(column)` returns `Promise<Array>` for one column.

Precomputed bundle indexes are used when present. Otherwise values are computed from the collection: array values are flattened, and falsy values such as `false`, `0`, `''`, `null` and `undefined` are omitted. A computed index is not a complete enumeration of all boolean or numeric values.

```js
const database = await Fliplet.DataSources.Database({ id: 42 });
const products = database.dataSource(42);
const categories = await products.index('Category');
console.log(categories); // Example: ['Accessories', 'Lighting']
const values = await products.indexes(['Category', 'Status']);
console.log(values.Category);
```

Empty collections, missing indexes and unavailable collection data can reject. A missing single-column index is not guaranteed to resolve to `[]`. Precomputed indexes are not recomputed by the mutation methods described above; do not assume they reflect a subsequent local edit.

## Errors and recovery

| Operation | Failure behavior |
|---|---|
| Open by name | Rejects when the name cannot be resolved from the app's bundled-source metadata. |
| Open native file | Rejects for missing data or invalid JSON, and propagates native read failures. |
| Select a collection | Can throw immediately if the source is absent from the loaded bundle. |
| Read/write invalid collection | Rejects when collection entries are unavailable. `find` can also throw when options are omitted. |
| Persist a local mutation | Rejects native write failures after the memory change. |
| Read an index | Rejects unavailable or empty index results as described above. |

Error messages are localized; do not match their English text for application control flow. When a local write fails, report the failure and reload authoritative data through the application's established update flow rather than treating the in-memory change as durable.

[Data Sources API](../fliplet-datasources) · [Subscriptions](subscriptions) · [Testing security](testing-security)
