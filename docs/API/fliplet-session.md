# Session JS APIs

## Get and set values

### Get the current session

```js
Fliplet.Session.get().then(function onSessionRetrieved(session) {
  // console.log(session);
});
```

### Get a key from the current session

```js
Fliplet.Session.get(key).then(function onSessionKeyRetrieved(value) {
  // console.log(value);
});
```

### Set new values into the current session

```js
Fliplet.Session.set({ foo: 'bar' }).then(function onSessionUpdated() {
  // session data has been set
});
```

### Clear all values from the current session

```js
Fliplet.Session.clear().then(function onSessionCleared() {
  // session has been cleared
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
Fliplet.Session.get().then(function(session) {
  if (session && session.entries) {
    // the user is logged in;

    // you can also check for which login type
    if (session.entries.dataSource) {
      // user is logged in against a Fliplet dataSource
    }

    // you can also check for which login type
    if (session.entries.saml2) {
      // user is logged in against your company's SAML2
    }

    // you can also check for which login type
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
Fliplet.Session.get().then(function(session) {
  if (session && session.entries && session.entries.dataSource) {
    // the user is logged in against a Fliplet dataSource

    var userData = session.entries.dataSource.data;
    // userData will contain all data found on the connected dataSource row
  }
});
```

### Example for Fliplet Studio login

```js
Fliplet.Session.get().then(function(session) {
  if (session && session.entries && session.entries.dataSource) {
    // the user is logged in against a Fliplet Studio account

    var userData = session.entries.flipletLogin;
    // userData contains id, email, firstName, lastName, fullName, userRoleId, legacyId
  }
});
```

[Back to API documentation](../API-Documentation.md)
{: .buttons}
