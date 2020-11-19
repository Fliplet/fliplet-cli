# Profile

A [namespaced storage](#namespaced) to access details saved for the user profile. Using this JS API you can get the user's email as well as the other properties documented below.

Example usage:

```js
// Set a value for a specific attribute
Fliplet.Profile.set('firstName', 'John')

// Read a value from the user's profile
Fliplet.Profile.get('firstName').then(function (value) {
  // value is 'John'
})
```

The following variables are reserved for common use and publicly accessible.

* `email`
* `firstName`
* `lastName`
* `name`
* `department`
* `company`
* `phone`