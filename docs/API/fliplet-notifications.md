# Notifications JS APIs

Fliplet Apps support both **in-app and push notifications**. After adding the `fliplet-notifications` dependency to your apps, you can use such library for both reading the list of notifications for a user (or device) and managing notifications (e.g. sending and scheduling them) for app managers if you are building a managing interface.

When dealing with app notifications, there's a few things you should keep in mind:

1. Notifications belong to an `app`. You can't have a notification span across multiple apps.
2. A notification can be an **in-app notification**, a **push notification** or both at once.
3. Notifications have a default "**draft**" `status`, meaning they are only visible to Fliplet Studio and Fliplet Viewer users. To make them live to all users, they must be published by updating their status to "**published**". You can also avoid this step by simply creating your notification as published in first place.
4. Notifications can have one or more **scopes** which limit their visibility. If you don't create a scope, they are treated as broadcasted messages hence available to all users of your app. On the other hand, defining a scope (or a list) will make them private and available to only specific users (e.g. individual users or groups)
5. Notifications have read receipts. Fliplet apps automatically take care of identifying your users so no extra work is required from your end when marking notifications as read.
6. Notifications can be scheduled to be sent in the future using the `scheduled` `status` and specifying the date using the `orderAt` parameter.
7. Push notifications automatically manage the badge count of new notifications, unless you provide the `badge` property to a fixed value.

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

#### Queue the request offline for later

Add `required: true` to queue the request if the device is offline. The queued request will be sent when the device becomes online again.

```js
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
  required: true // Queue the request for later if the device is offline
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
      query: '?weather=sunny'
    }
  }
})
```

#### Send to a specific user

Send an in-app notification to a specific user using the `scope` option:

```js
// insert a new notification for a specific user
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
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
  data: {
    title: 'Welcome',
    message: 'Hi logged in users!'
  },
  audience: 'loggedIn'
})
```

#### Send to a specific device

Send an in-app notification to a specific device ID using the `scope` option with the `flSessionId` attribute and the target device ID(s):

```js
// insert a new notification for a specific user
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
  // scope will be matched for the list of Device IDs specified
  scope: {
    flSessionId: [123]
  }
})
```

#### Broadcast to all users

Your in-app notification will be broadcasted to everyone if you don't provide a scope:

```js
// insert a new notification broadcasting everyone
instance.insert({
  status: 'published',
  data: {
    title: 'Greetings',
    message: 'Hi Everyone!'
  }
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

### Schedule a notification for later

You can schedule an in-app notification to be sent at a later date:

```js
// schedule a notification in 5 hours
instance.insert({
  status: 'scheduled',
  data: {
    title: 'Greetings',
    message: 'Hi Everyone!'
  },
  // timestamp in unix seconds
  orderAt: moment().add(5, 'hour').unix()
})
```

### Include a push notification

In-app notifications can also notify the user with a push notification which can include a custom message. Push notifications can also be scheduled in the future:

```js
// insert an in-app notification and also send a push notification
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },

  // Also send a push notification
  pushNotification: {
    payload: {
      title: 'Title of the push notification',
      body: 'Message of the push notification',
      // Optionally set the notification badge number to a fixed number.
      // Omit this property to have the system automatically increment the
      // badge count for each user and device receiving the push notification.
      badge: 1,
      custom: {
        // Add a link to the push notification
        customData: {
          action: 'screen',
          page: 123,
          query: '?weather=sunny'
        }
      }
    },

    // optionally schedule the push notification
    // to be sent in 30 minutes
    delayUntilTimestamp: moment().add(30, 'minute').unix()
  },
  // Optional scope: use a filter based on the connected Data Source
  // fro your contacts (if your app has a login component)
  scope: {
    Email: 'john@example.org'
  }
})
```

### Send a push notification

You can send a **push notification-only** by specifying its type as `push`. This type of notification won't show up in the user's notifications inbox component. **If you want to send a push notification which also shows up in such list, please have a look at [sending notifications with push notifications](#also-send-a-push-notification)**.

```js
// send a push notification
instance.insert({
  type: 'push',
  pushNotification: {
    payload: {
      title: 'Title of the push notification',
      body: 'Message of the push notification',
      // Optionally set the notification badge number to a fixed number.
      // Omit this property to have the system automatically increment the
      // badge count for each user and device receiving the push notification.
      badge: 1,
      custom: {
        // Add a link to the push notification
        customData: {
          action: 'screen',
          page: 123,
          query: '?weather=sunny'
        }
      }
    },

    // optionally schedule the push notification
    // to be sent in 30 minutes
    delayUntilTimestamp: moment().add(30, 'minute').unix()
  },
  // Optional scope: use a filter based on the connected Data Source
  // fro your contacts (if your app has a login component)
  scope: {
    Email: 'john@example.org'
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

If you are building a notifications managing app for your admin user, use the `get` method to fetch for a list of both in-app and push notifications including drafts, sent or scheduled notifications:

```js
instance.get({
  // Set this to true to ensure reports for push notifications are returned.
  // Note that this requires the logged in user to have editing permissions to the app.
  includeLogs: false,

  // optional limit and offset support for pagination
  limit: 50,
  offset: 0,

  // optional list of statuses to filter notifications
  // this defaults to published only
  status: [
    'draft', 'published', 'scheduled'
  ],

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
  onFirstResponse: function (err, notifications) {}
});

// insert a new notification for a specific user
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
  pushNotification: { payload: {}, delayUntilTimestamp: 123 },
  scope: { email: 'john@example.org' }
})

// insert a notification to a specific segment
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
  scope: { foo: 'bar' }
})

// insert a notification to a specific device ID
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi John!'
  },
  scope: { flSessionId: [123] }
})

// insert a new notification broadcasting everyone
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi Everyone!'
  }
})

// schedule a notification for later
instance.insert({
  data: {
    title: 'Greetings',
    message: 'Hi Everyone!'
  },
  status: 'scheduled',
  orderAt: moment().add(5, 'hour').unix()
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

// force checking for updates.
// calling this will publish any incoming notifications to the stream
instance.poll()

// mark an array of notifications as read
// make sure to pass notifications objects, not their IDs.
instance.markNotificationsAsRead([notification1, notification2])

// mark all notifications as read
instance.markNotificationsAsRead('all')

// fetch specific messages
// returns a promise with the found entries too
// (they also get published via the stream when "publishToStream" is true)
instance.get({
  limit: 5,                                    // defaults to the batch size
  offset: 0,                                   // defaults to 0
  includeDeleted: false,                       // defaults to true
  order: 'createdAt',                          // defaults to "id"
  direction: 'DESC',                           // defaults to ASC
  status: ['draft', 'published', 'scheduled'], // defaults to published only
  publishToStream: false,                      // defaults to true
  where: { createdAt: { $lt: 'timestamp' } }   // defaults to no filter
})

// return a promise with the unread notifications count
instance.unread.count({ createdAt: { $gt: 123 } })

// Manually add a notification to the list
instance.addToStream({
  createdAt: moment().format(),
  data: {
    title: 'Title of additional notification',
    message: 'Message of additional notification'
  }
})

// Manually add an array of notifications to the list
instance.addToStream([
  {
    createdAt: moment().format(),
    data: {
      title: 'Title of additional notification',
      message: 'Message of additional notification'
    }
  },
  {
    createdAt: moment().format(),
    data: {
      title: 'Title of another additional notification',
      message: 'Message of another additional notification.'
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
