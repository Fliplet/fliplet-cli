---
title: Managing data sources
description: "Source metadata, creation, configuration, deletion and Studio user roles, separate from app record access."
type: api-reference
tags: [js-api, datasources]
v3_relevant: true
deprecated: false
---
# Managing data sources

Namespace methods manage source metadata and settings. They differ from connection methods that read and write records, and require a caller authorized for the relevant management operation.

## Before you start

Use these methods in an authorized Studio or management integration context. Ordinary app-user access rules do not grant source administration. Available sources and metadata depend on the current app, organization and caller permissions. To implement app record CRUD, use [reading data](reading-data.md) and [writing data](writing-data.md).

Source columns are field names, not a typed schema. `accessRules` configure app operations; source-user roles configure Studio users' source permissions. [App authentication](../v3/auth.md) owns `connection.sendValidation(data)` and `connection.validate(data)`, including their inputs and responses. `validate` refreshes the cached user session after successful validation.

## List sources

`Fliplet.DataSources.get(data?, options?)` returns `Promise<Source[]>`. Omitted arguments default to empty objects.

| `data` property | Type and behavior |
|---|---|
| `appId` | App identifier; the caller must have the necessary app access. |
| `attributes` | Array of names or comma-separated string selecting source metadata fields. |
| `include` | Comma-separated associated metadata names supported by the listing endpoint. |
| `type` | Source type; an explicitly empty value requests ordinary sources. |
| `excludeTypes` | Comma-separated source types to exclude; system-source exclusions also apply. |
| `order`, `direction` | Metadata sort field and direction; default `name`, `ASC`. |
| `roles` | Comma-separated Studio app role names, applied within the caller's listing context. These are not source `crudq` permission letters or app-login `Roles` fields. |
| `definition` | Object filter on source definitions in the app context. The SDK serializes it and disables request caching. This is not an entry `where` query. |
| `includeInUse` | String `'true'` requests in-use information in supported listing contexts. |
| `includeCount` | Presence requests counts in supported listing contexts. |

`options.cache` defaults to `true`; explicit `false` bypasses SDK request caching. Listing rejects on access, request or filter failures. Results are source objects such as `{ id, name, columns, definition }`, with fields determined by projection and permissions.

```js
async function listSourceNames() {
  const sources = await Fliplet.DataSources.get({ attributes: ['id', 'name'] }, {
    cache: false
  });
  return sources.map(source => ({ id: source.id, name: source.name }));
}
```

## Read source metadata

`Fliplet.DataSources.getById(id, options?)` returns `Promise<Source>` and rejects for missing/inaccessible sources or request failures.

| Option | Type and behavior |
|---|---|
| `attributes` | Array or comma-separated string of metadata fields. |
| `cache` | Request caching; default `true`. |
| `params` | Query-parameter object. `includeEntriesCount` requests an entry count when present. `include: 'associatedPages'` requests page associations when an app context exists. |

```js
async function inspectSource(sourceId) {
  return Fliplet.DataSources.getById(sourceId, {
    attributes: ['id', 'name', 'columns'],
    cache: false,
    params: { includeEntriesCount: true }
  });
}
```

Reading source metadata does not prove permission to read every entry or bypass app rules.

## Create a source

`Fliplet.DataSources.create(options)` returns `Promise<Source>`. Use a nonempty `name` and supply the authorized app/organization scope. The SDK does not automatically add `appId` or `organizationId`; the request needs one of these scopes.

| Option | Type and consequence |
|---|---|
| `name` | Required nonempty String. |
| `appId` or `organizationId` | Required management scope identifier; supply the app or organization the caller can administer. |
| `columns` | Array of column names. |
| `entries` | Optional seed-entry array handled during source creation; returned value is the source, not a list of inserted rows. |
| `accessRules` | Rule array. If omitted/falsy, the SDK supplies `[]`, denying app operations until an applicable grant is configured. |
| `definition` | Source definition Object; login, view and index settings need their owning references. |
| `hooks` | Server-hook configuration; see [Data Source Hooks](../../Data-Source-Hooks.md). |
| `bundle` | Bundling setting for native apps. |
| `encrypted`, `type`, `appCapabilities` | Source configuration fields for the relevant management workflow; do not infer app-user permissions from them. |

This setup example creates an empty source with app access denied. Run it once in a disposable, authorized management context; repeated calls create additional sources rather than guaranteeing name-based reuse.

