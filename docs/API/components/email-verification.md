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

[Back to API documentation](../../API-Documentation.md)
{: .buttons}
