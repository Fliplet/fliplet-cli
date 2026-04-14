# Auth JS APIs

The Fliplet Auth JS APIs let you sign users into your Fliplet app with one line of code. It opens the unified sign-in popup (served by the Fliplet API) and handles the round-trip for you — including email/password and SSO (Google, Microsoft, Apple).

Use these APIs to:

- Sign users into your app with their Fliplet account
- Read the currently signed-in user
- Sign users out
- Get the auth token for custom API calls
- React to sign-in / sign-out events

Add the `fliplet-auth` package to your app's dependencies to enable these APIs.

---

## Methods

### Sign a user in

Opens the unified sign-in popup. Resolves with `{ user, token }` when the user successfully signs in.

```js
Fliplet.Auth.signIn().then(function(result) {
  console.log('Signed in as', result.user.email);
  console.log('Auth token:', result.token);
});
```

Pre-fill the email field in the sign-in form:

```js
Fliplet.Auth.signIn({ email: 'user@example.com' });
```

The promise rejects with an `Error` when:

- The popup is blocked by the browser
- The user closes the popup without completing sign-in
- The sign-in times out (10 minutes)
- The API returns an error (invalid credentials, 2FA flow cannot complete, etc.)

```js
Fliplet.Auth.signIn().then(function(result) {
  // user signed in
}).catch(function(err) {
  console.error(err.message);
});
```

---

### Get the currently signed-in user

Resolves to the signed-in user, or `null` when no user is signed in.

```js
Fliplet.Auth.currentUser().then(function(user) {
  if (!user) {
    // not signed in
    return;
  }

  // contains id, email, userRoleId, region
  console.log(user);
});
```

---

### Check whether a user is signed in

A convenience helper that resolves to a boolean.

```js
Fliplet.Auth.isSignedIn().then(function(isSignedIn) {
  if (isSignedIn) {
    // user is signed in
  }
});
```

---

### Get the user's auth token

Resolves to the signed-in user's auth token, or `null` when no user is signed in. Use it to authenticate custom API calls as the signed-in user.

```js
Fliplet.Auth.getToken().then(function(token) {
  return fetch(url, {
    headers: { 'Auth-Token': token }
  });
});
```

---

### Sign the user out

Clears locally stored credentials and invalidates the server-side session.

```js
Fliplet.Auth.signOut().then(function() {
  // user is signed out
});
```

---

### Listen for sign-in / sign-out events

Subscribe to auth state changes. The callback fires with the new user after a successful sign-in, or with `null` after sign-out completes.

```js
var unsubscribe = Fliplet.Auth.onChange(function(user) {
  if (user) {
    // user just signed in
  } else {
    // user just signed out
  }
});

// Stop listening when you no longer need to
unsubscribe();
```

---

## Examples

### Gate a screen behind sign-in

Prompt the user to sign in if they're not already signed in, then continue with the rest of the screen.

```js
Fliplet.Auth.currentUser().then(function(user) {
  if (user) return user;
  return Fliplet.Auth.signIn().then(function(result) {
    return result.user;
  });
}).then(function(user) {
  // render the screen as this user
});
```

### Show the signed-in user's name in the header

```js
Fliplet.Auth.currentUser().then(function(user) {
  var greeting = user
    ? 'Welcome, ' + user.email
    : 'Sign in to continue';

  document.querySelector('.profile-greeting').textContent = greeting;
});
```

### Sign-out button

```js
document.querySelector('.sign-out-button').addEventListener('click', function() {
  Fliplet.Auth.signOut().then(function() {
    location.reload();
  });
});
```

### Refresh the UI when auth state changes

Useful when the user signs in or out via a different mechanism (e.g. a Fliplet Login widget on another screen).

```js
Fliplet.Auth.onChange(function(user) {
  if (user) {
    document.body.classList.add('signed-in');
  } else {
    document.body.classList.remove('signed-in');
  }
});
```

### Make an authenticated API request

```js
Fliplet.Auth.getToken().then(function(token) {
  if (!token) {
    throw new Error('Not signed in');
  }

  return Fliplet.API.request({
    url: 'v1/user',
    headers: { 'Auth-Token': token }
  });
}).then(function(response) {
  console.log(response.user);
});
```

---

## What `Fliplet.Auth` does NOT do

- **It does not create new Fliplet user accounts from inside an app.** Only Studio's sign-up page can create Fliplet accounts. An app's sign-in popup can authenticate existing Fliplet users (including via SSO) — but it will not create a new account. Users who don't yet have a Fliplet account see an error message asking them to sign up at Fliplet Studio first.
- **It does not manage app-specific user data.** Use a Data Source with the [data source login component](components/login.md) or your own custom logic for that. `Fliplet.Auth` authenticates Fliplet users, not app-specific records.

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}
