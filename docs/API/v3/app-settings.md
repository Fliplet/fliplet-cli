---
title: "V3 App Settings Convention"
description: "V3 app settings convention: public, private (_) and protected (__) keys, who can read each, and how server app actions read them."
type: guide
tags: [js-api, v3, app-settings]
v3_relevant: true
deprecated: false
---

# V3 App Settings Convention

App settings in V3 use `app.settings` to store configuration for features like authentication, push notifications, and analytics. This page describes the naming convention that controls which settings are visible to the app runtime (preview and published apps), to Studio editors, or to server-side code only.

## The Underscore Convention

The prefix of a **top-level** settings key sets its tier:

| Key pattern | Tier | Who can read it | Example |
|---|---|---|---|
| `settingName` | Public | App runtime + Studio + backend | `app.settings.saml2` (IdP URL, attribute mappings) |
| `_settingName` | Private | Studio editors + backend + server app actions. Never sent to the app runtime, preview or bundles. | `app.settings._saml2` (IdP certificate) |
| `__settingName` | Protected | Backend + server app actions only. Write-only over HTTP: nobody can read it back, not Studio editors and not API tokens. | `app.settings.__mailProvider` (third-party API key) |

Settings keys that start with a **single** `_` are **editor-private**. They are visible to Studio editors managing the app but are NOT included in the app runtime (preview iframe, published apps, bundled apps).

