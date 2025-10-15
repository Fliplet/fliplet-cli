# Encode

### Encode data to base64

```js
var encoded = Fliplet.Encode.base64('mystring');
```

## Encoding URL

### Encode URL query parameters

This method doubly encodes the URL. If the browser automatically parses query parameters, double encoding ensures the browser parsing does not affect the result.

```js
var encodedUrl = Fliplet.Encode.encodeURI('my string');
// Encoded URL will be 'my%2520string'
```

#### Use case 1: Building query parameters with special characters

```js
// When building URLs with user input that contains spaces, symbols, etc.
var searchTerm = 'user@example.com & friends';
var encodedSearch = Fliplet.Encode.encodeURI(searchTerm);
// Result: 'user%2540example.com%2520%2526%2520friends'

// Use in URL construction
var searchUrl = 'https://api.example.com/search?q=' + encodedSearch;
```

#### Use case 2: Passing data through multiple redirects

```js
// When data needs to survive multiple URL parsing/redirect cycles
var userData = 'John Doe <john@company.com>';
var encodedData = Fliplet.Encode.encodeURI(userData);
// Result: 'John%2520Doe%2520%253Cjohn%2540company.com%253E'

// This ensures the data remains intact even after browser auto-parsing
var redirectUrl = 'https://app.example.com/process?data=' + encodedData;
```

#### Use case 3: Form data with complex values

```js
// Encoding form values that will be passed in URLs
var formData = {
  name: 'María José',
  email: 'maria.jose@example.com',
  message: 'Hello! How are you?'
};

var encodedName = Fliplet.Encode.encodeURI(formData.name);
var encodedEmail = Fliplet.Encode.encodeURI(formData.email);
var encodedMessage = Fliplet.Encode.encodeURI(formData.message);

// Build URL with encoded parameters
var formUrl = `https://api.example.com/submit?name=${encodedName}&email=${encodedEmail}&message=${encodedMessage}`;
```

### Decode URL query parameters

This method doubly decodes the URL. It will not affect the decoded value. Please see the examples below.

```js
var decodedUrl = Fliplet.Encode.decodeURI('my%20string');
```

#### Use case 1: Processing incoming URL parameters

```js
// When receiving encoded data from URLs
var encodedParam = 'user%2540example.com%2520%2526%2520friends';
var decodedParam = Fliplet.Encode.decodeURI(encodedParam);
// Result: 'user@example.com & friends'

// Use the decoded value in your application
console.log('Search term:', decodedParam);
```

#### Use case 2: Handling redirect data

```js
// When processing data that came through redirects
var redirectData = 'John%2520Doe%2520%253Cjohn%2540company.com%253E';
var userInfo = Fliplet.Encode.decodeURI(redirectData);
// Result: 'John Doe <john@company.com>'

// Parse the decoded data
var nameMatch = userInfo.match(/^(.+?)\s*<(.+?)>$/);
if (nameMatch) {
  var name = nameMatch[1]; // 'John Doe'
  var email = nameMatch[2]; // 'john@company.com'
}
```

#### Use case 3: Processing form data from URLs

```js
// When handling form submissions via URL parameters
var urlParams = new URLSearchParams(window.location.search);
var encodedName = urlParams.get('name');
var encodedEmail = urlParams.get('email');
var encodedMessage = urlParams.get('message');

// Decode the parameters
var name = Fliplet.Encode.decodeURI(encodedName);
var email = Fliplet.Encode.decodeURI(encodedEmail);
var message = Fliplet.Encode.decodeURI(encodedMessage);

// Use the decoded values
var formData = {
  name: name,
  email: email,
  message: message
};
```
