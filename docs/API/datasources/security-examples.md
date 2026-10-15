---
title: Data source security examples
description: "Pair public, shared, owner-filtered read, profile and role-based examples with data shapes and allowed and denied SDK operations."
type: guide
tags: [js-api, datasources, security]
v3_relevant: true
deprecated: false
---

# Data source security examples

Use these policies with their stated data shapes and operation limits. Each example pairs the complete rule array with app SDK calls and outcomes to verify with security enforcement enabled.

## Before you start

Configure each data source's columns and sample rows in Studio before running the app code. For authenticated examples, configure a **Members** login source using the [authentication guide](../v3/auth.md). Replace illustrative ID `731` in every bound rule with its actual ID. Seed two test identities whose flat authenticated data includes:

```json
[
  { "Email": "ada@example.org", "Enabled": true, "Roles": ["Author", "Approver"] },
  { "Email": "lin@example.org", "Enabled": true, "Roles": ["Author"] }
]
```

`Enabled` is a native boolean, and `Roles` is an array of strings. Protect those identity fields from self-service writes. Columns are names, not enforced types: verify actual stored values. Use disposable test sources and record allowed and denied results using the [preview procedure](testing-security.md). Outcomes below describe the policy contract, not a substitute for authenticated runtime tests.

SDK query results have `{ id, data }` envelopes. Obtain current fixture IDs from Studio rather than guessing IDs. These plain JavaScript examples use `await` and run inside an app with the Data Sources library available. Authentication happens through the app's configured login flow before these calls.

## Public lookup

**Goal:** Anonymous readers can browse a public instrument catalog. App users cannot change it.

Create **Instrument Catalog** with columns `Instrument` and `Family`, seeded with:

```json
[
  { "Instrument": "Oboe", "Family": "Woodwind" },
  { "Instrument": "Cello", "Family": "Strings" }
]
```

Save this entire rule array:

```json
[
  { "type": ["select"], "allow": "all" }
]
```

Allowed as an anonymous app user:

```js
const catalog = await Fliplet.DataSources.connectByName('Instrument Catalog', { offline: false });
const instruments = await catalog.find();
console.log(instruments.map(entry => entry.data.Instrument));
// Expected: ['Oboe', 'Cello'] (order is illustrative).
```

Denied as either an anonymous or signed-in app user:

```js
const catalog = await Fliplet.DataSources.connectByName('Instrument Catalog', { offline: false });
let denied = false;
try {
  await catalog.insert({ Instrument: 'Flute', Family: 'Woodwind' });
} catch (error) {
  denied = true;
  console.log(error); // Inspect the denial; then confirm no Flute row persisted.
}
if (!denied) throw new Error('Unexpected grant: verify the saved policy and preview mode.');
```

Update and delete are also denied because no rule grants them. Studio administrators may still seed the catalog; that success is separate from app-user evidence.

## Shared signed-in notices

**Goal:** Members from the intended login source can read and add shared notices. They cannot update or delete existing notices.

Create **Rehearsal Notices** with columns `Message` and `Venue`, seeded with `{ "Message": "Bring a music stand", "Venue": "Hall B" }`. Save:

```json
[
  {
    "type": ["select"],
    "allow": { "loggedIn": true, "dataSourceId": 731 }
  },
  {
    "type": ["insert"],
    "allow": { "loggedIn": true, "dataSourceId": 731 },
    "require": ["Message", "Venue"]
  }
]
```

Allowed after Ada signs in through Members:

```js
const notices = await Fliplet.DataSources.connectByName('Rehearsal Notices', { offline: false });
await notices.insert({ Message: 'Doors open at six', Venue: 'Hall A' });
const rows = await notices.find({ where: { Venue: 'Hall A' } });
console.log(rows.map(entry => entry.data));
```

Denied tests: sign out and call `find()` or `insert()`; sign in through another login source and repeat. As Ada, submit `insert({ Message: 'Missing venue' })`, or update/delete a seeded notice. Each must reject and leave no forbidden persisted effect. The string requirements check presence only: `Venue: null` is not a nonempty validation failure under this policy.

<a id="private-sketches"></a>

## Owner-filtered read illustration

**Goal:** Demonstrate an enabled member's owner-filtered query read and stored-owner record read.

Create **Composition Sketches** with columns `OwnerEmail` and `Title`. Seed:

```json
[
  { "OwnerEmail": "ada@example.org", "Title": "Morning motif" },
  { "OwnerEmail": "lin@example.org", "Title": "Evening variation" }
]
```

This illustrates the named read checks, not complete source privacy. Write/bulk response routes and actual source permissions require independent verification before using the source for private data. A select-only rule array does not prove every commit request is denied or its response isolated. Do not rely on UI availability, cooperative response options or evaluator-only tests to establish privacy.

Save this select-only illustration:

{% raw %}
```json
[
  {
    "type": ["select"],
    "allow": { "dataSourceId": 731, "user": { "Enabled": true } },
    "require": [{ "OwnerEmail": { "equals": "{{user.[Email]}}" } }]
  }
]
```
{% endraw %}

Allowed as Ada after signing in through Members:

```js
const sketches = await Fliplet.DataSources.connectByName('Composition Sketches', { offline: false });
const mine = await sketches.find({ where: { OwnerEmail: 'ada@example.org' } });
console.log(mine.map(entry => entry.data.Title)); // ['Morning motif']
```

Copy Ada's current fixture ID from Studio and call this function as Ada to check the record-read path:

