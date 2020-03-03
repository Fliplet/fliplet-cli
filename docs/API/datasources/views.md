# Data Source Views

Data Sources can optionally define a set of views for their data. These are essentially filtered data set (similar to SQL views) which allow you to define a dynamic filter on which data should be filtered for the current user.

Example use cases:

- A data source contains bookmarks for all users, but you want each user to only get their own bookmarks by defining a dynamic `userBookmarks` view.
- A data source contains a directory of people and you want to dynamically split the data source by a column (or more) value, e.g. `UserType`, so that you can have multiple views, one for each type.


## Defining a view

A view must be defined in the **data source definition JSON**, which can be edited via the **App Data** section of Fliplet Studio. Such definition can optionally contain an **array** called `views` with a list of views to define.
Each view must define a `name` and the `filter`. You can also specify whether the view must be bundled to the app (defaults to `false`).

- `name`: *(required)* the name of view.
- `filter`: *(required)* an object which is passed through the **Sift.js** query engine to filter the data source. The value of each attribute can be a literal value or a string to read from a target property in the user's connected session, e.g. `session.foo`, which most likely reads from a data source entry depending on how your app's login is set up.
- `bundle` *(optional)* a boolean defaulting to `false` defining whether the view should be bundled for offline use in your apps.

```json
{
  "views": [
    {
      "name": "userBookmarks",
      "bundle": true,
      "filter": {
        "IsBookmark": "Yes",
        "UserEmail": "session.EmailAddress"
      }
    }
  ]
}
```

## Querying data for a specific view

Both DataSources **JS APIs** and **REST APIs** allow you to request data for a specific view by defining its name through the `view` property. You can also provide an **array** of `views` if you prefer to extract more at once.

```js
Fliplet.DataSources.connect(123).then(function (connection) {
  // Only extract bookmarks for the current user
  return connection.find({
    view: 'userBookmarks'
  })
}).then(console.log)
```