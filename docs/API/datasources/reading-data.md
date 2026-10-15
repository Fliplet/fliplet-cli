---
title: Reading Data Source records
description: "Read records, filter and sort queries, paginate with cursors, and retrieve distinct column values with Fliplet.DataSources."
type: api-reference
tags: [js-api, datasources, query]
v3_relevant: true
deprecated: false
---
# Reading Data Source records

A Data Source connection reads records with `find`, `query`, `findOne` and `findById`. Query options control filtering and result shape; source permissions and [security rules](security-rules) control access.

The examples use an existing source with numeric ID `123`. Replace this ID with the source attached to the app. Online calls can reject for inaccessible sources, invalid input, access rules or transport failures. Studio sample data is not evidence that app-user access works; verify in [preview with security enabled](testing-security).

## Record shape

Normal query results are arrays of records with `id` and `data`. Metadata such as `order`, `createdAt` and `updatedAt` may also be present. Aggregation can change this shape.

```js
// Example record, not an insert payload
const record = { id: 41, data: { Name: 'Mina', Department: 'Design', Score: 86 } };
console.log(record.id, record.data.Name);
```

## find and query

`connection.find(query?, options?)` returns a Promise. `connection.query(query?, options?)` is an alias with the same arguments. Both default their arguments to `{}`. For online query updates and deletion, see [writing records](writing-data).

