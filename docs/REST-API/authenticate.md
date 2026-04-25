---
title: Authenticating with the Fliplet REST APIs
description: "Authenticate Fliplet REST API requests via Auth-token header, Authorization Bearer (base64), query string, or cookie against EU, US, or CA endpoints."
type: api-reference
tags: [rest-api, authenticate]
v3_relevant: true
deprecated: false
---
# Authenticating with the Fliplet REST APIs

Authenticate Fliplet REST API requests via the `Auth-token` header, an `Authorization: Bearer` header (base64), a `?auth_token=` query string, or a cookie, against the EU (`api.fliplet.com`), US (`us.api.fliplet.com`), or CA (`ca.api.fliplet.com`) endpoints over HTTPS.

All requests must be made via ​**SSL​** to the above HTTPS-only endpoint.

All our APIs uses **​RESTful​ web services** which supports both **JSON** and url-encoded parameters as body of POST requests.

The request **body size ​limit​** on all endpoints is set to **1​ GB​**, which is then a hard limit for uploaded files.

**All requests must contain the API authentication token** in the request headers ​or​ as a GET parameter. Alternatively, it can also be sent as a cookie, although sending it in the headers is preferred for security.

**Option 1) as a header**

```
Auth-token: eu--abcdefg123456789
```

Alternatively, you can also send the token via the **Authorization** header, encoded as a **base64**:

```
Authorization: Bearer ZXUtLWFiY2RlZmcxMjM0NTY3ODk=
```

**Option 2) as a GET parameter**
```
?auth_token=eu--abcdefg123456789
```

**Option 3) as a request cookie**
```
Cookie: auth_token=eu--abcdefg123456789;
```

If the provided token has been revoked, an error message will be returned as follows:

```json
{
  "error": "not authorised",
  "message":"The auth_token provided doesn't belong to any user."
}
```

## How to create an authentication token

1. Login to Fliplet Studio with your account
2. Edit the app you want to have API access to
3. Go to ‘App Settings’
4. Go to ‘API tokens’ tab of app settings
5. Create a new API token

Note: The token does not expire, but can be revoked at any time should you want to (e.g. when unauthorized access is found or your token has been compromised).

<p class="quote">Some API endpoints may require you to use the app's production ID for extra added security, since API tokens don't have access to the working draft apps you see in Studio. You can grab the production app's ID by heading to the <strong>https://api.fliplet.com/v1/apps/</strong> endpoint and verify the value for the <code>productionAppId</code> for the apps you have access to</p>

Please note that you may need to set up appropriate Data Source [security rules](/Data-source-security.html) on the API token for the Data Sources you are reading or writing data to.

---

All done? Jump to the [Data Sources](fliplet-datasources.md) documentation to start using our REST APIs!

[Next »](fliplet-datasources.md)
{: .buttons}
