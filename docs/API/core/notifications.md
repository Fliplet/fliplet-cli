# Notifications

### Check if the device has permissions to receive notifications

Use the `Fliplet.Navigator.Notifications.hasPermission()` function to check whether the device has permissions from the user to receive notifications (including push notifications).

```js
Fliplet.Navigator.Notifications.hasPermission().then(function (hasPermission) {
  if (hasPermission) {
    // The user can receive notifications
  }
});
```

---

### Check what type of permission the device has to receive notifications

Use the `Fliplet.Navigator.Notifications.getPermission()` method to check whether what type of permission the device has been given to receive notifications. Possible values are `granted`, `denied` and `default`.

```js
Fliplet.Navigator.Notifications.getPermission().then(function(permission) {
  switch (permission) {
    case 'granted':
      // the user has granted permissions to receive notifications
      break;
    case 'denied':
      // the user has denied permissions to receive notifications
      break;
    case 'default':
      // no specific choice has been made yet (e.g. not requested or user has not responded)
      break;
  }
});
```

---

### Ask the user for permission to receive notifications on the device

Use the `Fliplet.Navigator.Notifications.requestPermission()` method to ask the user for permission to receive notifications on the device.

```js
Fliplet.Navigator.Notifications.requestPermission().then(function(permission) {
  // Permission value is "granted", "denied" or "default"
}, function(error) {
  // There was an error requesting for the permission
});
```

---

### Subscribe the user for push notifications

Use the `Fliplet.User.subscribe()` method to subscribe the user for push notifications. The promise will be resolved with the user's `subscriptionId`, which can be used to target the user when sending a push notification. Note that such ID isn't necessary as the device can also be targeted via its `Device ID` (see `sessionId` in the next few examples).

<p class="quote"><strong>Note:</strong> the <code>subscribe()</code> method automatically asks the user for permissions to receive notifications.</p>

```js
Fliplet.User.subscribe().then(function(subscriptionId) {
  // The user has been subscribed
}, function(error) {
  // There was an error subscribing the user
});
```

---

### Unsubscribe the user from push notifications

Use the `Fliplet.User.unsubscribe()` method to unsubscribe the user from being able to receive push notifications.

```js
Fliplet.User.unsubscribe().then(function() {
  // The user has been unsubscribed
}, function(error) {
  // There was an error unsubscribing the user
});
```

---

### Verify the device's push notification settings

Use the `Fliplet.User.getPushNotificationSettings()` method to find out whether the user has allowed alerts, badges and sounds for push notifications.

<p class="warning">This method requires the <strong>native framework version 4.5.0 or newer</strong> to ensure the correct settings are returned.</p>

This is the list of properties returned on all platforms:

- `alert`: `boolean`
- `badge`: `boolean`
- `sound`: `boolean`

When running the method on **Android** the following properties are also returned:

- `canBypassDnd`: `boolean` - whether or not notifications can bypass the "Do Not Disturb" mode
- `importance`: `number` - the importance of a channel, from `0` (low) to `5` (high)
- `lightColor`: `number` - the notification light color for notifications
- `lockScreenVisibility`: `number` - whether or not notifications are shown on the lockscreen in full or redacted form. `-1` indicates no visibility, `0` indicates **private** (do not reveal any part of this notification on a secure lockscreen) and `1` indicates **public** (show this notification in its entirety on all lockscreens)

Please refer to the [Android notification documentation](https://developer.android.com/reference/android/app/NotificationChannel#summary) for more details about the properties listed above.

```js
Fliplet.User.getPushNotificationSettings().then(function(settings) {
  if (settings.alert) {
    // Alerts are enabled
  }

  if (settings.badge) {
    // Badges are enabled
  }

  if (settings.sound) {
    // Sounds are enabled
  }
}, function(error) {
  // There was an error fetching the settings
});
```

<p class="quote"><strong>Note:</strong> calling the method above does not automatically subscribe user for push notifications.</p>

---

### Open the App Settings

Use the `Fliplet.Navigator.Notifications.openSettings()` method to open the device native settings for the app where the user can manually change permissions for push notifications.

```js
Fliplet.Navigator.Notifications.openSettings().then(function() {
  // The settings have been opened
}, function(error) {
  // There was an error opening the settings
});
```

---

## Hooks

### Register a hook to be notified when the notification permission changes

Use the `notificationPermissionChange` hook to listen for events fired when the notification permission changes. The promise will be resolved with a `status` object containing the following keys:

- `permission`: `granted`, `denied` or `default`
- `source`: `request` (the hook was fired as a result of the `requestPermission` method) or `appSettings` (the hook was fired because the user changed the permissions via the App Settings on the device)

```js
Fliplet.Hooks.on('notificationPermissionChange', function(status) {
  // status contains "permission" and "source"
});
```

---

### Register a hook to be notified when the user subscribes for Push Notifications

Use the `notificationSubscriptionChange` hook to listen for events fired when the user subscribes to push notifications. The promise will be resolved with a `details` object containing the following keys:

- `subscriptionId`: ID of the subscription
- `sessionId`: ID of the session (which can be used to send the notification to the device)
- `createdAt`: Timestamp indicating the time the user subscribed (in ISODATE format)

```js
Fliplet.Hooks.on('notificationSubscriptionChange', function(details) {
  // details contains "subscriptionId", "sessionId" and "createdAt"
});
```

---

## Local notifications

### Show a local notification to the user

This feature allows you to programmatically display notifications on the user's device. You can optionally define a time to which they need to be scheduled to be displayed at later date.

```js
Fliplet.Navigator.Notifications.schedule({
  title: 'Hello world',
  text: 'Lorem ipsum dolor sit amet',
  icon: 'https://path/to/icon.jpg',
  smallIcon: 'res://icon_notification'
});
```

For the full available options, please check the [local notifications cordova plugin](https://github.com/katzer/cordova-plugin-local-notifications).

Note: compared to native devices, web support for local notifications is limited despite being available.
