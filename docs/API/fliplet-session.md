# Session JS APIs

## Get and set values

### Get the current session

```js
// Get the session using the locally cached offline data.
// This is fast and work across all network conditions.
Fliplet.Session.getCachedSession().then(function onCachedSessionRetrieved(session) {
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
Fliplet.Session.logout('saml2').then(function () {
  // here you can redirect (or else) once log out is acknowledged from the server
});
```

## Destroy the current session

Note: you should not use this on webapps since users won't be able to log in back.

```js
Fliplet.Session.destroy().then(function onSessionDestroyed() {
  // session has been destroyed
});
```

---

## Read details about connected accounts

If your app contains a login component (either DataSource, SAML2 or Fliplet) you can use the session to check whether the user is logged in and in and some of the connected account(s) details:

```js
Fliplet.Session.getCachedSession().then(function(session) {
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

[Back to API documentation](../API-Documentation.md)
{: .buttons}
