# `Fliplet.OAuth2` (Beta)

The `fliplet-oauth2` package contains helpers for standardizing requests to OAuth2 web services with a client-side integration.

**Note: The Fliplet OAuth2 library is currently in beta and only works in native apps. We suggest specifying the library version using `fliplet-oauth2:0.1` when including the Fliplet OAuth2 library to avoid the functionality breaking as the feature undergoes further development.**

To configure an OAuth2 service provider, call `Fliplet.OAuth2.configure()` with the service specificaions and use `Fliplet.OAuth2(service)` with the specified service name to access the available methods, e.g. `Fliplet.OAuth2(service).api(path)`.

```js
// Configure services
Fliplet.OAuth2.configure(service, configuration);
// Make API requests using configured service
Fliplet.OAuth2(service).api(path)
  .then(function (response) {
    // Process response from API service as necessary
  });
```

## Examples

### 1. Configure a connection with GitHub

*Note: The service configuration is likely executed via the Global JS code in Fliplet Studio.*

```js
Flipet.OAuth2.configure('github', {
  authUrl: 'http://github.com/login/oauth/authorize', // from OAuth2 service provider
  grantType: 'implicit', // as supported by OAuth2 service provider
  grantUrl: 'https://github.com/login/oauth/access_token', // from OAuth2 service provider
  baseUrl: 'https://api.github.com/', // from OAuth2 service provider
  clientId: '4c867cd2a96541883322', // from OAuth2 service provider
  clientSecret: '5f66b7a07842570936512097ec255721b259b16a', // from OAuth2 service provider
  redirectUrl: 'https://fliplet.com/oauth2-success', // as configured with OAuth2 service provider
  state: 'FeeIUo0hJv6K5l9-1', // optional state parameter during login
  loginPageId: 12345, // page ID where login page is found
  postLoginPageId: 12346 // page ID where users are redirected to after login
});
```

### 2. Log in using the configured GitHub service

*Note: The service name as configured through `Fliplet.OAuth2.configure()` is passed to `Fliplet.OAuth2()` to make sure the correct connection configurations are used.*

```js
// Start login process
Fliplet.OAuth2('github').login()
  .then(function () {
    // Successfully logged in
  });
```

### 3. Make API requests using the configured GitHub service

*Note: The service name as configured through `Fliplet.OAuth2.configure()` is passed to `Fliplet.OAuth2()` to make sure the correct connection configurations are used.*

The Fliplet OAuth2 library will manage authentication tokens and any token refreshing (if supported) before making API calls. If the token is invalid or missing, the user will be redirected to the login page with a `tokenInvalid=true` or `tokenMissing=true` query parameter respectively.

The login page can process these query parameters via `Fliplet.Navigate.query` to customize the user experience accordingly.

```js
Fliplet.OAuth2('github').api('user')
  .then(function (response) {
    // Process response from API service as necessary
  });
```

## Cross-Domain AJAX requests

A common problem for developers is a browser to refuse access to a remote resource. Usually, this happens when you execute **AJAX cross domain request** using jQuery Ajax interface, Fetch API, or plain XMLHttpRequest. As result is that the AJAX request is not performed and data are not retrieved.

This can occur with OAuth2 services if the service provider is not configured to allow Fliplet's app domains.

Cross-Origin Request Sharing (CORS) sometimes needs to be configured with the service provider to ensure API requests can be made across domains. See [AJAX cross domain and cross-origin requests](../AJAX-cross-domain.md) for more information.

## Methods

### `Fliplet.OAuth2.configure()`

(Returns **`null`**)

Configure an OAuth2 service or multiple OAuth2 services.

```js
Fliplet.OAuth2.configure(service, configuration)
Fliplet.OAuth2.configure(services)
```

