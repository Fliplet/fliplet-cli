---
description: V3 app settings convention for storing public and private configuration. Covers the underscore prefix convention for editor-private settings.
---

# V3 App Settings Convention

App settings in V3 use `app.settings` to store configuration for features like authentication, push notifications, and analytics. This page describes the naming convention that controls which settings are visible to the app runtime (preview and published apps) vs only to Studio editors.

## The Underscore Convention

Settings keys that start with `_` are **editor-private**. They are visible to Studio editors managing the app but are NOT included in the app runtime (preview iframe, published apps, bundled apps).

| Key pattern | Who can read it | Example |
|---|---|---|
| `settingName` | App runtime + Studio + backend | `app.settings.saml2` (IdP URL, attribute mappings) |
| `_settingName` | Studio editors + backend only | `app.settings._saml2` (IdP certificate) |

The convention uses **top-level key namespacing**. All private settings for a feature go under a single `_feature` key, not mixed into the public feature key.

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
  }
}
```

When the app loads in the preview iframe or as a published app, `_saml2` is stripped from `window.ENV.appSettings`. The running app only sees:

```js
window.ENV.appSettings = {
  saml2: {
    idpUrl: 'https://idp.company.com/sso',
    attributeMappings: { email: 'Email', name: 'Name' }
  }
  // _saml2 is NOT here
}
```

Backend code (server-side passports, hooks, app actions) reads the full `app.settings` from the model — no filtering is applied server-side.

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
```

### Saving Settings

The `PUT /v1/apps/:id` endpoint performs a **shallow merge** on `settings`. Top-level keys in your request overwrite existing keys with the same name. Keys you don't include are preserved. Nested objects are replaced entirely, not deep-merged.

```js
// Save both public and private settings together.
// This MERGES at the top level: saml2 and _saml2 are set/replaced,
// but other top-level keys (customCSS, etc.) are preserved.
await Fliplet.API.request({
  url: 'v1/apps/' + appId,
  method: 'PUT',
  data: {
    settings: {
      saml2: {
        idpUrl: 'https://idp.company.com/sso',
        attributeMappings: { email: 'Email', name: 'Name' }
      },
      _saml2: {
        idpCertificate: certificateText
      }
    }
  }
});

// WARNING: This replaces the ENTIRE _saml2 object.
// If _saml2 previously had { idpCertificate, otherField },
// after this call it only has { idpCertificate }.
// Always send the complete object for each top-level key.
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
// _ keys are visible to Studio editors. For truly server-only secrets,
// a future convention (__prefix) will be used. For now, use app widgets
// or environment variables for server-only secrets.

// DO: Check for existence before reading settings
var saml2 = app.settings.saml2 || {};

// DON'T: Assume settings exist — they may not be configured yet
var url = app.settings.saml2.idpUrl; // Throws if saml2 is undefined
```

## When to Use Private Settings

Use `_` prefix for settings that:
- Contain credentials, certificates, or keys that app users should not see
- Are only needed by Studio UI or backend processing, not by the running app
- Would be a security risk if exposed in client-side JavaScript

Examples:
- `_saml2.idpCertificate` — X.509 certificate for SAML signature verification
- `_push.apnsCertificate` — Apple Push Notification certificate (future)
- `_analytics.apiKey` — Analytics service API key (future)

## Related

- [Session JS APIs](../fliplet-session.md) — session management
- [V3 Authentication Patterns](auth.md) — auth flows for V3 apps
- [App Security](../../App-security.md) — app-level access control
