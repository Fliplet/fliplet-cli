---
description: Sign users into your Fliplet app with one line of code — email/password or SSO (Google, Microsoft, Apple).
---

# Auth JS APIs

The Fliplet Auth JS APIs sign users into your Fliplet app with their existing Fliplet account. One call opens a popup, handles the authentication round-trip, and resolves with the signed-in user. Email/password and SSO (Google, Microsoft, Apple) are supported out of the box.

Use these APIs to authenticate Fliplet users, read the signed-in user in your app code, sign users out, and get the auth token for custom API requests.

## Before you start

Add the `fliplet-auth` package to your app's dependencies. This exposes `Fliplet.Auth.*` at runtime.

<p class="warning"><code>Fliplet.Auth</code> authenticates <strong>existing Fliplet user accounts</strong>. It does not create new accounts from inside an app — only Fliplet Studio's sign-up page can do that. A user who tries to sign in with an SSO provider (Google, Microsoft, Apple) that isn't linked to any Fliplet account sees an error asking them to sign up at Fliplet Studio first. Direct users to Fliplet Studio to create their account, then back to your app to sign in.</p>

`Fliplet.Auth` is the high-level API for signing users in and out — prefer it for app code. It is distinct from two other APIs that share related concepts:

- **`Fliplet.User`** — low-level primitives (`getAuthToken`, `setAuthToken`, `getCachedSession`). `Fliplet.Auth` uses these internally; you rarely need to call them directly.
- **Data source login component** — an app-level authentication system that uses a data source as the user table. It's a separate system from `Fliplet.Auth` and is appropriate when you want users stored in your app's own data source rather than in Fliplet's user database. See [data source login](components/login.md) for that.

## Methods

### Sign a user in

`Fliplet.Auth.signIn()` opens the unified sign-in popup and resolves with `{ user, token }` when the user successfully signs in.

```js
Fliplet.Auth.signIn().then(function(result) {
  // result.user:  { id, email, firstName, lastName, userRoleId }
  // result.token: auth token string, e.g. "eu--55a54008...-203-8965"
  console.log('Signed in as', result.user.email);
}).catch(function(err) {
  // surface the error to the user and let them retry
  console.error(err.message);
});
```

Pre-fill the email field in the sign-in form by passing `options.email`:

```js
Fliplet.Auth.signIn({ email: 'alice@acme.com' });
```

The promise **rejects with an `Error`** when:

- The popup is blocked by the browser → `Error('Sign-in popup was blocked...')`
- The user closes the popup without completing sign-in → `Error('Sign-in was cancelled.')`
- Sign-in times out after 10 minutes → `Error('Sign-in timed out. Please try again.')`
- The API returns a sign-in error → `Error(<message from API>)`

Always handle rejection in your app code — the examples on this page consistently do so.

### Get the currently signed-in user

`Fliplet.Auth.currentUser()` resolves to the signed-in user, or `null` when no user is signed in.

```js
Fliplet.Auth.currentUser().then(function(user) {
  if (!user) {
    // not signed in
    return;
  }

  // user shape: { id, email, userRoleId }
  console.log(user.email);
});
```

The user object returned by `currentUser()` contains a subset of the fields returned by `signIn()` — specifically the fields that persist locally between sessions: `id`, `email`, `userRoleId`. To access `firstName` and `lastName`, either store them yourself after `signIn()` resolves, or query `v1/user` with `Fliplet.Auth.getToken()`.

### Check whether a user is signed in

`Fliplet.Auth.isSignedIn()` resolves to `true` or `false` — a convenience helper on top of `currentUser()`.

```js
Fliplet.Auth.isSignedIn().then(function(isSignedIn) {
  if (isSignedIn) {
    // show authenticated UI
  }
});
```

### Get the user's auth token

`Fliplet.Auth.getToken()` resolves to the signed-in user's auth token, or `null` when no user is signed in. Use it to authenticate custom API calls as the signed-in user.

```js
Fliplet.Auth.getToken().then(function(token) {
  if (!token) {
    throw new Error('Not signed in');
  }

  return fetch('https://api.example.com/my-endpoint', {
    headers: { 'Auth-Token': token }
  });
});
```

Pair with `Fliplet.API.request()` for calls to the Fliplet API:

```js
Fliplet.Auth.getToken().then(function(token) {
  return Fliplet.API.request({
    url: 'v1/user',
    headers: { 'Auth-Token': token }
  });
}).then(function(response) {
  console.log(response.user);
});
```

### Sign the user out

`Fliplet.Auth.signOut()` clears locally stored credentials and invalidates the server-side session.

```js
Fliplet.Auth.signOut().then(function() {
  // user is signed out; currentUser() now resolves to null
});
```

If the server-side logout request fails (for example, the device is offline), local credentials are still cleared so the user is effectively signed out.

### Listen for sign-in / sign-out events

`Fliplet.Auth.onChange(callback)` subscribes to auth state changes. The callback fires with the new user after a successful sign-in, or with `null` after sign-out completes. Returns an unsubscribe function.

```js
var unsubscribe = Fliplet.Auth.onChange(function(user) {
  if (user) {
    // user just signed in — refresh the UI as this user
  } else {
    // user just signed out — reset to logged-out state
  }
});

// Stop listening when no longer needed
unsubscribe();
```

Useful when the user signs in or out via a different mechanism — for example, a Fliplet Login component on another screen.

## Examples

### Gate a screen behind sign-in

Prompt the user to sign in if they're not already signed in, then render the screen.

```js
Fliplet.Auth.currentUser().then(function(user) {
  if (user) {
    return user;
  }

  return Fliplet.Auth.signIn().then(function(result) {
    return result.user;
  });
}).then(function(user) {
  // render the screen as this user
  document.querySelector('.greeting').textContent = 'Welcome, ' + user.email;
}).catch(function(err) {
  // user cancelled sign-in or it failed
  console.error(err.message);
});
```

### Show the signed-in user's name in the header

```js
Fliplet.Auth.currentUser().then(function(user) {
  var greeting = user
    ? 'Signed in as ' + user.email
    : 'Not signed in';

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
    url: 'v1/organizations',
    headers: { 'Auth-Token': token }
  });
}).then(function(response) {
  console.log('Organizations:', response.organizations);
}).catch(function(err) {
  console.error(err);
});
```

[Back to API documentation](../API-Documentation.md)
{: .buttons}
