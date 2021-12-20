# Session JS APIs

## Get and set values

### Get the current session

```js
// Get the session using the locally cached offline data.
// This is fast and work across all network conditions.
Fliplet.User.getCachedSession().then(function onCachedSessionRetrieved(session) {
  console.log(session);
});

// This only works if the app is online as it makes an API request
// to Fliplet servers to return the live data.
Fliplet.Session.get().then(function onSessionRetrieved(session) {
  console.log(session);
});
```

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
// Get the user's locale, taking into account its device settings
// e.g. "fr" if the user has either set its device to French or the language
// has been set using the above JS API to "fr".
var locale = Fliplet.Env.get('userLocale');

// Get the list of user's locales. As an example, when the locale has been set to "fr-ca"
// the resulting list will be: ['fr-ca', 'fr', 'en-GB', 'en-US', 'en', 'it']
var locales = Fliplet.Env.get('userLocales');

// Get the locale that has previously been set with the "set()" method.
Fliplet.Session.Locale.get().then(function (language) {
  // language will be the locale string you previously set, e.g. "fr-ca"
});
```

[Back to API documentation](../API-Documentation.md)
{: .buttons}
