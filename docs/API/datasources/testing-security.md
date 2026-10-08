---
title: Testing data source security in preview
description: "Verify allowed and denied data source operations as authenticated app users with Studio preview security enforcement enabled."
type: how-to
tags: [js-api, datasources, security, testing]
v3_relevant: true
deprecated: false
---

# Testing data source security in preview

Test data access as the intended app identity with Studio's preview security enforcement enabled. A rendered screen, a successful administrative query or a preview with enforcement disabled does not prove app-user authorization.

## Prepare a disposable test

Create dedicated test data sources and records. Record the saved rule array, login source, actual field types and test record IDs. Build an actor-operation table before testing:

| Actor | Operation | Expected result |
|---|---|---|
| Anonymous | Read private data | Denied |
| Bound enabled member | Read their record | Allowed |
| Bound enabled member | Change another member's record | Denied |
| Wrong-source login | Read protected data | Denied |
| Inactive member | Protected write | Denied |
| Approver with multiple roles | Supported review operation | Allowed |
| Member without required role | Same operation | Denied |
| Bound member with commit/bulk access | Own-data write with response enabled/default | Returned rows and columns satisfy the intended read isolation |
| Denied or wrong-source actor | Direct response-bearing request | No forbidden data returned or persisted |

Adapt the matrix to the configured policy. Include missing/null identity fields, different native types and each write method your app uses. For protected ownership, privilege or state fields, attempt malicious payloads directly through the SDK as well as through the UI. A hidden button does not stop an SDK call.

## Enable enforcement and sign in

1. Record the initial preview **Enforce security** setting.
2. Open preview settings and enable **Enforce security**. Wait for the preview to reload before continuing.
3. Use the app's configured login flow to sign in as the test actor. Confirm the identity and login source; a Studio account alone is not the app-user identity. Sign out between actors and test the anonymous case too.
4. Confirm the reloaded preview environment is consistent with enforcement enabled:

```js
console.log({
  appId: Fliplet.Env.get('appId'),
  disableSecurity: Fliplet.Env.get('disableSecurity'),
  interact: Fliplet.Env.get('interact'),
  development: Fliplet.Env.get('development')
});
// Require disableSecurity === false, interact === false and development !== true.
// Missing/unknown enforcement state is unverified.
```

Also confirm the UI setting is enabled and the preview is outside editor interaction mode. Interaction mode can bypass data source enforcement. A stale document or an unknown setting is unverified. Do not log tokens or copy token-bearing preview URLs into reports.

## Run allowed and denied operations

Configure the fixtures and select-only policy from the [owner-filtered read illustration](security-examples.md#private-sketches), then sign in as Ada through its bound Members login source. Use an online connection to avoid counting cached reads or queued writes as server proof:

```js
const sketches = await Fliplet.DataSources.connectByName('Composition Sketches', { offline: false });
const rows = await sketches.find({ where: { OwnerEmail: 'ada@example.org' } });
console.log(rows.map(entry => ({ id: entry.id, data: entry.data })));
```

Record the successful server response and returned rows. This read illustration does not establish complete source privacy. Repeat with another actor's filter and confirm the authorization denial.

For every allowed write, perform a fresh read and check the exact saved values. For every forbidden write, inspect the rejection and verify that no forbidden insert, update or delete persisted. Use a trusted Studio readback where the app's read rules hide the affected fields; label it as persistence evidence, not an app-user access test.

Test `findOne({ where: ... })` separately from `findById(id)` if the app uses both. Test single writes, append/replace, query writes and `commit()` separately when enabled. Do not extrapolate single-record `exclude` behavior to bulk writes. Record the mode, actor, rule revision, request, response and persisted result together. Change any of those inputs and rerun the relevant checks.

## Check write responses

For grants that admit commit/bulk operations, seed another owner's row and a sensitive column in the same disposable source. As the allowed actor, submit an own-data append or commit with response entries enabled or left at their default. Inspect **all returned rows and columns**, not just the submitted entry. Repeat direct requests as denied and wrong-source actors, and check both response data and persisted effects. Test these SDK calls independently of whether the UI exposes them.

Read-response filtering does not automatically apply to commit responses. A client choosing `returnEntries: false` is not proof that other callers cannot request entries. To assert a read-only private configuration, verify commit and other response-bearing routes are actually unavailable or appropriately isolated under its real source permissions. A select-only evaluator result is insufficient. Record the tested deployment/configuration and any unknowns; do not infer deployed behavior from local source alone.

## Diagnose a failure

A policy denial must be supported by the error response and unchanged forbidden state. An HTTP 400 or 401 alone is insufficient because errors vary by method and caller.

| Symptom | Check |
|---|---|
| Access denial / `datasource.access` | Saved rule order, operation, login binding, field casing/types and the correct requirement target |
| Empty results | Actual filter and fixtures; an allowed empty read is different from a denied request |
| HTTP 429 | Rate-limit response and retry interval; do not classify it as a rule failure |
| Login/loading screen | Complete authentication before testing data access |
| Network/transport error | Request completion and response body; authorization remains unverified |
| Successful update but field unchanged | Single-write `exclude` may filter the submitted field rather than reject |
| Success only with enforcement off | Rerun with enforcement on and the intended identity |

Use the [rule reference](security-rules.md) for evaluator and endpoint differences, and the [authentication guide](../v3/auth.md) for sign-in setup. Hooks remain documented in [Data source hooks](../../Data-Source-Hooks.md).

## Finish and restore preview

Delete the disposable test records through an authorized test/admin path. Restore the original **Enforce security** setting and wait for a fresh reload. Confirm the effective setting before reporting restoration; a failed reload is unverified. Preserve a compact allowed/denied result table with outstanding gaps, without credentials or private data.
