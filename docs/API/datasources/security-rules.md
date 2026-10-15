---
title: Data source security rule reference
description: "Access rule evaluation, trusted identity, requirement targets, column restrictions and custom script behavior."
type: reference
tags: [js-api, datasources, security]
v3_relevant: true
deprecated: false
---

# Data source security rule reference

Data source access rules grant app operations using identity, request and stored-record conditions. This reference distinguishes the rule evaluator from endpoint-specific reads and writes.

## Contents

- [Evaluation and defaults](#evaluation-and-defaults)
- [Rule properties](#rule-properties)
- [Identity and login binding](#identity-and-login-binding)
- [Requirements by operation](#requirements-by-operation)
- [Column restrictions](#column-restrictions)
- [Custom scripts](#custom-scripts)
- [Errors](#errors)

## Evaluation and defaults

Active rules are evaluated in order. The first grant wins; disabled rules, nonmatching actors and failed requirements are skipped. This fallthrough applies to insert, update and delete as well as select. A denied script does not veto a later grant.

Absent or null `accessRules` retains legacy unrestricted access. An explicit empty array `[]`, or an array with no applicable grant, denies access. Studio administrative access and preview with enforcement disabled can bypass rules; use [authenticated preview testing](testing-security.md) to prove app access.

## Rule properties

| Property | Shape | Behavior |
|---|---|---|
| `type` | Array of operation strings | `select`, `insert`, `update`, `delete`. A nonempty `script` runs independently of this filter. |
| `allow` | String or object | `all`, `loggedIn`, a user condition, login-source gate or token-ID gate. A script must make its own access decision. |
| `enabled` | Boolean | `false` skips the rule. Omission leaves it active. |
| `appId` | Array of numbers | Limits the rule to those apps, including the corresponding cloned/production app relationship. Applies to script rules too. |
| `require` | Array of strings or objects | All requirements must match their operation-specific target. |
| `include`, `exclude` | Arrays of column names | Endpoint-specific column restrictions, described below. |
| `name` | String | Descriptive Studio label. |
| `script` | String | JavaScript returning an object with `granted: true` to grant. |

## Identity and login binding

`allow.user` checks the authenticated user's data, not the target record. The data-source identity is the signed-in row's flat column values plus its entry metadata; SAML identity comes from the authenticated assertion. Client-written session fields must not be used as proof of identity. A bound data-source rule uses the same source identity for its user gate and templated requirements.

Use the actual authentication data source ID in `dataSourceId` (one positive integer or an array of IDs). For example, after configuring authentication against your **Members** source with ID `731`, this gate grants reads to users signed in through that source:

```json
[
  { "type": ["select"], "allow": { "loggedIn": true, "dataSourceId": 731 } }
]
```

`"loggedIn"` alone accepts a supported authenticated login without requiring this particular source. An API-token gate uses `{ "tokens": [tokenId] }`; these are token IDs, not token secrets.

### Typed user conditions

Literal boolean and numeric user conditions compare native values. Preserve the actual identity types:

```json
{
  "type": ["select"],
  "allow": {
    "dataSourceId": 731,
    "user": { "Enabled": true, "Clearance": 7, "Roles": "Approver" }
  }
}
```

For textual comparisons, `equals` compiles a case-insensitive anchored, escaped regular expression. It matches text and string elements of arrays, not native boolean or number values. `{ "Enabled": { "equals": true } }` therefore does not match native `true`. `contains` is a substring check: it matches both `Approver` and `SuperApprover`, including string elements in role arrays. Use a literal `"Approver"` or `{ "equals": "Approver" }` for exact role values. Both match `["Author", "Approver"]`; `contains` is unsuitable for exact role membership.

Multiple fields in `allow.user` are AND conditions. Use separate rules for alternative grants. Object conditions support `equals`, `notequals` and `contains`; do not invent query operators in this rule syntax.

### Identity templates

{% raw %}
`{{user.[Email]}}` resolves the signed-in identity field; brackets also support names with spaces. Use it in `require` to compare a record or query to the caller. Comparing a user's own field to that same template inside `allow.user` does not restrict the actor. Missing identity must deny owner-scoped access; test missing, null and blank fields rather than relying on template output.
{% endraw %}

Authentication setup and client-side session retrieval belong to the [authentication guide](../v3/auth.md) and [Session API](../fliplet-session.md).

## Requirements by operation

String requirements check **key presence**, not a nonempty value or type. For example, `"require": ["Label"]` can accept a submitted `Label: null`. Object requirements check values using the operators below. These two forms have different targets on updates.

| Operation/path | String requirement target | Object requirement target |
|---|---|---|
| `find()` / `findOne()` query | Submitted `where` keys or supported `$filters` column conditions | Submitted query filter, not every returned row |
| `findById()` record read | Stored record keys | Stored record values |
| Single `insert()` | Submitted keys | Submitted data |
| Single `update()` | Submitted keys | **Stored row**, not proposed data |
| Bulk/commit insert | Keys in every submitted data object | Every submitted data object |
| Bulk/commit update | Keys in every submitted data object | Every loaded stored row; no stored context means the condition cannot grant |
| Single `removeById()` | Stored record keys | Stored record values |
| Query admission | Submitted `where` keys, evaluated as `select` | Submitted `where`, evaluated as `select` |
| Query update, affected-record check | Submitted update-data keys | Stored row |
| Query delete, affected-record check | Stored record keys | Stored record values |
| Commit delete | Existing data for the requested IDs | Existing data for the requested IDs |

A query read requirement checks the client's filter; it does not inject a filter. Send the appropriate `where` clause. `findOne({ where: ... })` follows the query route, whereas `findById(id)` follows the record route and cannot be assumed equivalent. Additional source permissions can reject either route.

Query writes first require a `select` grant for the submitted `where`. In the inspected supported behavior, each affected row then undergoes an operation check: updates check string requirements against submitted update-data keys and object requirements against the stored row; deletes check stored data. Update persistence omits the affected row's matched-rule exclusions from the proposed data. `include` is not a write whitelist, and source permissions are additional gates. Verify affected-row enforcement on the tested deployment: compatibility settings can skip that check, so local source inspection alone does not prove production enforcement.

### Requirement operators

This select-only illustration compares the submitted read filter or stored record to the caller. On updates, the same object condition would authorize the **stored** owner's row without prohibiting a proposed change to `OwnerEmail`. See the explicitly limited [single-record profile example](security-examples.md#editable-profiles) before configuring updates; its exclusions do not protect bulk/commit writes.

{% raw %}
```json
[
  {
    "type": ["select"],
    "allow": { "loggedIn": true, "dataSourceId": 731 },
    "require": [{ "OwnerEmail": { "equals": "{{user.[Email]}}" } }]
  }
]
```
{% endraw %}

| Operator | Meaning |
|---|---|
| `equals` | Case-insensitive anchored text comparison; query validation also recognizes `$eq` and matching equality `$filters`. |
| `notequals` | Inequality comparison; it is not an existence or nonempty check. |
| `contains` | Substring comparison; query validation recognizes direct strings and relevant `$eq`, `$like`, `$iLike` or equality `$filters` values. |

Only these three object operators are supported. They are separate from [query operators](query-operators.md).

## Column restrictions

When the read-filtering helpers run, source-level `definition.include`/`definition.exclude` lists are unioned with the matching rule's corresponding lists. A rule include list is not an exclusive whitelist, and an empty rule include does not define a whitelist. For example, source include `PrivateNotes`, rule include `PublicName, Badge` and source exclude `Badge` leave `PrivateNotes, PublicName`: exclusions win.

The inspected query/record read routes invoke each helper when the matching rule has the corresponding **nonempty** list. Do not infer that a source list alone is always applied by those routes. These helpers filter read responses; they do not establish write-persistence restrictions.

Successful write authorization does not itself prove that returned rows or columns satisfy read restrictions. The inspected `commit()` response can return source entries without owner-select filtering or rule column filtering; hash redaction is separate. Source permissions and caller-supplied response options also affect this path. Test response isolation independently before choosing a writable policy for private data; setting `returnEntries: false` in cooperative clients does not enforce that option on other callers.

Column restrictions do not have a uniform write contract:

| Path | `exclude` | `include` |
|---|---|---|
| Select query/record response | Removes excluded data columns | Restricts returned data columns after exclusion; a field removed by `exclude` is not restored by `include` |
| Single insert/update | Removes submitted excluded fields before persistence; this is filtering, not necessarily a rejected request | Does not reliably filter the persisted single-write payload |
| Bulk append/replace/commit | Does not filter each persisted entry | Does not filter each persisted entry |
| Query update | Omits matched exclusions from affected-row update data when operation checks run | Not a write whitelist |

A single update that submits an excluded privilege field can resolve successfully while leaving that field unchanged. It is incorrect to describe that outcome as an authorization error. Do not use an `exclude` policy to promise protection on bulk/commit writes. Leave strict app-session writes unavailable until an implemented trusted write path has been verified. Script input selection can substitute `body.where` for proposed data, so a script that checks `query` is not automatically a complete payload validator.

### Joined-source reads

Online joins evaluate the primary source's select rules. The caller must be able to resolve the joined source through the source access lookup. This lookup does not establish enforcement of the joined source's read permission, access rules or column restrictions. Primary-source `include` and `exclude` filtering does not sanitize nested joined data. A token-accessible joined source can therefore return rows or fields that its direct-read rules restrict.

Do not treat direct-read authorization as proof of joined-data privacy. Caller-supplied join filters or projections are not enforceable protection against other callers. See [Data Source joins](joins.md#security-boundary-for-online-joins) for the contract and [joined-response tests](testing-security.md#check-joined-source-responses) before exposing related private data.

## Custom scripts

A nonempty script runs regardless of `type` and `allow`, subject to the enabled/app filters. It must check operation, authenticated identity and login source itself. Return `{ granted: true }` to grant; bare booleans, missing returns and `{ granted: false }` do not grant. A script grant returns immediately for that rule, so standard `require` is not an additional payload validator.

```js
// A read-only script for a bound login source; replace 731 with its actual ID.
if (!user || !session || session.dataSourceId !== 731 || type !== 'select') {
  return { granted: false };
}
return { granted: true, exclude: ['PrivateNotes'] };
```

The returned `include`/`exclude` use the endpoint limits above. Put a script into the custom-rule editor; it is server-side rule code, not browser JavaScript.

### Script inputs and mutation

| Variable | Shape |
|---|---|
| `type` | Operation string: `select`, `insert`, `update` or `delete` |
| `user` | Authenticated flat identity object, or `undefined` |
| `session` | Read-only verified login context with `loggedIn`, `passports`, `dataSourceId` and `entryId`; data-source IDs are absent for other login types |
| `query` | A **shallow copy** selected in this order: request `body.where`, supplied entry data, request body |
| `entry` | Stored `{ id, data, ... }` for a single update when supplied; absent for commit and initial query evaluation |
| `DataSources` | Server-side lookup library described below |

An online query read normally receives the unwrapped `where`. A single insert/update normally receives flat submitted data. A commit receives arrays of flat data for each operation; deletes receive loaded existing data. Query writes can receive `body.where` instead of proposed data even during affected-record checks. Do not treat `query` as a universal proposed payload or assume `entry` exists on every update.

Assigning `query.OwnerEmail` or `query.UpdatedAt` does not establish a persisted transformation. The rule's copied query is not a supported audit-stamping or filter-injection contract. Validate inputs or deny access; do not advertise mutation as server-enforced stamping. The script VM has a 3,000 ms synchronous execution timeout; this is not a guaranteed end-to-end deadline for awaited lookups.

### Reading another data source

`DataSources(idOrName).find(options)` and `.findOne(options)` perform server-side reads without applying the target source's access rules. A lookup may therefore expose fields ordinary app users cannot read. Use it only for the minimum policy decision, and do not return its contents to clients.

Before using this script, create **Reading Groups** with `Email` and `Group` columns and membership rows. The signed-in identity must have a nonempty string `Email`; column names alone do not enforce that type. The script validates its presence without normalizing or rewriting it.

```js
if (!user || !session || session.dataSourceId !== 731 || type !== 'select'
    || typeof user.Email !== 'string' || user.Email.trim().length === 0) {
  return { granted: false };
}
const membership = await DataSources('Reading Groups').findOne({
  where: { Email: user.Email, Group: 'Curators' }
});
return { granted: !!membership };
```

These methods return **flat data**: `find` returns an array and `findOne` returns a flat object or `undefined`. They do not return SDK `{ id, data }` envelopes. Options are `where`, `limit` (up to 100, default 100) and `offset` (default 0). See [query operators](query-operators.md) for supported filters.

## Errors

A denied operation rejects the SDK promise. Standard access denials may expose `type: "datasource.access"` with `payload.dataSourceId`, but error shape and HTTP status depend on the endpoint and caller. Query/record reads commonly return HTTP 400; single insert/update access checks can return HTTP 401. The insert denial message uses “write”, while update and delete use their respective operations. Scripts can surface a custom-rule error. Do not classify every rejected promise, HTTP 400 or HTTP 401 as a policy denial: inspect the response and follow [preview diagnosis](testing-security.md#diagnose-a-failure).
