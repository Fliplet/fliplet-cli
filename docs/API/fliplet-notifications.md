# Notifications JS APIs

When dealing with app notifications, there's a few things you should keep in mind:

1. Notifications belong to an `app`. You can't have a notification span across multiple apps.
2. Notifications have a default "draft" `status`, meaning they are only visible to Fliplet Studio and Fliplet Viewer users. To make them live to all users, they must be published by updating their status to "published". You can also avoid this step by simply creating your notification as published in first place.
3. Notifications can have one or more **scopes** which limit their visibility. If you don't create a scope, they are treated as broadcasted messages hence available to all users of your app. On the other hand, defining a scope (or a list) will make them private and available to only specific users (e.g. individual users or groups)
4. Notifications have read receipts. To mark them as read you will need to identify your users with a GUID (`recipientId`). Fliplet apps automatically take care of this so no extra work is required from your end.

App notifications can optionally send a notification. When doing so, you should provide the `pushNotification` payload, optionally a list of subscriptions IDs to target and the optional delay for the notification.

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

// Manually add a notification to the list
instance.addToStream({
  createdAt: moment().format(),
  data: {
    title: 'Consequat commodo enim ea elit',
    message: 'Lorem reprehenderit consectetur culpa eu do.'
  }
})

// Manually add an array of notifications to the list
instance.addToStream([
  {
    createdAt: moment().format(),
    data: {
      title: 'Consequat commodo enim ea elit',
    message: 'Lorem reprehenderit consectetur culpa eu do.'
    }
  },
  {
    createdAt: moment().format(),
    data: {
      title: 'Eiusmod laboris nulla voluptate',
      message: 'Ad nisi incididunt sunt aliqua id duis irure.'
    }
  }
])
```

---

## Use with Notifications Inbox

```js
Fliplet.Hooks.on('afterNotificationsInit', function (notifications) {
  notifications.getInstance()
    .then(function (instance) {
      // use instance as required
    });
});
```

---

[Back to API documentation](../API-Documentation.md)
{: .buttons}