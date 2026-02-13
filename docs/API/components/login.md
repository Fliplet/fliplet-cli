# Login

The login component fires hooks at key points in the authentication lifecycle. These allow you to run custom code after a user successfully logs in or when a returning user's session is re-validated.

## Hooks

### Run code after a successful login

The `login` hook is fired after a user successfully authenticates via username and password. It works with all login types: Data Source login, Fliplet login (including 2FA), and SAML2 SSO.

```js
Fliplet.Hooks.on('login', function (data) {
  // data.passport - 'dataSource', 'fliplet', or 'saml2'
  // data.session - session object (dataSource and fliplet only)
  // data.entry - the user's data source entry
  // data.userProfile - { type, dataSourceId, dataSourceEntryId }

  // Return a Promise to delay post-login navigation
});
```

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `data.passport` | String | The authentication method: `'dataSource'`, `'fliplet'`, or `'saml2'` |
| `data.session` | Object | The session object from `Fliplet.Session.authorize()` |
| `data.entry` | Object | The user's data source entry (`.id`, `.dataSourceId`, `.data`) |
| `data.userProfile` | Object | Profile object with `type`, `dataSourceId`, and `dataSourceEntryId` |

#### Example: Redirect users based on role

```js
Fliplet.Hooks.on('login', function (data) {
  var role = data.entry.data.Role;

  if (role === 'Admin') {
    return Fliplet.Navigate.screen(100);
  }

  return Fliplet.Navigate.screen(200);
});
```

#### Example: Set an encryption key after login

```js
Fliplet.Hooks.on('login', function (data) {
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

---

### Run code when a returning user's session is validated

The `sessionValidate` hook is fired when a user who is already logged in returns to the app and their cached session is re-validated. This is not a fresh login — it fires when the stored session token is confirmed as still valid.

```js
Fliplet.Hooks.on('sessionValidate', function (data) {
  // data.passport - 'dataSource', 'fliplet', or 'saml2'
  // data.session - the re-validated session object
  // data.entry - the user's data source entry
  // data.userProfile - { type, dataSourceId, dataSourceEntryId }
});
```

The payload is identical to the `login` hook.

#### Example: Refresh user preferences on session restore

```js
Fliplet.Hooks.on('sessionValidate', function (data) {
  return Fliplet.App.Storage.set('userDepartment', data.entry.data.Department);
});
```

---

## Which hook should I use?

| Scenario | Hook |
|----------|------|
| User logs in with username + password | `login` |
| User logs in via SAML2 SSO | `login` |
| User verifies via email or SMS code | `onUserVerified` (see [Email Verification](email-verification.html)) |
| Returning user's session is re-validated | `sessionValidate` |

<p class="quote"><strong>Tip:</strong> If you need to run the same code regardless of how the user authenticated, register handlers for both <code>login</code> and <code>onUserVerified</code>.</p>

---

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