Settings keys that start with `__` are **protected**: they are not included in the app runtime either, and they are not visible to Studio editors. See [Protected settings](#protected-settings).

The convention uses **top-level key namespacing**. All private settings for a feature go under a single `_feature` (or `__feature`) key, not mixed into the public feature key.

## How It Works

```
app.settings = {
  // Public settings — visible to the running app, Studio, and backend
  saml2: {
    idpUrl: 'https://idp.company.com/sso',
    attributeMappings: { email: 'Email', name: 'Name' }
  },

  // Editor-private settings — visible to Studio editors, NOT to the running app
  _saml2: {
    idpCertificate: '-----BEGIN CERTIFICATE-----\nMIID...'
  },

  // Protected settings — NOT readable over HTTP by anyone, NOT in the running app
  __mailProvider: {
    apiKey: 'sk_live_...'
  }
}
```

When the app loads in the preview iframe or as a published app, every top-level key starting with `_` (`_saml2` and `__mailProvider` here) is stripped from `window.ENV.appSettings`. The running app only sees:

```js
window.ENV.appSettings = {
  saml2: {
    idpUrl: 'https://idp.company.com/sso',
    attributeMappings: { email: 'Email', name: 'Name' }
  }
  // _saml2 and __mailProvider are NOT here
}
```

Backend code that runs inside the Fliplet API (server-side passports, hooks) reads the full `app.settings` from the model — no filtering is applied there.

App action code does **not** run inside the API and never reads the model. A V3 app action with `environment: 'server'` receives the underscore keys as `context.settings` — see [Reading settings in a server action](#reading-settings-in-a-server-action). `client` and `any` actions get no private settings; on the device they only see what the app runtime sees.

## Protected settings

Use a `__` key for a secret that must never be read back, such as a third-party API key used by a server action.

- Every HTTP read of app settings omits top-level keys starting with `__`. This applies to Studio editors, admins, API tokens and app action (task) tokens.
- Studio editors can write and delete `__` keys through `POST` and `DELETE /v1/apps/:id/settings`, but can never read them back. To change a value, overwrite it.
- `PUT /v1/admin/apps/:app` ignores `__` keys in the `settings` body and keeps the app's current values. Rotating a protected key there returns `200` and changes nothing — use `POST /v1/apps/:id/settings`.
- App action (task) tokens can not write or delete `__` keys — the request fails with `403`.
- V3 app version snapshots taken from this release onwards do not store `__` keys, and older snapshots that still hold them never return them. Restoring an app version keeps the app's current `__` values.
- Like `_` keys, `__` keys are never sent to the app runtime, preview or bundles.
- Server app actions receive `__` keys in `context.settings`, together with `_` keys.

## Reading settings in a server action

A V3 app action with `environment: 'server'` receives every top-level app setting whose key starts with `_` (both `_private` and `__protected`) as `context.settings`:

```js
async function execute(context) {
  const settings = context.settings || {};

  // Saved by a Fliplet AI Builder secure panel field (settingKey: 'mailApiKey')
  const apiKey = settings._aiartifact_mailApiKey;

  // Or, for a protected key saved through the REST API:
  // const apiKey = (settings.__mailProvider || {}).apiKey;

  if (!apiKey) {
    return { sent: false, error: 'MAIL_PROVIDER_NOT_CONFIGURED' };
  }

  // Send apiKey in a request header or body.
  // Never return it, log it, throw it or put it in a URL.
  return { configured: true };
}
```

- A Fliplet AI Builder panel field of type `secure` with a `secure` destination is saved by Studio as `_aiartifact_<settingKey>` and read as `context.settings._aiartifact_<settingKey>`. These are `_` (private) keys: Studio editors of the app can read them over the API.
- Keep `settingKey` simple and alphanumeric. Studio replaces every character outside `a-zA-Z0-9_.-` with `_`, so a key containing a space, `@` or `/` is stored under a different name than you wrote. `-` and `.` survive but break dot access — a key containing either needs bracket access, for example `settings['_aiartifact_mail-api-key']`.
- Values always come from the **master** app and are read fresh on every run. Published apps read the master's values; a rotated value applies to the next run without republishing.
- `client` and `any` actions always get `context.settings = {}`.
- If the underscore settings exceed 100 KB in total, every server action of the app fails until they are reduced.

See [`context.settings` in App Actions V3](../core/app-actions-v3#contextsettings-server-actions-only) for the complete example, the limits and the rules for keeping values out of logs and responses.

## Usage Patterns

### Reading Public Settings (App Runtime)

```js
// In a Vue component or app code — reads from the runtime environment
var appSettings = window.ENV.appSettings || {};
var saml2Config = appSettings.saml2;

if (saml2Config && saml2Config.idpUrl) {
  // SAML2 is configured — show SSO login button
}
```

### Reading All Settings (Studio)

```js
// In Studio code (AppSettings.vue, tools, etc.) — reads full settings including _prefixed
var response = await Fliplet.API.request({ url: 'v1/apps/' + appId + '/settings/' });
var settings = response;

// settings._saml2 is available here (editor context)
var certificate = settings._saml2 && settings._saml2.idpCertificate;

// __ keys are never returned, even to editors:
// settings.__mailProvider is undefined here
```

### Saving Settings

Settings are saved with `POST /v1/apps/:id/settings`. The setting keys go **flat in the request body** — they are not nested under a `settings` property.

The endpoint performs a **shallow merge**: top-level keys in your request overwrite existing keys with the same name, keys you don't include are preserved, and nested objects are replaced entirely rather than deep-merged.

```js
// Save both public and private settings together.
// The keys are top-level in `data` — NOT wrapped in { settings: {...} }.
// This MERGES at the top level: saml2 and _saml2 are set/replaced,
// but other top-level keys (customCSS, etc.) are preserved.
await Fliplet.API.request({
  url: 'v1/apps/' + appId + '/settings',
  method: 'POST',
  data: {
    saml2: {
      idpUrl: 'https://idp.company.com/sso',
      attributeMappings: { email: 'Email', name: 'Name' }
    },
    _saml2: {
      idpCertificate: certificateText
    }
  }
});

// WARNING: This replaces the ENTIRE _saml2 object.
// If _saml2 previously had { idpCertificate, otherField },
// after this call it only has { idpCertificate }.
// Always send the complete object for each top-level key.
```

<p class="warning"><code>PUT /v1/apps/:id</code> does <strong>not</strong> write app settings. It only updates <code>name</code>, <code>startingPageId</code>, <code>hooks</code>, <code>isTemplate</code>, <code>dependencies</code> and <code>icon</code>. Sending <code>settings</code> to it returns <code>200</code> and stores nothing, so a server action reading the value afterwards sees it as not configured, with no error anywhere.</p>

### Removing Settings

Delete settings keys with `DELETE /v1/apps/:id/settings`, passing an array of top-level key names as `keys`. There is no way to delete a nested property — write the complete parent object instead.

```
DELETE /v1/apps/:id/settings

{ "keys": ["_saml2", "__mailProvider"] }
```

```js
await Fliplet.API.request({
  url: 'v1/apps/' + appId + '/settings',
  method: 'DELETE',
  data: {
    keys: ['_saml2', '__mailProvider']
  }
});
```

## DO and DON'T

```js
// DO: Use top-level namespacing for private settings
app.settings._saml2 = { idpCertificate: '...' };

// DON'T: Mix private keys inside a public namespace
app.settings.saml2 = { idpUrl: '...', _certificate: '...' };
// The _ filter only operates on top-level keys. Nested _ keys are NOT filtered.

// DO: Put related public and private config in sibling keys
app.settings.push = { enabled: true };       // public
app.settings._push = { apnsCertificate: '...' };  // editor-private

// DON'T: Store secrets that should never leave the server in _ keys
// _ keys are visible to Studio editors.

// DO: Store server-only secrets in top-level __ keys
app.settings.__mailProvider = { apiKey: '...' };
// __ keys are write-only over HTTP: nobody can read them back.
// Only server app actions (context.settings) and backend code read them.

// DON'T: Read a __ key back to check or merge it — it is never returned.
// Always write the complete object for the key.

// DO: Check for existence before reading settings
var saml2 = app.settings.saml2 || {};

// DON'T: Assume settings exist — they may not be configured yet
var url = app.settings.saml2.idpUrl; // Throws if saml2 is undefined
```

## When to Use Private Settings

Use `_` prefix for settings that:
- Contain credentials, certificates, or keys that app users should not see
- Are only needed by Studio UI, backend processing or server app actions, not by the running app
- Would be a security risk if exposed in client-side JavaScript

Credentials collected by a Fliplet AI Builder secure panel field are always saved as `_aiartifact_<settingKey>` keys, with every character outside `a-zA-Z0-9_.-` replaced by `_`. They are private, not protected: Studio editors of the app can read them over the API, and server app actions read them via `context.settings`.

When saving settings through the REST API, use `__` prefix instead when Studio editors do not need to read the value back — for example an API key that only a server app action uses.

Examples:
- `_saml2.idpCertificate` — X.509 certificate for SAML signature verification
- `_push.apnsCertificate` — Apple Push Notification certificate (future)
- `_analytics.apiKey` — Analytics service API key (future)

## Related

- [App Actions V3](../core/app-actions-v3) — `context.settings` reference and full example
- [Session JS APIs](../fliplet-session) — session management
- [V3 Authentication Patterns](auth) — auth flows for V3 apps
- [App Security](../../App-security) — app-level access control