```js
async function createDisposableSource(appId) {
  if (!appId) throw new Error('Supply the disposable test app ID.');
  const source = await Fliplet.DataSources.create({
    appId,
    name: 'Workshop Test Records',
    columns: ['Title', 'Status'],
    accessRules: []
  });
  console.log('Created source', source.id);
  return source;
}
```

Invalid configuration, missing scope, feature limits or permission failures reject. Configure and verify [access rules](../../Data-source-security.md) before app users use the new source.

## Update source settings

`Fliplet.DataSources.update(id, data)` and `Fliplet.DataSources.update({ id, ...data })` return `Promise<Source>`. Missing ID throws synchronously in the online SDK path. The object overload removes `id` from the supplied object; pass a fresh object if you need to retain it.

The source must allow the caller to update settings. Supported settings include `name`, `columns`, `definition`, `hooks`, `bundle`, `accessRules` and `appCapabilities`. Each field has its own setter/validation behavior; do not assume recursive merging or that this is a record update. A successful update clears SDK request caches. Invalid names/settings, denied permission or request failures reject.

```js
async function renameSource(sourceId) {
  const source = await Fliplet.DataSources.update(sourceId, {
    name: 'Workshop Archive'
  });
  return source.name;
}
```

`connection.update(id, data, options?)` updates one entry instead. Its separate signature and outcomes are in [writing data](writing-data.md).

## Delete a source

`Fliplet.DataSources.delete(id)` returns a Promise resolving the deletion response. It deletes the source rather than an individual entry; do not expect an entry array. Use only a disposable source or a deliberate management action. App-token callers are rejected by the source-deletion endpoint. Permission and request failures reject.

Delete one entry with `connection.removeById(id)` instead. Do not implement source deletion as app-user record cleanup.

## Studio user roles

These connection methods manage source permissions for Studio users. They do not create app login records, set a login record's `Roles` array or prove app-user authorization.

| Method | Arguments and result |
|---|---|
| `connection.getUsers()` | Returns `Promise<Array>` of `{ fullName, firstName, lastName, email, dataSourceRole }`. Email is masked and `dataSourceRole.userId` is opaque, not a numeric account ID. |
| `connection.addUserRole(data)` | `data.userId` is a numeric Studio account ID; `permissions` defaults to `'crudq'` and accepts only those permission letters; optional `definition` holds role configuration. Returns the created role object. |
| `connection.removeUserRole(userId)` | Uses the source-role identifier expected by the management endpoint, which can be the opaque identifier from the listing. Returns the deletion response, not the removed user. |

`dataSourceRole` includes `userId`, `permissions`, `definition`, `createdAt`, `updatedAt` and `dataSourceId`. Do not feed a masked email or opaque listing identifier into `addUserRole` as the numeric account ID. Invalid permission letters or a nonnumeric creation ID reject with a validation error; missing role/access and request failures reject.

## Mapped-row helper

`Fliplet.DataSources.fetchWithOptions(options)` is a convenience wrapper. Prefer `connection.find` when entry IDs/metadata or pagination envelopes are needed.

| Option | Contract |
|---|---|
| `dataSourceId` | Required source identifier. Missing/falsy value rejects. |
| `query` | Query object passed to `find`. Keep normal array results; pagination/object envelopes are not compatible with its row mapping. |
| `columns` | Array of field names or single-key maps, e.g. `['Name', { label: 'Title' }]`. Omitted/empty selects row data directly. |
| `compact` | Default `true`; excludes mapped null/undefined/blank strings. `false` retains these mapped values. |
| `cache` | Converted to Boolean; default `false` for the entry request. |

The helper connects online and normally resolves `{ dataSource, dataSourceEntries }`. `dataSourceEntries` contains flat column objects, not `{ id, data }` entries. `dataSource.columns` is recalculated from available mapped columns. Empty mapped rows are removed. A metadata failure is tolerated and can leave metadata incomplete; an entry query failure still rejects. When `query.aggregate` is supplied, it returns the raw aggregation result instead of this wrapper.

## Client helpers and internal exports

[The main reference](../fliplet-datasources.md#sdk-helper-boundaries) classifies client hooks, temporary IDs and connection lookup helpers. They do not enforce server authorization. Underscore helpers and core queue plumbing are not recommended app interfaces. Native `applyDiff` is described only as an update-pipeline compatibility surface in [offline storage](offline-database.md).
