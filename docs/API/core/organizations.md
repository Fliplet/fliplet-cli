# Organizations

### Get the user organizations

```js
Fliplet.Organizations.get().then(function (organizations) {

});
```

### Get the current organization settings

```js
Fliplet.Organization.Settings.getAll()
  .then(function (settings) {
    // Your code
  });
```

### Extend the current settings

```js
Fliplet.Organization.Settings.set({
  user: 'foo',
  _password: 'bar' // Settings with an underscore prefix "_" will be encrypted
})
  .then(function(settings) {
    // Code to run when it completes
  });
```

### Get a setting

```js
Fliplet.Organization.Settings.get('foo')
  .then(function (value) {
    // Your code
  })
```

### Check if a setting is set

```js
Fliplet.Organization.Settings.isSet('_password')
  .then(function(isSet) {
    if (isSet) {
      // Your code
    }
  });
```

### Unset a setting

```js
Fliplet.Organization.Settings.unset(['user','_password'])
  .then(function (currentSettings) {
    // Your code
  })
```