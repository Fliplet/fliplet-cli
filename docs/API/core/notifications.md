# Notifications

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