# `Fliplet.OAuth2()` (Beta)

(Returns **`Promise`**)

The `fliplet-oauth2` package contains helpers for standardizing requests to OAuth2 web services with a client-side integration.

**Note: The Fliplet OAuth2 library is Currently in beta and only works in native apps. We suggest specifying the library version using `fliplet-oauth2:0.1` when including the Fliplet OAuth2 library to avoid the functionality breaking as the feature undergoes further development.**

To configure a connection with an OAuth2 provider, initialize a connection with `Fliplet.OAuth2.init()` using a key-value object and use `Fliplet.OAuth2(provider)` with the specified provider name to access the available methods.

```js
// Initialize providers
Fliplet.OAuth2.init(providers);
// Make API requests using configured provider
Fliplet.OAuth2(provider).api(path)
  .then(function (response) {
    // Process response from API provider as necessary
  });
```

## Examples

### 1. Initialize a connection with the GitHub provider

*Note: The provider initialization is likely executed via the Global JS code in Fliplet Studio.*

```js
Flipet.OAuth2.init({
  github: {
    authUrl: 'http://github.com/login/oauth/authorize', // from OAuth2 provider
    grantType: 'implicit', // as supported by OAuth2 provider
    grantUrl: 'https://github.com/login/oauth/access_token', // from OAuth2 provider
    baseUrl: 'https://api.github.com/', // from OAuth2 provider
    clientId: '4c867cd2a96541883322', // from OAuth2 provider
    clientSecret: '5f66b7a07842570936512097ec255721b259b16a', // from OAuth2 provider
    redirectUrl: 'https://fliplet.com/oauth2-success', // as configured with OAuth2 provider
    state: 'FeeIUo0hJv6K5l9-1', // optional state parameter during login
    loginPageId: 12345, // page ID where login page is found
    postLoginPageId: 12346 // page ID where users are redirected to after login
  }
});
```

### 2. Log in using the configured GitHub provider

*Note: The provider name as configured through `Fliplet.OAuth2.init()` is passed to `Fliplet.OAuth2()` to make sure the correct connection configurations are used.*

```js
// Start login process
Fliplet.OAuth2('github').login()
  .then(function () {
    // Successfull logged in
  });
```

### 3. Make API requests using the configured GitHub provider

*Note: The provider name as configured through `Fliplet.OAuth2.init()` is passed to `Fliplet.OAuth2()` to make sure the correct connection configurations are used.*

The Fliplet OAuth2 library will manage authentication tokens and any token refreshing (if supported) before making API calls. If the token is invalid or missing, user will be redirected to the login page with a `tokenInvalid=true` or `tokenMissing=true` query parameter respectively.

The login page can process these query parameters via `Fliplet.Navigste.query` to customize the user experience accordingly.

```js
Fliplet.OAuth2('github').api('user')
  .then(function (response) {
    // Process response from API provider as necessary
  });
```

## Methods

### `Fliplet.OAuth2.init()`

(Returns **`null`**)

Initialize a connection with an OAuth2 provider.

```js
Fliplet.OAuth2.init(providers)
```

* **providers** (Object) A key-value map of options to initialize connections with. Each object can contain the following details.
  * **authUrl** (String) **Required** Authorization URL as supplied by the OAuth2 provider.
  * **grantType** (String) `implicit|explicit` **Required** Implicit (token) or Explicit (code) Grant flow to be used when logging in.
  * **grantUrl** (String) Grant URL as supplied by the OAuth2 provider. Required if an *Explicit Grant* flow is used when calling `.login()`.
  * **baseUrl** (String) Base URL for API requests. API requests made with a full URL will ignore the `baseUrl`. If `baseUrl` is not provided, API requests are expected to be called using a full URL.
  * **clientId** (String) **Required** Client ID as supplied by the OAuth2 provider.
  * **clientSecret** (String) **Required** Client Secret as supplied by the OAuth2 provider.
  * **redirectUrl** (String) **Required** Full page URL where users will be redirected to after a successful login through the OAuth2 provider. It's also called *authorization callback URL* by some OAuth2 providers. Fliplet provides `https://fliplet.com/oauth2-success` to show a generic login success message. You may use any custom page as necessary.
  * **state** (String) `state` is an optional parameter that, if provided, is returned by the OAuth2 provider during the redirect step for additional verification during login.
  * **loginPageId** (Number) Page ID of login page.
  * **postLoginPagseId** (Number) Page ID of page to redirect to if user is logged in.

### `Fliplet.OAuth2().login()`

(Returns **`Promise`**)

Initialize the OAuth2 authentication process with the in-app browser.

```js
Fliplet.OAuth2(provider).login()
```

* **provider** (String) **Required** Provider name as configured in `Fliplet.OAuth2.init()`.

### `Fliplet.OAuth2().logout()`

(Returns **`Promise`**)

Remove sessions with all providers or with specific providers as defined via `provider`.

```js
Fliplet.OAuth2(provider).logout()
```

* **provider** (String|Array) Provider name(s) as configured in `Fliplet.OAuth2.init()`. Sessions in the specified provider(s) will be removed. If a `provider` is not given, all sessions will be removed.

### `Fliplet.OAuth2().getAuthResponse()`

(Returns **`Promise`**)

Get the current status of sessions with all providers. This is does not validate any sessions which may have expired. Sessions are returned in the Promise resolving function as key-value objects.

```js
Fliplet.OAuth2().getAuthResponse()
```

### `Fliplet.OAuth2().api()`

(Returns **`Promise`**)

Make calls to the API for getting and posting data.

```js
Fliplet.OAuth2(provider).api(path)
```

* **provider** (String) **Required** Provider name as configured in `Fliplet.OAuth2.init()`.
* **path** (String) **Required** A relative path to the provider base URL as configued in `Fliplet.OAuth2.init()` or a full URL. If a full URL is provided the base URL will be ignored.


```js
Fliplet.OAuth2(provider).api(options)
```

* **provider** (String) **Required** Provider name as configured in `Fliplet.OAuth2.init()`.
* **options** (Object) **Required** A map of options to pass to the method.
  * **path** (String) **Required** A relative path to the provider base URL as configued in `Fliplet.OAuth2.init()` or a full URL. If a full URL is provided the base URL will be ignored.
  * **method** (String) `get|post|put|delete` HTTP request method to use. **Default**: `GET`
  * **data** (Object) A JSON object of data, FormData, HTMLInputElement, HTMLFormElment to be sent along with a `get`, `post` or `put` request. **Default**: `null`

[Back to API documentation](../API-Documentation.md)
{: .buttons}
