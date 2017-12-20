# Single Sign-on with SAML2

Once your app has been set up with a *SAML2* Single Sign-on login, you can access the logged user details using the following JS API:

```js
Fliplet.Session.passport('saml2').data().then(function (response) {
  // response.user contains "firstName", "lastName" and "email"

  // create a welcome string
  var text = `Hi ${response.user.firstName}. You are signed in as ${response.user.email}.`;

  // display it in a html element with class "welcome"
  $('.welcome').text(text);
});
```

Don't forget to add `fliplet-session` as a dependency of your screen (or app) to make it available to your code.