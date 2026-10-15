---
title: Writing Data Source records
description: "Insert, update, delete and commit Data Source records with the correct input shapes, options, write outcomes and security limits."
type: api-reference
tags: [js-api, datasources, writes]
v3_relevant: true
deprecated: false
---
# Writing Data Source records

Data Source connections write individual records or batches. This reference describes request shapes, results and the difference between a server response, a queued submission and a native local change.

## Before you start

Load the [Data Sources library](../fliplet-datasources.md) and configure [access rules](../../Data-source-security.md) for the intended app identity. Use a disposable source for replacement and deletion examples. An administrative request or native cached result does not establish app-user authorization.

The examples use a source named **Equipment requests** with `Item`, `Quantity` and `Status` columns. Column names do not impose a typed schema. Read IDs from actual returned records rather than guessing them.

For a write that must receive an online server response, open the connection with `{ offline: false }`. Set `insert`'s separate `{ offline: false }` option to prevent a failed submission from being queued. Leave `update`'s `allowOffline` option false. A rejected request can still follow a server-side effect, so inspect persisted state before retrying a write.

```js
const requests = await Fliplet.DataSources.connectByName('Equipment requests', {
  offline: false
});

try {
  const created = await requests.insert({
    Item: 'Portable monitor',
    Quantity: 1,
    Status: 'Requested'
  }, { offline: false });

  if (!created || !created.id || !created.data) {
    throw new Error('The submission did not return a server record.');
  }

  const saved = await requests.findById(created.id);
  console.log('Persisted request:', saved.id, saved.data);
} catch (error) {
  console.error('Check the response and persisted state before retrying:', error);
}
```

The read-back requires read permission. A successful write can still be followed by a denied read; record those outcomes separately. For files, use the [attachment reference](file-attachments.md).

## Individual writes

### insert(data, options?)

`connection.insert(data, options?)` submits a new record. `data` is a flat object of column values or a `FormData` object for attachments. It is not a `{ data: ... }` record envelope. Missing/falsy `data` throws synchronously; validation and network failures occur asynchronously.

| Option | Type | Default | Behavior |
|---|---|---|---|
| `offline` | Boolean | Unspecified | `false` prevents queueing a failed submission. Other values allow the insertion queue where the input can be stored. This differs from the connection's native database option. |
| `ack` | Boolean | Unspecified | Attempts native local reconciliation after a server result. Native database connections also attempt reconciliation automatically. Single-write reconciliation requires a working native database connection; `ack: true` does not enable it on an `offline: false` connection. It does not establish server persistence. |
| `folderId` | Number | Unspecified | Target media folder for uploaded attachments. |
| `flUserToken` | String | Unspecified | Existing Fliplet user-token context forwarded with the request. It is not an app role or arbitrary identity claim. |
| `public` | Boolean | Unspecified | `true` requests a shared-content slug. Requires an app context and the appropriate shared-content configuration. It does not grant Data Source permissions. |
| `source` | String | Unspecified | Context forwarded to server hooks. It is caller-supplied, not trusted attribution. |

Possible resolved outcomes:

| Outcome | Shape or observation | Meaning |
|---|---|---|
| Online server record | `{ id, dataSourceId, data, ... }` | The server returned the saved entry. Fields can be transformed, excluded or redacted. |
| Native pending record | `{ id: 'temp_...', data, _pending: true, _tempId: 'temp_...', ... }` | A local optimistic entry awaits a server result and ID reconciliation. |
| Stored queued submission | Result of local queue storage; not guaranteed to contain `id` or `data` | The input was accepted locally after a failed send. It is not a saved server entry. |

Development sample mode returns the submitted flat data rather than a server entry. Do not use that mode to verify persistence or security.

### update(id, data, options?)

`connection.update(id, data, options?)` updates an existing record. Online single-record updates shallowly merge the submitted column values into stored `data`; omitted fields remain and `null` is a value. Nested objects are replaced as values rather than deeply merged.

| Argument or option | Type | Default | Behavior |
|---|---|---|---|
| `id` | Number or `'session'` | Required | Existing entry ID. `'session'` targets the authenticated row for this source when that login exists. |
| `data` | Object or FormData | Required | Flat column values or attachment input. |
| `allowOffline` | Boolean | False when omitted | Requests required-request handling and, on request failure, resolves an `{ id, dataSourceId, data, offline: true }` result instead of rejecting. It does not prove the server accepted the update. |
| `ack` | Boolean | Unspecified | Attempts local reconciliation only when native database support is active on the connection; also automatic for those connections. `ack: true` does not override `offline: false`. |
| `folderId` | Number | Unspecified | Media folder for attachments. |
| `public` | Boolean | Unspecified | `true` requests shared-content slug creation where supported. |
| `source` | String | Unspecified | Caller-supplied server-hook context. |

