---
title: Fliplet.DataSources
description: "Connect to Fliplet data sources and find references for queries, writes, subscriptions, native storage and source management."
type: api-reference
tags: [js-api, datasources]
v3_relevant: true
deprecated: false
category: data
capabilities: [data source, datasource, query, insert, update, delete, crud, records, table, database, pagination, sort, filter, subscribe, real-time records, bulk operations, join, joins, related data, combine data sources, lookup, relationship]
---
# `Fliplet.DataSources`

Fliplet.DataSources connects app code to data sources. The references below describe supported arguments, result shapes, errors and the differences between online operations, native storage and source management.

## Before you start

Load the `fliplet-datasources` library in your app and create a data source in Studio. Configure [access rules](../Data-source-security.md) for the intended app users before exposing private data. Calls use the current app/page context and identity; a connection does not supply an independent login.

Connection and network methods return Promises. Subscription registration and cursor navigation return synchronous handles; their references identify which calls need `await`. Use the plural namespace `Fliplet.DataSources`.

## Read records

This example needs a source named `Directory` with `Name` and `Department` columns and permission to query it. It uses an online connection and handles failed requests.

```js
async function readDirectory() {
  try {
    const connection = await Fliplet.DataSources.connectByName('Directory', {
      offline: false
    });
    const entries = await connection.find({
      where: { Department: 'Operations' },
      attributes: ['Name', 'Department'],
      order: [['data.Name', 'ASC']],
      limit: 25
    }, { cache: false });
    return entries.map(entry => ({ id: entry.id, name: entry.data.Name }));
  } catch (error) {
    console.error('Directory query failed', error);
    throw error;
  }
}
```

The default read result is an array of entries. Each entry has metadata such as `id`, `createdAt` and `updatedAt`, with column values under `data`:

```json
{
  "id": 101,
  "data": { "Name": "Ada Patel", "Department": "Operations" },
  "createdAt": "2026-01-10T09:00:00.000Z",
  "updatedAt": "2026-01-10T09:00:00.000Z"
}
```

A query's `where` filters column values under `data`; entry metadata filters use top-level query parameters. Pagination, aggregation and request options can change the result shape. See [reading data](datasources/reading-data.md) before combining them.

## API navigation

| Task | Reference and methods |
|---|---|
| Read, filter and paginate | [Reading data](datasources/reading-data.md): `find`, `query`, `findOne`, `findById`, `findWithCursor`, cursor methods, `getIndex`, `getIndexes` and aggregation |
| Query operators | [Query operators](datasources/query-operators.md): JSON-safe filters and separate server rule lookup semantics |
| Related records | [Joins](datasources/joins.md): named joins, reductions and pagination limits |
| Session-bound filters | [Views](datasources/views.md): definitions, requested views and security boundaries |
| Write records | [Writing data](datasources/writing-data.md): `insert`, `update`, `removeById`, query writes, `append`, `replaceWith` and `commit` |
| Attach files or import | [File attachments](datasources/file-attachments.md): attachment inputs, limits and `import` capability boundaries |
| Listen for changes | [Subscriptions](datasources/subscriptions.md): `subscribe` and subscription handle methods |
| Native local storage | [Offline database](datasources/offline-database.md): `Database`, handles and collections |
| Manage source settings | [Managing data sources](datasources/managing-data-sources.md): `get`, `getById`, `create`, namespace `update`, `delete` and source roles |
| Authenticate app users | [App authentication](v3/auth.md): `sendValidation` and `validate` |
| Secure and verify access | [Security entry](../Data-source-security.md), [rule reference](datasources/security-rules.md), [policy examples](datasources/security-examples.md) and [preview testing](datasources/testing-security.md) |
| Server hooks | [Data source hooks](../Data-Source-Hooks.md) |

## Connect to a source

`Fliplet.DataSources.connect(id, connectionOptions?)` and `Fliplet.DataSources.connectByName(name, connectionOptions?)` return `Promise<Connection>`. The options-object overload `connect({ name, offline })` also selects a named source.

| Argument | Type and behavior |
|---|---|
| `id` | Required source identifier for the ID form. A missing/falsy identifier rejects. |
| `name` | Required source name for the named form. Name lookup uses the current request context; it does not grant cross-app access. |
| `connectionOptions.offline` | Optional Boolean. `false` forces online operations. When omitted, native apps can use bundled storage if the Database API is available. `true` does not enable native storage in a browser. |

```js
const online = await Fliplet.DataSources.connectByName('Directory', { offline: false });
const byId = await Fliplet.DataSources.connect(123, { offline: false });
```

The SDK may reuse a connection for the same identifier and offline setting. Connecting establishes a handle; it does not prove a successful server query or authorized access. Native bundle loading is lazy and failed local loading can cause later reads to use the server. There is no public connection `close`, `disconnect` or `destroy` method. Unsubscribe each listener when its owner is disposed.

## Security and verification

Query reads and record reads evaluate different requirement targets. Object update requirements inspect stored rows, not proposed values. Field restrictions vary across single and bulk writes. Views, projections and client hooks do not replace server access rules.

