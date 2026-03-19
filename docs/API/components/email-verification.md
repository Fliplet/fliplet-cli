# Email Verification

## Retrieve an instance

Retrieves the email verification component instance available on the page.

`Fliplet.Verification.Email.get()`

```js
// Gets the email verification component instance
Fliplet.Verification.Email.get()
  .then(function(verification) {
    // Use verification instance to perform various actions
  });
```

The method returns a promise that resolves when the email verification component is rendered.

## What happens after successful verification

When a user successfully verifies their email or SMS code, Fliplet authenticates them with a `dataSource` passport session. This means the user stays logged in after verification and can be recognized by app security rules, data source security rules, and other APIs that rely on the current session.

Use `Fliplet.User.getCachedSession()` to read the authenticated entry:

```js
Fliplet.User.getCachedSession().then(function (session) {
  var entry = _.get(session, 'entries.dataSource');

  if (!entry) {
    return; // user is not logged in with a dataSource passport
  }

  // Public session shape
  // entry.id - the authenticated data source entry ID
  // entry.dataSourceId - the authentication data source ID
  // entry.data - the authenticated row's flat column values
  console.log(entry);
});
```

A typical public session shape looks like this:

```js
{
  entries: {
    dataSource: {
      id: 123,
      dataSourceId: 456,
      data: {
        ID: 123,
        Email: 'john@example.org',
        Department: 'Sales',
        Role: 'Member'
      }
    }
  }
}
```

<p class="quote"><strong>Important:</strong> Email Verification does not only validate identity for the current screen. It creates a reusable logged-in session using the <code>dataSource</code> passport.</p>

This authenticated state is compatible with Data Source security rules:

- `allow: "loggedIn"` recognizes the user as authenticated
- {% raw %}`{{user.[Email]}}`, `{{user.[Department]}}`, `{{user.[Role]}}`, and `{{user.[ID]}}`{% endraw %} resolve against the authenticated row

See the <a href="../fliplet-session.html">Session JS APIs</a> and <a href="../../Data-source-security.html">Securing your Data Sources</a> docs for the full session and security model.

## Instance properties

The `verification` instance variable above makes available the following instance properties.

 * `verification.instance` Vue.js instance

## Instance methods

The `verification` instance variable above makes available the following instance methods.

### Set the email

Use the `setEmail()` method to manually set the email value as if the user entered it via the UI:

```js
Fliplet.Verification.Email.get().then(function (verification) {
  // Sets the email to a new value
  verification.setEmail('john@example.org');
});
```

### Request for a code

Use the `requestCode()` method to manually trigger the component to request for a code. If the user's email is incorrect or not found in the target data source, the promise will be rejected with an error message:

```js
Fliplet.Verification.Email.get().then(function (verification) {
  // Sets the email
  verification.setEmail('john@example.org');

  // Requests for a code
  verification.requestCode().then(function () {
    // Code has been requested
  }).catch(function (error) {
    // Display error to the user if necessary
  });
});
```

---

## Hooks

### Run code after email/SMS verification

The `onUserVerified` hook is fired after a user successfully validates their verification code (email or SMS) and the `dataSource` passport session has been established. Use this to run custom logic such as redirecting users, fetching additional data, or setting encryption keys.

```js
Fliplet.Hooks.on('onUserVerified', function (data) {
  // data.entry - the verified user's data source entry
  // data.entry.id - the entry ID
  // data.entry.dataSourceId - the data source ID
  // data.entry.data - all columns (e.g. Email, Name, etc.)

  // Return a Promise to delay post-verification navigation
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `data.entry` | Object | The data source entry for the verified user |
| `data.entry.id` | Number | The entry ID |
| `data.entry.dataSourceId` | Number | The ID of the data source |
| `data.entry.data` | Object | All columns/fields from the user's row |

#### Example: Redirect after verification

```js
Fliplet.Hooks.on('onUserVerified', function (data) {
  return Fliplet.Navigate.screen(123);
});
```

#### Example: Set an encryption key after verification

```js
Fliplet.Hooks.on('onUserVerified', function (data) {
  return Fliplet.DataSources.connect(123).then(function (connection) {
    return connection.find({
      where: { ID: data.entry.data.OrganizationID }
    });
  }).then(function (organizations) {
    var key = _.first(organizations).data.key;
    return Fliplet.DataSources.Encryption().setKey(key);
  });
});
```

<p class="quote"><strong>Note:</strong> This hook is only fired by the <strong>Email Verification</strong> component (including SMS verification mode) and by the <strong>Data Source Login</strong> component during its password reset flow. For hooks that fire after a full username + password login, see the <a href="login.html">Login component hooks</a>.</p>

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
