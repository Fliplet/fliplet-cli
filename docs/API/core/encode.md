# Encode

### Encode data to base64

```js
var encoded = Fliplet.Encode.base64('mystring');
```

## Encoding URL 
### Encode url query parameters

This method is used to doubly encode the url. So if browser is automatically parsing double encoding ensures that browser parsing doesn't effect the result.

```js
var encodedUrl = Fliplet.Encode.encodeURI('my string');
```

Example Usage:
```js
var encodedUrl = Fliplet.Encode.encodeURI('my string');
// Encoded URL will be my 'my%2520string'
```

### Decode url query parameters
This method is used to doubly decode the url. This method will not effect the decoded URL. Please see the example belows

```js
var decodedUrl = Fliplet.Encode.decodeURI('my%20string');
```

Example Usage:
```js
var decodedUrl = Fliplet.Encode.decodeURI('my%2520string');
//  decodedUrl will be 'my string'
var decodedUrl = Fliplet.Encode.decodeURI('my%20string');
//  decodedUrl will be 'my string'
```