For authorization tests, use an online connection, the intended app identity and confirmed preview enforcement. Check denied operations, returned data and persisted effects. Administrative calls, local results and preview with enforcement disabled cannot establish app-user authorization. A resolved write may be queued or pending; use the write reference's persistence checks.

## SDK helper boundaries

These exposed helpers have narrower purposes than record CRUD. They are not additional authorization or synchronization APIs.

| Helper | Signature and outcome |
|---|---|
| Temporary IDs | `isTempId(id)` returns a Boolean synchronously; true for strings starting with `temp_`. A false result alone does not prove server persistence. |
| Connection lookup | `clearActiveConnections()` returns `undefined` and resets the reuse lookup. It does not unsubscribe existing listeners. |
| Client hook registration | `bindHooks(id, hooks)` registers an object synchronously and rejects duplicate bindings or nonobject inputs by throwing. These run in the client, separately from server hooks. |
| Client hook lookup | `hasHook(id)` returns a Boolean synchronously. |
| Client hook application | `applyHooks(id, method, entries)` invokes the bound callback. Array input returns `Promise.all` of callback results; a single item returns the callback's value/Promise. Without a callback it resolves `undefined`. |
| Mapped-row convenience | `fetchWithOptions(options)` returns a Promise. See [mapped rows](datasources/managing-data-sources.md#mapped-row-helper) for its different result shape and options. |

Underscore-prefixed tracking/reconciliation helpers and core queue-storage helpers are internal implementation surfaces. Use the documented insert/update outcomes rather than manipulating the queue. Native `applyDiff` belongs to the update pipeline, not a custom app synchronization recipe.

## Existing reference links

Existing method-family fragments route to the references below. These references own the current signatures and outcomes.

<a id="1-find-records-query-data"></a>
<a id="basic-usage"></a>
<a id="advanced-querying"></a>
<a id="4-find-single-record"></a>
<a id="pagination-and-performance"></a>
<a id="basic-pagination"></a>
<a id="advanced-pagination-with-cursor"></a>
<a id="sorting-and-ordering"></a>
<a id="the-order-contract"></a>
<a id="common-mistakes"></a>
<a id="utility-methods"></a>
<a id="get-unique-values"></a>
<a id="advanced-features"></a>
<a id="aggregation-queries"></a>
<a id="common-usage-patterns"></a>
<a id="pattern-2-advanced-search-and-filtering"></a>
<a id="data-source-users"></a>

[Read methods, sorting, cursors and aggregation](datasources/reading-data.md).

<a id="-important-all-api-calls-are-asynchronous"></a>
<a id="core-workflow-connect-first"></a>
<a id="connect-to-a-data-source-by-name"></a>
<a id="connect-to-a-data-source-by-id"></a>
<a id="essential-connection-methods"></a>
<a id="️-important-all-api-calls-are-asynchronous"></a>

[Connection setup and asynchronous behavior](#connect-to-a-source).

<a id="query-operators-reference"></a>

[Query operators](datasources/query-operators.md).

<a id="2-insert-records-add-data"></a>
<a id="3-update-records-modify-data"></a>
<a id="5-remove-records-delete-data"></a>
<a id="bulk-operations"></a>
<a id="insert-multiple-records"></a>
<a id="replace-all-data"></a>
<a id="commit-multiple-changes"></a>
<a id="pattern-4-comprehensive-error-handling-and-recovery"></a>

[Individual and batch writes](datasources/writing-data.md).

<a id="subscribing-to-data-source-changes"></a>
<a id="how-updates-arrive"></a>
<a id="what-a-subscription-costs-your-app"></a>
<a id="1-pause-while-the-screen-is-hidden"></a>
<a id="2-never-add-a-timer-of-your-own-on-top"></a>
<a id="pattern-3-paginated-user-directory-with-real-time-updates"></a>

[Subscriptions and lifecycle cleanup](datasources/subscriptions.md).

<a id="import-data-from-file"></a>

[File attachments and import boundaries](datasources/file-attachments.md).

<a id="data-source-management"></a>
<a id="get-available-data-sources"></a>
<a id="create-new-data-source"></a>
<a id="pattern-1-complete-user-management-system"></a>
<a id="test-data-source-structure"></a>
<a id="creating-the-test-data-source"></a>

[Source management and setup](datasources/managing-data-sources.md).

<a id="joining-data-from-other-data-sources"></a>

[Related records and joins](datasources/joins.md).

<a id="data-source-views"></a>

[Requested views](datasources/views.md).

<a id="offline-database-native-only"></a>
<a id="opening-the-database"></a>
<a id="selecting-a-data-source"></a>
<a id="reading-data"></a>
<a id="findwhere-options--promisearray"></a>
<a id="findbyidid--promiseobjectundefined"></a>
<a id="writing-data"></a>
<a id="insertentry--promiseobject"></a>
<a id="updateexistingentry-entry--promiseobject"></a>
<a id="removeentry--promiseobject"></a>
<a id="applying-server-diffs"></a>
<a id="indexes"></a>
<a id="indexescolumnsarray--promiseobject"></a>
<a id="indexcolumnname--promisearray"></a>

[Native Database handles and collection methods](datasources/offline-database.md).
