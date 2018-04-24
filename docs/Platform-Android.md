# Advanced features for the Android platform

## Enable the use of back button

Fliplet apps by default prevent the device back button from navigating to the previous page, but you can easily enable such behaviour by adding this snippet into the Javascript code of a specific screen or even the global one:

```js
document.addEventListener('backbutton', function () {
  Fliplet.Navigate.back();
}, false);
```

[Back](README.md)
{: .buttons}