---
title: "V3 App Settings Convention"
description: "Store public, editor-private and protected app settings, and read credentials inside server-side app actions."
type: guide
tags: [js-api, v3, app-settings, integrations]
v3_relevant: true
deprecated: false
---

# V3 App Settings Convention

App settings store configuration for an app. Top-level key prefixes control which values are available to app screens, Studio editors, and server-side app actions.

## Contents

- [The underscore convention](#the-underscore-convention)
- [How it works](#how-it-works)
- [Usage patterns](#usage-patterns)
- [DO and DON'T](#do-and-dont)
- [When to use private settings](#when-to-use-private-settings)
- [Related](#related)

## The Underscore Convention

| Top-level key | App screens, preview and published bundles | Editor settings reads | Action declared `environment: 'server'` |
|---|---|---|---|
| `settingName` | Available | Available | Available |
| `_settingName` | Omitted | Available | Available |
| `__settingName` | Omitted | Omitted | Available |

Use **public** keys for configuration that app users may read. A single leading underscore makes a key **editor-private**: app screens cannot read it, but authorized Studio editors can. Two leading underscores make a key **protected**: authorized editors can set, replace, delete, or check whether a value is configured, but ordinary settings responses do not return the value.

This policy applies to top-level names. A nested `_token` inside a public `provider` object is public. Put the entire sensitive value or object under a private or protected top-level key.

The legacy `_aiartifact_` prefix is an exception to the single-underscore rule: these credential values are also protected. Use `__aiartifact_` for configuration-panel credentials and `__` for other protected settings. `__proto__`, `constructor`, and `prototype` are rejected setting names.

**Trust action authors with these credentials.** Someone allowed to edit server action code can write code that reads and returns a protected value. Protected settings prevent routine value retrieval and inclusion in app screens; they do not hide credentials from trusted action authors or the dependencies those authors load.

## How It Works

App screens read their available settings through `Fliplet.App.Settings.get(key)` or `Fliplet.App.Settings.getAll()`. These are synchronous reads of the current execution environment, not REST requests. An absent or unavailable key returns `undefined` from `get()`.

An action declared `environment: 'server'` receives settings from the app's current development (master) app for each invocation. This also applies when the action itself is published. Replacing or deleting a credential affects subsequent invocations without republishing the action; an invocation already running keeps its initial settings.

Actions declared `client` or `any` do not receive private or protected settings, including when an `any` action is invoked on the server. Opening an action's compiled HTML in a browser does not provide protected values. See [App Actions V3](../core/app-actions-v3.md) for execution and integration requests.

Protected values are omitted from ordinary app responses and app-version snapshots. Restoring an app version preserves its current protected settings rather than restoring old credentials. Cloning an app does not provision credentials for the clone; configure them separately.

## Usage Patterns

### Reading Public Settings (App Runtime)

```js
var provider = Fliplet.App.Settings.get('provider');
var integrationEnabled = Boolean(provider && provider.enabled);
```

This works in app code with Fliplet core loaded. It does not grant access to private or protected values.

<a id="reading-all-settings-studio"></a>

### Reading editor-visible settings

`GET /v1/apps/:appId/settings/` requires editor access to the development (master) app. It returns a settings object containing public and ordinary editor-private keys; protected keys and legacy `_aiartifact_` credentials are omitted.

```js
// Editor context only. appId is the development app being configured.
async function readEditorSettings(appId) {
  var settings = await Fliplet.API.request({
    url: 'v1/apps/' + appId + '/settings/'
  });
  return settings;
}
```

### Saving Settings

Use `POST /v1/apps/:appId/settings/` for explicit credential writes with editor authorization. The request body is the settings map itself, without a `settings` wrapper. Each supplied top-level key replaces its value; omitted keys are preserved. Nested objects are replaced, not deep-merged. Send the complete object for each top-level key.

Collect a credential through a secure configuration input. Do not put it in app source, caller payloads, chat, browser storage, or logs. The following helper belongs in trusted editor configuration code, not an app screen. It receives a value collected by that input:

```js
async function saveProviderCredential(appId, credential) {
  if (typeof credential !== 'string' || !credential.trim()) {
    throw new Error('Enter a provider credential.');
  }

  await Fliplet.API.request({
    url: 'v1/apps/' + appId + '/settings/',
    method: 'POST',
    data: { __providerKey: credential }
  });
}
```

The response contains app configuration with protected values omitted; it does not echo the credential. Verify presence using the status endpoint below. `PUT /v1/apps/:appId` does not update app settings. Use `POST /v1/apps/:appId/settings/` for settings writes.

Omitting a key preserves it. Explicitly writing `''` or `null` is a write and makes its status unconfigured. To implement a “leave blank to keep existing” form, omit that key from the request; use an explicit delete action to remove it.

Task tokens used by actions cannot write or delete protected settings or author executable app configuration. They also cannot author app actions. Use editor authorization for setup; action code reads its supplied settings at execution time.

### Checking whether a credential is configured

`GET /v1/apps/:appId/settings/status` requires editor access to the development app and rejects task tokens. Supply `keys` as a JSON-encoded array of explicit protected names, up to 200 keys, with each name between 1 and 512 characters. Public and ordinary single-underscore names are rejected. The endpoint does not list secret names or return their values.

```js
async function isProviderConfigured(appId) {
  var response = await Fliplet.API.request({
    url: 'v1/apps/' + appId + '/settings/status',
    data: { keys: JSON.stringify(['__providerKey']) }
  });
  return response.configured.__providerKey === true;
}
```

Response:

```json
{ "configured": { "__providerKey": true } }
```

`true` means the stored value is neither missing, `null`, nor an empty string. It does not validate the credential or prove the provider is reachable. Confirm connectivity with a successful authenticated provider request from the action.

Studio configuration panels map a logical secure `settingKey` such as `providerKey` to `__aiartifact_providerKey`. When using such a panel, use the complete stored name for both the status request and `Fliplet.App.Settings.get('__aiartifact_providerKey')` inside the action. A manually saved `__providerKey` is a different key; the API does not rewrite arbitrary names.

For compatibility, status and server action reads recognize legacy `_aiartifact_` credentials through their `__aiartifact_` names. When both exist, the double-underscore value takes precedence, even if it is empty.

### Reading private and protected settings in an action

Save this code in an action declared `environment: 'server'`. Fliplet core is available to the action; these reads need no extra package:

```js
async function execute(context) {
  var credential = Fliplet.App.Settings.get('__providerKey');
  if (typeof credential !== 'string' || !credential) {
    return { success: false, error: 'Configure the provider credential first.' };
  }

  // This only verifies that the credential is available, not that it works.
  // Use credential in a server integration request; never return its value.
  return { success: true, configured: true };
}
```

For a full setup and provider request, see [server API integrations](../core/app-actions-v3.md#server-api-integrations).

### Deleting settings

Use `DELETE /v1/apps/:appId/settings/` with editor authorization and a `keys` array:

```js
async function deleteProviderCredential(appId) {
  await Fliplet.API.request({
    url: 'v1/apps/' + appId + '/settings/',
    method: 'DELETE',
    data: { keys: ['__providerKey'] }
  });
}
```

The response contains app configuration with protected values omitted. A later status request returns `false`. Deleting a `__aiartifact_` key also deletes its `_aiartifact_` legacy alias, and vice versa.

Settings write/delete validation rejects invalid key names or more than 200 supplied keys with HTTP 400. Unauthorized operations are rejected rather than silently applied.

## DO and DON'T

- Put sensitive values under a private or protected **top-level** key.
- Use `__` for integration credentials that editors should replace without routinely retrieving.
- Guard missing settings before using them.
- Keep provider URLs and allowed operations in trusted action code. Do not accept arbitrary URLs or authorization headers from app callers.
- Return only the business data callers are authorized to receive; do not return credential values, raw provider responses, or headers indiscriminately.
- Use the explicit settings REST endpoint for saved configuration. `Fliplet.App.Settings.set()` in development mode changes in-memory settings only; see [the settings JS reference](../core/app.md#development-mode-caveat).

## When to Use Private Settings

Use `_` for configuration that authorized editors need to read but app users should not receive, such as `_saml2.idpCertificate`. Use `__` for credentials needed by server actions, such as `__providerKey`. Protecting a credential does not authorize an app user to perform an operation: action code must validate input and enforce the app's access rules before making restricted provider requests.

## Related

- [App Actions V3](../core/app-actions-v3.md) — action configuration, integration transport, execution results
- [Fliplet.App settings](../core/app.md#settings) — synchronous reads and settings write helpers
- [Session JS APIs](../fliplet-session.md) — session management
- [V3 Authentication Patterns](auth.md) — auth flows for V3 apps
- [App Security](../../App-security.md) — app-level access control