```js
async function readOwnSketch(adaSketchId) {
  const sketches = await Fliplet.DataSources.connectByName('Composition Sketches', { offline: false });
  const own = await sketches.findById(adaSketchId);
  console.log(own.data.Title); // 'Morning motif'
}
```

Denied read tests as Ada: `find()` without an owner filter, `find({ where: { OwnerEmail: 'lin@example.org' } })` and `findById(linSketchId)` using Lin's actual fixture ID. Anonymous callers, a wrong-source login and `Enabled: false` must also be denied on these read paths.

The query rule validates `where`; it does not add an owner filter. `findById(id)` instead evaluates the stored row. This textual email comparison is case-insensitive; use normalized unique identities and do not assume case-sensitive ownership. Before asserting private deployment safety, verify commit and other response-bearing routes are actually unavailable or appropriately isolated under the source's real permissions, including their returned rows and columns. See [adversarial response tests](testing-security.md#check-write-responses).

## Editable profiles

**Goal:** An enabled member updates their stored profile through single-record writes while excluded fields remain unchanged. This example does not guarantee protection on bulk/commit writes.

Create **Performer Profiles** with columns `OwnerEmail`, `DisplayName` and `Badge`. Seed:

```json
[
  { "OwnerEmail": "ada@example.org", "DisplayName": "Ada", "Badge": "Soloist" },
  { "OwnerEmail": "lin@example.org", "DisplayName": "Lin", "Badge": "Member" }
]
```

For immutable ownership or protected badges across **all** endpoints, leave app-session updates disabled until an implemented trusted write path has been verified against source and runtime tests. This example does not provide that guarantee: bulk/commit updates can write fields that single-record `exclude` filters out. Omitting bulk methods from the UI is not server enforcement. A script's `query` can also come from caller-supplied `body.where`, so proposed-payload validation cannot be assumed even when `entry.data` exists.

Save:

{% raw %}
```json
[
  {
    "type": ["select", "update"],
    "allow": { "dataSourceId": 731, "user": { "Enabled": true } },
    "require": [{ "OwnerEmail": { "equals": "{{user.[Email]}}" } }],
    "exclude": ["OwnerEmail", "Badge"]
  }
]
```
{% endraw %}

For the explicitly limited single-record example, copy Ada's and Lin's fixture IDs from Studio and run as Ada:

```js
async function verifySingleProfileWrite(adaProfileId, linProfileId) {
  const profiles = await Fliplet.DataSources.connectByName('Performer Profiles', { offline: false });
  await profiles.update(adaProfileId, { DisplayName: 'Ada L.' });
  const saved = await profiles.findById(adaProfileId);
  console.log(saved.data.DisplayName); // 'Ada L.'
  let denied = false;
  try {
    await profiles.update(linProfileId, { OwnerEmail: 'ada@example.org', DisplayName: 'Changed' });
  } catch (error) {
    denied = true;
    console.log(error); // Stored Lin ownership does not match Ada.
  }
  if (!denied) throw new Error('Unexpected grant on another member’s profile.');
}
```

Also submit a single update of Ada's row with `Badge: 'Director'` and `OwnerEmail: 'lin@example.org'`. It can resolve successfully, but those excluded fields must remain unchanged in a trusted Studio readback; the read rule hides them from the SDK response. Anonymous or wrong-source updates, insert and delete must be denied. This distinguishes a rejected operation from a filtered field.

## Role and state access

**Goal:** An enabled Approver can update an existing Pending review. This demonstrates stored-state authorization only, not a complete approval workflow.

Create **Festival Reviews** with columns `WorkTitle`, `Stage` and `Comment`. Seed `{ "WorkTitle": "River quartet", "Stage": "Pending", "Comment": "" }`.

This policy permits changing Pending directly to any next stage. Do not use it as approval-transition enforcement. Leave strict workflow writes disabled until an implemented trusted write path and actor-operation tests verify caller role, stored stage, proposed stage and protected fields across all allowed endpoints.

Save this illustrative stored-state policy:

```json
[
  {
    "type": ["select"],
    "allow": { "dataSourceId": 731, "user": { "Enabled": true } }
  },
  {
    "type": ["update"],
    "allow": { "dataSourceId": 731, "user": { "Enabled": true, "Roles": "Approver" } },
    "require": [{ "Stage": { "equals": "Pending" } }]
  }
]
```

As Ada (`Roles: ['Author', 'Approver']`), a single update of the seeded Pending review's `Comment` is allowed:

```js
async function addReviewComment(reviewId) {
  const reviews = await Fliplet.DataSources.connectByName('Festival Reviews', { offline: false });
  await reviews.update(reviewId, { Comment: 'Ready for rehearsal' });
  const saved = await reviews.findById(reviewId);
  console.log(saved.data.Comment); // 'Ready for rehearsal'
}
```

Denied tests: Lin (`Roles: ['Author']`), a user with only `['SuperApprover']`, an inactive user or an anonymous caller attempting that update. Ada updating a seeded `Stage: 'Closed'` row must also be denied. Insert and delete have no grant.

**Transition limit:** Ada can also submit `Stage: 'Published'` while the stored row is Pending. The requirement does not validate the next stage. Do not deploy this example as an approval-transition policy. A strict workflow needs server checks of caller role, stored stage, proposed stage and protected fields on every allowed write path. A single-update script can inspect `entry.data`, but commit lacks `entry`, and even a single-update request can supply `body.where` instead of the proposed payload to the script. Keep strict workflow writes unavailable until an implemented trusted write path and its actor-operation tests establish the required contract. Frontend guards and rule-query mutation do not supply that guarantee.
