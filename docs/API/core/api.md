# API

The Fliplet API module provides methods for making HTTP requests to the Fliplet APIs with built-in authentication, caching, offline queue management, and error handling.

## Fliplet.API.request()

Makes an authenticated HTTP request to the Fliplet APIs with automatic URL construction, header management, and error handling.

### Syntax

```js
Fliplet.API.request(options)
```

### Parameters

**options** (Object\|String) - Configuration object for the request, or a URL string for simple GET requests.

#### Options Object Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `url` | String | **Required** | The API endpoint path (e.g., 'v1/user'). Will be prefixed with the base API URL automatically. |
| `method` | String | `'GET'` | HTTP method: 'GET', 'POST', 'PUT', 'DELETE', etc. |
| `data` | Object\|String | `undefined` | Request payload. Objects are automatically JSON stringified for POST/PUT requests. |
| `headers` | Object | `{}` | Additional headers to include with the request. |
| `cache` | Boolean | `false` | Whether to cache the response for identical requests. |
| `required` | Boolean | `false` | If true, failed requests will be queued for retry when connection is restored. |
| `apiUrl` | String | Auto-detected | Custom API URL to use instead of the default. |
| `contentType` | String | Auto-set | Content type header. Automatically set to 'application/json' for object data. |
| `processData` | Boolean | Auto-set | Whether jQuery should process the data. Set to false for JSON requests. |

### Return Value

Returns a **Promise** that resolves with the API response or rejects with an error.

### Examples

#### Basic GET Request

```js
// Simple URL string
Fliplet.API.request('v1/user')
  .then(function(response) {
    console.log('User data:', response.user);
  })
  .catch(function(error) {
    console.error('Request failed:', error);
  });
```

#### POST Request with Data

```js
Fliplet.API.request({
  url: 'v1/user',
  method: 'POST',
  data: {
    email: 'user@example.com',
    name: 'John Doe'
  }
}).then(function(response) {
  console.log('User created:', response.user);
});
```

#### PUT Request with Custom Headers

```js
Fliplet.API.request({
  url: 'v1/apps/123/settings',
  method: 'PUT',
  data: { theme: 'dark' },
  headers: {
    'Custom-Header': 'value'
  }
}).then(function(response) {
  console.log('Settings updated:', response);
});
```

#### DELETE Request

```js
Fliplet.API.request({
  url: 'v1/data-sources/456/entries/789',
  method: 'DELETE'
}).then(function() {
  console.log('Entry deleted successfully');
});
```

#### Cached Request

```js
// This request will be cached and subsequent identical requests
// will return the cached response
Fliplet.API.request({
  url: 'v1/apps/123',
  cache: true
}).then(function(response) {
  console.log('App data:', response.app);
});
```

#### Required Request with Offline Queue

```js
// If this request fails due to network issues, it will be queued
// and automatically retried when connection is restored
Fliplet.API.request({
  url: 'v1/analytics/track',
  method: 'POST',
  data: { event: 'page_view', page: 'home' },
  required: true
}).then(function(response) {
  console.log('Analytics tracked:', response);
});
```

#### Using Custom API URL

```js
Fliplet.API.request({
  url: 'v1/external-service/data',
  apiUrl: 'https://custom-api.example.com/',
  method: 'GET'
}).then(function(response) {
  console.log('External data:', response);
});
```

### Authentication

All requests are automatically authenticated using:
- **Auth-token** header with the current user's authentication token
- **Authorization** header with Bearer token (when btoa is available)
- Automatic token refresh when the session expires

### Automatic Headers

The following headers are automatically added to all requests:

- `X-Device-Platform`: Current platform (web, native, etc.)
- `X-Device-Tracking`: JSON string with device information
- `X-App-Locales`: Supported app locales
- `Auth-token` or `Authorization`: Authentication credentials

### Data Handling

- **JSON Serialization**: Object data is automatically converted to JSON for POST/PUT requests
- **Content-Type**: Automatically set to 'application/json' for object payloads
- **URL Construction**: The base API URL is automatically prepended to relative URLs

### Error Handling

The request method includes sophisticated error handling:

- **Session Refresh**: Automatically retries with a new token if the session expires
- **Offline Queue**: Required requests are queued when offline and retried when online
- **Billing Enforcement**: Special handling for billing-related errors
- **Network Errors**: Descriptive error messages for connection failures

### Cache Management

When `cache: true` is specified:
- Responses are cached based on a hash of the request (method, URL, auth token, data)
- Identical subsequent requests return the cached response
- Use `Fliplet.API.clearCache()` to clear all cached responses

### Offline Support

When `required: true` is specified:
- Failed requests are automatically queued for retry
- Queued requests are processed when the device comes back online
- Queue is persisted across app sessions

## Related Methods

### Fliplet.API.clearCache()

Clears all cached API responses.

```js
Fliplet.API.clearCache();
```

### Fliplet.API.processQueue()

Manually processes the offline request queue.

```js
Fliplet.API.processQueue()
  .then(function() {
    console.log('All queued requests processed');
  });
```

### Fliplet.API.mock()

Creates a mock API response for development and testing.

```js
Fliplet.API.mock({ user: { id: 1, name: 'Test User' } }, {
  delay: 500,
  reject: false
}).then(function(response) {
  console.log('Mock response:', response);
});
```

## Error Handling Best Practices

```js
Fliplet.API.request('v1/user')
  .then(function(response) {
    // Handle success
    return response.user;
  })
  .catch(function(error) {
    // Check if error is already handled by the system
    if (Fliplet.Error.isHandled(error)) {
      return;
    }

    // Parse error message
    const errorMessage = Fliplet.Error.parse(error, 'Unknown error occurred');
    console.error('API Error:', errorMessage);

    // Handle specific error types
    if (error.status === 401) {
      // Unauthorized - redirect to login
    } else if (error.status === 403) {
      // Forbidden - show access denied message
    } else if (error.status === 429) {
      // Rate limited - show retry message
    }
  });
```

## Common Use Cases

### Fetching User Data

```js
Fliplet.API.request('v1/user')
  .then(function(response) {
    const user = response.user;
    console.log('User:', user.email, user.name);
  });
```

### Updating App Settings

```js
Fliplet.API.request({
  url: 'v1/apps/' + Fliplet.Env.get('appId') + '/settings',
  method: 'PUT',
  data: {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d'
  }
}).then(function(response) {
  console.log('Settings updated:', response.settings);
});
```

### Uploading Data

```js
Fliplet.API.request({
  url: 'v1/data-sources/' + dataSourceId + '/data',
  method: 'POST',
  data: {
    Name: 'John Doe',
    Email: 'john@example.com',
    Department: 'Engineering'
  }
}).then(function(response) {
  console.log('Data entry created:', response.id);
});
```
