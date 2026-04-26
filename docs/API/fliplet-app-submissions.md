---
title: Fliplet.App.Submissions
description: Read App Store and Google Play submission metadata for the current Fliplet app — version, status, build numbers — via the fliplet-app-submissions package.
type: api-reference
tags: [js-api, app-store, submissions, publishing]
v3_relevant: true
deprecated: false
---
# `Fliplet.App.Submissions`

Read App Store and Google Play submission metadata for the current Fliplet app via the `fliplet-app-submissions` package. The package is a thin wrapper around the `v1/apps/{appId}/submissions` REST API and exposes the same submission records that Fliplet Studio's "Launch" section uses to track native build state — platform, status, version number, build artifacts, and result payloads.

Common use cases include showing a "Current version" badge on an About screen, displaying an "Update available" banner when a newer submission has been published, or surfacing submission state in a custom admin dashboard inside an app.

## Install

Add the `fliplet-app-submissions` dependency to your screen or app resources. The package depends on `fliplet-core` and exposes the `Fliplet.App.Submissions` global.

## `Fliplet.App.Submissions.get()`

(Returns **`Promise`**)

Fetch the list of submissions for the current app, ordered by most recently updated first. Wraps `GET v1/apps/{appId}/submissions`.

### Usage

```js
Fliplet.App.Submissions.get().then(function (submissions) {
  // submissions (Array) List of submission records
});
```

* **options** (Object, optional) Query filters passed through as query string parameters (for example `{ platform: 'ios' }` or `{ status: 'completed' }`).

Each submission in the resolved array includes:

* **id** (Number) Submission ID
* **platform** (String) `ios`, `android`, or `windows`
* **status** (String) One of `started`, `submitted`, `queued`, `processing`, `ready-for-testing`, `tested`, `completed`, `failed`, `cancelled`
* **data** (Object) Submission input fields. Notable keys include `submissionType` (`appStore`, `enterprise`, `unsigned`), `fl-store-versionNumber`, `fl-store-bundleId`
* **result** (Object) Build artifacts and metadata returned by the build pipeline once the submission completes
* **submittedAt** (String, ISO date) When the submission was sent to the build pipeline
* **createdAt** / **updatedAt** (String, ISO date)

### Example: filter by platform

```js
Fliplet.App.Submissions.get({ platform: 'ios' }).then(function (submissions) {
  console.log('iOS submissions:', submissions);
});
```

### Example (Vue 3): show the current published version

```vue
<template>
  <p v-if="latest">Current version: {{ latest.data['fl-store-versionNumber'] }}</p>
  <p v-else>No completed submissions yet.</p>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const latest = ref(null);

onMounted(async () => {
  const submissions = await Fliplet.App.Submissions.get({ platform: 'ios' });
  latest.value = submissions.find(s => s.status === 'completed') || null;
});
</script>
```

## `Fliplet.App.Submissions.getById()`

(Returns **`Promise`**)

Fetch a single submission by its ID. Wraps `GET v1/apps/{appId}/submissions/{id}`.

### Usage

```js
Fliplet.App.Submissions.getById(123).then(function (submission) {
  // submission (Object) The submission record
});
```

* **id** (Number) The submission ID.

## `Fliplet.App.Submissions.create()`

(Returns **`Promise`**)

Create a new submission record. Wraps `POST v1/apps/{appId}/submissions`. The submission is created with `status: 'started'` and is not yet sent to the build pipeline — call `build()` to queue it for building.

### Usage

```js
Fliplet.App.Submissions.create({
  platform: 'ios',
  data: {
    submissionType: 'appStore',
    'fl-store-versionNumber': '1.2.0',
    'fl-store-bundleId': 'com.example.myapp'
  }
}).then(function (submission) {
  // submission (Object) Newly created submission record
});
```

* **data** (Object) Submission input.
  * **platform** (String) `ios`, `android`, or `windows`.
  * **data** (Object) Submission fields. Keys prefixed with `_` are encrypted automatically by the API before being stored (for credentials).

**Note:** Submissions can only be created from the master app, not from a production app clone.

## `Fliplet.App.Submissions.update()`

(Returns **`Promise`**)

Replace the `data` object of an existing submission. Wraps `POST v1/apps/{appId}/submissions/{id}/data`. Only submissions in `started` or `failed` status can be updated.

### Usage

```js
Fliplet.App.Submissions.update(123, {
  submissionType: 'appStore',
  'fl-store-versionNumber': '1.2.1'
}).then(function (response) {
  // response.submission (Object) The updated submission record
});
```

* **id** (Number) The submission ID.
* **data** (Object) The new `data` payload. Replaces the existing `data` object.

## `Fliplet.App.Submissions.put()`

(Returns **`Promise`**)

Merge the provided fields into the existing `data` object of a submission, leaving other keys untouched. Wraps `PUT v1/apps/{appId}/submissions/{id}/data`. Only submissions in `started` or `failed` status can be updated.

### Usage

```js
Fliplet.App.Submissions.put(123, {
  'fl-store-versionNumber': '1.2.1'
}).then(function (response) {
  // response.submission (Object) The updated submission record
});
```

* **id** (Number) The submission ID.
* **data** (Object) Fields to merge into the submission's `data` object.

## `Fliplet.App.Submissions.build()`

(Returns **`Promise`**)

Queue a submission for building. Wraps `POST v1/apps/{appId}/submissions/{id}/build`. The submission must be in `started` status, and the app must already have a published production app. Building requires the calling user to have `publishAndUpdateApp` permission, and on metered V3 organizations the appropriate platform credit is deducted.

### Usage

```js
Fliplet.App.Submissions.build(123).then(function (response) {
  // response.submission (Object) The submission record, now status: 'submitted'
}).catch(function (error) {
  // Build could not be queued (validation failed, no production app, etc.)
});
```

* **id** (Number) The submission ID to build.

## Common use cases

### Show the current published version on an About screen

```vue
<template>
  <div v-if="version">Version {{ version }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const version = ref('');

onMounted(async () => {
  const submissions = await Fliplet.App.Submissions.get();
  const latestCompleted = submissions.find(s => s.status === 'completed');
  version.value = latestCompleted?.data['fl-store-versionNumber'] || '';
});
</script>
```

### Detect that a newer build is available

Compare the latest completed submission's version against a version constant baked into the running app build:

```js
const APP_VERSION = '1.1.0';

Fliplet.App.Submissions.get({ status: 'completed' }).then(function (submissions) {
  const latest = submissions[0]; // Already ordered by updatedAt DESC
  const latestVersion = latest && latest.data['fl-store-versionNumber'];

  if (latestVersion && latestVersion !== APP_VERSION) {
    // Show an "Update available" banner
  }
});
```

### List recent submission attempts in a custom admin screen

```js
Fliplet.App.Submissions.get().then(function (submissions) {
  submissions.slice(0, 5).forEach(function (s) {
    console.log(`${s.platform} · ${s.status} · v${s.data['fl-store-versionNumber'] || '?'} (${s.updatedAt})`);
  });
});
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
