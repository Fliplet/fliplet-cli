# Analytics

## System Analytics

### Enable/disable tracking

Analytics tracking can manually be disabled or enabled regardless of whether the app and user have enabled it or not.

```js
Fliplet.Analytics.enableTracking()
Fliplet.Analytics.disableTracking()
```

### Check tracking status

```js
Fliplet.Analytics.isTrackingEnabled()
````

---

## App Analytics

### Tracking an event for app analytics

Analytics for apps can be tracked by providing a type (either `event` or `pageView` and a optional JSON `data` object to be stored against the event).

```js
// Track an event
Fliplet.App.Analytics.track('event', {
  category: 'news',
  action: 'open',
  label: 'News Item 123'
});

// Track a page view
Fliplet.App.Analytics.track('pageView', {
  label: 'My sample page'
});

// Shorthand for tracking events
Fliplet.App.Analytics.event({
  category: 'news',
  action: 'open',
  label: 'News Item 123'
});

// Shorthand for tracking pageviews
Fliplet.App.Analytics.pageView('My sample page');
```

The system takes care of creating an analytics session for the user and track it and also track when a new session should be created. Furthermore, the following data gets added automatically to each event or pageView you track:

- `_platform` (String, `web` or `native`)
- `_os` (String, operative system)
- `_analyticsSessionId` (String, a unique hash for the user session. This changes every 30 minutes for the user.)
- `_pageId` (Number, the screen ID where the event has been tracked)
- `_pageTitle` (String, the screen name where the event has been tracked)
- `_userEmail` (String, the email of the logged user when using a login system like SAML2, Fliplet Data Sources or Fliplet Login)

When tracking events via `Fliplet.App.Analytics.event` you can overwrite these variables by passing a new value:

```js
Fliplet.App.Analytics.event({
  _os: 'Ubuntu',
  _pageTitle: 'My other page'
});
```

### Manually resetting the analytics session id

```js
Fliplet.App.Analytics.Session.reset();
```

### Fetch aggregated logs

Here's how you can use our powerful JS APIs to do some heavylifting for you and return aggregated logs instead of having to group them manually when displaying charts for app analytics.

<p class="quote"><strong>Note</strong>: this JS API is only available when app users have logged in with the <strong>Fliplet Studio</strong> component or when using <strong>Fliplet Viewer</strong>.</p>

Fetching aggregating logs is available both under the namespace **for the current app** (`Fliplet.App`) and **for all apps** (`Fliplet.Apps`), each have different behaviors and parameter requirements:

```js
// Fetch analytics for the current app
Fliplet.App.Analytics.get(query);

// Fetch analytics for a specific app
Fliplet.Apps.Analytics.get(appId, query);
```

The `query` parameter is optional; when given, it must be an object with the following (all optional) attributes:

- `aggregate` (object to define post-querying filtering, see below for usage)
- `attributes` (array of attributes to select)
- `group` (for grouping data, described below)
- `limit` (number)
- `order` (array of arrays, check below for usage)
- `period` (object to define how chunks of data should be grouped chronologically)
- `where` (sequelize where condition)

---

#### `attributes`

Use when you only want to select a few attributes or you need to apply a distinct count.

**Selecting attributes:**

```js
['createdAt', 'data']
```

**Applying a distinct count:**

```js
[ { distinctCount: true, col: 'data._analyticsTrackingId', as: 'sessionsCount' } ]
```

---

#### `where`

Sequelize where condition for the query.

```js
{
  data: { foo: 'bar' },
  type: ['app.analytics.pageView'],
  createdAt: {
    $gte: moment().startOf('day').unix()*1000,
    $lte: moment().endOf('day').unix()*1000
  }
}
```

---

#### `group`

When aggregating data with "group", this parameter must be an array of objects or strings.

- If you pass a string, it must be the database column name in the logs table. Keep in mind that all data stored by JS APIs is saved into "data", so you will be required to use "data.foo" and so on. On the other hand, "createdAt" is a root column of the table.
- If you pass an object, you can specify the PostgreSQL native function to run (via fn) as well as any parameter (e.g. part), then the target column with col and also an target alias using as (this is optional).

Let's make an example by aggregating data by a `data.label` column and then by hour:

```js
Fliplet.Apps.Analytics.get(appId, {
  group: [
    'data.label',
    { fn: 'date_trunc', part: 'hour', col: 'createdAt', as: 'hour' }
  ],
  where: {
    data: { foo: 'bar' }
  },
  order: [['data.label', 'DESC']],
  limit: 5
}).then(function (results) {
  // console.log(results)
});
```

Another example:

```js
// 1. track a pageview
Fliplet.App.Analytics.pageView({
  label: 'News Item 123'
});

// 2. fetch pageviews by hour
Fliplet.Apps.Analytics.get(appId, {
  group: [
    { fn: 'date_trunc', part: 'hour', col: 'createdAt', as: 'hour' }
  ]
}).then(function (results) {
  // console.log(results)
});
```

And one more:

```js
var startDate = '2018-08-01';
var endDate = '2018-08-30';

// fetch a list of users with their page views count (ordered by most active to less active user)
Fliplet.Apps.Analytics.get(appId, {
  group: [
    'data._userEmail'
  ],
  where: {
    type: ['app.analytics.pageView'],
    createdAt: {
      $gte: moment(startDate, 'YYYY-MM-DD').startOf('day').unix()*1000,
      $lte: moment(endDate, 'YYYY-MM-DD').endOf('day').unix()*1000
    }
  }
}).then(function (results) {
  results = _.sortBy(results, 'count').reverse();
});

// fetch a list of most active users by their number of sessions
Fliplet.App.Analytics.get({
  group: ['data._userEmail'],
  order: [['sessionsCount', 'DESC']],
  attributes: [ { distinctCount: true, col: 'data._analyticsTrackingId', as: 'sessionsCount' } ],
  limit: 3
})
```

---

#### `limit`

Number of records to return. Defaults to `250`.


---

#### `order`

Define the ascending or descending order of returned records, sorting by specific column(s).

```js
[ ['data.label', 'DESC'], ['sessionsCount', 'ASC'] ]
```

---

#### `period`

Define how data should be grouped into periods of time.

- `duration`: can be either `week`, `day`, `hour`, `minute` or a specific time in **seconds**
- `col`: defines the target column to use for the date comparison.
- `count`: if `true`, only returns a count for the matched records; if `false`, returns a `data` array with a list of matched records

```js
{
  duration: 'hour',  // size of the data point
  col: 'createdAt',  // target column
  count: true        // return count only
}
```

---

### Fetch logs count

`count` works exactly the same as the above `get` method, but returns just a number of results:

```js
Fliplet.Apps.Analytics.count(appId, { group: [ 'data._userEmail' ] }).then(function (count) {
  // console.log(count)
});
```
