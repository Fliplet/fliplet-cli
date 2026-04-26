---
title: Fliplet.Security
description: Persist a per-app structured object to encrypted device storage via the fliplet-security package — for app-local secrets, device tokens, and per-user preferences. Distinct from fliplet-encryption (Data Source column-level encryption).
type: api-reference
tags: [js-api, security, encryption, storage]
v3_relevant: true
deprecated: false
---
# `Fliplet.Security`

Persist a structured, per-app object to **encrypted device-local storage** via the `fliplet-security` package. The package exposes two globals:

- `Fliplet.Security` — top-level namespace (currently a container for `Storage`).
- `Fliplet.Security.Storage` — the storage API for reading, writing, resetting, and removing the encrypted bag.

Each app gets its own bag, keyed internally by `appId`, so values written from one app never leak to another running on the same device.

> **Not the same as `fliplet-encryption`.** `fliplet-security` stores values **on the device** (a single encrypted bag per app, useful for tokens, flags, secrets). `fliplet-encryption` (`Fliplet.DataSources.Encryption`) transparently encrypts and decrypts **selected columns of a Data Source** as it goes to and from the server. If you need to protect data inside a Data Source row, use `fliplet-encryption`. If you need to keep something private on the device, use `fliplet-security`. See the [When to use this](#when-to-use-this) section for a side-by-side.

## When to use this

| You need to… | Use |
|---|---|
| Keep an OAuth token, refresh token, or API key private on the device | `fliplet-security` (`Fliplet.Security.Storage`) |
| Persist a small structured object across app launches with a default shape | `fliplet-security` |
| Protect specific Data Source columns (e.g. `firstName`, `bio`) end-to-end | `fliplet-encryption` (`Fliplet.DataSources.Encryption`) |
| Encrypt rows on the server so the API never sees plaintext | `fliplet-encryption` |
| Read/write the current login session | [`Fliplet.Session`](./fliplet-session.md) |
| Persist arbitrary unencrypted device data | `Fliplet.Storage` (in `fliplet-core`) |

The two packages are complementary, not interchangeable. They're often used together: `fliplet-encryption` to protect what's stored remotely, `fliplet-security` to protect the encryption key itself on the device.

## Install

Add the `fliplet-security` dependency to your screen or app resources. The package depends on `fliplet-core` and exposes `Fliplet.Security` and `Fliplet.Security.Storage` globally on load.

## How it works

`Fliplet.Security.Storage` maintains a single in-memory object (the "secure bag") for the current app. The bag is namespaced per app and persisted to encrypted device storage under the hood.

Each entry in the bag is created with a `key` and a `dataStructure` — the default shape used when the entry is first created and when it's reset. Reading an entry returns its `data`; writing values means mutating that `data` object and calling `update()` to persist.

A typical lifecycle:

1. Call `Fliplet.Security.Storage.init()` once on screen load to hydrate the bag.
2. Call `create(key, dataStructure)` for each entry your screen owns — idempotent; returns the existing `data` if already present.
3. Mutate the returned `data` object as the user interacts.
4. Call `update()` to persist.
5. Call `reset(key)` to revert one entry to its default shape, or `resetAll()` to wipe the whole bag (e.g. on logout).

## `Fliplet.Security.Storage.init()`

(Returns **`Promise<Object>`**)

Hydrates the secure bag for the current app from device storage into memory. Must be called once before any other method on `Fliplet.Security.Storage`. Subsequent calls are no-ops and resolve with the cached bag.

### Usage

```js
Fliplet.Security.Storage.init().then(function (bag) {
  // bag is the full secure object for this app
  // typically you don't need to use it directly — call create() / get() instead
});
```

### Vue 3 example

```vue
<script setup>
import { onMounted } from 'vue';

onMounted(async () => {
  await Fliplet.Security.Storage.init();
  // safe to call create / get / update from here on
});
</script>
```

## `Fliplet.Security.Storage.create(key, dataStructure)`

(Returns **`Promise<Object>`**)

Creates a new named entry in the secure bag, or returns the existing `data` if one already exists for that `key`. The `dataStructure` argument is shallow-cloned and stored as both the entry's initial `data` and its default shape (used later by `reset(key)`).

* **key** (String) — Unique key for this entry inside the bag.
* **dataStructure** (Object) — Default shape and initial values for the entry.

### Usage

```js
await Fliplet.Security.Storage.init();

const credentials = await Fliplet.Security.Storage.create('credentials', {
  accessToken: '',
  refreshToken: '',
  expiresAt: null
});

// credentials is the live data object — mutate it directly, then call update()
credentials.accessToken = 'eyJhbGciOi...';
credentials.expiresAt = Date.now() + 3600 * 1000;

await Fliplet.Security.Storage.update();
```

> `create()` is idempotent. Calling it again with the same `key` returns the existing entry's `data` rather than overwriting it. To wipe an entry back to its `dataStructure`, use `reset(key)`.

## `Fliplet.Security.Storage.get(key)`

(Returns **`Object | undefined`** — synchronous)

Reads the `data` for an existing entry. Returns `undefined` if no entry has been created for that `key`. **Synchronous** — `init()` must have already resolved.

* **key** (String) — Key the entry was created under.

### Usage

```js
await Fliplet.Security.Storage.init();
await Fliplet.Security.Storage.create('credentials', {
  accessToken: '',
  refreshToken: ''
});

const credentials = Fliplet.Security.Storage.get('credentials');

if (credentials && credentials.accessToken) {
  // user has a stored token
}
```

## `Fliplet.Security.Storage.update()`

(Returns **`Promise<Object>`**)

Persists the current in-memory state of the bag to device storage. Call this after mutating any entry's `data` object.

### Usage

```js
const prefs = Fliplet.Security.Storage.get('preferences');

prefs.theme = 'dark';
prefs.notificationsEnabled = false;

await Fliplet.Security.Storage.update();
```

> Mutations to `data` are **not** persisted automatically — `update()` is required.

## `Fliplet.Security.Storage.reset(key)`

(Returns **`Promise<Object>`**)

Resets a single entry's `data` back to the `dataStructure` that was passed when it was first created, then persists the bag. Other entries are untouched.

* **key** (String) — Key of the entry to reset.

### Usage

```js
// User signs out — clear their credentials but keep their UI preferences
await Fliplet.Security.Storage.reset('credentials');
```

## `Fliplet.Security.Storage.resetAll()`

(Returns **`Promise`**)

Removes the entire secure bag for the current app from device storage. Use this on full logout or "wipe app data" flows.

### Usage

```js
async function logoutAndWipe() {
  await Fliplet.Session.logout();
  await Fliplet.Security.Storage.resetAll();
  Fliplet.Navigate.screen('login');
}
```

> After `resetAll()`, the in-memory bag in the current page session may still hold previously-created entries. To use the storage again, call `init()` followed by `create()` for each entry you need.

## Full example

A screen that stores an OAuth token securely and reuses it across launches:

```vue
<template>
  <div>
    <button v-if="!isAuthenticated" @click="signIn">Sign in</button>
    <button v-else @click="signOut">Sign out</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const isAuthenticated = ref(false);
let credentials = null;

onMounted(async () => {
  await Fliplet.Security.Storage.init();

  credentials = await Fliplet.Security.Storage.create('oauthCredentials', {
    accessToken: '',
    expiresAt: null
  });

  isAuthenticated.value = !!credentials.accessToken
    && credentials.expiresAt > Date.now();
});

async function signIn() {
  // ...obtain a token from your OAuth flow
  credentials.accessToken = 'eyJhbGciOi...';
  credentials.expiresAt = Date.now() + 3600 * 1000;

  await Fliplet.Security.Storage.update();
  isAuthenticated.value = true;
}

async function signOut() {
  await Fliplet.Security.Storage.reset('oauthCredentials');
  isAuthenticated.value = false;
}
</script>
```

## Related

- [`Fliplet.DataSources.Encryption`](./fliplet-encryption.md) — column-level encryption for Data Sources.
- [`Fliplet.Session`](./fliplet-session.md) — current user session, login/logout, passport details.
- `Fliplet.Storage` (part of `fliplet-core`) — general-purpose unencrypted device storage.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
