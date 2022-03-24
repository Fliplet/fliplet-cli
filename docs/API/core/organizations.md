# Organizations

### Get the current user's organizations list

```js
Fliplet.Organizations.get().then(function (organizations) {

});
```

---

## Audit logs

Use the logs JS API to fetch audit logs for an organization.

Optional parameters:

  - `type`: String or Array of strings ([see list of available types](/Organization-audit-log-types.html))
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

Note that the following [types](/Organization-audit-log-types.html) are filtered out by default since they are primarily used for analytics: `app.analytics.pageView`, `app.analytics.event`, `app.view`, `app.update`,  `studio.analytics.presence`.

Here's an example providing all optional parameters:

```js
Fliplet.Organizations.Logs.get({
  format: 'csv',
  type: ['app.settings.update', 'app.create'],
  fields: ['id', 'type', 'data'],
  appId: 123,
  startDate: '2021-01-01',
  endDate: '2021-12-31 23:59:59',
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

### Set the list of blacklisted extensions on file uploads

Run the snippet below in a Fliplet Studio app preview frame while you're logged in as an organization admin to set up a new policy blacklisting as list of file extensions for all media files upload.

```js
Fliplet.Organizations.get().then(function (organizations) {
  return Fliplet.API.request({
    method: 'POST',
    url: 'v1/organizations/' + _.first(organizations).id + '/policy',
    data: {
      blacklistedFileExtensions: ['exe', 'jar', 'sfx', 'bat', 'cmd', 'com']
    }
  });
});
```

<p class="note">Note: updating the policy may require Studio users of your organization to update their password to ensure it's up to date with any other policy set up on your organization (e.g. security or password policies).</p>

---