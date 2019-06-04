# Notifications JS APIs

```js
var instance = Fliplet.Notifications.init({
  batchSize: 20, // defaults to 50
  appId: 123, // defaults to current app
  // List of scopes to fetch notifications from.
  // This example targets a specific user and everything sent
  // to the "news" topic.
  scope: [
    { dataSourceId: 123, email: 'john@example.org' },
    { topic: 'news' }
  ],
  onFirstResponse: function (err, notifications) {}
});

// insert a new notification for a specific user
instance.insert({
  data: { message: 'Hi John!' },
  pushNotification: { payload: {}, delayUntilTimestamp: 123 },
  scope: [
    { dataSourceId: 123, email: 'john@example.org' }
  ]
})

// insert a new notification broadcasting everyone
instance.insert({
  data: { message: 'Hi Everyone!' }
})

// update a notification by id
instance.update(1, {
  status: 'published',
  data: { bar: 'baz' },
  extendData: true, // defaults to false (aka replace)
  pushNotification: { payload: {}, delayUntilTimestamp: 123 }
})

// remove a notification by id
notification.remove(1)

// subscribe to notifications
// each message contains id, createdAt, updatedAt, data, isUpdate, isDeleted, isFirstBatch
// it can also contain readStatus { readAt: Timestamp }
instance.stream(console.log)

// mark an array of notifications as read
// make sure to pass notifications objects, not their IDs.
instance.markNotificationsAsRead([notification1, notification2])

// mark all notifications as read
instance.markNotificationsAsRead('all')

// force checking for updates
instance.poll()

// fetch specific messages
// returns a promise with the found entries too (they also get published via the stream)
instance.poll({
  limit: 5, // defaults to batch size
  where: { createdAt: { $lt: 'timestamp' } },
  includeDeleted: false, // defaults to true
  order: 'createdAt',  // defaults to "id"
  direction: 'DESC',  // defaults to ASC
  publishToStream: false // defaults to true
})

// return a promise with the unread notifications count
instance.unread.count({ createdAt: { $gt: 123 } })
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}