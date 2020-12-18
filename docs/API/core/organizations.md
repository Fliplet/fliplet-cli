# Organizations

### Get the current user's organizations list

```js
Fliplet.Organizations.get().then(function (organizations) {

});
```

---

## Audit logs

Use the logs JS API to fetch audit logs for an organisation.

Optional parameters:

- `type`: String or Array
- `appId`: Number (ID)
- `fields`: Array of strings
- `startDate`: ISODATE String
- `endDate`: ISODATE String
- `sort`: String (column name: `id`, `createdAt`, `type`; defaults to `createdAt`)
- `order`: String (ASC or DESC; defaults to DESC)
- `limit`: Number (defaults to 50, max 500)
- `offset`: Number
- `format` (`json` or `csv`; defaults to `json`)

```js
// Get the latest 50 audit logs
Fliplet.Organizations.Logs.get().then(function(response) {
  console.log(response.logs)
});
```

Here's an example providing all optional parameters:

```js
Fliplet.Organizations.Logs.get({
  format: 'csv',
  type: ['app.settings.update', 'app.create'],
  fields: ['id', 'type', 'data],
  appId: 123,
  startDate: '2020-01-01',
  endDate: '2020-12-31 23:59:59',
  sort: 'createdAt',
  order: 'DESC',
  limit: 10,
  offset: 0
}).then(function(response) {
  console.log(response.logs)
});
```

---


## Settings

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