---
title: Data Source views
description: "Request named filters that bind to the current login session. Views filter query results; access rules must enforce privacy independently."
type: api-reference
tags: [js-api, datasources, views]
v3_relevant: true
deprecated: false
---
# Data Source views

Request named filters that bind to the current login session. Views filter query results; access rules must enforce privacy independently.

Example use cases:

- A data source contains bookmarks for all users, but you want each user to only get their own bookmarks by defining a dynamic `userBookmarks` view.
- A data source contains a directory of people and you want to dynamically split the data source by a column (or more) value, e.g. `UserType`, so that you can have multiple views, one for each type.


## Defining a view

A view must be defined in the **data source definition JSON**, which can be edited via the **App Data** section of Fliplet Studio. Such definition can optionally contain an **array** called `views` with a list of views to define.
Each view must define a `name` and the `filter`. You can also specify whether the view must be bundled to the app (defaults to `false`).

- `name`: *(required)* the name of view.
- `filter`: *(required)* an object which is passed through the **Sift.js** query engine to filter the data source. Primitive filter values are context property paths, such as `session.EmailAddress`, resolved from the connected login session. They are not literal constants: `"Yes"` does not mean a literal Yes comparison. Use an ordinary `where` filter for static conditions. Missing session fields resolve to undefined; require and test the expected login session.
- `bundle` *(optional)* a boolean defaulting to `false` defining whether the view should be bundled for offline use in your apps.

```json
{
  "views": [
    {
      "name": "userBookmarks",
      "bundle": true,
      "filter": {
        "UserEmail": "session.EmailAddress"
      }
    }
  ]
}
```

## Querying data for a specific view

Request one or more view names with the plural `views` array. Use this form rather than the singular `view` property. Multiple resolved views are combined with OR, so a row matching any requested view can be returned. Unknown names are omitted during lookup; they do not establish a security boundary.

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  // Only extract bookmarks for the current user
  return connection.find({
    views: ['userBookmarks'],
    where: { IsBookmark: 'Yes' }
  })
}).then(console.log)
```

## Security and offline use

Views are explicitly requested query filters. An app can omit the request or change it; configure [security rules](security-rules) for enforced read restrictions and test both filtered and unfiltered calls. A successful view query is not proof that another user's rows are inaccessible.

`bundle: true` requests bundling for native offline use; it does not authorize server access or revoke already downloaded rows. Verify session bindings and the actual bundled data on the target platform.

[Reading records](reading-data) · [Testing security](testing-security)