| Query property | Type / default | Behavior |
|---|---|---|
| `where` | Object; omitted | Filters fields within `record.data`; see [query operators](query-operators). An omitted filter selects all accessible records. |
| `id`, `createdAt`, `updatedAt` | Number/date or query object; omitted | Online filters on record metadata, outside `where`. For incremental reads, `updatedAt` can also return deleted-entry metadata in an object response. Not applied by native local reads. |
| `dataSourceEntryId` | Number; omitted | Online filter on the record's metadata ID. `where: { id: ... }` instead filters a data column named `id`. |
| `type` | String; omitted | Omitted or `select` reads records. Online `update` and `delete` are writes; see [writing records](writing-data). Native local reads do not implement the online query-update path. |
| `data` | Object; omitted | Patch for online `type: 'update'`. Do not supply this for ordinary reads. |
| `attributes` | String[]; omitted | Returns the listed data fields, subject to security field restrictions. Does not change metadata ID. |
| `limit` | Number; omitted | Maximum records. Supply a positive integer; `0` is treated as omitted rather than an empty page. Online negative or nonnumeric values reject; fractions are rounded down. |
| `offset` | Number; omitted | Skip records. Use a nonnegative integer; online negative or nonnumeric values reject. |
| `order` | Array of pairs; online default `[['order', 'ASC'], ['id', 'DESC']]` | See [sorting](#sorting-and-ordering). Native local queries do not apply the same online ordering pipeline. |
| `includePagination` | Boolean; omitted | Online literal `true` returns the root response with `entries` and `pagination`. Native local reads still return an array. |
| `distinct` | String; omitted | Online retains the first row for each value of the named data column, after pagination. Other fields come from that row. Not applied by native local reads. |
| `views` | String[]; omitted | Requests named [views](views); use this plural array form. Views do not replace security rules. |
| `join` | Object; omitted | Named [joins](joins). Online and native implementations differ; verify the target platform. |
| `aggregate` | Array; omitted | Mingo aggregation pipeline applied to records. Stage paths refer to record properties such as `data.Score`. Native execution requires Mingo to be loaded. |

| Request option | Type / default | Behavior |
|---|---|---|
| `cache` | API cache option; omitted | Forwarded to the online API request; use `false` when fresh verification is needed. Native reads use the loaded local database. |
| `authenticate` | Boolean; true when `Fliplet.Page` exists | Applies SDK entry authentication in supported paths. This is not a switch for server security enforcement. Delete queries turn it off. |
| `returnAsObject` | Boolean; omitted | Online returns `{ entries, deletedEntries }`, taking precedence over `includePagination`. Native reads still return an array. |
| `ack` | Boolean; omitted | Relevant to query deletion and native reconciliation; see [writing records](writing-data). |

```js
const connection = await Fliplet.DataSources.connect(123);
const records = await connection.find({
  where: { Department: 'Design', Score: { $gte: 80 } },
  attributes: ['Name', 'Score'],
  limit: 20,
  order: [['data.Score', 'DESC']]
}, { cache: false });
records.forEach(function(record) { console.log(record.id, record.data.Name); });
```

### Pagination results

Online `includePagination: true` returns `{ entries, dataSourceId, count, source, pagination, indexes, deletedEntries }`. Some optional properties may be absent. `count` is the returned array length. `pagination` contains `total`, `limit` and `offset`; omitted limits/offsets may be absent. `total` is calculated before distinct and required-join filtering, so it can exceed the final returned record count.

```js
const page = await connection.find({ limit: 20, offset: 0, includePagination: true });
console.log(page.entries.length, page.pagination.total);
```

Do not combine this envelope with `findOne` or `findWithCursor`, which expect array-producing queries. `returnAsObject` produces a different envelope without pagination metadata.

## findOne

`connection.findOne(query?, options?)` sets `query.limit` to `1` and resolves the first record or `undefined`. It modifies the supplied query object. With online `returnAsObject: true`, it resolves `{ entries: recordOrUndefined, deletedEntries }`; `entries` is a single record here, not an array. Avoid combining `returnAsObject` with native local reads.

```js
const record = await connection.findOne({ where: { Email: 'mina@example.com' } });
if (record) { console.log(record.id, record.data.Email); }
```

## findById

`connection.findById(id)` resolves a single record. Online missing records reject with a 404 response and invalid IDs reject with a 400 response. Native local lookup can resolve `undefined`. The authenticated `session` identifier is reserved for session lookup; use numeric record IDs for ordinary reads. This method has no second request-options argument.

```js
try {
  const record = await connection.findById(41);
  if (record) { console.log(record.data.Name); }
} catch (error) {
  // Handle missing, denied or failed online requests in the app UI.
  console.error(error);
}
```

## Sorting and ordering

Top-level `order` is an array of `[column, direction]` pairs. Metadata columns are `id`, `order`, `createdAt`, `deletedAt` and `updatedAt`. Data columns use a `data.` prefix and must exist on the source. Use `ASC` or `DESC`; online data-column directions are normalized to uppercase and reject other values. Data-column numeric-looking values are sorted numerically, while other values use text ordering. A join's `order` instead takes one flat pair.

```js
const records = await connection.find({
  order: [['data.Department', 'ASC'], ['data.Score', 'DESC']]
});
```

## findWithCursor

`connection.findWithCursor(query?, options?)` resolves an array with cursor properties and methods after fetching its first page. Supply a positive integer `limit` and an array-producing query. Cursor movement changes the query synchronously; `update()` performs the next read.

| Cursor member | Behavior |
|---|---|
| `query` | Mutable query; pagination is `cursor.query.limit` / `cursor.query.offset`, not `cursor.limit` / `cursor.offset`. |
| `currentPage` | Zero-based page index, initially `0`. |
| `isFirstPage`, `isLastPage` | Flags updated during movement/fetch. Last-page detection fetches one extra record. |
| `firstRecordInNextPage` | Extra fetched record when another page exists; otherwise undefined. |
| `idSet`, `containsId(id)` | Set of fetched IDs and membership check. |
| `next()`, `prev()`, `setPage(page)` | Mutate page/offset and return the cursor. They do not fetch. Negative page/offset is clamped to zero. |
| `update({ keepExisting? })` | Promise resolving the cursor. Default replaces its rows and ID set. `keepExisting: true` appends rows without deduplicating overlapping pages. |

```js
const cursor = await connection.findWithCursor({
  limit: 20, order: [['id', 'ASC']]
});
console.log(cursor.length, cursor.query.offset);
if (!cursor.isLastPage) {
  await cursor.next().update();
  console.log(cursor.currentPage, cursor.map(function(record) { return record.id; }));
}
```

## Column indexes

`connection.getIndex(column)` resolves an array of distinct values. `connection.getIndexes(columns)` resolves an object mapping each requested column to its values. These source-wide lookups do not accept the `where`, views, pagination or request options of `find`; do not use them to infer the values visible to a filtered user. Verify returned values separately when configuring security.

| Argument | Type | Required |
|---|---|---|
| `column` | String | Yes for `getIndex`. |
| `columns` | String[] | Yes for `getIndexes`; use a nonempty array. |

Online values are extracted as text, with missing/null values represented as `null`; for example numeric `12` can return `'12'`. When the source declares columns, requesting an undeclared column rejects with a 400 response. Native indexes may use precomputed values or scan local rows; computed native indexes skip falsy values, including `false`, `0` and `''`. See [offline database](offline-database).

```js
const departments = await connection.getIndex('Department');
const indexes = await connection.getIndexes(['Department', 'Status']);
console.log(departments, indexes.Department, indexes.Status);
```

## Aggregation

Aggregation operates on records, so field paths include `data.`. The result follows the supplied pipeline rather than guaranteeing `{ id, data }` records. Invalid pipelines can reject the query.

```js
const summary = await connection.find({
  aggregate: [
    { $group: { _id: '$data.Department', count: { $sum: 1 } } }
  ]
});
console.log(summary); // [{ _id: 'Design', count: ... }, ...]
```

[Data Sources API](../fliplet-datasources)