* **service** (String) **Required** A service name. The service name is used when making `Fliplet.OAuth2` requests.
* **configuration** (Object) **Required** A key-value map of options to configure multiple services with. Each object can contain the following details.
  * **authUrl** (String) **Required** Authorization URL as supplied by the OAuth2 service.
  * **grantType** (String) `implicit|explicit` **Required** Implicit (token) or Explicit (code) Grant flow to be used when logging in.
  * **grantUrl** (String) Grant URL as supplied by the OAuth2 service. Required if an *Explicit Grant* flow is used when calling `.login()`.
  * **baseUrl** (String) Base URL for API requests. API requests made with a full URL will ignore the `baseUrl`. If `baseUrl` is not provided, API requests are expected to be called using a full URL.
  * **clientId** (String) **Required** Client ID as supplied by the OAuth2 service.
  * **clientSecret** (String) **Required** Client Secret as supplied by the OAuth2 service.
  * **redirectUrl** (String) **Required** Full page URL where users will be redirected to after a successful login through the OAuth2 service. It's also called *authorization callback URL* by some OAuth2 services. Fliplet provides `https://fliplet.com/oauth2-success` to show a generic login success message. You may use any custom page as necessary.
  * **state** (String) `state` is an optional parameter that, if provided, is returned by the OAuth2 service during the redirect step for additional verification during login.
  * **loginPageId** (Number) Page ID of login page.
  * **postLoginPagseId** (Number) Page ID of page to redirect to if user is logged in.
  * **scope** (String) A comma separated string of scopes as provided by the OAuth2 service.
  * **verifyRedirectUrl** (Function) An optional function that takes the redirect URL after login, and confirms if the URL is valid. The URL is passed as the first parameter and the function can either return a value or a Promise. If a Promise is returned, the URL is considered valid if the Promise resolves. If the Promise rejects, the URL is considered invalid.
* **services** **Required** (Object) A key-value map of service configurations to configure multiple services in one go. Each service configuration should use the service name as the key and a configuration that follows the specification as outlined for the `configuration` parameter above.

### `Fliplet.OAuth2().login()`

(Returns **`Promise`**)

Initialize the OAuth2 authentication process with the in-app browser.

```js
Fliplet.OAuth2(service).login()
```

* **service** (String) **Required** Service name as configured in `Fliplet.OAuth2.configure()`.

### `Fliplet.OAuth2().logout()`

(Returns **`Promise`**)

Logout and remove session with a specific service.

```js
Fliplet.OAuth2(service).logout()
```

* **service** (String) Service name as configured in `Fliplet.OAuth2.configure()`. The currently active session in the specified service will be removed after the user has successfully logged out.

### `Fliplet.OAuth2().getAuthResponse()`

(Returns **`Promise`**)

Get the current status of sessions with a selected service. This does not validate any sessions which may have expired.

```js
Fliplet.OAuth2(service).getAuthResponse()
```

* **service** (String) Service name as configured in `Fliplet.OAuth2.configure()`.

### `Fliplet.OAuth2().api()`

(Returns **`Promise`**)

Make calls to the API for getting and posting data.

*Note: The Fliplet OAuth2 library will manage authentication tokens and any token refreshing (if supported) before making API calls. If the token is invalid or missing, the user will be redirected to the login page with a `tokenInvalid=true` or `tokenMissing=true` query parameter respectively.*

```js
Fliplet.OAuth2(service).api(path)
Fliplet.OAuth2(service).api(options)
```

* **service** (String) **Required** Service name as configured in `Fliplet.OAuth2.configure()`.
* **path** (String) **Required** A relative path to the service base URL as configued in `Fliplet.OAuth2.configure()` or a full URL. If a full URL is provided the base URL will be ignored. *When using a single `path` parameter, the request will be made as a `GET` request.*
* **options** (Object) **Required** A map of options to pass to the method.
  * **path** (String) **Required** A relative path to the service base URL as configued in `Fliplet.OAuth2.configure()` or a full URL. If a full URL is provided the base URL will be ignored.
  * **method** (String) `get|post|put|delete` HTTP request method to use. **Default**: `GET`
  * **data** (Object) A JSON object of data, FormData, HTMLInputElement, HTMLFormElment to be sent along with a `get`, `post` or `put` request. **Default**: `null`

[Back to API documentation](../API-Documentation.md)
{: .buttons}
