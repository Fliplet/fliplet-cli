# Single Sign-on with SAML2

Fliplet Apps offer secure single sign-on through the SAML2 standard. Setting it up on your app usually requires IT/backend support from your system administrators for the initial configuration phase only.

## Get started

Create a new Fliplet app or use your existing one then drop the **SAML2 component** into your screen:

![SAML2](../../assets/img/saml/1.png)

Once you've dropped the component in your screen, a "Sign in" button will appear along with the configuration interface on the right hand side:

![SAML2](../../assets/img/saml/2.png)

The first thing you'll need is to **press the copy the link to the metadata XML** button on the bottom right of the screen. That will copy on your computer clipboard a URL to the metadata file which you will need to provide to your IT. Its format is the following:

```
https://api.fliplet.com/v1/session/providers/saml2/metadata?appId=123
```  

Please note that the `appId=123` will change depending on your Fliplet app id. The metadata also contains a few other things you will need to provide to your team, such as:

1. **Entity ID** (or Identifier) this field has a fixed value and it's `https://api.fliplet.com/v1/session/providers/saml2/metadata`
2. **Reply URL** (or Assertion URL) which depends on your appId like the first URL. Here's a sample value for it: `https://api.fliplet.com/v1/session/providers/saml2/callback?appId=2197`
2. Service Provider **[Certificate](../../assets/misc/saml2-certificate.txt)** (PEM String format)

Once you have given the above to your IT, they should be configure to configure the integration and come back to you with a few details which you will need to paste on the configuration interface:

- **Single sign-on login** URL
- **Single sign-on logout** URL
- Your Identity Provider **Certificate(s)** in PEM format 

When everything is set up, clicking the sign in button on the Fliplet app should redirect the user to your login screen. Once a login succeed, the user will be redirected back to the Fliplet app at the screen you selected in the component configuration.

---

## Integration flow

1. User clicks a login button on a Fliplet app and gets redirected to the client's login page.
2. User logs in with his/her organisation credentials (not Fliplet credentials) and gets redirected back to Fliplet servers.
3. Fliplet servers validates the login request and when valid redirects the user back to the Fliplet app and to the relevant page.

---

## Access SAML2 data into your apps

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

---

## Third-party reference docs

- [Configuring SAML2 on Azure Active Directory](https://docs.microsoft.com/en-us/azure/active-directory/active-directory-saas-custom-apps)