---
title: Securing Fliplet data sources
description: "Configure data source access rules and verify allowed and denied operations as authenticated app users."
type: how-to
tags: [js-api, datasources, security]
v3_relevant: true
deprecated: false
---

# Securing Fliplet data sources

Protect app data with server-evaluated access rules, then test the allowed and denied operations as real app users. Rules control access; browser checks and successful Studio administrative requests do not prove authorization.

## Configure a policy

1. Open **App Data** in Fliplet Studio, select the data source and open **Access Rules**.
2. Define the actors, operations and fields that need protection. Start with an explicit empty rules array (`[]`) for a source that should deny app access until configured. Missing or null rules retain legacy unrestricted access.
3. Choose a [complete security example](API/datasources/security-examples.md) and adapt its data shape and login-source binding. Save the rules, then read back the configuration.
4. Test both allowed and denied operations with [Enforce security enabled in preview](API/datasources/testing-security.md). Confirm persisted results using a fresh read.

A minimal public read-only policy is:

```json
[
  { "type": ["select"], "allow": "all" }
]
```

Use this only for data intended for anonymous readers. It grants no insert, update or delete operation. The [public lookup example](API/datasources/security-examples.md#public-lookup) pairs this rule with sample rows and SDK calls.

## Choose the right guide

| Task | Guide |
|---|---|
| Understand rule order, identity, requirements and endpoint differences | [Security rule reference](API/datasources/security-rules.md) |
| Configure public, shared, private, profile or role/state data | [Security examples](API/datasources/security-examples.md) |
| Prove allowed and denied app behavior | [Authenticated preview testing](API/datasources/testing-security.md) |
| Connect, query or write through JavaScript | [Fliplet.DataSources reference](API/fliplet-datasources.md) |
| Configure authentication or hooks | [App authentication](API/v3/auth.md), [Session API](API/fliplet-session.md) and [Data source hooks](Data-Source-Hooks.md) |

## Check the policy's limits

Rules grant access in order. A failed rule falls through for writes as well as reads, so a later broad grant can defeat an earlier restriction.

Object conditions on updates check the **stored row**, while string requirements check submitted key presence. A condition that checks stored `Owner` or `Status` does not prevent a permitted write from changing those fields. Single-record writes honor `exclude`, but bulk/commit writes do not provide the same field protection. Custom scripts receive a copied input; assigning audit fields to that copy does not reliably persist them.

For immutable ownership or approval transitions, keep app-user writes unavailable until an implemented trusted write path has been verified to check both stored and proposed values on every supported endpoint. See [role and state limits](API/datasources/security-examples.md#role-and-state-access) before choosing a workflow policy.

## Existing section links

These destinations retain links to the previous sections of this guide.

<a id="security-rules"></a>

[Security rules](API/datasources/security-rules.md#evaluation-and-defaults)

<a id="access-rule-structure"></a>

[Access rule structure](API/datasources/security-rules.md#rule-properties)

<a id="defining-who-can-access"></a>

[Defining who can access](API/datasources/security-rules.md#identity-and-login-binding)

<a id="restricting-columns"></a>

[Restricting columns](API/datasources/security-rules.md#column-restrictions)

<a id="example-role-based-access-with-protected-fields"></a>

[Example role based access with protected fields](API/datasources/security-examples.md#editable-profiles)

<a id="example-department-scoped-access"></a>

[Example department scoped access](API/datasources/security-examples.md#private-sketches)

<a id="data-requirements-and-query-validation"></a>

[Data requirements and query validation](API/datasources/security-rules.md#requirements-by-operation)

<a id="data-requirement-types"></a>

[Data requirement types](API/datasources/security-rules.md#requirement-operators)

<a id="handlebars-templating"></a>

[Handlebars templating](API/datasources/security-rules.md#identity-and-login-binding)

<a id="require-syntax"></a>

[Require syntax](API/datasources/security-rules.md#requirement-operators)

<a id="custom-security-rules"></a>

[Custom security rules](API/datasources/security-rules.md#custom-scripts)

<a id="granting-access"></a>

[Granting access](API/datasources/security-rules.md#custom-scripts)

<a id="modifying-the-input-query"></a>

[Modifying the input query](API/datasources/security-rules.md#script-inputs-and-mutation)

<a id="checking-data-when-committing-changes"></a>

[Checking data when committing changes](API/datasources/security-rules.md#script-inputs-and-mutation)

<a id="reading-data-from-other-data-sources"></a>

[Reading data from other data sources](API/datasources/security-rules.md#reading-another-data-source)
