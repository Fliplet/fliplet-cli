# API

## Make an API request to the Fliplet APIs

```js
// Returns a promise
Fliplet.API.request({
  url: 'v1/user',
  method: 'PUT',
  data: { email: 'new@email.org' }
}).then(function onSuccess(response) {
  console.log(response);
});
```