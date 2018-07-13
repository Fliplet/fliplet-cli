# Push Notifications JS APIs

These public JS APIs will be automatically available in your screens once **Push Notifications** have been enabled for your app.

## Ask the user to subscribe for push notifications

The `ask()` method will automatically take care of asking the user whether he wants to subscribe for push notifications and then create a subscription.

```js
Fliplet.Widget.get('PushNotifications').ask();
```

The above code returns a Promise which you can use to control state flow and provide errors if necessary:

```js
Fliplet.Widget.get('PushNotifications').ask().then(function () {
  // the user subscribed for push
}).catch(function (error) {
  // here you can present the error to the user if necessary
  console.error(error);
});
```

## Get the Fliplet push subscription ID of the user

```js
Fliplet.User.getSubscriptionId().then(function (subscriptionId) {
  // get the push subscription ID of the user
})
```

## Unsubscribe the user from push notifications

```js
Fliplet.User.unsubscribe(appId).then(function () {
  // unsubscribed successfully
});

## Reset the user's push notification settings 

Use the `reset()` method to clear the local settings on whether the user has decided not to subscribe for push notifications. This method is useful if you want to present the `ask()` popup once again even if the user did decide not to subscribe in the past.

```js
Fliplet.Widget.get('PushNotifications').reset();
```

Like other methods, the above `reset()` function returns a promise.