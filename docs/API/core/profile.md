# `Fliplet.Profile`

Read and write namespaced user profile attributes (email, name, company, phone) and fetch the device UUID.

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

## Device UUID

Use `Fliplet.Profile.getDeviceUuid()` to get the device's UUID.

**Response**

- `uuid` (String) Device UUID
