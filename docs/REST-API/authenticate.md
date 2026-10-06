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

Use the request format documented for each endpoint. Many endpoints accept JSON or URL-encoded bodies; others use multipart form data for file uploads. For example, [AI audio transcription](/REST-API/fliplet-ai#audio-transcription) requires a multipart audio file.

The shared JSON and URL-encoded body limit is configured as `1000mb`, but endpoint-specific limits still apply. This is not a universal file-upload allowance. AI audio transcription limits each audio file to 25 MiB; check the target endpoint before uploading.

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

To create, list or revoke app API tokens, your Studio account needs editor or publisher access to the app. These token-management permissions do not establish the resulting token's permission to call every runtime endpoint. The app token or integration token is checked against the target app and the requested operation; task tokens cannot manage app API tokens.

1. Log in to Fliplet Studio with an account that can edit or publish the app
2. Edit the app you want to have API access to
3. Go to ‘App Settings’
4. Go to ‘API tokens’ tab of app settings
5. Create a new API token

Note: The token does not expire, but can be revoked at any time should you want to (e.g. when unauthorized access is found or your token has been compromised).

Use the app ID and token type required by the target endpoint. Some integrations require the production app ID rather than the working draft ID; inspect the app's `productionAppId` in the [Apps reference](/REST-API/fliplet-apps). Do not assume token creation grants draft access or that an endpoint's development option bypasses authentication or authorization. The [app AI reference](/REST-API/fliplet-ai#authentication-and-app-access) describes its access boundary.

Please note that you may need to set up appropriate Data Source [security rules](/Data-source-security) on the API token for the Data Sources you are reading or writing data to.

---

All done? Jump to the [Data Sources](fliplet-datasources) documentation to start using our REST APIs!

[Next »](fliplet-datasources)
{: .buttons}
