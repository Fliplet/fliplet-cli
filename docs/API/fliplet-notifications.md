# Notifications JS APIs

Fliplet Apps support both **in-app and push notifications**. After adding the `fliplet-notifications` dependency to your apps, you can use such library for both reading the list of notifications for a user (or device) and managing notifications (e.g. sending and scheduling them) for app managers if you are building a managing interface.

When dealing with app notifications, there's a few things you should keep in mind:

1. Notifications belong to an `app`. You can't have a notification span across multiple apps.
2. A notification can be an **in-app notification**, a **push notification** or both at once.
3. Notifications have a default "**draft**" `status`, meaning they are only visible to Fliplet Studio and Fliplet Viewer users. To make them live to all users, they must be published by updating their status to "**published**". You can also avoid this step by simply creating your notification as published in first place.
4. Notifications can have one or more **scopes** which limit their visibility. If you don't create a scope, they are treated as broadcasted messages hence available to all users of your app. On the other hand, defining a scope (or a list) will make them private and available to only specific users (e.g. individual users or groups)
5. Notifications have read receipts. To mark them as read you will need to identify your users with a GUID (`recipientId`). Fliplet apps automatically take care of this so no extra work is required from your end.
6. Notifications can be scheduled to be sent in the future using the `scheduled` `status` and specifying the date using the `orderAt` parameter.

Note: apps by default have no permissions to insert notifications. Enabling such permission is done by setting the `notificationsExtendedPermissions` setting to `true` in the app settings.

---

## Managing notifications

This section is to be used by developers when coding interfaces for app managers to send and manage notifications. It should not be used by user-facing apps to display notifications.

You first need to initialize the JS API to access all instance methods as follows:

```js
var instance = Fliplet.Notifications.init({});
```

### Send an in-app notification

In-app notifications are displayed in the notifications inbox component of Fliplet Apps. They can optionally include a push notification to be sent to the devices as described further below.

#### Send to all users

Send an in-app notification using the `insert` method:

```js
// insert a new notification for all users
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  }
})
```

#### Add a link to the notification

Add a link to the in-app notification using the `navigate` option:

