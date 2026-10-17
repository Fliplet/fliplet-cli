---
title: Fliplet.Session
description: "Read, write, and clear the current user session — including cached offline sessions — for authentication state in Fliplet apps."
type: api-reference
tags: [js-api, session]
v3_relevant: true
deprecated: false
category: identity
capabilities: [session, auth session, login state, current user session, offline session, signin state, passport, sso session, connected account]
---
# `Fliplet.Session`

Read, write, and clear the current user session — including cached offline sessions — for authentication state in Fliplet apps.

## Get and set values

### Get the current session

```js
// Get the session using the locally cached offline data.
// This is fast and work across all network conditions.
Fliplet.User.getCachedSession().then(function onCachedSessionRetrieved(session) {
  // Use the session for UI state; do not log authentication fields.
});

// Request the current session. If the request fails, get() can return
// a stored session; use the fresh-read method below for access checks.
Fliplet.Session.get().then(function onSessionRetrieved(session) {
  // Use the session for UI state; do not log authentication fields.
});
```

### Read the session without a stored-session fallback

Use `Fliplet.Session.run({ url: 'v1/session', cache: false })` when a failed session read must stop an operation. Include `fliplet-session` in an app action's dependencies. The promise resolves to a response object containing `session`; it rejects when the request fails. Treat a missing or malformed `response.session` as a failed access check.

```js
const response = await Fliplet.Session.run({ url: 'v1/session', cache: false });
const session = response && response.session;
const login = session && session.entries && session.entries.dataSource;
// For Data Source login, login.dataSourceId identifies the login Data Source
// and login.id identifies its authenticated entry. Check the intended source
// and operation's permissions before granting access.
```

`Fliplet.Session.get()` also requests the session, but can fall back to a stored session if the request fails. `Fliplet.User.getCachedSession()` is appropriate for cached UI decisions; neither a cached result nor the existence of a session establishes permission for a private operation. In a server action, use the fresh read above and follow [caller authorization](core/app-actions-v3#authorize-callers-before-accessing-private-data). Do not log the session response or its authentication fields.

### Get a key from the current session

```js
Fliplet.Session.get(key).then(function onSessionKeyRetrieved(value) {
  console.log(value);
});
```

### Set new values into the current session

```js
Fliplet.Session.set({ foo: 'bar' }).then(function onSessionUpdated() {
  // session data has successfully been set here
});
```

### Clear all values from the current session

```js
Fliplet.Session.clear().then(function onSessionCleared() {
  // session has been cleared when this runs
});
```

---

## Passports

### Log out the user from a passport

The `logout()` function requires the first parameter to be the passport type to log out from. Valid inputs are `saml2`, `dataSource` and `flipletLogin`.

```js
Fliplet.Session.logout('dataSource').then(function () {
  // here you can redirect (or else) once log out is acknowledged from the server
});
```

### Log out from all passports

If you don't provide a specific passport type to the `logout()` function, the user will be logged out from all its passports. This is useful to code a generic "log out" feature instead of relying on a specific login component.

```js
Fliplet.Session.logout().then(function onSessionDestroyed() {
  // user has been logged out
});
```

---

## Read details about connected accounts

If your app contains a login component (either DataSource, SAML2 or Fliplet) you can use the session to check whether the user is logged in and in and some of the connected account(s) details:

```js
Fliplet.User.getCachedSession().then(function(session) {
  if (session && session.entries) {
    // the user is logged in;

    // check if the user is connected to a dataSource login
    if (session.entries.dataSource) {
      // user is logged in against a Fliplet dataSource
    }

    // check if the user is connected to a SAML2 login
    if (session.entries.saml2) {
      // user is logged in against your company's SAML2
    }

    // check if the user is connected to a Fliplet login
    if (session.entries.flipletLogin) {
      // user is logged in with a Fliplet Studio account
    }
  } else {
    // not logged in
  }
});
```

Data for the connected account(s) can also be read and used as necessary:

### Example for dataSource login

```js
Fliplet.User.getCachedSession().then(function (session) {
  var user = _.get(session, 'entries.dataSource.data');

  if (!user) {
    return; // user is not logged in
  }

  // contains all columns found on the connected dataSource entry
  console.log(user);
});
```

### Example for SAML2

```js
Fliplet.User.getCachedSession().then(function (session) {
  var user = _.get(session, 'entries.saml2.user');

  if (!user) {
    return; // user is not logged in
  }

  // contains id, email, firstName, lastName
  console.log(user);
});
```

### Example for Fliplet Studio login

```js
Fliplet.User.getCachedSession().then(function (session) {
  var user = _.get(session, 'entries.flipletLogin');

  if (!user) {
    return; // user is not logged in
  }

  // contains id, email, firstName, lastName, fullName, userRoleId, legacyId
  console.log(user);
});
```

---

## Language (locale)

<p class="warning"><strong>[Closed beta]</strong> This feature is currently in development and it's not available yet to all customers.</p>

### Set the current user's language to a new locale

```js
// Change the language to a new country code
Fliplet.Session.Locale.set('fr');

// Change the language to a new country + territory code
Fliplet.Session.Locale.set('fr-ca');
```

### Get the current user's language

```js
// Get the primary locale in use by the user for the current app
var locale = Fliplet.Env.get('userLocale');

// Get the list of user's locales. As an example, when the locale has been set to "fr-ca"
// the resulting list may be: ['fr-ca', 'fr', 'en-GB', 'en-US', 'en', 'it']
var locales = Fliplet.Env.get('userLocales');

// Get the locale that has previously been set
// in the user's session  with the "set()" method.
// This allows you to check if a language has been explicitly set by the user.
Fliplet.Session.Locale.get().then(function (language) {
  // language will be the locale string you previously set, e.g. "fr-ca"
});
```

### Get the list of locales supported by the current app

```js
// Gets the list of locales defined for the current app as set by the Studio user
var locales = Fliplet.App.Locales.get();
```

---

[Back to API documentation](../API-Documentation)
{: .buttons}