An ordinary online success resolves the server entry. Native reconciliation can return a local update result rather than the same complete envelope. Development sample mode resolves without a record. Read the saved entry separately when the complete persisted state matters.

```js
const requests = await Fliplet.DataSources.connectByName('Equipment requests', {
  offline: false
});
const pending = await requests.findOne({ where: { Status: 'Requested' } });

if (pending) {
  await requests.update(pending.id, { Status: 'Collected' });
  const saved = await requests.findById(pending.id);
  console.log('Stored status:', saved.data.Status);
}
```

Object update requirements evaluate stored rows. They do not validate every proposed transition. Read [operation-specific security](security-rules.md#requirements-by-operation) before using a status field as an approval workflow.

### removeById(id, options?)

`connection.removeById(id, { ack? })` deletes one entry. A missing/falsy ID throws synchronously. An online missing entry rejects with HTTP 404; authorization and source permission failures can reject with HTTP 400.

Online success resolves `{}`. With native reconciliation enabled by `ack` or the connection, the result can instead be the removed local entry. This requires native database support to remain active; `ack: true` does not override an `offline: false` connection. Development sample mode resolves without a value. No `connection.remove()` method is provided by the online connection; the [native collection API](offline-database.md) is separate.

## Writes selected by a query

`connection.query(data, options?)` is an alias for `find`. For writes, `data.type` selects `update` or `delete`. These calls require query admission and permission for the requested write operation; they are distinct from single-record writes.

| Field | Type | Behavior |
|---|---|---|
| `type` | String | `'update'` or `'delete'`. |
| `where` | Object | Filters data-column values. An omitted or broad filter can affect the whole source. |
| `data` | Object | Required for update; flat patch shallowly merged into each matched row. |
| `options.returnAsObject` | Boolean | Returns `{ entries, deletedEntries }`; `deletedEntries` is not the list of IDs deleted by this request. |
| `options.ack` | Boolean | For query deletion, attempts removal of returned deleted IDs from a supported local database. |

An online update normally resolves an array of updated entries. Online query deletion normally resolves `[]`, not a count or removed-row list. Do not infer the deleted count from that empty array. `returnAsObject` changes the SDK envelope but does not expose the endpoint's `deleted` ID list. With query deletion and `ack: true`, a local reconciliation failure can resolve `{ entries, deletedEntries }` even when `returnAsObject` is omitted. Successful reconciliation returns the entries array instead of retaining an `includePagination` root response. Handle these branches or omit `ack` when consuming a predictable online response. Native local `find` routing is not an online query-update implementation; use an online connection for query writes.

```js
const requests = await Fliplet.DataSources.connectByName('Equipment requests', {
  offline: false
});
const updated = await requests.query({
  type: 'update',
  where: { Status: 'Collected' },
  data: { Status: 'Archived' }
});
console.log('Updated entries:', updated.length);
```

Query write authorization, returned fields and hook behavior must be tested independently from `update(id, ...)`. See [testing security](testing-security.md).

## Appending and replacing a batch

Both methods accept an array of **flat column objects**, not record envelopes. A top-level input `id` is treated as an entry ID rather than a data-column value. Prefer omitting it for new rows.

| Method | Arguments | Result and side effects |
|---|---|---|
| `append(entries?, options?)` | Array; `{ runHooks?: Boolean }` | Adds rows and preserves existing rows. Omitted entries defaults to `[]`. Online result is an array of created entry envelopes. Server `runHooks` defaults to `true`. |
| `replaceWith(entries?)` | Array | Removes existing rows and imports the supplied dataset. Omitted entries defaults to `[]`, which clears the source when authorized. Online result is an array of created entries. No options argument is implemented. |

These operations can expand declared column names. They do not enforce column value types. Replacement requires deletion permission in addition to insertion permission for nonempty rows. Neither method supplies an atomic rollback guarantee. A failure can follow deletion or partial mutation.

```js
const requests = await Fliplet.DataSources.connectByName('Equipment requests', {
  offline: false
});
const created = await requests.append([
  { Item: 'USB-C adapter', Quantity: 2, Status: 'Requested' },
  { Item: 'Headset', Quantity: 1, Status: 'Requested' }
]);
console.log('Created records:', created.map(entry => entry.id));
```

For replacement, back up the source and verify the complete desired dataset before calling `replaceWith`. Development sample mode has different results and does not establish the online contract.

## commit(data, columns?)

`connection.commit(data, columns?)` sends several changes in **one request**. It is not an atomic transaction: deletion, insertion, updating and hook work do not share a universal rollback boundary. Never retry the entire commit automatically after an ambiguous failure.

The entry shape differs from append/replace: commit receives `{ data: { ... } }` for new rows and `{ id, data: { ... } }` for updates. An array shorthand becomes `{ entries: data, columns: columns || [] }`. The second `columns` argument applies only to that shorthand.

**Deletion defaults are consequential.** Without `append: true` or an explicit `delete` array, rows omitted from `entries` can be removed. An empty/default commit can clear the source. Set `append: true` for an insert/update-only commit, or explicitly provide the IDs to delete.

| Field | Type | Default | Behavior |
|---|---|---|---|
| `entries` | Array | `[]` when omitted | Wrapped new/updated entries. A supplied nonarray rejects HTTP 400. Provide `entries` or `delete`. |
| `entries[].id` | Number | Omitted | Existing entry ID for updates. Without an ID, `data` creates a new entry. |
| `entries[].data` | Object | No default | Column values. Prefer complete values unless using `extend`. |
| `entries[].order` | Number | Unspecified | Entry order for a supplied row. |
| `entries[].clientId` | String | Unspecified | Caller correlation value for a new entry; returned alongside the assigned server ID. |
| `append` | Boolean | False when omitted | `true` skips removal when no explicit `delete` array is present. |
| `delete` | Array of IDs | Unspecified | Deletes the specified IDs instead of treating omitted rows as removed. An empty array explicitly requests no deletions. |
| `extend` | Boolean | False when omitted | Shallowly merges update `data` with stored data. With update hooks enabled the handler also merges values, so use `extend: true` explicitly for patch semantics. |
| `runHooks` | Array of strings | `[]` | Operation names such as `['insert', 'update']`. It is not append's Boolean option. |
| `returnEntries` | Boolean | True unless explicitly false | `false` omits the returned dataset. It does not grant access or enforce privacy. |
| `columns` | Array of strings | Inferred/merged when omitted | Explicit list replaces the declared column list and is augmented from row data. These names are not a typed schema. |
| `source` | String | Unspecified | Caller-supplied context for server hooks. |
| `normalizeOrder` | Object | Unspecified | `{ gap: positiveSafeInteger }` renumbers existing order values. A no-entry normalization requires `append: true` or an explicit `delete` array to prevent unintended removal. Excessive gaps reject. |

Use a disposable source with read/write permission for this example:

```js
const requests = await Fliplet.DataSources.connectByName('Equipment requests', {
  offline: false
});
const result = await requests.commit({
  entries: [
    { clientId: 'monitor-request', data: {
      Item: 'Portable monitor', Quantity: 1, Status: 'Requested'
    } }
  ],
  append: true,             // preserve rows not supplied in this request
  runHooks: ['insert'],     // server hook operation names, not a Boolean
  returnEntries: false     // request only the correlation response
});
const mapping = (result.clientIds || []).find(row => row.clientId === 'monitor-request');
if (mapping) {
  const saved = await requests.findById(mapping.id);
  console.log('Persisted new row:', saved.id, saved.data);
}
```

The online result is `{ entries?, clientIds: [{ id, clientId }, ...] }`. By default, `entries` can contain the source dataset, not only changed rows. Hashed fields are redacted, but query-read filters and projections must not be assumed to protect this write response. Test returned rows and columns as each actor before enabling commits on private data. A cooperative caller's `returnEntries: false` is not authorization enforcement. See [write-response tests](testing-security.md#check-write-responses).

## Hooks and completion

Client hooks and [server hooks](../../Data-Source-Hooks.md) have separate ownership:

| Method | Client hook | Server behavior relevant to completion |
|---|---|---|
| `insert` / `update` | `insert` / `update` | Server entry hooks can run in the background after saving. A record response does not prove downstream actions completed. |
| `append` | `append` | Server operation hooks requested by Boolean `runHooks`, default true. Setting false still runs the client hook. |
| `replaceWith` | No explicit package hook call | No implemented options argument for selecting hooks. |
| `commit` | `commit` | Selected server operations from `runHooks` array. Update-hook work is not a guarantee that every downstream action completed before response. |
| `query` writes / `removeById` | No equivalent insert/update client hook call | Do not assume the single-record hook pipeline is reused. |

Hooks can transform values; client hooks and caller-supplied `source` cannot establish trusted identity or universal authorization. Verify each write path the app exposes.

## Failures and recovery

Failures are not uniformly HTTP 403. Source permissions, malformed batches and query failures can reject HTTP 400; missing IDs can reject 404; file validation can reject 422; throttling can reject 429. `insert` can wrap permanent 401/422 responses as `{ code: 2, message }` and multipart send failures as `{ code: 1, message }`. Preserve the actual error shape rather than assuming a status property always exists.

Show pending/queued writes as pending. Inspect server records before retrying a write after a timeout, network failure or non-atomic batch error. Prevent duplicate submissions in the UI and use application-level duplicate detection where needed. Do not use an unbounded retry loop. Keep local state, server response and persisted verification as separate observations.

[Back to Data Sources](../fliplet-datasources.md)
