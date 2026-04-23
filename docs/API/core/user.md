# `Fliplet.User`

Get and set the current user's auth token, profile details, and preferences, and sign the user out.

### Get the user auth token

Retrive the auth token for the current user.

```js
var userAuthToken = Fliplet.User.getAuthToken();
```

### Set the user auth token

```js
Fliplet.User.setAuthToken('eu--abcdef');
```

### Set the user details

```js
Fliplet.User.setUserDetails({
  auth_token: 'eu--abc',
  id: 2,
  email: 'foo@example.org'
});
```

### Set (extend) the user preferences

```js
// promise will resolve with all user preferences
Fliplet.User.Preferences.set({
  foo: 'bar',
  baz: { barbaz: true }
});
```

### Get the user preferences

```js
// promise will resolve with all user preferences
Fliplet.User.Preferences.get().then(function (preferences) {
  // preferences.foo
});
```