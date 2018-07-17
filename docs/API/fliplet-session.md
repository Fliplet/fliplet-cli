# Session JS APIs

The `fliplet-session` package contains the following namespaces:

- [Session](#session)

---

## Session

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

### Destroys the current session

```js
Fliplet.Session.destroy().then(function onSessionDestroyed() {
  // session has been destroyed
});
```

---

### Read details about connected accounts

If your app contains a login component (either DataSource, SAML2 or Fliplet) you can use the session to check whether the user is logged in and in its data:

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

```js
Fliplet.Session.get().then(function(session) {
  if (session && session.entries && session.entries.dataSource) {
    // the user is logged in against a Fliplet dataSource

    var userData = session.entries.dataSource.data;
    console.log(userData.email); // print the user's email
  }
});
```

[Back to API documentation](../API-Documentation.md)
{: .buttons}