```js
// insert a notification linking to a screen with a query
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi John!',
    navigate: {
      action: 'screen',
      page: 123,
      query: 'weather=sunny'
    }
  }
})
````

#### Send to a specific user

Send an in-app notification to a specific user using the `scope` option:

```js
// insert a new notification for a specific user
instance.insert({
  status: 'published',
  data: { message: 'Hi John!' },
  // scope will be matched using data matched from the user's entry in the data source
  scope: {
    email: 'john@example.org'
  }
})
```

#### Send to all logged in users

Send an in-app notification to all logged in users using the `audience` attribute:

```js
// insert a new notification for a specific user
instance.insert({
  status: 'published',
  data: { message: 'Hi logged in users!' },
  audience: 'loggedIn'
})
```

#### Broadcast to all users

Your in-app notification will be broadcasted to everyone if you don't provide a scope:

```js
// insert a new notification broadcasting everyone
instance.insert({
  status: 'published',
  data: { message: 'Hi Everyone!' }
})
```

#### Preview how many users will receive a notification

If you want to preview how many users and push subscribed devices will get a notification for a particular scope, use the `getMatches` method as described below:

```js
instance.getMatches({ scope: { type: 'Admin' } }).then(function (result) {
  // result.count (int)
  // result.subscriptions (int)
});
```

#### Schedule for later

You can schedule an in-app notification to be sent at a later date:

```js
// schedule a notification in 5 hours
instance.insert({
  status: 'scheduled',
  data: {
    message: 'Hi Everyone!'
  },
  // timestamp in unix seconds
  orderAt: moment().add(5, 'hour').unix()
})
```

#### Also send a push notification

In-app notifications can also notify the user with a push notification which can include a custom message. Push notifications can also be scheduled in the future:

```js
// insert an in-app notification and also send a push notification
instance.insert({
  data: { message: 'Hi John!' },

  // Also send a push notification
  pushNotification: {
    payload: {
      title: 'Title of the push notification',
      body: 'Message of the push notification',
      badge: 1, // Set the notification badge number
      custom: {
        // Add a link to the push notification
        customData: {
          action: 'screen',
          page: 123,
          query: 'weather=sunny'
        }
      }
    },

    // optionally schedule the push notification
    // to be sent in 30 minutes
    delayUntilTimestamp: moment().add(30, 'minute').unix()
  },
  // optional scope
  scope: {
    email: 'john@example.org'
  }
})
```

### Send a push notification

You can send a push notification-only by specifying its type as `push`. This type of notification won't show up in the user's notifications inbox component. **If you want to send a push notification which also shows up in such list, please have a look at [sending notifications with push notifications](#also-send-a-push-notification)**.

```js
// send a push notification
instance.insert({
  type: 'push',
  pushNotification: {
    payload: {
      title: 'Title of the push notification',
      body: 'Message of the push notification'
      badge: 1, // Set the notification badge number
      custom: {
        // Add a link to the push notification
        customData: {
          action: 'screen',
          page: 123,
          query: 'weather=sunny'
        }
      }
    },

    // optionally schedule the push notification
    // to be sent in 30 minutes
    delayUntilTimestamp: moment().add(30, 'minute').unix()
  },
  // optional scope
  scope: {
    email: 'john@example.org'
  }
})
```


### Update a notification

All attributes of a notification can be updated through the method below. Note that push notifications already sent can't be rescheduled as users would have already received them.

```js
// update a notification by id
instance.update(1, {
  status: 'published',
  data: { bar: 'baz' },
  extendData: true, // defaults to false (aka replace)
  pushNotification: { payload: {}, delayUntilTimestamp: 123 }
}).then(function () {

})
```

### Remove a notification

Notifications can be removed through the following method. Note that push notifications already sent can't be removed as users would have already received them.

```js
// remove a notification by id
notification.remove(1).then(function () {

})
```

### Get the list of notifications

If you are building a notifications managing app for your admin user, use the `poll` method to fetch for a list of both in-app and push notifications including drafts, sent or scheduled notifications:

```js
instance.poll({
  // set this to true to ensure reports for push notifications are returned
  includeLogs: true,

  // optional limit and offset support for pagination
  limit: 50,
  offset: 0,

  // optional query filter
  where: {
    data: {
      foo: 'bar'
    }
  }
}).then(function (response) {
  // response.entries will be an array of notifications
})
```

---

## Advanced usage in client apps

```js
var instance = Fliplet.Notifications.init({
  batchSize: 20, // defaults to 50
  appId: 123, // defaults to current app
  // List of scopes to fetch notifications from.
  // This example targets everyone sent to the logged user
  // and also all notifications sent to the "news" topic.
  scope: [
    { topic: 'news' }
  ],
  onFirstResponse: function (err, notifications) {}
});

// insert a new notification for a specific user
instance.insert({
  data: { message: 'Hi John!' },
  pushNotification: { payload: {}, delayUntilTimestamp: 123 },
  scope: { email: 'john@example.org' }
})

// insert a notification to a specific segment
instance.insert({
  data: { message: 'Hi John!' },
  scope: { foo: 'bar' }
})

// insert a new notification broadcasting everyone
instance.insert({
  data: { message: 'Hi Everyone!' }
})

// schedule a notification for later
instance.insert({
  data: {
    message: 'Hi Everyone!',
    scheduledAt: moment().add(5, 'hour').unix()
  },
  status: 'scheduled'
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
  offset: 0, // defaults to 0
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

// Retrieve count of matches for a given query scope,
// including how many of these are subscribed for push
instance.getMatches({ scope: { foo: 'bar' } }).then(function (result) {
  // result.count (int)
  // result.subscriptions (int)
});
```

---

## Usage with Notifications Inbox

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
